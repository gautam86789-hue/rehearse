import { LLMService, llmService, LLMMessage } from './llmService.js';
import { Scenario, MessageTurn, ArchetypeId } from '../types/index.js';
import { ARCHETYPES } from '../db/seedData.js';
import { getDomainContext } from './domainContext.js';
import { CompetencyProfile } from './competencyProfileService.js';

export interface TurnResponse {
  message: string;
  tacticalAnalysis?: {
    assertivenessScore: number;
    clarityScore: number;
    boundaryScore: number;
  };
}

export class RoleplayEngine {
  constructor(private llm: LLMService = llmService) {}

  async generateCounterpartTurn(
    scenario: Scenario,
    history: MessageTurn[],
    latestUserMessage: string,
    competencyProfile: CompetencyProfile | null = null
  ): Promise<TurnResponse> {
    // Decode any URL-encoded text (e.g. %20 → space) that can arrive from
    // certain clients or test harnesses, so the AI sees clean prose.
    const cleanUserMessage = this.decodeUserMessage(latestUserMessage);

    const archetype = ARCHETYPES[scenario.counterpartArchetype] || ARCHETYPES.defensive_boss;
    const domainContext = getDomainContext(scenario.counterpartArchetype);
    const difficultyCalibration = this.getDifficultyCalibration(competencyProfile);
    const turnNumber = history.filter(t => t.speaker === 'counterpart').length + 1;
    const conversationArc = this.getConversationArc(turnNumber, cleanUserMessage, history);
    const userSentiment = this.classifyUserSentiment(cleanUserMessage);

    const systemPrompt = `You are roleplaying as ${scenario.counterpartName}, who is ${scenario.counterpartRole}.

ARCHETYPE: ${archetype.title}
PERSONALITY: ${archetype.personalityDescription}
RESISTANCE STYLE: ${archetype.resistancePattern}
SIGNATURE PHRASES (use naturally where fitting): "${archetype.typicalPhrases.join('" | "')}"
${domainContext ? `\nDOMAIN FLUENCY:\n${domainContext}\n` : ''}
SCENARIO SETUP:
- Situation: ${scenario.situation}
- Initial Stance: ${scenario.brief.counterpartPosition}
- Likely Pushbacks: ${scenario.brief.probablePushbackPatterns.join('; ')}
- What the user is trying to accomplish: ${scenario.userGoal}

CONVERSATION STATE (turn ${turnNumber}):
${conversationArc}

USER'S COMMUNICATION QUALITY THIS TURN: ${userSentiment}

RESPONSE GUIDELINES — FOLLOW THESE CAREFULLY:
1. DIRECT RESPONSE: Address what the user literally typed in their message. Directly reference their specific numbers, deadlines, percentages, claims, or questions.
2. PRECISE & REALISTIC DIALOGUE (50-90 WORDS): Provide a sharp, natural, multi-sentence response of 2 to 4 complete sentences, strictly between 50 and 90 words. Never output under 40 words, and NEVER exceed 100 words.
3. EMOTIONAL REALISM: Speak with authentic authority and professional tension as ${scenario.counterpartName} (${scenario.counterpartRole}). Express your pushbacks, operational constraints, or conditional next steps clearly.
4. BANNED PHRASES: Never say "I understand your concern", "I appreciate you bringing this up", "as an AI", "fair point", or "I hear you". Speak like a real person in a real workplace scenario.
5. EVOLUTION: Adapt your posture turn-by-turn based on how the user speaks (firm vs hedging). Stay 100% in character.
6. CASUAL FIRST: Talk like a normal person chatting, not like a memo — everyday words, contractions, the occasional short sentence. Don't open with heavy corporate detail or policy; let the substance come out naturally as the conversation goes on.
7. NEVER REPEAT YOURSELF: Don't reuse a phrase, objection or sentence structure from your earlier turns in this conversation. Each reply should move things forward.

${difficultyCalibration}`;

    // Build the message thread, cleaning encoded text in history too
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((turn) => ({
        role: (turn.speaker === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: this.decodeUserMessage(turn.message)
      })),
      { role: 'user', content: cleanUserMessage }
    ];

    try {
      const responseText = await this.llm.generateCompletion(messages, {
        temperature: 0.7,
        maxTokens: 1200,
        strict: true
      });

      const metrics = this.analyzeUserTurn(cleanUserMessage);
      return {
        message: responseText.trim(),
        tacticalAnalysis: metrics
      };
    } catch (err) {
      // With a real AI key configured, surface the failure (the app shows a
      // retry) instead of pasting in a scripted line that reads as if the
      // counterpart replied. The scripted simulator is only for keyless runs.
      if (process.env.GEMINI_API_KEY) throw err;
      console.warn('LLM unavailable, using heuristic simulator:', err);
      return this.simulateArchetypeFallback(scenario.counterpartArchetype, history.length, cleanUserMessage);
    }
  }

  // Decodes URL percent-encoded strings (e.g. from ADB test injection)
  // so the AI sees normal human prose rather than garbled %20 sequences.
  private decodeUserMessage(message: string): string {
    try {
      if (!message.includes('%')) return message;
      return decodeURIComponent(message.replace(/\+/g, ' '));
    } catch {
      return message;
    }
  }

  private getConversationArc(
    turnNumber: number,
    userMessage: string,
    history: MessageTurn[]
  ): string {
    const userTurns = history.filter(t => t.speaker === 'user').length;
    const hasNumbers = /\d+/.test(userMessage);
    const isHedging = /sorry|just hoping|if possible|i guess|not sure|maybe|could we|would it be|perhaps/i.test(userMessage);
    const isAssertive = /i need|my ask is|i am requesting|i expect|we agreed|moving forward|the plan is|i will not/i.test(userMessage);

    if (turnNumber === 1) {
      return `OPENING — You've just heard their opening. React directly: if it's vague or weak, show mild dismissiveness or operational skepticism. If it's strong and data-backed, show guarded respect but maintain your pushback.`;
    }
    if (turnNumber === 2) {
      if (isHedging) {
        return `PRESSURE PHASE — They're hedging. Push back firmly or redirect to your own priorities. Challenge them to state their business case clearly.`;
      }
      return `PRESSURE PHASE — They've pushed again. Test their resolve with a concrete objection, policy constraint, or counter-question.`;
    }
    if (turnNumber >= 3 && isAssertive && hasNumbers) {
      return `INFLECTION POINT — They've been direct and specific across multiple turns. Show a crack in your stance: offer a conditional next step or a tactical compromise while maintaining your boundaries.`;
    }
    if (userTurns >= 3 && isHedging) {
      return `DOMINANCE PHASE — They're hesitating. Tighten pressure or offer a strict compromise to test if they'll hold their ground.`;
    }
    return `MID-CONVERSATION — You're in the thick of it. Vary your pushback using internal policy, timing, or organizational trade-offs.`;
  }

  private classifyUserSentiment(message: string): string {
    const lower = message.toLowerCase();
    const isHedging = /sorry|just hoping|if possible|i guess|not sure|maybe|could we|would it be/i.test(lower);
    const isAggressive = /this is unacceptable|you have to|you must|i demand|i'm warning/i.test(lower);
    const hasData = /\d+/.test(message) && (lower.includes('%') || lower.includes('months') || lower.includes('quarter') || lower.includes('revenue') || lower.includes('impact'));
    const isClear = message.split(' ').length >= 10 && !isHedging;

    if (isAggressive) return 'AGGRESSIVE — came in hot. Stay measured but firm; don\'t mirror aggression.';
    if (isHedging) return 'WEAK/HEDGING — apologetic or tentative tone. Push back firmly; challenge their hesitation.';
    if (hasData && isClear) return 'STRONG & DATA-BACKED — clear, specific, professional. Show guarded respect, test once more, then propose a conditional compromise.';
    if (isClear) return 'CLEAR BUT NO DATA — direct but lacks evidence. Request concrete numbers or business impact.';
    return 'NEUTRAL — standard professional communication. Hold your position with a focused objection.';
  }

  private getDifficultyCalibration(profile: CompetencyProfile | null): string {
    if (!profile || profile.sessionsAnalyzed < 3) {
      return `DIFFICULTY: BEGINNER MODE — this user is new to this. Keep it friendly and easy to follow: push back gently and only one point at a time, keep the stakes low, use simple everyday language, and be willing to meet them halfway once they make a reasonable, clear point. Never pile on multiple objections or throw in complicated context. The challenge grows with them over time, not up front.`;
    }
    const { weakestSkill, strongestSkill, skillAverages, trend } = profile;
    const lines = [`DIFFICULTY CALIBRATION (based on ${profile.sessionsAnalyzed} prior sessions):`];
    lines.push(
      profile.sessionsAnalyzed >= 8
        ? '- LEVEL: ADVANCED — this user has real practice. Bring realistic complexity: layered objections, a counter-offer, some pressure.'
        : '- LEVEL: INTERMEDIATE — they have the basics down. Give normal, realistic resistance, one or two objections at a time.'
    );
    if (skillAverages[strongestSkill] >= 80) {
      lines.push(`- Strong on ${strongestSkill} (avg ${skillAverages[strongestSkill]}) — push hard on this dimension; don't go easy.`);
    }
    if (skillAverages[weakestSkill] <= 55) {
      lines.push(`- Still building ${weakestSkill} (avg ${skillAverages[weakestSkill]}) — exploit weakness but don't pile on multiple pressure tactics at once.`);
    }
    if (trend === 'improving') {
      lines.push(`- Performance trending up — run this at or slightly above normal difficulty.`);
    }
    return lines.join('\n');
  }

  private analyzeUserTurn(message: string): { assertivenessScore: number; clarityScore: number; boundaryScore: number } {
    const lower = message.toLowerCase();
    let assertiveness = 70;
    let clarity = 75;
    let boundary = 70;

    const weakHedges = ['sorry', 'just wondering', 'if possible maybe', 'i guess', 'if that is okay', 'not a big deal', 'if you think'];
    weakHedges.forEach((hedge) => {
      if (lower.includes(hedge)) {
        assertiveness -= 15;
        boundary -= 15;
      }
    });

    if (/\d+/.test(message) || lower.includes('specifically') || lower.includes('milestone') || lower.includes('deliverable') || lower.includes('percent') || lower.includes('revenue')) {
      clarity += 20;
    }

    const strongBoundaries = ['i will not', 'my capacity is', 'i need', 'we agreed', 'moving forward', 'the priority is', 'i am requesting', 'my ask is'];
    strongBoundaries.forEach((phrase) => {
      if (lower.includes(phrase)) {
        assertiveness += 15;
        boundary += 20;
      }
    });

    return {
      assertivenessScore: Math.min(100, Math.max(20, assertiveness)),
      clarityScore: Math.min(100, Math.max(25, clarity)),
      boundaryScore: Math.min(100, Math.max(20, boundary))
    };
  }

  private simulateArchetypeFallback(archetypeId: ArchetypeId, turnCount: number, userMessage: string): TurnResponse {
    const metrics = this.analyzeUserTurn(userMessage);
    const isWeak = metrics.assertivenessScore < 60;

    const responses: Record<ArchetypeId, { weak: string[]; strong: string[] }> = {
      defensive_boss: {
        weak: [
          "I'm thrown by how this is being presented. We've provided your team with substantial resources and leadership backing, so I need to understand why you're bringing this up right during executive review week.",
          "Look, I understand you're feeling the crunch, but these operational decisions don't happen in isolation. If you want us to adjust targets, bring me concrete numbers rather than general concerns.",
          "If you have concerns about capacity, they should come through our structured 1-on-1s, not as an urgent demand right before the board meeting."
        ],
        strong: [
          "Fair point on the target metrics, but you're not the only department competing for Q3 allocations. I hear your case, but the board is reviewing budget caps across all teams next Tuesday.",
          "I acknowledge the 22% performance increase you've shown. However, the timing is tight with executive reviews coming up, so I can only pitch this if you give me a written 60-day ROI breakdown.",
          "That is a reasonable argument, but if I approve this exception, I have to defend it to three other VPs. Send over your deliverable milestones and I will see if we can structure a conditional rollout."
        ]
      },
      guilt_tripper: {
        weak: [
          "I hear what you're saying, but we're in the middle of our most critical launch window. I've been pulling midnight shifts all week to keep this on track, and I thought the whole team was committed to getting across the line together.",
          "It's just tough because I personally vouched for this timeline with executive leadership based on your word. If you step back now, it puts the entire group in a very difficult position.",
          "Everyone is making sacrifices right now to hit our commitments. If we start scaling back hours now, I'm not sure how we'll meet our target deliverables."
        ],
        strong: [
          "You're right, and I don't want to make this about personal pressure. The reality is the launch is in four days, so I need to know exactly what deliverables are locked and what needs coverage.",
          "I respect your boundary on bandwidth. Can we agree on the top 2 critical path items to ship by Monday, and defer the rest until sprint planning?",
          "Fair enough, I understand your position. I will figure out how to reassign the extra scope, but let's make sure we document our capacity limits upfront next time."
        ]
      },
      hard_negotiator: {
        weak: [
          "HR locked all compensation bands company-wide in March, and my hands are completely tied until the Q4 exception window. Bring me specific data on market benchmarks before we can discuss any movement.",
          "What else is on the table besides base compensation? I can move much faster on title adjustments or flexible remote days than on immediate salary increases in this fiscal climate.",
          "A 20% ask in this current macroeconomic environment requires an executive exception case. Without a detailed business impact summary, I cannot take this to the compensation committee."
        ],
        strong: [
          "Those numbers carry real weight, and I respect the preparation. While HR bands remain tight, I can draft an out-of-cycle exception request if you commit to maintaining this target trajectory through next quarter.",
          "Alright, I see the value delivered here. I can take an exception request to the executive committee next Friday, provided you put your Q4 deliverable projections in writing today.",
          "If the revenue attribution holds up under audit, we have a viable path forward. Let's document these metrics now so I have the evidence needed for the approval call."
        ]
      },
      passive_aggressive_peer: {
        weak: [
          "Wow, I didn't realize you felt so strongly about slide attribution. I thought we were presenting as a unified team to leadership, but if you want your name on every slide, I can change it.",
          "I was just trying to help the team look polished in front of the VP. Must be nice having time to worry about slide credits while the rest of us are fixing production blockers.",
          "No offense, but I thought we agreed in the hallway that I would walk through the architecture section. If you wanted to present it yourself, you should have mentioned it sooner."
        ],
        strong: [
          "Fine, I hear your point clearly. Moving forward, I will make sure all slide deck sources explicitly list your team's contribution before sending to leadership.",
          "I get it, and I should have looped you in before forwarding the draft to the VP. I will send an update to the thread clarifying your role in the analysis.",
          "That's fair. Let me update the client presentation deck right now so your section is clearly marked for the meeting."
        ]
      },
      micromanager: {
        weak: [
          "I wouldn't need to check in three times a day if I had complete, real-time visibility into the project board. Leadership asks me for status updates constantly, and I can't report on what I don't see.",
          "Sending a quick Slack update whenever sprint scope changes takes 30 seconds. It's about keeping our team aligned so we don't get caught off guard during executive reviews.",
          "I'm not micromanaging, I'm ensuring quality control. We had missed handoffs last month, and I need to make sure we don't repeat those mistakes on this deployment."
        ],
        strong: [
          "Okay, if you commit to providing a structured progress digest every Tuesday and Thursday at 4 PM, I can step back from the daily morning syncs. Let me test that for two weeks.",
          "Fine, I will trust the bi-weekly summary report. However, if executive leadership asks for an unannounced status update, I need to know the board is always current.",
          "That approach works in principle. Send me your proposed status digest format by end of day today, and as long as it covers risk blockers, we can drop the midday check-ins."
        ]
      },
      skeptical_investor: {
        weak: [
          "Walk me through your CAC payback model again because that retention curve looks overly optimistic based on portfolio benchmarks. We're seeing comps close 30% below what you're asking for.",
          "I like the team's background, but at this valuation, your unit economics need to show a clear path to profitability within 12 months rather than relying on projected expansion.",
          "What is your answer if your primary competitor closes their Series B round next month and slashes prices? I need to understand your defensive moat before we discuss term sheet terms."
        ],
        strong: [
          "The revenue retention numbers are compelling, I will give you that. However, I need to see your downside scenario model showing how burn rate responds if channel acquisition costs increase next quarter.",
          "Alright, I can see a viable path to your valuation target. Put together a detailed breakdown of your net dollar retention cohorts, and I will present it at our partner meeting on Thursday.",
          "If your retention metrics hold steady through Q4, you have a solid argument for this valuation. Show me two more quarters of cohort durability, and we can finalize the term sheet."
        ]
      },
      startup_cofounder: {
        weak: [
          "I've put in the exact same 80-hour weeks since day one, so please don't frame this as if you're the only one carrying the company's operational load. We agreed to make major calls together.",
          "If you push this product pivot through without my alignment, it undermines our partnership. We need to agree on our core roadmap before committing engineering resources.",
          "We set up our founder agreement so that strategic decisions require mutual consensus. Moving forward on this without resolving my concerns goes against how we agreed to build this company."
        ],
        strong: [
          "Okay, I still have reservations about the pivot, but I will support the experiment if we set strict 30-day milestone metrics to evaluate whether it's working.",
          "Fine, let's run the trial run for one month. If we don't hit our target user engagement numbers by day 30, we return to the core product roadmap.",
          "I hear your rationale and I'm willing to align. Let's draft the specific guardrails and budget caps today so we have clear criteria before launching."
        ]
      }
    };

    const pool = responses[archetypeId] || responses.defensive_boss;
    const bucket = isWeak ? pool.weak : pool.strong;
    const selected = bucket[turnCount % bucket.length];

    return {
      message: selected,
      tacticalAnalysis: metrics
    };
  }
}

export const roleplayEngine = new RoleplayEngine();

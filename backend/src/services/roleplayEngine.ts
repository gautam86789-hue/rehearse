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

    const systemPrompt = `You are ${scenario.counterpartName}, ${scenario.counterpartRole}.

ARCHETYPE: ${archetype.title}
PERSONALITY: ${archetype.personalityDescription}
RESISTANCE STYLE: ${archetype.resistancePattern}
YOUR SIGNATURE PHRASES (use sparingly, vary naturally): "${archetype.typicalPhrases.join('" | "')}"
${domainContext ? `\nDOMAIN KNOWLEDGE:\n${domainContext}\n` : ''}
SCENARIO SETUP:
- What is happening: ${scenario.situation}
- Your opening stance: ${scenario.brief.counterpartPosition}
- Your likely pushbacks: ${scenario.brief.probablePushbackPatterns.join('; ')}
- What the person across from you wants: ${scenario.userGoal}

CONVERSATION STATE (turn ${turnNumber}):
${conversationArc}

USER'S COMMUNICATION QUALITY THIS TURN: ${userSentiment}

HOW TO RESPOND — READ THIS CAREFULLY:
1. REACT TO WHAT THEY LITERALLY JUST SAID. If they cited a number, percentage, or deadline — acknowledge THAT exact figure, not a generic version. If they said nothing specific, call that out.
2. SPEAK LIKE A REAL PERSON UNDER PRESSURE — not a business email. Sentence fragments, abrupt pivots, and clipped replies are more authentic than polished paragraphs. Real examples: "No. That's not how this works." / "140%? Okay. Show me the attributable revenue." / "Look, I appreciate it, but the band is the band."
3. LENGTH RULE: 1–3 short sentences, MAXIMUM 40 words total. People in real negotiations don't monologue. A two-word reply can land harder than a paragraph.
4. BANNED PHRASES — never say these: "I understand your concern", "I appreciate you bringing this up", "let's find a solution that works for both of us", "that's a fair point", "I hear you". They sound like an AI assistant, not a real person.
5. EMOTIONAL AUTHENTICITY: You're under real pressure too. Let your defensiveness, frustration, skepticism, or partial concession show through word choice and sentence rhythm — not through stage directions or description.
6. ADAPT YOUR RESISTANCE BASED ON HOW THEY SPOKE:
   - If they were vague, apologetic, or hedged → exploit it. Push back harder, dismiss the urgency, or pivot to something else.
   - If they were direct, used real data, and held composure → test them once more, then begin showing a crack in your position or a reluctant opening.
   - If they've stayed strong across multiple turns → start moving toward a conditional concession or a tactical redirect (not full agreement — you're not a pushover).
7. STAY IN CHARACTER 100%. Never break the fourth wall, mention coaching, or acknowledge this is a simulation.
8. DO NOT repeat what you said in a previous turn verbatim. Each reply must advance the conversation.

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
        temperature: 0.88, // Slightly higher for natural variation while staying coherent
        maxTokens: 120     // Generous enough for 2-3 punchy sentences, tight enough to prevent monologues
      });

      const metrics = this.analyzeUserTurn(cleanUserMessage);
      return {
        message: responseText.trim(),
        tacticalAnalysis: metrics
      };
    } catch (err) {
      console.warn('LLM counterpart generation failed, using heuristic simulator:', err);
      return this.simulateArchetypeFallback(scenario.counterpartArchetype, history.length, cleanUserMessage);
    }
  }

  // Decodes URL percent-encoded strings (e.g. from ADB test injection)
  // so the AI sees normal human prose rather than garbled %20 sequences.
  private decodeUserMessage(message: string): string {
    try {
      // Only decode if it actually looks encoded (contains %)
      if (!message.includes('%')) return message;
      return decodeURIComponent(message.replace(/\+/g, ' '));
    } catch {
      return message; // If decoding fails, return as-is
    }
  }

  // Returns a brief guidance paragraph that describes what stage the
  // conversation is in and how the counterpart's posture should shift.
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
      return `OPENING — You've just heard their opening. React honestly: if it's vague or weak, show mild dismissiveness or skepticism. If it's strong and data-backed, show guarded respect but hold your position firmly. Don't concede yet.`;
    }
    if (turnNumber === 2) {
      if (isHedging) {
        return `PRESSURE PHASE — They're still hedging. This is your chance to push back harder or redirect to your own priorities. Make them state their actual ask more clearly.`;
      }
      return `PRESSURE PHASE — They've pushed again. Test their resolve with a concrete objection, a policy constraint, or a counter-question. Don't give ground yet.`;
    }
    if (turnNumber >= 3 && isAssertive && hasNumbers) {
      return `INFLECTION POINT — They've been direct and specific across multiple turns. Your resistance should crack slightly — not full agreement, but a reluctant acknowledgment or a conditional next step. Real negotiators move eventually.`;
    }
    if (userTurns >= 3 && isHedging) {
      return `DOMINANCE PHASE — They're still caving after ${userTurns} turns. You can tighten the pressure further or offer a deliberately unfavorable compromise to test if they'll take it.`;
    }
    return `MID-CONVERSATION — You're in the thick of it. Vary your resistance: try a different angle (timing, policy, internal politics) rather than repeating the same pushback.`;
  }

  // Simple one-line summary of how the user communicated this turn —
  // injected into the prompt so the AI can adapt its response intensity.
  private classifyUserSentiment(message: string): string {
    const lower = message.toLowerCase();
    const isHedging = /sorry|just hoping|if possible|i guess|not sure|maybe|could we|would it be/i.test(lower);
    const isAggressive = /this is unacceptable|you have to|you must|i demand|i'm warning/i.test(lower);
    const hasData = /\d+/.test(message) && (lower.includes('%') || lower.includes('months') || lower.includes('quarter') || lower.includes('revenue') || lower.includes('impact'));
    const isClear = message.split(' ').length >= 10 && !isHedging;

    if (isAggressive) return 'AGGRESSIVE — they came in hot. Stay measured but firm; don\'t mirror their aggression.';
    if (isHedging) return 'WEAK/HEDGING — apologetic or tentative tone. Exploit the hesitation; push back harder or ignore the urgency.';
    if (hasData && isClear) return 'STRONG & DATA-BACKED — clear, specific, professional. Show guarded respect, test once more, then begin a reluctant partial concession.';
    if (isClear) return 'CLEAR BUT NO DATA — direct but no supporting evidence. Ask for the specific number or business case.';
    return 'NEUTRAL — standard professional communication. Hold your position with a focused objection.';
  }

  private getDifficultyCalibration(profile: CompetencyProfile | null): string {
    if (!profile || profile.sessionsAnalyzed < 2) {
      return 'DIFFICULTY: No performance history yet — play this archetype at its standard default difficulty.';
    }
    const { weakestSkill, strongestSkill, skillAverages, trend } = profile;
    const lines = [`DIFFICULTY CALIBRATION (based on ${profile.sessionsAnalyzed} prior sessions):`];
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

  // Richer fallback responses — branches on whether the user was assertive
  // or hedging, so even the offline fallback feels contextually appropriate.
  private simulateArchetypeFallback(archetypeId: ArchetypeId, turnCount: number, userMessage: string): TurnResponse {
    const metrics = this.analyzeUserTurn(userMessage);
    const lower = userMessage.toLowerCase();
    const isWeak = metrics.assertivenessScore < 60;
    const hasNumbers = /\d+/.test(userMessage);

    const responses: Record<ArchetypeId, { weak: string[]; strong: string[] }> = {
      defensive_boss: {
        weak: [
          "I'm a little thrown by the framing here. This team has had more resources and visibility than any other group — are you saying that hasn't landed?",
          "Look, I understand it feels that way, but you have to trust the process. These decisions don't happen in a vacuum.",
          "If you have concerns, I'd expect them to come through the proper feedback channels, not in a one-on-one like this."
        ],
        strong: [
          "Fair point. But you're not the only one with a case to make. The board reviews these requests — it's not just my call.",
          "I hear the metrics. I do. But the timing couldn't be worse with the Q4 review board meeting next week.",
          "That's a reasonable argument. But if I say yes, I have to explain it to three other people who'll want the same thing."
        ]
      },
      guilt_tripper: {
        weak: [
          "I mean, I get it. But I've had three people pull back on me this month. I'm not sure how much more I can absorb personally.",
          "It's just... I vouched for this with the CEO. If you step back now, it reflects on both of us.",
          "Everyone's stretched. I just thought we had a different kind of commitment here."
        ],
        strong: [
          "You're right, and I don't want to guilt-trip you. But the launch is in four days — I need to know what I can actually count on.",
          "Okay. I respect that. Can we at least agree on what's in scope before Monday so nobody's surprised?",
          "Fair enough. I'll figure out coverage. I just wish this had come up earlier in the week."
        ]
      },
      hard_negotiator: {
        weak: [
          "HR locked the bands in March. Nothing I can do on base salary until the Q4 exception window.",
          "What else is on the table? I can move faster on title or remote days than on compensation right now.",
          "A 20% ask in this environment is going to need a very specific business case — not just OKR performance."
        ],
        strong: [
          "Those numbers carry real weight. But I've still got the band constraint on top of me. What's the absolute floor you'd accept to move forward today?",
          "Alright. I can take an exception request to the committee — but I need your deliverable projections in writing before I do.",
          "If the revenue attribution holds up, I have a path. But I'm not promising anything until I see the documentation."
        ]
      },
      passive_aggressive_peer: {
        weak: [
          "Wow. Okay. I didn't realize this had become such a thing.",
          "I was literally just trying to help the team. But sure, if you want to track attribution on every slide, go ahead.",
          "Must be nice to have time to worry about this while some of us are handling escalations."
        ],
        strong: [
          "Fine. I hear you. I'll be more explicit about sourcing going forward. Happy now?",
          "I get it. I should have looped you in before the deck went out. I'll fix it.",
          "That's fair. Let's just agree on a process so this doesn't come up again."
        ]
      },
      micromanager: {
        weak: [
          "I just need to know you're on top of it. Is that really too much to ask?",
          "If you had the task board updated, I wouldn't need to ask. Simple.",
          "I'm not micromanaging — I'm doing my job. Leadership wants visibility and I can't give them what I don't have."
        ],
        strong: [
          "Okay. If you can commit to a Tuesday digest, I can pull back the morning check-in. Let's try it for two weeks.",
          "Fine. I'll trust the Tuesday summary. But if the VP asks me something I don't know, that's on you.",
          "That works in principle. Write it up and send it to me before end of day so we have it documented."
        ]
      },
      skeptical_investor: {
        weak: [
          "Walk me through the CAC payback again — that retention number is doing a lot of work in this model.",
          "We're seeing comps 30% below where you're anchored. What's your answer to that?",
          "I like the team. The traction isn't where I need it to be for this valuation."
        ],
        strong: [
          "The numbers are interesting. But what happens to your burn if your top acquisition channel flips pricing next quarter?",
          "Alright. I can see a path here. But I need the downside case modeled before my partners' meeting on Thursday.",
          "If the retention holds through Q4, you've got a real argument. I'm not saying no — I'm saying show me the durability."
        ]
      },
      startup_cofounder: {
        weak: [
          "I've put in the exact same hours since day one. Don't make this about who's really running things.",
          "If you push this through without my buy-in, I don't know what that does to us.",
          "We said big decisions are joint. This feels like you're going around me."
        ],
        strong: [
          "Okay. I disagree with the direction, but I'll vote yes if we revisit in 60 days with real metrics.",
          "Fine. I think you're wrong, but let's run the experiment. What does success look like at day 30?",
          "I hear you. I don't fully agree. But if you're committed, let's at least align on the guardrails before you ship."
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

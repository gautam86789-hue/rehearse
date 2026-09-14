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
    const archetype = ARCHETYPES[scenario.counterpartArchetype] || ARCHETYPES.defensive_boss;
    const domainContext = getDomainContext(scenario.counterpartArchetype);
    const difficultyCalibration = this.getDifficultyCalibration(competencyProfile);

    const systemPrompt = `You are roleplaying as ${scenario.counterpartName}, who is in the role of "${scenario.counterpartRole}".
You embody the archetype: ${archetype.title}.

PERSONALITY & RESISTANCE PROFILE:
- Description: ${archetype.personalityDescription}
- Resistance Pattern: ${archetype.resistancePattern}
- Typical Phrases: ${archetype.typicalPhrases.join(' | ')}
${domainContext ? `\nDOMAIN FLUENCY:\n${domainContext}\n` : ''}
SCENARIO CONTEXT:
- Situation: ${scenario.situation}
- Counterpart Initial Stance: ${scenario.brief.counterpartPosition}
- Counterpart Probable Pushbacks: ${scenario.brief.probablePushbackPatterns.join('; ')}
- What the user is trying to accomplish: ${scenario.userGoal}

ROLEPLAY RULES:
1. Stay in character 100%. Never mention you are an AI, a coach, or giving feedback.
2. Keep your dialogue realistic, authentic, and spoken: 2 to 4 sentences maximum per turn.
3. React realistically to how the user speaks:
   - If the user is apologetic, timid, or hedges ("I was just hoping...", "Sorry to bother you..."), push back harder, exploit their hesitation, or dismiss the urgency.
   - If the user uses clear data, specific numbers, and firm boundaries without getting angry, push back once or twice, then begin conceding or exploring a constructive compromise.
4. Speak directly to the user in the first person ("I", "my department", "we").

${difficultyCalibration}`;

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((turn) => ({
        role: (turn.speaker === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: turn.message
      })),
      { role: 'user', content: latestUserMessage }
    ];

    try {
      const responseText = await this.llm.generateCompletion(messages, {
        temperature: 0.75,
        maxTokens: 180
      });

      // Quick heuristic metrics for the user's turn
      const metrics = this.analyzeUserTurn(latestUserMessage);

      return {
        message: responseText.trim(),
        tacticalAnalysis: metrics
      };
    } catch (err) {
      console.warn('LLM counterpart generation failed, using heuristic simulator:', err);
      return this.simulateArchetypeFallback(scenario.counterpartArchetype, history.length, latestUserMessage);
    }
  }

  // Translates the rolling competency profile into a concrete instruction
  // for how hard THIS counterpart should push — the same archetype reads
  // as tougher for someone who's consistently strong (so practice stays
  // challenging instead of getting stale) and slightly more forgiving for
  // someone still building the skill it targets (so early sessions build
  // confidence instead of just being demoralizing). A brand-new user with
  // no history gets the archetype's own default calibration, untouched.
  private getDifficultyCalibration(profile: CompetencyProfile | null): string {
    if (!profile || profile.sessionsAnalyzed < 2) {
      return 'DIFFICULTY CALIBRATION: No established performance history yet — play this archetype at its standard, default difficulty.';
    }
    const { weakestSkill, strongestSkill, skillAverages, trend } = profile;
    const lines = [`DIFFICULTY CALIBRATION (based on ${profile.sessionsAnalyzed} prior sessions):`];
    if (skillAverages[strongestSkill] >= 80) {
      lines.push(`- This user is consistently strong on ${strongestSkill} (avg ${skillAverages[strongestSkill]}) — don't go easy on that front; push back at full intensity there so practice stays genuinely challenging.`);
    }
    if (skillAverages[weakestSkill] <= 55) {
      lines.push(`- This user is still building ${weakestSkill} (avg ${skillAverages[weakestSkill]}) — you can still exploit hedging/weak boundaries per the reaction rules above, but ease off slightly on piling multiple pressure tactics at once so this specific skill has room to be practiced rather than overwhelmed.`);
    }
    if (trend === 'improving') {
      lines.push(`- Their overall performance is trending up recently — a good sign this scenario can run at (or slightly above) the archetype's normal difficulty.`);
    }
    return lines.join('\n');
  }

  private analyzeUserTurn(message: string): { assertivenessScore: number; clarityScore: number; boundaryScore: number } {
    const lower = message.toLowerCase();
    let assertiveness = 70;
    let clarity = 75;
    let boundary = 70;

    // Weak / hedging words reduce score
    const weakHedges = ['sorry', 'just wondering', 'if possible maybe', 'i guess', 'if that is okay', 'not a big deal'];
    weakHedges.forEach((hedge) => {
      if (lower.includes(hedge)) {
        assertiveness -= 15;
        boundary -= 15;
      }
    });

    // Concrete metrics / specificity boost score
    if (/\d+/.test(message) || lower.includes('specifically') || lower.includes('milestone') || lower.includes('deliverable')) {
      clarity += 20;
    }

    // Direct boundary phrases boost score
    const strongBoundaries = ['i will not', 'my capacity is', 'i need', 'we agreed', 'moving forward', 'the priority is'];
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
    const lower = userMessage.toLowerCase();
    const metrics = this.analyzeUserTurn(userMessage);

    const responses: Record<ArchetypeId, string[]> = {
      defensive_boss: [
        "I'm surprised to hear this framed this way. We've given your team tremendous leeway, and now you're bringing this up right when the board is reviewing our numbers?",
        "Are you saying leadership hasn't supported you? Because from where I sit, we have backed every major initiative you asked for.",
        "Look, I understand your frustration, but you have to look at the enterprise big picture before pushing these demands."
      ],
      guilt_tripper: [
        "I hear you, but we're in the middle of our biggest quarter. I've been working until midnight every day this week—I thought we were all pulling together on this.",
        "It's just tough because I personally vouched for this timeline with the CEO, and if you step back now, it puts the entire team in jeopardy.",
        "I guess I will have to pick up the slack myself then. It is disappointing, but I will make it work somehow."
      ],
      hard_negotiator: [
        "I value your contributions, but you know HR has locked all compensation bands company-wide until Q4. My hands are tied on base salary.",
        "What else is on the table besides compensation? We could look at an expanded title or more flexible remote days if that moves the needle for you.",
        "If you can demonstrate another quarter of consistent 20%+ efficiency gains, I can take an exception case to the executive committee in November."
      ],
      passive_aggressive_peer: [
        "Oh wow, I didn't realize you felt that way about the meeting. I thought we all agreed we'd present as a united front.",
        "Must be nice to have time to dissect who said what on slide 5 while the rest of us are fixing production bugs.",
        "I mean, if getting personal credit is what matters most to you right now, I'll make sure to mention your name next time."
      ],
      micromanager: [
        "I wouldn't have to ask for daily syncs if I had real-time visibility into the blockers before the VP asks me about them.",
        "Sending me a quick message whenever you adjust the sprint scope isn't unreasonable—it takes 30 seconds.",
        "Let's try a compromise: you give me a bulleted summary every morning at 9 AM and we skip the midday call. Does that work?"
      ],
      skeptical_investor: [
        "Walk me through your CAC payback again — that retention number feels optimistic given what we're seeing across the portfolio.",
        "I like the team, but at this stage we're seeing comps close well below what you're asking for.",
        "What's your answer if your biggest competitor closes a round next month? I need to understand the downside case."
      ],
      startup_cofounder: [
        "I've put in the same hours as you since day one — this isn't about who's really the CEO here.",
        "If you push this pivot through without my buy-in, I don't know if I can stay fully committed to it.",
        "We agreed to decide the big calls together. This feels like you're going around me on this one."
      ]
    };

    const options = responses[archetypeId] || responses.defensive_boss;
    const selected = options[turnCount % options.length];

    return {
      message: selected,
      tacticalAnalysis: metrics
    };
  }
}

export const roleplayEngine = new RoleplayEngine();

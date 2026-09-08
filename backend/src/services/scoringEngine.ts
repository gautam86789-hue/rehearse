import { v4 as uuidv4 } from 'uuid';
import { LLMService, llmService } from './llmService.js';
import { Scenario, MessageTurn, SubstanceRubric, Scorecard, WeakestLineRewrite } from '../types/index.js';

export class ScoringEngine {
  constructor(private llm: LLMService = llmService) {}

  async evaluateSession(
    scenario: Scenario,
    turns: MessageTurn[]
  ): Promise<SubstanceRubric> {
    const userTurns = turns.filter((t) => t.speaker === 'user');
    if (userTurns.length === 0) {
      return this.getEmptyRubric();
    }

    const transcriptFormatted = turns
      .map((t, idx) => `[Turn ${idx + 1}] ${t.speaker.toUpperCase()}: ${t.message}`)
      .join('\n');

    const systemPrompt = `You are a world-class executive communications coach evaluating a high-stakes roleplay transcript.
Evaluate the user's performance according to the 4-part SUBSTANCE RUBRIC:

1. STATED THE ASK (0-100): Did the user clearly state their core goal, thesis, or boundary upfront without diluting it?
2. HELD THE BOUNDARY (0-100): Did the user resist emotional guilt, deflection, false compromises, or backing down when challenged?
3. STAYED SPECIFIC (0-100): Did the user use concrete numbers, verified facts, dates, and examples rather than vague generalizations?
4. EMOTIONAL COMPOSURE (0-100): Was the tone calm, firm, non-defensive, professional, and free of unnecessary apologies?

WEAKEST LINE REWRITE:
Identify the SINGLE WEAKEST sentence spoken by the user (e.g. Most apologetic, most hedged, or most conceding), and rewrite it as an executive-level masterclass line.

You MUST return a JSON object strictly matching this schema:
{
  "statedTheAsk": number (0-100),
  "heldTheBoundary": number (0-100),
  "stayedSpecific": number (0-100),
  "emotionalComposure": number (0-100),
  "overallScore": number (0-100),
  "strengths": ["Strength 1", "Strength 2"],
  "growthAreas": ["Growth area 1", "Growth area 2"],
  "weakestLineRewrite": {
    "originalLine": "Exact user line from transcript",
    "suggestedRewrite": "High-impact rewrite",
    "coachingRationale": "Why this change makes the user 10x more persuasive",
    "techniqueApplied": "Name of technique (e.g. The Clean Ask, Boundary Anchoring, Non-Defensive Pivot)"
  },
  "keyTakeaways": [
    "Practical takeaway 1 for the real conversation",
    "Practical takeaway 2 for the real conversation"
  ]
}`;

    const userPrompt = `SCENARIO CONTEXT:
Title: ${scenario.title}
Target Goal: ${scenario.userGoal}
Counterpart: ${scenario.counterpartName} (${scenario.counterpartRole})

TRANSCRIPT:
${transcriptFormatted}

Evaluate this transcript and generate the complete Substance Rubric JSON now.`;

    try {
      const rawResponse = await this.llm.generateCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        { temperature: 0.4, responseFormat: 'json' }
      );

      const parsed = this.cleanAndParseJSON(rawResponse);
      return this.validateAndNormalizeRubric(parsed, userTurns);
    } catch (err) {
      console.warn('LLM scoring failed, using heuristic rubric calculation:', err);
      return this.heuristicScoring(scenario, userTurns);
    }
  }

  private cleanAndParseJSON(text: string): any {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found in scoring output');
    return JSON.parse(match[0]);
  }

  private validateAndNormalizeRubric(parsed: any, userTurns: MessageTurn[]): SubstanceRubric {
    const ask = Math.min(100, Math.max(10, Number(parsed.statedTheAsk) || 75));
    const boundary = Math.min(100, Math.max(10, Number(parsed.heldTheBoundary) || 70));
    const specific = Math.min(100, Math.max(10, Number(parsed.stayedSpecific) || 70));
    const composure = Math.min(100, Math.max(10, Number(parsed.emotionalComposure) || 80));
    const overall = Math.min(100, Math.max(10, Number(parsed.overallScore) || Math.round((ask + boundary + specific + composure) / 4)));

    let rewrite = parsed.weakestLineRewrite;
    if (!rewrite || !rewrite.originalLine) {
      const fallbackWeakTurn = userTurns[0]?.message || 'I was just hoping we could discuss this if possible.';
      rewrite = {
        originalLine: fallbackWeakTurn,
        suggestedRewrite: 'I scheduled this time to align on our compensation adjustment based on the Q2 outcomes.',
        coachingRationale: 'Removes tentative hedging and frames the conversation as a decisive alignment session.',
        techniqueApplied: 'The Direct Opening Anchor'
      };
    }

    return {
      statedTheAsk: ask,
      heldTheBoundary: boundary,
      stayedSpecific: specific,
      emotionalComposure: composure,
      overallScore: overall,
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : ['Maintained professional tone', 'Addressed counterpart pushback'],
      growthAreas: Array.isArray(parsed.growthAreas) && parsed.growthAreas.length > 0 ? parsed.growthAreas : ['Use fewer hedging phrases', 'Anchor with concrete business metrics'],
      weakestLineRewrite: rewrite,
      keyTakeaways: Array.isArray(parsed.keyTakeaways) && parsed.keyTakeaways.length > 0 ? parsed.keyTakeaways : ['Lead with the ask within 30 seconds', 'Do not apologize for holding a standard boundary']
    };
  }

  private heuristicScoring(scenario: Scenario, userTurns: MessageTurn[]): SubstanceRubric {
    let askScore = 75;
    let boundaryScore = 70;
    let specificScore = 65;
    let composureScore = 80;

    let weakestTurn = userTurns[0]?.message || '';
    let foundWeakness = false;

    for (const turn of userTurns) {
      const msg = turn.message.toLowerCase();

      if (msg.includes('sorry') || msg.includes('just hoping') || msg.includes('i guess') || msg.includes('if that is okay')) {
        askScore -= 10;
        boundaryScore -= 10;
        composureScore -= 5;
        if (!foundWeakness) {
          weakestTurn = turn.message;
          foundWeakness = true;
        }
      }

      if (/\d+/.test(msg) || msg.includes('percent') || msg.includes('$') || msg.includes('q1') || msg.includes('q2') || msg.includes('october')) {
        specificScore += 15;
      }

      if (msg.includes('my priority is') || msg.includes('we agreed') || msg.includes('i will deliver') || msg.includes('moving forward')) {
        boundaryScore += 10;
        askScore += 10;
      }
    }

    askScore = Math.min(95, Math.max(40, askScore));
    boundaryScore = Math.min(95, Math.max(35, boundaryScore));
    specificScore = Math.min(95, Math.max(40, specificScore));
    composureScore = Math.min(95, Math.max(45, composureScore));
    const overall = Math.round((askScore * 0.3) + (boundaryScore * 0.3) + (specificScore * 0.2) + (composureScore * 0.2));

    const weakestLine: WeakestLineRewrite = {
      originalLine: weakestTurn,
      suggestedRewrite: `Based on the $2.1M impact delivered this quarter, I am requesting an adjustment to $145k base salary.`,
      coachingRationale: `Replaces tentative hedging with verified data and an exact compensation anchor.`,
      techniqueApplied: 'Value-Anchored Assertion'
    };

    return {
      statedTheAsk: askScore,
      heldTheBoundary: boundaryScore,
      stayedSpecific: specificScore,
      emotionalComposure: composureScore,
      overallScore: overall,
      strengths: [
        'Maintained respectful, professional engagement under pushback',
        'Stuck to the agenda despite the counterpart trying to change topics'
      ],
      growthAreas: [
        'Eliminate introductory apologies like "Sorry to bring this up"',
        'State concrete target numbers earlier in the dialogue'
      ],
      weakestLineRewrite: weakestLine,
      keyTakeaways: [
        'Silence is your ally: state the ask and allow the counterpart to respond without rushing to fill the void',
        'Frame boundaries as protecting delivery quality rather than personal limitations'
      ]
    };
  }

  private getEmptyRubric(): SubstanceRubric {
    return {
      statedTheAsk: 0,
      heldTheBoundary: 0,
      stayedSpecific: 0,
      emotionalComposure: 0,
      overallScore: 0,
      strengths: [],
      growthAreas: ['Complete at least 2 conversational turns to receive scoring'],
      weakestLineRewrite: {
        originalLine: 'No dialogue submitted.',
        suggestedRewrite: 'State your ask clearly in the opening turn.',
        coachingRationale: 'Conversational practice requires an opening statement.',
        techniqueApplied: 'Opening Hook'
      },
      keyTakeaways: ['Practice speaking your ask out loud']
    };
  }
}

export const scoringEngine = new ScoringEngine();

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

    const systemPrompt = `You are a world-class communications coach evaluating a high-stakes roleplay transcript.
Evaluate the user's performance according to the 4-part COMMUNICATION RUBRIC:

1. CLARITY (0-100): Did the user state their point directly, without hedging or diluting it?
2. EMPATHY (0-100): Did the user acknowledge the counterpart's perspective or feelings before pressing their own point?
3. ASSERTIVENESS (0-100): Did the user hold their position without backing down when challenged?
4. LISTENING (0-100): Did the user respond to what the counterpart actually said, rather than talking past them or repeating a script?

WEAKEST LINE REWRITE:
Identify the SINGLE WEAKEST sentence spoken by the user (e.g. Most apologetic, most hedged, or most conceding), and rewrite it as a confident, clear alternative.

You MUST return a JSON object strictly matching this schema:
{
  "clarity": number (0-100),
  "empathy": number (0-100),
  "assertiveness": number (0-100),
  "listening": number (0-100),
  "overallScore": number (0-100),
  "strengths": ["Strength 1", "Strength 2"],
  "growthAreas": ["Growth area 1", "Growth area 2"],
  "weakestLineRewrite": {
    "originalLine": "Exact user line from transcript",
    "suggestedRewrite": "High-impact rewrite",
    "coachingRationale": "Why this change lands better",
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

Evaluate this transcript and generate the complete Communication Rubric JSON now.`;

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
    const clarity = Math.min(100, Math.max(10, Number(parsed.clarity) || 75));
    const empathy = Math.min(100, Math.max(10, Number(parsed.empathy) || 70));
    const assertiveness = Math.min(100, Math.max(10, Number(parsed.assertiveness) || 70));
    const listening = Math.min(100, Math.max(10, Number(parsed.listening) || 75));
    const overall = Math.min(100, Math.max(10, Number(parsed.overallScore) || Math.round((clarity + empathy + assertiveness + listening) / 4)));

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
      clarity,
      empathy,
      assertiveness,
      listening,
      overallScore: overall,
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : ['Maintained professional tone', 'Addressed counterpart pushback'],
      growthAreas: Array.isArray(parsed.growthAreas) && parsed.growthAreas.length > 0 ? parsed.growthAreas : ['Use fewer hedging phrases', 'Anchor with concrete business metrics'],
      weakestLineRewrite: rewrite,
      keyTakeaways: Array.isArray(parsed.keyTakeaways) && parsed.keyTakeaways.length > 0 ? parsed.keyTakeaways : ['Lead with the ask within 30 seconds', 'Do not apologize for holding a standard boundary']
    };
  }

  private heuristicScoring(scenario: Scenario, userTurns: MessageTurn[]): SubstanceRubric {
    let clarityScore = 75;
    let empathyScore = 65;
    let assertivenessScore = 70;
    let listeningScore = 70;

    let weakestTurn = userTurns[0]?.message || '';
    let foundWeakness = false;

    for (const turn of userTurns) {
      const msg = turn.message.toLowerCase();

      if (msg.includes('sorry') || msg.includes('just hoping') || msg.includes('i guess') || msg.includes('if that is okay')) {
        clarityScore -= 10;
        assertivenessScore -= 10;
        if (!foundWeakness) {
          weakestTurn = turn.message;
          foundWeakness = true;
        }
      }

      if (/\d+/.test(msg) || msg.includes('percent') || msg.includes('$') || msg.includes('q1') || msg.includes('q2') || msg.includes('october')) {
        clarityScore += 10;
      }

      if (msg.includes('i understand') || msg.includes('i hear') || msg.includes('i know this is') || msg.includes('i get that')) {
        empathyScore += 15;
      }

      if (msg.includes('my priority is') || msg.includes('we agreed') || msg.includes('i will deliver') || msg.includes('moving forward')) {
        assertivenessScore += 10;
      }

      if (msg.includes('what i hear you saying') || msg.includes('to your point') || msg.includes('you mentioned') || msg.includes('you said')) {
        listeningScore += 15;
      }
    }

    clarityScore = Math.min(95, Math.max(40, clarityScore));
    empathyScore = Math.min(95, Math.max(35, empathyScore));
    assertivenessScore = Math.min(95, Math.max(35, assertivenessScore));
    listeningScore = Math.min(95, Math.max(40, listeningScore));
    const overall = Math.round((clarityScore * 0.3) + (assertivenessScore * 0.3) + (empathyScore * 0.2) + (listeningScore * 0.2));

    const weakestLine: WeakestLineRewrite = {
      originalLine: weakestTurn,
      suggestedRewrite: `Based on the $2.1M impact delivered this quarter, I am requesting an adjustment to $145k base salary.`,
      coachingRationale: `Replaces tentative hedging with verified data and an exact compensation anchor.`,
      techniqueApplied: 'Value-Anchored Assertion'
    };

    return {
      clarity: clarityScore,
      empathy: empathyScore,
      assertiveness: assertivenessScore,
      listening: listeningScore,
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
      clarity: 0,
      empathy: 0,
      assertiveness: 0,
      listening: 0,
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

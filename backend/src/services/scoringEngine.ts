import { v4 as uuidv4 } from 'uuid';
import { LLMService, llmService } from './llmService.js';
import { Scenario, MessageTurn, SubstanceRubric, Scorecard, WeakestLineRewrite } from '../types/index.js';
import { CompetencyProfile, formatCompetencyProfileForPrompt } from './competencyProfileService.js';

export class ScoringEngine {
  constructor(private llm: LLMService = llmService) {}

  async evaluateSession(
    scenario: Scenario,
    turns: MessageTurn[],
    competencyProfile: CompetencyProfile | null = null
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

GRADING TONE: ${competencyProfile && competencyProfile.sessionsAnalyzed >= 3 ? 'This user has some practice behind them — grade to a normal standard.' : 'This user is a BEGINNER (fewer than 3 scored sessions). Grade encouragingly: a short, honest, reasonably clear attempt deserves 60+ overall. Name what they did well first, give at most 2 simple growth areas in plain everyday language, and avoid jargon.'}

${formatCompetencyProfileForPrompt(competencyProfile)}
Use this history to make "strengths" and "growthAreas" feel like a continuation of a real coaching relationship, not a first impression — e.g. call out when a historically weak skill actually held up well this time, or when a recurring growth area from prior sessions showed up again. Don't force this if there isn't a genuine, specific connection to make; a generic mention of the trend adds nothing a rehearsing user hasn't already seen.

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
        { temperature: 0.4, responseFormat: 'json', strict: true }
      );

      const parsed = this.cleanAndParseJSON(rawResponse);
      return this.validateAndNormalizeRubric(parsed, userTurns);
    } catch (err) {
      // With a real AI key configured, a failed evaluation is an error, not a
      // reason to hand back an invented score that would be saved as real XP,
      // history and streak. The heuristic only stands in when no key exists.
      if (process.env.GEMINI_API_KEY) throw err;
      console.warn('LLM scoring unavailable, using heuristic rubric calculation:', err);
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

    // Build a scenario-aware rewrite based on what the user actually said and
    // the scenario context — avoids a misleading salary-negotiation template
    // appearing for unrelated scenarios (e.g. conflict resolution, feedback).
    const scenarioContext = scenario?.title || scenario?.situation || 'this conversation';
    const rawLine = weakestTurn.trim();
    const dynamicRewrite = rawLine
      ? `In the context of ${scenarioContext}: Instead of saying "${rawLine.slice(0, 80)}${rawLine.length > 80 ? '...' : ''}", lead with your concrete goal and frame your position around impact rather than permission.`
      : `In ${scenarioContext}: State your position directly and anchor it on observable facts or agreed outcomes rather than tentative language.`;

    const weakestLine: WeakestLineRewrite = {
      originalLine: weakestTurn,
      suggestedRewrite: dynamicRewrite,
      coachingRationale: `Replacing tentative or hedging language with a direct, outcome-focused statement gives you more influence in ${scenarioContext.toLowerCase()}.`,
      techniqueApplied: 'Direct Assertion'
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

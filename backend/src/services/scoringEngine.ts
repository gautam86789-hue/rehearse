import { LLMService, llmService } from './llmService.js';
import {
  Scenario,
  MessageTurn,
  SubstanceRubric,
  TurnAssessment,
  ReplyQuality,
  NextPractice,
  WeakestLineRewrite
} from '../types/index.js';
import { CompetencyProfile, formatCompetencyProfileForPrompt } from './competencyProfileService.js';
import { analyzeReply, ReplyFacts, QUALITY_BANDS } from './replyAnalysis.js';

const CATEGORIES = ['negotiation', 'feedback', 'boundaries', 'managing_up', 'difficult_decisions', 'crisis'];
const QUALITIES: ReplyQuality[] = ['nonsense', 'off_topic', 'weak', 'ok', 'strong'];

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));
const num = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Scores a rehearsal from what the user actually said.
 *
 * How the number is built (so it can't be gamed with filler):
 *  1. Every user reply is graded on its own (nonsense / off_topic / weak / ok /
 *     strong) with a reason and a stronger version. Keyboard-mashing is caught
 *     locally; everything else is judged by the AI against the scenario.
 *  2. Each reply's score is clipped into the band for its quality.
 *  3. The overall score can never exceed the average of those reply scores
 *     (plus a small allowance), and the four skill scores are pulled down with it.
 *  4. Very short attempts are capped: one exchange or a handful of words can't
 *     demonstrate a skill.
 * A missing/invalid AI answer is an error — never an invented default score.
 */
export class ScoringEngine {
  constructor(private llm: LLMService = llmService) {}

  async evaluateSession(
    scenario: Scenario,
    turns: MessageTurn[],
    competencyProfile: CompetencyProfile | null = null
  ): Promise<SubstanceRubric> {
    const userTurns = turns.filter((t) => t.speaker === 'user');
    if (userTurns.length === 0) return this.getEmptyRubric();

    const facts = userTurns.map((t) => analyzeReply(t.message));

    // Nothing but mashing / one-word replies: no AI needed, the answer is clear.
    if (facts.every((f) => f.isMash || f.isMinimal)) {
      return this.noEffortRubric(scenario, userTurns, facts);
    }

    if (!process.env.GEMINI_API_KEY) {
      return this.offlineRubric(scenario, userTurns, facts);
    }

    const raw = await this.llm.generateCompletion(
      [
        { role: 'system', content: this.buildSystemPrompt(competencyProfile) },
        { role: 'user', content: this.buildUserPrompt(scenario, turns, userTurns, facts) }
      ],
      { temperature: 0.2, responseFormat: 'json', strict: true, thinking: 'low', maxTokens: 3200 }
    );
    return this.buildRubric(this.cleanAndParseJSON(raw), scenario, userTurns, facts);
  }

  // ---------------------------------------------------------------- prompts

  private buildSystemPrompt(profile: CompetencyProfile | null): string {
    const experienced = !!profile && profile.sessionsAnalyzed >= 3;
    return `You are an expert communication coach and a STRICT, HONEST grader of practice conversations. People use your scores to decide what to improve, so an inflated score harms them.

You will get a scenario and a transcript. Grade ONLY what the user (the person practising) actually wrote. Read every user reply carefully against the scenario and the counterpart's last message.

SCORING BANDS (use the whole range; most real first attempts land between 40 and 70):
- 0-19: not a real attempt — random words, gibberish, keyboard mashing, a list of unrelated words, pure insults, or replies that ignore the scenario entirely.
- 20-39: poor — on the topic but vague, rambling, evasive, or backs down immediately.
- 40-59: weak to average — the point is there but hedged, generic or ignores what the counterpart said.
- 60-74: decent — clear, relevant, some skill shown, with clear gaps.
- 75-89: strong — clear ask, acknowledges the other side, holds position, moves toward the goal under pushback.
- 90-100: exceptional and rare — precise, empathetic, resilient, achieves the goal.
NEVER give a decent score to replies that are nonsense, off-topic, or a random list of words, even if they are long. Be kind in your WORDING, but never in your numbers.

GRADE EACH USER REPLY on its own with a quality label:
- "nonsense": gibberish, random words, no meaning.
- "off_topic": real language, but unrelated to this scenario or ignores what was said.
- "weak": relevant but vague, hedged, apologetic, or conceding.
- "ok": relevant and reasonably clear.
- "strong": clear, specific, empathetic where needed, and firm.
Each gets a 0-100 "score" consistent with its label (nonsense 0-5, off_topic 0-20, weak 15-50, ok 40-75, strong 65-100).

SKILLS (0-100 each, judged across the whole conversation and consistent with the reply grades):
- clarity: states the point directly and specifically.
- empathy: acknowledges the counterpart's perspective before or while pressing their own.
- assertiveness: holds the position under pushback without collapsing or attacking.
- listening: responds to what the counterpart actually said, not a script.
- goalProgress: how far the user moved toward the scenario's goal.

FEEDBACK QUALITY: Be specific to THIS scenario and THESE words. Quote the user's own lines. No generic advice ("be more confident"). Explain why something works or doesn't, and what to do instead. ${
      experienced
        ? 'This user has some practice behind them: grade to a normal standard and challenge them.'
        : 'This user is newer: keep the wording encouraging and simple (no jargon), but keep the numbers honest.'
    }

${formatCompetencyProfileForPrompt(profile)}
Use that history for "progressNote": say concretely what improved, what is still recurring, and the one thing to focus on next. If there is no history, say this session is the baseline.

Return ONLY valid JSON, exactly this shape:
{
  "verdict": "one honest sentence on the whole attempt",
  "summary": "3-4 sentences on how the conversation flowed from the first line to the last: where the user gained ground, where they lost it, and why",
  "clarity": 0, "empathy": 0, "assertiveness": 0, "listening": 0, "goalProgress": 0,
  "replies": [ { "turn": 1, "quality": "weak", "score": 0, "note": "specific to that reply — what worked or didn't, quoting a phrase", "betterVersion": "a stronger line for this exact moment in the scenario" } ],
  "strengths": ["specific strength with a quoted phrase (empty list if there truly is none)"],
  "growthAreas": ["specific problem, quoting the user's words, and how to fix it"],
  "weakestLineRewrite": { "originalLine": "exact user line", "suggestedRewrite": "stronger version", "coachingRationale": "why it lands better", "techniqueApplied": "technique name" },
  "keyTakeaways": ["practical takeaway for the real conversation"],
  "progressNote": "how this compares with the user's history and what to focus on",
  "nextPractice": { "focus": "the one skill to work on next", "drill": "a concrete exercise for the next session", "category": "one of: ${CATEGORIES.join(', ')}" }
}
"replies" must contain one entry for EVERY user reply, in order. If nothing deserves praise, "strengths" must be an empty list — do not invent praise.`;
  }

  private buildUserPrompt(scenario: Scenario, turns: MessageTurn[], userTurns: MessageTurn[], facts: ReplyFacts[]): string {
    let userIdx = 0;
    const transcript = turns
      .map((t) => {
        if (t.speaker === 'user') {
          userIdx += 1;
          return `USER REPLY ${userIdx}: ${t.message}`;
        }
        return `${scenario.counterpartName.toUpperCase()}: ${t.message}`;
      })
      .join('\n');

    const hints = facts
      .map((f, i) => {
        const bits: string[] = [];
        if (f.isMash) bits.push('looks like keyboard-mashing/gibberish');
        else if (f.wordCount >= 4 && f.commonWordRatio < 0.12) bits.push('almost no connecting words, so it may be a list of random words rather than a sentence');
        if (f.wordCount <= 3) bits.push('very short');
        return bits.length ? `- Reply ${i + 1}: ${bits.join('; ')}` : null;
      })
      .filter(Boolean)
      .join('\n');

    return `SCENARIO
Title: ${scenario.title}
Situation: ${scenario.situation}
The user's goal: ${scenario.userGoal}
Counterpart: ${scenario.counterpartName} (${scenario.counterpartRole}), archetype: ${scenario.counterpartArchetype}
What a good outcome looks like: ${scenario.brief?.whatGoodLooksLike ?? 'n/a'}
Likely pushback: ${(scenario.brief?.probablePushbackPatterns || []).join('; ') || 'n/a'}

TRANSCRIPT (${userTurns.length} user repl${userTurns.length === 1 ? 'y' : 'ies'})
${transcript}
${hints ? `\nAUTOMATIC PRE-CHECK NOTES (facts, not verdicts):\n${hints}\n` : ''}
Grade it now.`;
  }

  // ---------------------------------------------------------- result building

  private cleanAndParseJSON(text: string): any {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found in scoring output');
    return JSON.parse(match[0]);
  }

  private buildRubric(parsed: any, scenario: Scenario, userTurns: MessageTurn[], facts: ReplyFacts[]): SubstanceRubric {
    const skills = {
      clarity: num(parsed.clarity),
      empathy: num(parsed.empathy),
      assertiveness: num(parsed.assertiveness),
      listening: num(parsed.listening),
      goalProgress: num(parsed.goalProgress)
    };
    if (Object.values(skills).some((v) => v === null)) {
      throw new Error('Scoring output was missing skill scores');
    }
    if (!Array.isArray(parsed.replies) || parsed.replies.length === 0) {
      throw new Error('Scoring output was missing per-reply grades');
    }

    // ---- per-reply assessments, clipped into their quality band
    const turnAssessments: TurnAssessment[] = userTurns.map((t, i) => {
      const r = parsed.replies.find((x: any) => Number(x?.turn) === i + 1) ?? parsed.replies[i] ?? {};
      let quality: ReplyQuality = QUALITIES.includes(r.quality) ? r.quality : 'weak';
      let score = num(r.score) ?? (QUALITY_BANDS[quality].min + QUALITY_BANDS[quality].max) / 2;
      // Keyboard-mashing is nonsense no matter what the AI said.
      if (facts[i].isMash) {
        quality = 'nonsense';
        score = 0;
      }
      const band = QUALITY_BANDS[quality];
      score = Math.round(clamp(score, band.min, band.max));
      return {
        turn: i + 1,
        youSaid: t.message,
        quality,
        score,
        note: String(r.note || '').trim() || 'No specific note for this line.',
        betterVersion: r.betterVersion ? String(r.betterVersion).trim() : undefined
      };
    });

    // ---- the ceiling: the conversation can't score higher than its replies did
    const turnAvg = turnAssessments.reduce((a, t) => a + t.score, 0) / turnAssessments.length;
    const totalWords = facts.reduce((a, f) => a + f.wordCount, 0);
    // Replies that earned very little leave almost no room above them.
    let ceiling = turnAvg + (turnAvg < 25 ? 5 : 12);
    if (userTurns.length === 1) ceiling = Math.min(ceiling, 65); // one exchange can't show a pattern
    if (totalWords < 12) ceiling = Math.min(ceiling, 35);

    const soft = (v: number) => Math.round(clamp(Math.min(v, turnAvg + 20, ceiling + 8)));
    const clarity = soft(skills.clarity!);
    const empathy = soft(skills.empathy!);
    const assertiveness = soft(skills.assertiveness!);
    const listening = soft(skills.listening!);
    const goalProgress = soft(skills.goalProgress!);

    const weighted = clarity * 0.25 + empathy * 0.2 + assertiveness * 0.25 + listening * 0.15 + goalProgress * 0.15;
    const overallScore = Math.round(clamp(Math.min(weighted, ceiling)));

    // "nonsense" = not a real attempt at all (replies were gibberish / random /
    // off-topic). A relevant but weak attempt — even one that caves completely —
    // is still real practice, just with a low score.
    const attemptQuality: SubstanceRubric['attemptQuality'] =
      turnAvg < 10 ? 'nonsense' : totalWords < 25 || overallScore < 35 ? 'low_effort' : 'ok';

    const strList = (v: any): string[] => (Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : []);
    let strengths = strList(parsed.strengths);
    // No praise for attempts that didn't earn any.
    if (attemptQuality === 'nonsense') strengths = [];
    else if (attemptQuality === 'low_effort') strengths = strengths.slice(0, 1);

    const growthAreas = strList(parsed.growthAreas);
    if (growthAreas.length === 0) throw new Error('Scoring output had no growth areas');

    const weakest = this.pickWeakest(parsed.weakestLineRewrite, turnAssessments);

    const cat = String(parsed?.nextPractice?.category || '').toLowerCase();
    const nextPractice: NextPractice = {
      focus: String(parsed?.nextPractice?.focus || '').trim() || 'Answering what the other person actually said',
      drill: String(parsed?.nextPractice?.drill || '').trim() || 'Redo this scenario and open with your ask in one clear sentence.',
      category: CATEGORIES.includes(cat) ? cat : scenario.category
    };

    return {
      clarity,
      empathy,
      assertiveness,
      listening,
      overallScore,
      goalProgress,
      strengths,
      growthAreas,
      weakestLineRewrite: weakest,
      keyTakeaways: strList(parsed.keyTakeaways).slice(0, 4),
      verdict: String(parsed.verdict || '').trim() || this.verdictFor(overallScore),
      summary: String(parsed.summary || '').trim(),
      turnAssessments,
      nextPractice,
      progressNote: String(parsed.progressNote || '').trim() || undefined,
      attemptQuality
    };
  }

  private pickWeakest(fromAi: any, assessments: TurnAssessment[]): WeakestLineRewrite {
    if (fromAi?.originalLine && fromAi?.suggestedRewrite) {
      return {
        originalLine: String(fromAi.originalLine),
        suggestedRewrite: String(fromAi.suggestedRewrite),
        coachingRationale: String(fromAi.coachingRationale || ''),
        techniqueApplied: String(fromAi.techniqueApplied || 'Direct Assertion')
      };
    }
    // Fall back to the reply that scored lowest and its own better version.
    const worst = [...assessments].sort((a, b) => a.score - b.score)[0];
    return {
      originalLine: worst.youSaid,
      suggestedRewrite: worst.betterVersion || 'State your position in one clear sentence and tie it to the goal.',
      coachingRationale: worst.note,
      techniqueApplied: 'Direct Assertion'
    };
  }

  private verdictFor(score: number): string {
    if (score < 20) return 'This was not a real attempt at the conversation yet.';
    if (score < 40) return 'A weak attempt — the basics of the conversation are still missing.';
    if (score < 60) return 'A fair start, with clear gaps to work on.';
    if (score < 75) return 'A decent attempt with real skill in places.';
    if (score < 90) return 'A strong performance.';
    return 'An exceptional performance.';
  }

  // ---------------------------------------------- deterministic (no-AI) paths

  // Only mashing / one-word replies: score is decided locally, feedback is
  // honest and points at what to do instead.
  private noEffortRubric(scenario: Scenario, userTurns: MessageTurn[], facts: ReplyFacts[]): SubstanceRubric {
    const mash = facts.filter((f) => f.isMash).length;
    const first = userTurns[0].message;
    const opener = scenario.brief?.recommendedOpeningFormula || 'State what you want in one clear sentence.';
    const turnAssessments: TurnAssessment[] = userTurns.map((t, i) => ({
      turn: i + 1,
      youSaid: t.message,
      quality: 'nonsense',
      score: facts[i].isMash ? 0 : 3,
      note: facts[i].isMash ? 'This is not a recognisable sentence, so there is nothing to assess.' : 'A single word gives no position to assess.',
      betterVersion: opener
    }));
    return {
      clarity: 2,
      empathy: 2,
      assertiveness: 2,
      listening: 2,
      goalProgress: 0,
      overallScore: 2,
      strengths: [],
      growthAreas: [
        mash > 0
          ? 'Your replies were not real sentences, so no skill could be assessed. Write what you would actually say to this person.'
          : 'One-word replies do not show a position. Answer in full sentences.',
        `Start with your goal: ${scenario.userGoal}`
      ],
      weakestLineRewrite: {
        originalLine: first,
        suggestedRewrite: opener,
        coachingRationale: 'A real opening states the situation and what you want, so the other person has something to respond to.',
        techniqueApplied: 'Start with a real opening'
      },
      keyTakeaways: [
        'The practice only works if you say what you would really say.',
        'Try again and write two or three full sentences per reply.'
      ],
      verdict: this.verdictFor(2),
      summary: 'No meaningful replies were given, so there was no conversation to score. Nothing here counts towards your progress.',
      turnAssessments,
      nextPractice: {
        focus: 'Writing a complete, on-topic reply',
        drill: `Redo "${scenario.title}" and open with one sentence that says what you want.`,
        category: scenario.category
      },
      progressNote: 'This attempt is not counted as practice.',
      attemptQuality: 'nonsense'
    };
  }

  // No AI key configured (local development): a coarse, honest estimate.
  private offlineRubric(scenario: Scenario, userTurns: MessageTurn[], facts: ReplyFacts[]): SubstanceRubric {
    const per: number[] = facts.map((f): number => {
      if (f.isMash) return 0;
      if (f.wordCount < 4) return 20;
      if (f.commonWordRatio < 0.12) return 8;
      return f.wordCount >= 12 ? 55 : 40;
    });
    const avg = per.reduce((a, b) => a + b, 0) / per.length;
    const s = Math.round(clamp(avg));
    const turnAssessments: TurnAssessment[] = userTurns.map((t, i) => ({
      turn: i + 1,
      youSaid: t.message,
      quality: per[i] < 6 ? 'nonsense' : per[i] < 25 ? 'weak' : 'ok',
      score: per[i],
      note: 'Estimated without the AI grader.'
    }));
    return {
      clarity: s,
      empathy: s,
      assertiveness: s,
      listening: s,
      goalProgress: s,
      overallScore: s,
      strengths: s >= 40 ? ['You wrote complete sentences about the situation.'] : [],
      growthAreas: ['Detailed AI feedback is unavailable right now. Aim for a clear ask, acknowledge the other side, and respond to what they said.'],
      weakestLineRewrite: {
        originalLine: userTurns[0].message,
        suggestedRewrite: scenario.brief?.recommendedOpeningFormula || 'State your ask in one clear sentence.',
        coachingRationale: 'A direct opening gives the conversation a clear starting point.',
        techniqueApplied: 'Direct Assertion'
      },
      keyTakeaways: ['Lead with the ask.', 'Respond to what the other person actually said.'],
      verdict: this.verdictFor(s),
      turnAssessments,
      attemptQuality: s < 20 ? 'nonsense' : s < 35 ? 'low_effort' : 'ok'
    };
  }

  private getEmptyRubric(): SubstanceRubric {
    return {
      clarity: 0,
      empathy: 0,
      assertiveness: 0,
      listening: 0,
      goalProgress: 0,
      overallScore: 0,
      strengths: [],
      growthAreas: ['Send at least one reply so there is something to score.'],
      weakestLineRewrite: {
        originalLine: 'No dialogue submitted.',
        suggestedRewrite: 'State your ask clearly in the opening turn.',
        coachingRationale: 'Conversational practice requires an opening statement.',
        techniqueApplied: 'Opening Hook'
      },
      keyTakeaways: ['Practice speaking your ask out loud'],
      verdict: 'Nothing was said, so there is nothing to score.',
      attemptQuality: 'nonsense'
    };
  }
}

export const scoringEngine = new ScoringEngine();

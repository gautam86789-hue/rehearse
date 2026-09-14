import { RoleplaySession } from '../types/index.js';

// The minimal shape computeCompetencyProfile actually needs — both real
// callers have something matching this without extra work: roleplayController
// has Scorecard (which structurally satisfies this), and assistantController
// has the client-sent AssistantSessionSummary[] (session data the client
// already tracks locally, not re-fetched from the DB — a different pattern
// than roleplayController's server-side fetch, but the same arithmetic
// either way).
export interface ScoredSessionSummary {
  clarity: number;
  empathy: number;
  assertiveness: number;
  listening: number;
  overallScore: number;
  growthAreas: string[];
}

// The thing that makes this app more than a stateless wrapper around an
// LLM: every completed rehearsal already produces a scorecard, and those
// scorecards already sit in session history — this just aggregates ones
// already paid for into a rolling read of where a user actually stands,
// computed with plain arithmetic (no extra LLM call, no added cost or
// latency) and fed back into the scoring, roleplay, and coach prompts so
// each of those reads the user's real trajectory instead of treating every
// session as the first one they've ever done.
export interface CompetencyProfile {
  sessionsAnalyzed: number;
  skillAverages: {
    clarity: number;
    empathy: number;
    assertiveness: number;
    listening: number;
  };
  weakestSkill: 'clarity' | 'empathy' | 'assertiveness' | 'listening';
  strongestSkill: 'clarity' | 'empathy' | 'assertiveness' | 'listening';
  trend: 'improving' | 'declining' | 'stable';
  topGrowthAreas: string[];
}

// Prints as a compact block any prompt can splice in directly — every
// caller (scoring, roleplay, coach) wants the same shape of context, just
// used for a different purpose once it's there.
export function formatCompetencyProfileForPrompt(profile: CompetencyProfile | null): string {
  if (!profile || profile.sessionsAnalyzed === 0) {
    return 'No prior rehearsal history yet — this is a new user with no established performance pattern.';
  }
  const { skillAverages, weakestSkill, strongestSkill, trend, topGrowthAreas, sessionsAnalyzed } = profile;
  return `USER'S ROLLING PERFORMANCE PROFILE (from ${sessionsAnalyzed} prior scored rehearsal${sessionsAnalyzed === 1 ? '' : 's'}):
- Average scores — Clarity: ${skillAverages.clarity}, Empathy: ${skillAverages.empathy}, Assertiveness: ${skillAverages.assertiveness}, Listening: ${skillAverages.listening}
- Consistently weakest skill: ${weakestSkill}
- Consistently strongest skill: ${strongestSkill}
- Recent trend: ${trend}
- Recurring growth areas across sessions: ${topGrowthAreas.length > 0 ? topGrowthAreas.join('; ') : 'none identified yet'}`;
}

// Convenience wrapper for roleplayController, which has full
// RoleplaySession[] from a server-side fetch — extracts the scored ones and
// delegates to the shared arithmetic below.
export function computeCompetencyProfile(sessions: RoleplaySession[]): CompetencyProfile | null {
  const scored = sessions
    .filter((s) => s.status === 'completed' && s.scorecard)
    .map((s) => s.scorecard!);
  return computeCompetencyProfileFromScores(scored);
}

// The actual arithmetic, shared by both callers (see ScoredSessionSummary).
// Sessions are expected newest-first (matches both memoryDb.getUserSessions'
// ordering and how the client already orders its own local session cache)
// — the trend split below relies on that ordering to compare "most recent
// half" against "older half".
export function computeCompetencyProfileFromScores(scored: ScoredSessionSummary[]): CompetencyProfile | null {
  if (scored.length === 0) return null;

  const avg = (key: 'clarity' | 'empathy' | 'assertiveness' | 'listening') =>
    Math.round(scored.reduce((sum, sc) => sum + (sc[key] || 0), 0) / scored.length);

  const skillAverages = {
    clarity: avg('clarity'),
    empathy: avg('empathy'),
    assertiveness: avg('assertiveness'),
    listening: avg('listening')
  };

  const ranked = (Object.entries(skillAverages) as [keyof typeof skillAverages, number][]).sort(
    (a, b) => a[1] - b[1]
  );
  const weakestSkill = ranked[0][0];
  const strongestSkill = ranked[ranked.length - 1][0];

  // Needs at least 4 scored sessions to split into a meaningful "before vs
  // after" comparison — below that, a single strong or weak session would
  // swing the trend without enough data to back it up.
  let trend: CompetencyProfile['trend'] = 'stable';
  if (scored.length >= 4) {
    const mid = Math.floor(scored.length / 2);
    const recentAvg = scored.slice(0, mid).reduce((s, sc) => s + sc.overallScore, 0) / mid;
    const olderAvg = scored.slice(mid).reduce((s, sc) => s + sc.overallScore, 0) / (scored.length - mid);
    if (recentAvg - olderAvg >= 5) trend = 'improving';
    else if (olderAvg - recentAvg >= 5) trend = 'declining';
  }

  const growthCounts: Record<string, number> = {};
  scored.forEach((sc) => (sc.growthAreas || []).forEach((g) => {
    growthCounts[g] = (growthCounts[g] || 0) + 1;
  }));
  const topGrowthAreas = Object.entries(growthCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g);

  return {
    sessionsAnalyzed: scored.length,
    skillAverages,
    weakestSkill,
    strongestSkill,
    trend,
    topGrowthAreas
  };
}

import { HistoryEntry, ScenarioCategory } from '../types/index';
import { ConstellationSkill } from '../components/progress/SkillConstellation';
import { ConfidenceDataPoint } from '../types/progress';
import { bandFor, BANDS } from '../components/progress/core/geometry';

/**
 * Turns the user's real HistoryEntry[] (every completed, scored rehearsal)
 * into the same shapes the Progress screen renders — replacing what used to
 * be a fixed demo dataset in progressData.ts. Every number here traces back
 * to an actual scorecard; nothing is invented.
 */

const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  negotiation: 'Negotiation',
  feedback: 'Difficult Feedback',
  boundaries: 'Boundary Setting',
  managing_up: 'Managing Up',
  difficult_decisions: 'Difficult Decisions',
  crisis: 'Crisis Response'
};

const CATEGORY_ORDER: ScenarioCategory[] = [
  'negotiation',
  'boundaries',
  'feedback',
  'difficult_decisions',
  'managing_up',
  'crisis'
];

type RubricKey = 'clarity' | 'empathy' | 'assertiveness' | 'listening';
const RUBRIC_LABEL: Record<RubricKey, string> = {
  clarity: 'Clarity',
  empathy: 'Empathy',
  assertiveness: 'Assertiveness',
  listening: 'Listening'
};

/** Oldest-first copy — every derivation below reads trends left-to-right. */
const chronological = (history: HistoryEntry[]) =>
  [...history].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

export function deriveConfidenceSeries(history: HistoryEntry[]): ConfidenceDataPoint[] {
  return chronological(history).map((h, i) => ({
    rehearsalIndex: i + 1,
    score: h.overallScore,
    label: String(i + 1),
    scenarioTitle: h.scenarioTitle
  }));
}

export function deriveSkillsFromHistory(history: HistoryEntry[]): ConstellationSkill[] {
  const ordered = chronological(history);

  return CATEGORY_ORDER.map((category) => {
    const sessions = ordered.filter((h) => h.category === category);
    const id = category;
    const name = CATEGORY_LABELS[category];

    if (sessions.length === 0) {
      return {
        id,
        name,
        category: categoryGroupLabel(category),
        score: 0,
        rehearsalsCount: 0,
        recentScores: [],
        strengths: [],
        growthAreas: [],
        locked: true
      };
    }

    const score = Math.round(sessions.reduce((sum, s) => sum + s.overallScore, 0) / sessions.length);
    const recentScores = sessions.slice(-3).map((s) => s.overallScore);

    const rubricAverages: Record<RubricKey, number> = {
      clarity: avg(sessions.map((s) => s.clarity)),
      empathy: avg(sessions.map((s) => s.empathy)),
      assertiveness: avg(sessions.map((s) => s.assertiveness)),
      listening: avg(sessions.map((s) => s.listening))
    };
    const topRubric = (Object.keys(rubricAverages) as RubricKey[]).sort(
      (a, b) => rubricAverages[b] - rubricAverages[a]
    )[0];

    const band = bandFor(score);
    const strengths = [
      BANDS[band].note,
      `${RUBRIC_LABEL[topRubric]} averaging ${rubricAverages[topRubric]} across ${sessions.length} rehearsal${sessions.length === 1 ? '' : 's'}`
    ];

    const growthCounts = new Map<string, number>();
    sessions.forEach((s) => s.growthAreas.forEach((g) => growthCounts.set(g, (growthCounts.get(g) || 0) + 1)));
    const growthAreas = [...growthCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([g]) => g);

    const last = sessions[sessions.length - 1];

    return {
      id,
      name,
      category: categoryGroupLabel(category),
      score,
      rehearsalsCount: sessions.length,
      recentScores,
      strengths,
      growthAreas,
      lastPracticed: last.completedAt
    };
  });
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/** A broader grouping label, shown as the skill's subtitle in the UI. */
function categoryGroupLabel(category: ScenarioCategory): string {
  switch (category) {
    case 'negotiation':
      return 'Commercial & Compensation';
    case 'boundaries':
      return 'Workload & Governance';
    case 'feedback':
      return 'People Leadership';
    case 'managing_up':
      return 'Stakeholder Influence';
    case 'difficult_decisions':
      return 'High-Stakes Communication';
    case 'crisis':
      return 'Crisis & Escalation';
    default:
      return 'General';
  }
}

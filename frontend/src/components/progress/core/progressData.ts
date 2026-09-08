import { ConfidenceDataPoint, AchievementItem } from '../../../types/progress';
import { ConstellationSkill } from '../SkillConstellation';
import { PracticeDay } from '../PracticeRhythm';

/**
 * Single source of truth for the Progress surfaces.
 *
 * Previously the screen, the tree canvas and the mountain canvas each carried
 * their own copies of the skill scores, and they disagreed. Everything now
 * reads from here, so one edit moves every visual together.
 */

export const SKILLS: ConstellationSkill[] = [
  {
    id: 'negotiation_salary',
    name: 'Negotiation',
    category: 'Commercial & Compensation',
    score: 86,
    rehearsalsCount: 3,
    recentScores: [74, 81, 86],
    strengths: [
      'Strong anchoring with market precedent',
      'Effective pause after stating compensation terms',
      'Defended variable bonus components firmly'
    ],
    growthAreas: [
      'Explore non-monetary equity trade-offs earlier',
      'Avoid preemptive justification before counter-offer'
    ],
    recommendedScenarioId: 's1',
    recommendedScenarioTitle: 'Executive Compensation & Scope Alignment'
  },
  {
    id: 'boundary_setting',
    name: 'Boundary Setting',
    category: 'Workload & Governance',
    score: 82,
    rehearsalsCount: 2,
    recentScores: [76, 82],
    strengths: [
      'Direct refusal without apologetic weakening',
      'Clear redirection to agreed quarterly roadmap'
    ],
    growthAreas: ['Establish explicit SLAs when rejecting ad-hoc asks'],
    recommendedScenarioId: 's2',
    recommendedScenarioTitle: 'Pivoting an Unfunded Board Request'
  },
  {
    id: 'difficult_feedback',
    name: 'Difficult Feedback',
    category: 'People Leadership',
    score: 79,
    rehearsalsCount: 2,
    recentScores: [71, 79],
    strengths: [
      'Grounded feedback in observable behaviors',
      'Kept emotional tone steady during initial defensiveness'
    ],
    growthAreas: ['Follow through with immediate 30-day performance check-ins'],
    recommendedScenarioId: 's3',
    recommendedScenarioTitle: 'Performance Turnaround for Underperforming Lead'
  },
  {
    id: 'executive_presence',
    name: 'Executive Presence',
    category: 'High-Stakes Communication',
    score: 74,
    rehearsalsCount: 1,
    recentScores: [74],
    strengths: [
      'Succinct executive summary opening',
      'Handled interruptions without losing core narrative'
    ],
    growthAreas: [
      'Slow down vocal cadence during intense pushback',
      'Use tactical silence instead of filler transitions'
    ],
    recommendedScenarioId: 's4',
    recommendedScenarioTitle: 'High-Stakes Cross-Functional Budget Defense'
  },
  {
    id: 'managing_up',
    name: 'Managing Up',
    category: 'Stakeholder Influence',
    score: 68,
    rehearsalsCount: 0,
    recentScores: [],
    strengths: [],
    growthAreas: ['Build a repeatable pre-read before executive check-ins'],
    locked: true,
    recommendedScenarioId: 's5',
    recommendedScenarioTitle: 'Realigning Priorities With Your Chief of Staff'
  }
];

export const CONFIDENCE_SERIES: ConfidenceDataPoint[] = [
  { rehearsalIndex: 1, score: 61, label: '1' },
  { rehearsalIndex: 2, score: 68, label: '2' },
  { rehearsalIndex: 3, score: 65, label: '3' },
  { rehearsalIndex: 4, score: 72, label: '4' },
  { rehearsalIndex: 5, score: 76, label: '5' },
  { rehearsalIndex: 6, score: 79, label: '6' },
  { rehearsalIndex: 7, score: 82, label: '7' },
  { rehearsalIndex: 8, score: 80, label: '8' },
  { rehearsalIndex: 9, score: 84, label: '9' },
  { rehearsalIndex: 10, score: 86, label: '10' }
];

export const ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'a1',
    title: 'First Rehearsal',
    description: 'Completed your first full AI counterpart simulation.',
    icon: '🏅',
    unlocked: true,
    unlockedDate: 'Jun 2, 2026'
  },
  {
    id: 'a2',
    title: '3-Day Streak',
    description: 'Maintained 3 consecutive days of deliberate practice.',
    icon: '🔥',
    unlocked: true,
    unlockedDate: 'Jun 5, 2026'
  },
  {
    id: 'a3',
    title: '90+ Score Club',
    description: 'Achieved 90%+ substance rating in high-stakes negotiation.',
    icon: '🎯',
    unlocked: true,
    unlockedDate: 'Jun 7, 2026'
  },
  {
    id: 'a4',
    title: 'Tactical Empathy Master',
    description: 'Execute 5 calibrated questions without triggering pushback.',
    icon: '💎',
    unlocked: false,
    progressText: '3/5'
  },
  {
    id: 'a5',
    title: 'Executive Tenacity',
    description: 'Rehearse 10 distinct difficult conversation scenarios.',
    icon: '👑',
    unlocked: false,
    progressText: '4/10'
  },
  {
    id: 'a6',
    title: 'Influence at the Top',
    description: 'Complete 5 Managing Up scenarios with 80%+ confidence.',
    icon: '👥',
    unlocked: false,
    progressText: '2/5'
  }
];

const DAY_MS = 86400000;

/**
 * Practice history anchored to today, so the calendar grid always shows a
 * live trailing window instead of dates that drift out of range.
 * Offsets are days-ago; replace with real session dates when the API lands.
 */
const PRACTICE_OFFSETS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 1], [4, 1], [5, 1],
  [8, 1], [9, 2], [11, 1], [14, 1], [15, 1],
  [18, 1], [21, 2], [22, 1], [25, 1], [29, 1],
  [30, 1], [33, 2], [36, 1], [40, 1], [43, 1],
  [47, 1], [51, 2], [55, 1], [60, 1], [64, 1],
  [69, 1], [73, 1], [78, 2]
];

export const buildPracticeDays = (): PracticeDay[] => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return PRACTICE_OFFSETS.map(([ago, count]) => ({
    date: new Date(today.getTime() - ago * DAY_MS).toISOString().slice(0, 10),
    count
  }));
};

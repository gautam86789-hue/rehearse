import { ConfidenceDataPoint } from '../../../types/progress';
import { ConstellationSkill } from '../SkillConstellation';

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

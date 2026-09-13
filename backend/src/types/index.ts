export type ArchetypeId =
  | 'defensive_boss'
  | 'guilt_tripper'
  | 'hard_negotiator'
  | 'passive_aggressive_peer'
  | 'micromanager'
  | 'skeptical_investor'
  | 'startup_cofounder';

export interface Archetype {
  id: ArchetypeId;
  name: string;
  title: string;
  tagline: string;
  accentColor: string;
  avatarIcon: string;
  personalityDescription: string;
  resistancePattern: string;
  typicalPhrases: string[];
  coachingHint: string;
}

export type ScenarioCategory =
  | 'negotiation'
  | 'feedback'
  | 'boundaries'
  | 'managing_up'
  | 'difficult_decisions'
  | 'crisis';

export interface ScenarioBrief {
  counterpartPosition: string;
  probablePushbackPatterns: string[];
  whatGoodLooksLike: string;
  keyPhrasesToAvoid: string[];
  recommendedOpeningFormula: string;
}

export type Audience = 'founders_investors' | 'new_managers' | 'mba_students' | 'professionals' | 'new_hires';

export interface Scenario {
  id: string;
  title: string;
  audiences: Audience[];
  category: ScenarioCategory;
  counterpartRole: string;
  counterpartName: string;
  counterpartArchetype: ArchetypeId;
  difficulty: 'Beginner' | 'Intermediate' | 'High Stakes';
  estimatedMinutes: number;
  situation: string;
  userGoal: string;
  brief: ScenarioBrief;
  isCurated: boolean;
  createdAt: string;
}

export interface MessageTurn {
  id: string;
  speaker: 'user' | 'counterpart';
  message: string;
  timestamp: string;
  tacticalAnalysis?: {
    assertivenessScore?: number;
    clarityScore?: number;
    boundaryScore?: number;
  };
}

export interface WeakestLineRewrite {
  originalLine: string;
  suggestedRewrite: string;
  coachingRationale: string;
  techniqueApplied: string;
}

export interface SubstanceRubric {
  clarity: number;        // 0-100: Was the point stated directly, without hedging?
  empathy: number;        // 0-100: Did the user acknowledge the counterpart's perspective/feelings?
  assertiveness: number;  // 0-100: Did the user hold their position without backing down?
  listening: number;      // 0-100: Did the user respond to what the counterpart actually said, not talk past them?
  overallScore: number;      // 0-100 weighted average
  strengths: string[];
  growthAreas: string[];
  weakestLineRewrite: WeakestLineRewrite;
  keyTakeaways: string[];
}

export interface Scorecard extends SubstanceRubric {
  id: string;
  sessionId: string;
  xpEarned: number;
  newStreak: number;
  streakExtended: boolean;
  badgeUnlocked?: {
    id: string;
    title: string;
    description: string;
    icon: string;
  };
  generatedAt: string;
}

export interface RoleplaySession {
  id: string;
  userId: string;
  scenario: Scenario;
  turns: MessageTurn[];
  status: 'in_progress' | 'completed' | 'abandoned';
  scorecard?: Scorecard;
  startedAt: string;
  completedAt?: string;
}

export interface FrameworkOfTheDay {
  id: string;
  title: string;
  sourceCredit: string;
  audiences: Audience[];
  /** Links this framework to the Word/Puzzle of the Day sharing the same
   *  concept, so a day's three daily-content cards read as one narrative
   *  (introduce → teach → apply) instead of three unrelated rotations. */
  theme?: string;
  tagline: string;
  summary: string;
  components: {
    step: string;
    label: string;
    explanation: string;
    example: string;
  }[];
  suggestedScenarioId: string;
  releaseDate: string;
}

export interface WordOfTheDay {
  id: string;
  term: string;
  audiences: Audience[];
  /** See FrameworkOfTheDay.theme — this is the anchor: the day's word picks
   *  the theme, framework/puzzle selection then prefers a same-theme match. */
  theme?: string;
  meaning: string;
  whyItMatters: string;
  releaseDate: string;
}

export interface DailyPuzzleOption {
  id: string;
  strategyLabel: string;
  responseText: string;
  isOptimal: boolean;
  score: number;
  explanation: string;
}

export interface DailyPuzzle {
  id: string;
  date: string;
  title: string;
  /** Undefined = shown to every audience. */
  audiences?: Audience[];
  /** See FrameworkOfTheDay.theme. */
  theme?: string;
  scenarioContext: string;
  counterpartOpeningLine: string;
  options: DailyPuzzleOption[];
  communityDistribution: {
    optionA: number;
    optionB: number;
    optionC: number;
  };
}

export interface ReplyOption {
  label: 'The Direct Option' | 'The Diplomatic Option' | 'The Boundary-Setting Option';
  responseText: string;
  whatThisAccomplishes: string;
  toneStyle: string;
}

export interface ReplyAssistantResult {
  id: string;
  userId?: string;
  originalSituation: string;
  options: ReplyOption[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  fullName?: string;
  avatarUrl?: string;
  role: string;
  experienceLevel: string;
  audience?: Audience;
  primaryDreadCategory: string;
  totalRehearsals: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate?: string;
  subscription: {
    status: 'free_trial' | 'active_monthly' | 'active_three_month' | 'active_annual' | 'expired';
    rehearsalsRemaining: number; // 2 free rehearsals total
    trialEndsAt?: string;
    planName?: string;
  };
  createdAt: string;
}

export interface UserAccount extends UserProfile {
  passwordHash?: string;
  passwordSalt?: string;
  isActive?: boolean;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}


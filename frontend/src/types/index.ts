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

export interface Scenario {
  id: string;
  title: string;
  audiences?: Audience[];
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
  clarity: number;
  empathy: number;
  assertiveness: number;
  listening: number;
  overallScore: number;
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
  audiences?: Audience[];
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

export type Audience = 'founders_investors' | 'new_managers' | 'mba_students' | 'professionals' | 'new_hires';

export type StoryTrajectory = 'assertive' | 'diplomatic' | 'avoidant' | 'aggressive';

export interface StoryOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  trajectory: StoryTrajectory;
}

export interface StoryBeat {
  narrative: string;
  options: StoryOption[];
}

export interface StoryEnding {
  title: string;
  narrative: string;
  tone: 'strong' | 'growth' | 'mixed';
}

export interface StoryTree {
  id: string;
  date: string;
  title: string;
  premise: string;
  q1: StoryBeat;
  q2: Record<StoryTrajectory, StoryBeat>;
  q3: Record<StoryTrajectory, StoryBeat>;
  q4: Record<StoryTrajectory, StoryBeat>;
  q5: Record<StoryTrajectory, StoryBeat>;
  endings: Record<StoryTrajectory, StoryEnding>;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  icon?: 'flame' | 'award' | 'shield-check' | 'sparkles';
  createdAt: string;
  read: boolean;
}

export interface HistoryEntry {
  id: string;
  scenarioTitle: string;
  counterpartName: string;
  category: ScenarioCategory | string;
  overallScore: number;
  clarity: number;
  empathy: number;
  assertiveness: number;
  listening: number;
  growthAreas: string[];
  completedAt: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  fullName?: string;
  avatarUri?: string;
  role: string;
  audience?: Audience;
  milestoneFlags?: Record<string, boolean>;
  completedPuzzleDates?: string[];
  completedStoryDates?: string[];
  readArticleIds?: string[];
  completedJourneyNodeIds?: string[];
  savedScenarioIds?: string[];
  experienceLevel: string;
  primaryDreadCategory: string;
  totalRehearsals: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate?: string;
  subscription: {
    status: 'free_rehearsals' | 'free_trial' | 'active_monthly' | 'active_three_month' | 'active_annual' | 'active_promo' | 'expired';
    rehearsalsRemaining: number;
    trialEndsAt?: string;
    planName?: string;
  };
  // Permanent record that this account has ever redeemed a promo code —
  // survives subscription.status moving on to 'expired' once the promo
  // period ends, so PaywallModal can tell "never had a free period" apart
  // from "already used their free period via a promo code".
  promoRedeemed?: boolean;
  // Confirmed via a sent code — gates promo code redemption specifically,
  // not general app access (see PaywallModal / EmailVerificationModal).
  emailVerified?: boolean;
  createdAt: string;
}

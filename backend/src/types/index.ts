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

// How one of the user's replies actually landed — graded individually so the
// overall score can never rise above what the replies themselves earned.
export type ReplyQuality = 'nonsense' | 'off_topic' | 'weak' | 'ok' | 'strong';

export interface TurnAssessment {
  turn: number;            // 1-based index among the user's replies
  youSaid: string;
  quality: ReplyQuality;
  score: number;           // 0-100
  note: string;            // what worked / what didn't, specific to this line
  betterVersion?: string;  // a stronger way to say it in this scenario
}

export interface NextPractice {
  focus: string;           // the one skill to work on next
  drill: string;           // a concrete exercise for the next session
  category?: string;       // scenario category to practise (negotiation, feedback, ...)
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
  // Richer, scenario-specific feedback (optional so older saved scorecards still load)
  goalProgress?: number;            // 0-100: how far the user moved toward the scenario goal
  verdict?: string;                 // one honest sentence on the whole attempt
  summary?: string;                 // how the conversation flowed, start to end
  turnAssessments?: TurnAssessment[];
  nextPractice?: NextPractice;
  progressNote?: string;            // how this compares with the user's earlier sessions
  attemptQuality?: 'ok' | 'low_effort' | 'nonsense';
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
  /** 1 = gentle warm-up, 2 = realistic, 3 = high stakes. Missing = 2. */
  level?: 1 | 2 | 3;
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
    status: 'free_rehearsals' | 'free_trial' | 'active_monthly' | 'active_three_month' | 'active_annual' | 'active_promo' | 'expired';
    rehearsalsRemaining: number; // 3 free rehearsals total
    trialEndsAt?: string;
    planName?: string;
  };
  // Permanent record that this account has ever redeemed a promo code —
  // kept separate from subscription.status so it survives the promo period
  // expiring (status will move on to 'expired', but this stays true forever,
  // which is what actually blocks a second redemption).
  promoRedeemed?: boolean;
  // True once the account has confirmed its email via a sent code — gates
  // promo code redemption (see subscriptionController) so a throwaway or
  // mistyped address can't be used to farm the promo. Doesn't gate general
  // app access — a guest/free account is fully usable unverified.
  emailVerified?: boolean;
  createdAt: string;
}

export interface UserAccount extends UserProfile {
  passwordHash?: string;
  passwordSalt?: string;
  isActive?: boolean;
  // Never sent to the client — see stripSensitive in db/client.ts.
  emailVerificationCode?: string;
  emailVerificationExpiresAt?: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}


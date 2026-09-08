export type ArchetypeId =
  | 'defensive_boss'
  | 'guilt_tripper'
  | 'hard_negotiator'
  | 'passive_aggressive_peer'
  | 'micromanager';

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
  statedTheAsk: number;
  heldTheBoundary: number;
  stayedSpecific: number;
  emotionalComposure: number;
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
  originalSituation: string;
  options: ReplyOption[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  role: string;
  experienceLevel: string;
  primaryDreadCategory: string;
  totalRehearsals: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate?: string;
  subscription: {
    status: 'free_trial' | 'active_monthly' | 'active_annual' | 'expired';
    rehearsalsRemaining: number;
    trialEndsAt?: string;
    planName?: string;
  };
  createdAt: string;
}

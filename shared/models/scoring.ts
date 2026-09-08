export interface WeakestLineRewrite {
  originalLine: string;
  suggestedRewrite: string;
  coachingRationale: string;
  techniqueApplied: string;
}

export interface SubstanceRubric {
  statedTheAsk: number;      // 0-100
  heldTheBoundary: number;   // 0-100
  stayedSpecific: number;    // 0-100
  emotionalComposure: number;// 0-100
  overallScore: number;      // 0-100
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

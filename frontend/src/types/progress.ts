export interface CommunicationSkill {
  id: string;
  name: string;
  category: string;
  score: number;
  rehearsalsCount: number;
  recentScores: number[];
  strengths: string[];
  growthAreas: string[];
  recommendedScenarioId?: string;
  recommendedScenarioTitle?: string;
  lastPracticed?: string;
}

export interface ConfidenceDataPoint {
  rehearsalIndex: number;
  score: number;
  label?: string;
  scenarioTitle?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progressText?: string;
}

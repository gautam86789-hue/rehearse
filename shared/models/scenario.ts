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
  counterpartArchetype: string;
  difficulty: 'Beginner' | 'Intermediate' | 'High Stakes';
  estimatedMinutes: number;
  situation: string;
  userGoal: string;
  brief: ScenarioBrief;
  isCurated: boolean;
  createdAt: string;
}

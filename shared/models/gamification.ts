export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface SkillDomainConfidence {
  category: string;
  averageScore: number;
  completedCount: number;
}

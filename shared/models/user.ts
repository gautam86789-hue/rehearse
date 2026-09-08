export interface UserSubscription {
  status: 'free_trial' | 'active_monthly' | 'active_annual' | 'expired';
  rehearsalsRemaining: number;
  trialEndsAt?: string;
  planName?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  role: string;
  experienceLevel: string;
  primaryDreadCategory: string;
  totalRehearsals: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate?: string;
  subscription: UserSubscription;
  createdAt: string;
}

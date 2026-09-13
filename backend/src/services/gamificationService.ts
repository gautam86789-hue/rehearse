import { UserProfile, Scorecard } from '../types/index.js';

export interface GamificationUpdateResult {
  updatedProfile: UserProfile;
  xpEarned: number;
  streakExtended: boolean;
  newStreak: number;
  badgeUnlocked?: {
    id: string;
    title: string;
    description: string;
    icon: string;
  };
}

export class GamificationService {
  processSessionCompletion(
    user: UserProfile,
    score: number
  ): GamificationUpdateResult {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = user.lastPracticeDate;

    let newStreak = user.currentStreak;
    let streakExtended = false;

    if (!lastDate) {
      newStreak = 1;
      streakExtended = true;
    } else {
      const last = new Date(lastDate);
      const current = new Date(today);
      const diffTime = Math.abs(current.getTime() - last.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
        streakExtended = true;
      } else if (diffDays === 0) {
        // Already practiced today, keep streak
        streakExtended = false;
      } else {
        // Streak broken
        newStreak = 1;
        streakExtended = true;
      }
    }

    const longestStreak = Math.max(user.longestStreak, newStreak);

    // XP Calculation
    let xpEarned = 50; // Base completion XP
    if (score >= 90) xpEarned += 50; // Masterclass execution bonus
    else if (score >= 80) xpEarned += 25; // Strong proficiency bonus

    const totalXP = user.totalXP + xpEarned;
    const totalRehearsals = user.totalRehearsals + 1;

    // Remaining free trials count
    const remainingFree = Math.max(0, user.subscription.rehearsalsRemaining - 1);

    // Badge triggers — checked in priority order, one badge per session so
    // each unlock gets its own celebration moment rather than stacking.
    let badgeUnlocked: GamificationUpdateResult['badgeUnlocked'] = undefined;
    if (totalRehearsals === 1) {
      badgeUnlocked = {
        id: 'badge_first_rehearsal',
        title: 'Stepped into the Arena',
        description: 'Completed your first high-stakes conversation rehearsal.',
        icon: 'flame'
      };
    } else if (newStreak === 3 && streakExtended) {
      badgeUnlocked = {
        id: 'badge_3day_streak',
        title: 'Relentless Practice',
        description: 'Maintained a 3-day hard conversation streak.',
        icon: 'award'
      };
    } else if (newStreak === 7 && streakExtended) {
      badgeUnlocked = {
        id: 'badge_7day_streak',
        title: 'One Week Strong',
        description: 'A full 7-day rehearsal streak — this is becoming a habit.',
        icon: 'flame'
      };
    } else if (newStreak === 30 && streakExtended) {
      badgeUnlocked = {
        id: 'badge_30day_streak',
        title: 'Unshakeable',
        description: '30 days of consistent practice. Elite consistency.',
        icon: 'flame'
      };
    } else if (score >= 90) {
      badgeUnlocked = {
        id: 'badge_masterclass_score',
        title: 'Executive Composure',
        description: 'Scored 90%+ on substance and boundary holding.',
        icon: 'shield-check'
      };
    } else if (totalRehearsals === 10) {
      badgeUnlocked = {
        id: 'badge_10_rehearsals',
        title: 'Double Digits',
        description: 'Completed 10 rehearsals — you\'re building real range.',
        icon: 'award'
      };
    } else if (totalRehearsals === 25) {
      badgeUnlocked = {
        id: 'badge_25_rehearsals',
        title: 'Seasoned Operator',
        description: '25 rehearsals in the books. This is expertise being built.',
        icon: 'shield-check'
      };
    } else if (totalRehearsals === 50) {
      badgeUnlocked = {
        id: 'badge_50_rehearsals',
        title: 'Master Communicator',
        description: '50 rehearsals — few people invest in this skill like you have.',
        icon: 'shield-check'
      };
    }

    const updatedProfile: UserProfile = {
      ...user,
      totalRehearsals,
      totalXP,
      currentStreak: newStreak,
      longestStreak,
      lastPracticeDate: today,
      subscription: {
        ...user.subscription,
        rehearsalsRemaining: remainingFree
      }
    };

    return {
      updatedProfile,
      xpEarned,
      streakExtended,
      newStreak,
      badgeUnlocked
    };
  }
}

export const gamificationService = new GamificationService();

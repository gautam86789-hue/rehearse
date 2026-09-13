import { scoringEngine } from '../src/services/scoringEngine.js';
import { gamificationService } from '../src/services/gamificationService.js';
import { Scenario, MessageTurn, UserProfile } from '../src/types/index.js';

describe('Scoring & Gamification Service', () => {
  const dummyScenario: Scenario = {
    id: 'test-scenario',
    title: 'Salary Negotiation',
    audiences: ['professionals'],
    category: 'negotiation',
    counterpartRole: 'VP',
    counterpartName: 'David Sterling',
    counterpartArchetype: 'hard_negotiator',
    difficulty: 'High Stakes',
    estimatedMinutes: 5,
    situation: 'Asking for 20% raise after beating OKRs',
    userGoal: 'Lock in 20% salary increase',
    brief: {
      counterpartPosition: 'Will push back with budget freeze',
      probablePushbackPatterns: ['Budget freeze'],
      whatGoodLooksLike: 'State exact numbers',
      keyPhrasesToAvoid: ['Sorry to bother you'],
      recommendedOpeningFormula: 'Anchor on impact'
    },
    isCurated: true,
    createdAt: new Date().toISOString()
  };

  test('should evaluate dialogue turns and generate substance rubric', async () => {
    const turns: MessageTurn[] = [
      {
        id: 't1',
        speaker: 'user',
        message: 'Hi David, based on the $2.5M revenue delivered this quarter, I am requesting a salary adjustment to $145k.',
        timestamp: new Date().toISOString()
      },
      {
        id: 't2',
        speaker: 'counterpart',
        message: 'You know our budget is frozen until next year.',
        timestamp: new Date().toISOString()
      },
      {
        id: 't3',
        speaker: 'user',
        message: 'I understand macro policy is tight, but we agreed out-of-cycle exceptions apply to top 5% performers. Let us initiate the HR exception workflow this week.',
        timestamp: new Date().toISOString()
      }
    ];

    const rubric = await scoringEngine.evaluateSession(dummyScenario, turns);

    expect(rubric).toBeDefined();
    expect(rubric.clarity).toBeGreaterThan(0);
    expect(rubric.empathy).toBeGreaterThan(0);
    expect(rubric.assertiveness).toBeGreaterThan(0);
    expect(rubric.listening).toBeGreaterThan(0);
    expect(rubric.overallScore).toBeGreaterThan(0);
    expect(rubric.weakestLineRewrite).toBeDefined();
    expect(rubric.strengths.length).toBeGreaterThan(0);
  }, 25000);

  test('should correctly compute streak and XP increments', () => {
    const user: UserProfile = {
      id: 'test-user',
      role: 'Manager',
      experienceLevel: 'Mid',
      primaryDreadCategory: 'negotiation',
      totalRehearsals: 0,
      totalXP: 0,
      currentStreak: 0,
      longestStreak: 0,
      subscription: {
        status: 'free_trial',
        rehearsalsRemaining: 2
      },
      createdAt: new Date().toISOString()
    };

    const result = gamificationService.processSessionCompletion(user, 92);

    expect(result.xpEarned).toBe(100); // 50 base + 50 masterclass bonus
    expect(result.newStreak).toBe(1);
    expect(result.streakExtended).toBe(true);
    expect(result.updatedProfile.totalXP).toBe(100);
    expect(result.updatedProfile.totalRehearsals).toBe(1);
    expect(result.updatedProfile.subscription.rehearsalsRemaining).toBe(1);
    expect(result.badgeUnlocked?.id).toBe('badge_first_rehearsal');
  });

  test('should extend the streak when practicing on consecutive days', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const user: UserProfile = {
      id: 'test-user-streak',
      role: 'Manager',
      experienceLevel: 'Mid',
      primaryDreadCategory: 'negotiation',
      totalRehearsals: 4,
      totalXP: 200,
      currentStreak: 3,
      longestStreak: 3,
      lastPracticeDate: yesterday,
      subscription: {
        status: 'free_trial',
        rehearsalsRemaining: 1
      },
      createdAt: new Date().toISOString()
    };

    const result = gamificationService.processSessionCompletion(user, 70);

    expect(result.newStreak).toBe(4);
    expect(result.streakExtended).toBe(true);
    expect(result.updatedProfile.longestStreak).toBe(4);
  });

  test('should not double-count a streak when practicing again the same day', () => {
    const today = new Date().toISOString().split('T')[0];
    const user: UserProfile = {
      id: 'test-user-sameday',
      role: 'Manager',
      experienceLevel: 'Mid',
      primaryDreadCategory: 'negotiation',
      totalRehearsals: 1,
      totalXP: 50,
      currentStreak: 1,
      longestStreak: 1,
      lastPracticeDate: today,
      subscription: {
        status: 'free_trial',
        rehearsalsRemaining: 1
      },
      createdAt: new Date().toISOString()
    };

    const result = gamificationService.processSessionCompletion(user, 70);

    expect(result.newStreak).toBe(1);
    expect(result.streakExtended).toBe(false);
  });

  test('should reset the streak to 1 after missing a day', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const user: UserProfile = {
      id: 'test-user-broken',
      role: 'Manager',
      experienceLevel: 'Mid',
      primaryDreadCategory: 'negotiation',
      totalRehearsals: 10,
      totalXP: 500,
      currentStreak: 7,
      longestStreak: 7,
      lastPracticeDate: threeDaysAgo,
      subscription: {
        status: 'free_trial',
        rehearsalsRemaining: 1
      },
      createdAt: new Date().toISOString()
    };

    const result = gamificationService.processSessionCompletion(user, 70);

    expect(result.newStreak).toBe(1);
    expect(result.streakExtended).toBe(true);
    expect(result.updatedProfile.longestStreak).toBe(7); // longest streak record preserved
  });
});

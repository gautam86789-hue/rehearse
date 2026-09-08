import { scoringEngine } from '../src/services/scoringEngine.js';
import { gamificationService } from '../src/services/gamificationService.js';
import { Scenario, MessageTurn, UserProfile } from '../src/types/index.js';

describe('Scoring & Gamification Service', () => {
  const dummyScenario: Scenario = {
    id: 'test-scenario',
    title: 'Salary Negotiation',
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
    expect(rubric.statedTheAsk).toBeGreaterThan(0);
    expect(rubric.heldTheBoundary).toBeGreaterThan(0);
    expect(rubric.stayedSpecific).toBeGreaterThan(0);
    expect(rubric.emotionalComposure).toBeGreaterThan(0);
    expect(rubric.overallScore).toBeGreaterThan(0);
    expect(rubric.weakestLineRewrite).toBeDefined();
    expect(rubric.strengths.length).toBeGreaterThan(0);
  });

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
});

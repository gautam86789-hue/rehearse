import { ScoringEngine } from '../src/services/scoringEngine.js';
import { gamificationService } from '../src/services/gamificationService.js';
import { Scenario, MessageTurn } from '../src/types/index.js';

const scenario: Scenario = {
  id: 's', title: 'Weekend Boundaries', audiences: ['professionals'], category: 'boundaries',
  counterpartRole: 'Manager', counterpartName: 'Elena', counterpartArchetype: 'guilt_tripper',
  difficulty: 'Beginner', estimatedMinutes: 3,
  situation: 'Your manager messages you on weekends', userGoal: 'Agree that weekends are off unless urgent',
  brief: { counterpartPosition: 'Launch crunch', probablePushbackPatterns: ['guilt'], whatGoodLooksLike: 'clear boundary', keyPhrasesToAvoid: [], recommendedOpeningFormula: 'State the boundary and offer an emergency path.' },
  isCurated: true, createdAt: ''
} as any;

const convo = (lines: string[]): MessageTurn[] => {
  const t: MessageTurn[] = [{ id: 'c0', speaker: 'counterpart', message: 'Hey, what is up?', timestamp: '' }];
  lines.forEach((l, i) => {
    t.push({ id: `u${i}`, speaker: 'user', message: l, timestamp: '' });
    t.push({ id: `c${i + 1}`, speaker: 'counterpart', message: 'I see.', timestamp: '' });
  });
  return t;
};

// A grader that hands out glowing, inflated numbers no matter what was said.
const inflatedAi = (quality: string, score: number, count: number) => ({
  generateCompletion: jest.fn(async () =>
    JSON.stringify({
      verdict: 'Great job!', summary: 's',
      clarity: 95, empathy: 95, assertiveness: 95, listening: 95, goalProgress: 95,
      replies: Array.from({ length: count }, (_, i) => ({ turn: i + 1, quality, score, note: 'n', betterVersion: 'b' })),
      strengths: ['Very confident'], growthAreas: ['Minor polish'],
      weakestLineRewrite: { originalLine: 'x', suggestedRewrite: 'y', coachingRationale: 'z', techniqueApplied: 't' },
      keyTakeaways: ['k'], progressNote: 'p', nextPractice: { focus: 'f', drill: 'd', category: 'boundaries' }
    })
  )
}) as any;

describe('Scoring cannot be gamed', () => {
  beforeAll(() => { process.env.GEMINI_API_KEY = 'test-key'; });

  test('keyboard mashing scores near zero without asking the AI', async () => {
    const ai = inflatedAi('strong', 90, 3);
    const r = await new ScoringEngine(ai).evaluateSession(scenario, convo(['asdfgh jkl qwerty', 'hjkl asdf lkjh', 'zxcvb nm qqqqq']));
    expect(ai.generateCompletion).not.toHaveBeenCalled();
    expect(r.overallScore).toBeLessThanOrEqual(5);
    expect(r.attemptQuality).toBe('nonsense');
    expect(r.strengths).toEqual([]);
  });

  test('one-word replies score near zero', async () => {
    const r = await new ScoringEngine(inflatedAi('strong', 90, 3)).evaluateSession(scenario, convo(['ok', 'yes', 'fine']));
    expect(r.overallScore).toBeLessThanOrEqual(5);
  });

  test('random real words cannot score well even if the AI is generous', async () => {
    const lines = ['banana purple elephant quickly window seven', 'jump orange river pencil happy monkey', 'cheese mountain laptop blue sing under'];
    const r = await new ScoringEngine(inflatedAi('nonsense', 60, 3)).evaluateSession(scenario, convo(lines));
    expect(r.overallScore).toBeLessThanOrEqual(15);
    expect(r.clarity).toBeLessThanOrEqual(30);
    expect(r.attemptQuality).toBe('nonsense');
    expect(r.strengths).toEqual([]);
  });

  test('off-topic chat is capped low', async () => {
    const lines = ['I really love pizza and my cat is fluffy today.', 'The weather is nice and I went to the beach.', 'Do you know any good movies to watch tonight?'];
    const r = await new ScoringEngine(inflatedAi('off_topic', 40, 3)).evaluateSession(scenario, convo(lines));
    expect(r.overallScore).toBeLessThanOrEqual(30);
  });

  test('a genuinely strong conversation keeps a high score', async () => {
    const lines = [
      'Elena, I want to talk about weekend messages. Over three weeks I got eight requests on Saturdays and Sundays and it is hurting my work.',
      'I understand the launch matters and I am committed to it, which is why I need weekends to recover so I can deliver Monday to Friday.',
      'For a real outage call me and I will pick up. Everything else goes in a Friday handoff note. Can we agree on that?'
    ];
    const r = await new ScoringEngine(inflatedAi('strong', 85, 3)).evaluateSession(scenario, convo(lines));
    expect(r.overallScore).toBeGreaterThanOrEqual(75);
    expect(r.attemptQuality).toBe('ok');
  });

  test('a single exchange cannot exceed 65', async () => {
    const r = await new ScoringEngine(inflatedAi('strong', 95, 1)).evaluateSession(
      scenario,
      convo(['Elena, I want to set a clear boundary: weekends are off unless there is a real emergency, and I will answer calls for those.'])
    );
    expect(r.overallScore).toBeLessThanOrEqual(65);
  });

  test('missing skill scores are an error, never a made-up default', async () => {
    const ai = { generateCompletion: jest.fn(async () => JSON.stringify({ replies: [{ turn: 1, quality: 'ok', score: 60, note: 'n' }], growthAreas: ['x'] })) } as any;
    await expect(
      new ScoringEngine(ai).evaluateSession(scenario, convo(['I would like weekends to be free of work messages please, unless it is urgent.']))
    ).rejects.toThrow();
  });
});

describe('Attempts that are not real practice', () => {
  const user: any = {
    id: 'u', totalRehearsals: 0, totalXP: 0, currentStreak: 0, longestStreak: 0,
    subscription: { status: 'free_rehearsals', rehearsalsRemaining: 3 }
  };

  test('earn no XP, no streak, no badge, but use up the attempt', () => {
    const r = gamificationService.processSessionCompletion(user, 2, false);
    expect(r.xpEarned).toBe(0);
    expect(r.streakExtended).toBe(false);
    expect(r.badgeUnlocked).toBeUndefined();
    expect(r.updatedProfile.totalRehearsals).toBe(0);
    expect(r.updatedProfile.subscription.rehearsalsRemaining).toBe(2);
  });

  test('XP follows the score', () => {
    const low = gamificationService.processSessionCompletion(user, 20, true).xpEarned;
    const good = gamificationService.processSessionCompletion(user, 70, true).xpEarned;
    expect(low).toBeLessThan(good);
  });
});

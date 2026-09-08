import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  Scenario,
  RoleplaySession,
  Scorecard,
  FrameworkOfTheDay,
  DailyPuzzle,
  ReplyAssistantResult,
  UserProfile,
  Archetype
} from '../types';
import { CURATED_SCENARIOS } from '../data/scenariosData';

export const getApiBaseUrl = (): string | null => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api/v1';
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    // If running in Expo Tunnel mode, port 5000 is not routed through ngrok
    if (hostUri.includes('exp.direct') || hostUri.includes('expo.dev')) {
      return null;
    }
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api/v1`;
  }

  return 'http://localhost:5000/api/v1';
};

const DEFAULT_PROFILE = (userId: string): UserProfile => ({
  id: userId,
  role: 'Executive Leader',
  experienceLevel: 'Mid-Senior',
  primaryDreadCategory: 'negotiation',
  totalRehearsals: 4,
  totalXP: 380,
  currentStreak: 3,
  longestStreak: 5,
  subscription: {
    status: 'free_trial',
    rehearsalsRemaining: 10,
    planName: 'Executive Free Trial'
  },
  createdAt: new Date().toISOString()
});

const DEFAULT_FRAMEWORK: FrameworkOfTheDay = {
  id: 'fw-sbi',
  title: 'Situation-Behavior-Impact (SBI)',
  sourceCredit: 'Center for Creative Leadership',
  tagline: 'Deliver constructive critique without triggering defensive shields.',
  summary: 'Anchor on observable behavior rather than subjective intent or character judgements.',
  components: [
    {
      step: '1',
      label: 'Situation',
      explanation: 'Define the exact time and context where the event occurred.',
      example: '“In yesterday’s sprint review...”'
    },
    {
      step: '2',
      label: 'Behavior',
      explanation: 'Describe the specific action or words without judging intent.',
      example: '“...when the data schema was updated without team notice...”'
    },
    {
      step: '3',
      label: 'Impact',
      explanation: 'Explain the measurable business or team consequence.',
      example: '“...it blocked 3 engineers for the afternoon.”'
    }
  ],
  suggestedScenarioId: 'sc-4',
  releaseDate: new Date().toISOString().split('T')[0]
};

const DEFAULT_PUZZLE: DailyPuzzle = {
  id: 'puz-today',
  date: new Date().toISOString().split('T')[0],
  title: 'Managing Weekend Pushback',
  scenarioContext: 'Your VP asks you to work Saturday to polish slide animations for an internal review.',
  counterpartOpeningLine: '“I know it’s the weekend, but executive visibility is everything. Can we count on you?”',
  options: [
    {
      id: 'opt-a',
      strategyLabel: 'Diplomatic Boundary',
      responseText: '“I have personal plans this weekend, but I will prioritize this first thing Monday at 8 AM.”',
      isOptimal: true,
      score: 92,
      explanation: 'Optimal: Holds firm boundary without defensiveness, offers immediate morning commitment.'
    },
    {
      id: 'opt-b',
      strategyLabel: 'Over-Accommodating',
      responseText: '“Sure, I will cancel my plans and log on Saturday morning.”',
      isOptimal: false,
      score: 45,
      explanation: 'Submissive: Reinforces boundary erosion and burnout expectation.'
    },
    {
      id: 'opt-c',
      strategyLabel: 'Combative Policy',
      responseText: '“It is against company policy to demand weekend work on non-P0 tasks.”',
      isOptimal: false,
      score: 30,
      explanation: 'Combative: Citing policy creates antagonism and damages executive trust.'
    }
  ],
  communityDistribution: {
    optionA: 64,
    optionB: 18,
    optionC: 18
  }
};

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      throw new Error('Running in standalone/tunnel mode; using local executive mock engine');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || `Request failed with status ${res.status}`);
      }

      return (await res.json()) as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  // Auth / Profile
  async getProfile(userId: string): Promise<{ user: UserProfile }> {
    try {
      return await this.request<{ user: UserProfile }>(`/auth/profile?userId=${encodeURIComponent(userId)}`);
    } catch {
      return { user: DEFAULT_PROFILE(userId) };
    }
  }

  async completeOnboarding(data: {
    userId: string;
    role: string;
    experienceLevel: string;
    primaryDreadCategory: string;
  }): Promise<{ user: UserProfile }> {
    try {
      return await this.request<{ user: UserProfile }>('/auth/onboarding', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      return {
        user: {
          ...DEFAULT_PROFILE(data.userId),
          role: data.role,
          experienceLevel: data.experienceLevel,
          primaryDreadCategory: data.primaryDreadCategory
        }
      };
    }
  }

  async getProgress(userId: string): Promise<{
    user: UserProfile;
    stats: {
      totalCompleted: number;
      averageScore: number;
      skillBreakdown: { category: string; averageScore: number; completedCount: number }[];
      recentSessions: RoleplaySession[];
    };
  }> {
    try {
      return await this.request(`/auth/progress?userId=${encodeURIComponent(userId)}`);
    } catch {
      return {
        user: DEFAULT_PROFILE(userId),
        stats: {
          totalCompleted: 6,
          averageScore: 82,
          skillBreakdown: [
            { category: 'negotiation', averageScore: 84, completedCount: 3 },
            { category: 'managing_up', averageScore: 86, completedCount: 2 },
            { category: 'boundaries', averageScore: 78, completedCount: 1 }
          ],
          recentSessions: []
        }
      };
    }
  }

  // Scenarios
  async getScenarios(category?: string, difficulty?: string): Promise<{ total: number; scenarios: Scenario[] }> {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return await this.request(`/scenarios${qs}`);
    } catch {
      let list = CURATED_SCENARIOS;
      if (category && category !== 'all') {
        list = list.filter((s) => s.category === category);
      }
      if (difficulty && difficulty !== 'all') {
        list = list.filter((s) => s.difficulty === difficulty);
      }
      return { total: list.length, scenarios: list };
    }
  }

  async getArchetypes(): Promise<{ archetypes: Archetype[] }> {
    try {
      return await this.request('/scenarios/archetypes');
    } catch {
      return {
        archetypes: [
          {
            id: 'defensive_boss',
            name: 'The Defensive Boss',
            title: 'Defensive Boss',
            tagline: 'Raises shields, deflects critique, questions loyalty.',
            accentColor: '#E74C3C',
            avatarIcon: 'shield-alert',
            personalityDescription: 'Interprets feedback as personal attacks and changes topics.',
            resistancePattern: 'Denial and deflection',
            typicalPhrases: ['“Are you questioning my judgment?”', '“That is not how it happened.”'],
            coachingHint: 'Separate intent from impact. Use objective business metrics.'
          }
        ]
      };
    }
  }

  async generateCustomScenario(data: {
    situation: string;
    counterpartRole?: string;
    counterpartArchetype?: string;
    targetGoal?: string;
  }): Promise<{ scenario: Scenario }> {
    try {
      return await this.request('/scenarios/generate', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      return {
        scenario: {
          id: `custom-${Date.now()}`,
          title: `Custom: ${data.counterpartRole || 'Executive'} Dilemma`,
          category: 'difficult_decisions',
          counterpartName: 'Jordan Taylor',
          counterpartRole: data.counterpartRole || 'Executive Leader',
          counterpartArchetype: (data.counterpartArchetype as any) || 'defensive_boss',
          difficulty: 'High Stakes',
          estimatedMinutes: 6,
          situation: data.situation,
          userGoal: data.targetGoal || 'Protect release stability and maintain rapport.',
          brief: {
            counterpartPosition: 'Defending departmental constraints and urgency.',
            probablePushbackPatterns: ['Tests your conviction', 'Challenges timeline flexibility'],
            whatGoodLooksLike: 'Grounded composure and structured milestone agreement.',
            keyPhrasesToAvoid: ['“You never listen to us”'],
            recommendedOpeningFormula:
              '“I appreciate the candid visibility into your priorities. Let’s align on a structured path forward that protects our deliverables.”'
          },
          isCurated: false,
          createdAt: new Date().toISOString()
        }
      };
    }
  }

  // Roleplay Session
  async startSession(userId: string, scenarioId: string): Promise<{ session: RoleplaySession }> {
    try {
      return await this.request('/roleplay/start', {
        method: 'POST',
        body: JSON.stringify({ userId, scenarioId })
      });
    } catch {
      const scenario = CURATED_SCENARIOS.find((s) => s.id === scenarioId) || CURATED_SCENARIOS[0];
      return {
        session: {
          id: `session-${Date.now()}`,
          userId,
          scenario,
          turns: [
            {
              id: 'turn-1',
              speaker: 'counterpart',
              message: `Thanks for meeting. I understand you wanted to discuss ${scenario.title}. What is your proposal?`,
              timestamp: new Date().toISOString()
            }
          ],
          status: 'in_progress',
          startedAt: new Date().toISOString()
        }
      };
    }
  }

  async sendTurn(sessionId: string, userMessage: string): Promise<{
    userTurn: any;
    counterpartTurn: any;
    totalTurns: number;
  }> {
    try {
      return await this.request('/roleplay/turn', {
        method: 'POST',
        body: JSON.stringify({ sessionId, userMessage })
      });
    } catch {
      return {
        userTurn: {
          id: `user-${Date.now()}`,
          speaker: 'user',
          message: userMessage,
          timestamp: new Date().toISOString()
        },
        counterpartTurn: {
          id: `counterpart-${Date.now()}`,
          speaker: 'counterpart',
          message:
            "I hear what you're saying, but given the current constraints, we need to look at the concrete business tradeoffs. How do you propose we balance this against our existing commitments?",
          timestamp: new Date().toISOString()
        },
        totalTurns: 2
      };
    }
  }

  async scoreSession(sessionId: string): Promise<{
    scorecard: Scorecard;
    session: RoleplaySession;
    updatedUser: UserProfile;
  }> {
    try {
      return await this.request('/roleplay/score', {
        method: 'POST',
        body: JSON.stringify({ sessionId })
      });
    } catch {
      const fallbackScore: Scorecard = {
        id: `score-${Date.now()}`,
        sessionId,
        overallScore: 84,
        statedTheAsk: 88,
        heldTheBoundary: 82,
        stayedSpecific: 85,
        emotionalComposure: 80,
        strengths: [
          'Anchored firmly on deliverables and business impact',
          'Held frame without defensive reaction'
        ],
        growthAreas: [
          'Avoid pause when counterpart raises headcount tradeoffs',
          'Lock in next review date earlier in conversation'
        ],
        weakestLineRewrite: {
          originalLine: 'I will try to make this work if we have to.',
          suggestedRewrite: 'I can deliver this scope if we adjust our Q3 milestone timing.',
          coachingRationale: 'Avoid passive acquiescence; state the trade-off condition clearly.',
          techniqueApplied: 'Conditional Agreement'
        },
        keyTakeaways: [
          'Clear conviction on core goals',
          'Protect boundaries under pressure'
        ],
        xpEarned: 120,
        newStreak: 4,
        streakExtended: true,
        generatedAt: new Date().toISOString()
      };
      return {
        scorecard: fallbackScore,
        session: {
          id: sessionId,
          userId: 'user-1',
          scenario: CURATED_SCENARIOS[0],
          turns: [],
          status: 'completed',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        },
        updatedUser: DEFAULT_PROFILE('user-1')
      };
    }
  }

  // Daily Habits
  async getFrameworkOfTheDay(): Promise<{ framework: FrameworkOfTheDay; allCount: number }> {
    try {
      return await this.request('/daily/framework');
    } catch {
      return { framework: DEFAULT_FRAMEWORK, allCount: 12 };
    }
  }

  async getDailyPuzzle(): Promise<{ puzzle: DailyPuzzle }> {
    try {
      return await this.request('/daily/puzzle');
    } catch {
      return { puzzle: DEFAULT_PUZZLE };
    }
  }

  async submitDailyPuzzle(data: {
    userId: string;
    puzzleId: string;
    selectedOptionId: string;
  }): Promise<{ result: any }> {
    try {
      return await this.request('/daily/puzzle/submit', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const selected = DEFAULT_PUZZLE.options.find((o) => o.id === data.selectedOptionId);
      return {
        result: {
          isCorrect: selected?.id === 'opt-a',
          score: selected?.score || 80,
          explanation: selected?.explanation || 'Optimal tactical choice.'
        }
      };
    }
  }

  // Message Coach / Reply Assistant
  async generateReplies(data: {
    incomingMessage: string;
    contextOrRelationship?: string;
    desiredOutcome?: string;
  }): Promise<{ result: ReplyAssistantResult }> {
    try {
      return await this.request('/reply-coach/generate', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      return {
        result: {
          id: `reply-${Date.now()}`,
          originalSituation: data.incomingMessage,
          options: [
            {
              label: 'The Diplomatic Option',
              responseText:
                "I appreciate the candid context on budget caps. Given our team delivered 22% over quarterly targets, I'd like to explore how we can align on a structured Q3 milestone review date paired with non-cash equity leveling today.",
              whatThisAccomplishes: 'Validates counterpart constraint without conceding value.',
              toneStyle: 'Collaborative Inquiry'
            },
            {
              label: 'The Direct Option',
              responseText:
                "I hear you on the broader climate. However, my scope and market benchmark have expanded significantly. Let's formalize the objective criteria now so leveling is locked the moment the review window opens.",
              whatThisAccomplishes: 'Draws clean boundary around expanded scope and demands objective criteria.',
              toneStyle: 'High Conviction'
            },
            {
              label: 'The Boundary-Setting Option',
              responseText:
                "Understood. If compensation bands are frozen, let's review my Q3 roadmap to deprioritize secondary workstreams so my focus stays purely on core revenue deliverables.",
              whatThisAccomplishes: 'Links compensation directly to scope sustainability and protects against burnout.',
              toneStyle: 'Protective Boundary'
            }
          ],
          createdAt: new Date().toISOString()
        }
      };
    }
  }

  // Subscriptions
  async getSubscriptionPlans(): Promise<{ trialDays: number; plans: any[] }> {
    try {
      return await this.request('/subscriptions/plans');
    } catch {
      return {
        trialDays: 5,
        plans: [
          { id: 'annual', name: 'Executive Annual', price: '$19.99/mo', savings: 'Save 45%' },
          { id: 'monthly', name: 'Monthly Pro', price: '$35.99/mo' }
        ]
      };
    }
  }

  async upgradePlan(userId: string, plan: 'monthly' | 'annual'): Promise<{ subscription: any }> {
    try {
      return await this.request('/subscriptions/upgrade', {
        method: 'POST',
        body: JSON.stringify({ userId, plan })
      });
    } catch {
      return {
        subscription: {
          status: 'active_monthly',
          planName: plan === 'annual' ? 'Executive Annual' : 'Monthly Pro'
        }
      };
    }
  }
}

export const apiService = new ApiService();

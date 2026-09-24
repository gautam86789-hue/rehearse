import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  Scenario,
  RoleplaySession,
  Scorecard,
  FrameworkOfTheDay,
  DailyPuzzle,
  WordOfTheDay,
  ReplyAssistantResult,
  UserProfile,
  Archetype,
  StoryTree,
  StoryOption
} from '../types';
import { CURATED_SCENARIOS } from '../data/scenariosData';

export const getApiBaseUrl = (): string => {
  // 1. Explicit env var always takes highest priority
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Web browser
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api/v1';
  }

  // 3. Expo Go on phone / emulator
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && !ip.includes('exp.direct') && !ip.includes('expo.dev')) {
      return `http://${ip}:5000/api/v1`;
    }
  }

  // 4. Last-resort default for a real distributed build (no dev-server host
  // to infer from) — the deployed production backend, not a local address
  // that only resolves on the machine the app happened to be built on.
  return 'https://rehearse-backend-fu90.onrender.com/api/v1';
};

const DEFAULT_PROFILE = (userId: string): UserProfile => ({
  id: userId,
  name: 'Professional',
  role: 'Executive Leader',
  experienceLevel: 'Mid-Senior',
  primaryDreadCategory: 'negotiation',
  totalRehearsals: 0,
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  subscription: {
    status: 'free_trial',
    rehearsalsRemaining: 2,
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

const DEFAULT_WORD: WordOfTheDay = {
  id: 'word-runway',
  term: 'Runway',
  audiences: ['founders_investors'],
  meaning: 'The number of months of cash you have left before hitting $0 at your current burn rate.',
  whyItMatters: 'Running out of runway without knowing it is the #1 way founders lose leverage in their next raise — it shows up first in a fuzzy runway number.',
  releaseDate: new Date().toISOString().split('T')[0]
};

const storyOpt = (id: StoryOption['id'], text: string, trajectory: StoryOption['trajectory']): StoryOption => ({
  id,
  text,
  trajectory
});

// Same shape/spirit as the backend's storyService fallback — used only if
// the API is unreachable, so Story Mode never hard-fails offline.
const DEFAULT_STORY: StoryTree = {
  id: 'story-fallback',
  date: new Date().toISOString().split('T')[0],
  title: 'The Monday Morning Ask',
  premise:
    'Your manager pulls you aside before the team standup: a deadline everyone agreed was unrealistic just got moved up two weeks.',
  q1: {
    narrative: 'Your manager says, "I know it\'s tight, but leadership wants this shipped early. Can you make it work?"',
    options: [
      storyOpt('A', '"That timeline isn\'t realistic without cutting scope — let\'s decide together what moves."', 'assertive'),
      storyOpt('B', '"I want to help make this work — can we look at what could shift to hit it?"', 'diplomatic'),
      storyOpt('C', '"...Sure, I\'ll figure something out." (You have no plan.)', 'avoidant'),
      storyOpt('D', '"This is exactly why nothing here gets planned properly."', 'aggressive')
    ]
  },
  q2: {
    assertive: {
      narrative: 'Your manager pauses, then nods. "Okay — what would you need to cut?" The room is listening.',
      options: [
        storyOpt('A', '"Cut the analytics dashboard for v1 — ship the core flow on time instead."', 'assertive'),
        storyOpt('B', '"Let\'s scope it together so nobody\'s surprised later."', 'diplomatic'),
        storyOpt('C', '"I don\'t know yet, let me think about it."', 'avoidant'),
        storyOpt('D', '"You should have asked before promising leadership anything."', 'aggressive')
      ]
    },
    diplomatic: {
      narrative: 'Your manager relaxes slightly. "Appreciate that. What do you need from me to make it happen?"',
      options: [
        storyOpt('A', '"I need one clear priority, not five — can you rank them?"', 'assertive'),
        storyOpt('B', '"Let\'s find the smallest version that still delivers value."', 'diplomatic'),
        storyOpt('C', '"I\'ll just try to squeeze it in somehow."', 'avoidant'),
        storyOpt('D', '"Honestly you should be asking the team, not just me."', 'aggressive')
      ]
    },
    avoidant: {
      narrative: 'Your manager takes the vague yes at face value and walks away. The deadline stands, unexamined.',
      options: [
        storyOpt('A', '"Actually, wait — I need to flag this is risky before you go."', 'assertive'),
        storyOpt('B', '"Can we talk for two minutes about what\'s realistic?"', 'diplomatic'),
        storyOpt('C', '"...okay, I\'ll deal with it later I guess."', 'avoidant'),
        storyOpt('D', '"This is unfair and I don\'t think I can do it."', 'aggressive')
      ]
    },
    aggressive: {
      narrative: 'Your manager stiffens. "I\'m not the one who set the timeline — don\'t take it out on me." The tension in the room rises.',
      options: [
        storyOpt('A', '"You\'re right, that came out wrong — let\'s reset and talk about what\'s realistic."', 'assertive'),
        storyOpt('B', '"Sorry — I\'m frustrated, not at you. Can we problem-solve together?"', 'diplomatic'),
        storyOpt('C', '"Whatever. I\'ll just figure it out."', 'avoidant'),
        storyOpt('D', '"Well maybe someone should finally push back on leadership for once."', 'aggressive')
      ]
    }
  },
  q3: {
    assertive: {
      narrative:
        'Later that day, a teammate asks if the new deadline is really happening. Your earlier conversation is already shaping how the team feels.',
      options: [
        storyOpt('A', '"Yes, but I\'m pushing to cut scope so it\'s actually achievable — I\'ll confirm by EOD."', 'assertive'),
        storyOpt('B', '"Still being worked out — I want to make sure it\'s fair to everyone before confirming."', 'diplomatic'),
        storyOpt('C', '"I think so? Not totally sure, honestly."', 'avoidant'),
        storyOpt('D', '"Apparently. Don\'t ask me, ask whoever keeps changing their mind upstairs."', 'aggressive')
      ]
    },
    diplomatic: {
      narrative:
        'Later that day, a teammate asks if the new deadline is really happening. Your earlier conversation is already shaping how the team feels.',
      options: [
        storyOpt('A', '"Yes, but I\'m pushing to cut scope so it\'s actually achievable — I\'ll confirm by EOD."', 'assertive'),
        storyOpt('B', '"Still being worked out — I want to make sure it\'s fair to everyone before confirming."', 'diplomatic'),
        storyOpt('C', '"I think so? Not totally sure, honestly."', 'avoidant'),
        storyOpt('D', '"Apparently. Don\'t ask me, ask whoever keeps changing their mind upstairs."', 'aggressive')
      ]
    },
    avoidant: {
      narrative:
        'Later that day, a teammate asks if the new deadline is really happening. Your uncertain earlier answer is already shaping how the team feels.',
      options: [
        storyOpt('A', '"Yes, but I\'m pushing to cut scope so it\'s actually achievable — I\'ll confirm by EOD."', 'assertive'),
        storyOpt('B', '"Still being worked out — I want to make sure it\'s fair to everyone before confirming."', 'diplomatic'),
        storyOpt('C', '"I think so? Not totally sure, honestly."', 'avoidant'),
        storyOpt('D', '"Apparently. Don\'t ask me, ask whoever keeps changing their mind upstairs."', 'aggressive')
      ]
    },
    aggressive: {
      narrative:
        'Later that day, a teammate asks if the new deadline is really happening. Your tense earlier conversation is already shaping how the team feels.',
      options: [
        storyOpt('A', '"Yes, but I\'m pushing to cut scope so it\'s actually achievable — I\'ll confirm by EOD."', 'assertive'),
        storyOpt('B', '"Still being worked out — I want to make sure it\'s fair to everyone before confirming."', 'diplomatic'),
        storyOpt('C', '"I think so? Not totally sure, honestly."', 'avoidant'),
        storyOpt('D', '"Apparently. Don\'t ask me, ask whoever keeps changing their mind upstairs."', 'aggressive')
      ]
    }
  },
  q4: {
    assertive: {
      narrative: 'In the next 1-on-1, your manager brings up the deadline again.',
      options: [
        storyOpt('A', '"Here\'s the plan: cut feature X, ship the core on time, revisit X next sprint."', 'assertive'),
        storyOpt('B', '"I\'ve got a plan that works if we\'re flexible on one feature — want to walk through it?"', 'diplomatic'),
        storyOpt('C', '"I haven\'t really figured it out yet, I\'ve been busy."', 'avoidant'),
        storyOpt('D', '"It\'s still impossible and I don\'t think anyone up there cares."', 'aggressive')
      ]
    },
    diplomatic: {
      narrative: 'In the next 1-on-1, your manager brings up the deadline again.',
      options: [
        storyOpt('A', '"Here\'s the plan: cut feature X, ship the core on time, revisit X next sprint."', 'assertive'),
        storyOpt('B', '"I\'ve got a plan that works if we\'re flexible on one feature — want to walk through it?"', 'diplomatic'),
        storyOpt('C', '"I haven\'t really figured it out yet, I\'ve been busy."', 'avoidant'),
        storyOpt('D', '"It\'s still impossible and I don\'t think anyone up there cares."', 'aggressive')
      ]
    },
    avoidant: {
      narrative: 'In the next 1-on-1, your manager brings up the deadline again, assuming it\'s already handled.',
      options: [
        storyOpt('A', '"Here\'s the plan: cut feature X, ship the core on time, revisit X next sprint."', 'assertive'),
        storyOpt('B', '"I\'ve got a plan that works if we\'re flexible on one feature — want to walk through it?"', 'diplomatic'),
        storyOpt('C', '"I haven\'t really figured it out yet, I\'ve been busy."', 'avoidant'),
        storyOpt('D', '"It\'s still impossible and I don\'t think anyone up there cares."', 'aggressive')
      ]
    },
    aggressive: {
      narrative: 'In the next 1-on-1, your manager brings up the deadline again, visibly guarded this time.',
      options: [
        storyOpt('A', '"Here\'s the plan: cut feature X, ship the core on time, revisit X next sprint."', 'assertive'),
        storyOpt('B', '"I\'ve got a plan that works if we\'re flexible on one feature — want to walk through it?"', 'diplomatic'),
        storyOpt('C', '"I haven\'t really figured it out yet, I\'ve been busy."', 'avoidant'),
        storyOpt('D', '"It\'s still impossible and I don\'t think anyone up there cares."', 'aggressive')
      ]
    }
  },
  q5: {
    assertive: {
      narrative: 'It\'s the day before the deadline. Your plan is already in motion. Leadership asks for a final status.',
      options: [
        storyOpt('A', '"On track — we scoped it down and it ships tomorrow as planned."', 'assertive'),
        storyOpt('B', '"We adjusted scope together and the team is confident in tomorrow."', 'diplomatic'),
        storyOpt('C', '"I think it\'ll be close, I\'m not totally sure."', 'avoidant'),
        storyOpt('D', '"It was never going to work and I said so from day one."', 'aggressive')
      ]
    },
    diplomatic: {
      narrative: 'It\'s the day before the deadline. The team is aligned behind the adjusted plan. Leadership asks for a final status.',
      options: [
        storyOpt('A', '"On track — we scoped it down and it ships tomorrow as planned."', 'assertive'),
        storyOpt('B', '"We adjusted scope together and the team is confident in tomorrow."', 'diplomatic'),
        storyOpt('C', '"I think it\'ll be close, I\'m not totally sure."', 'avoidant'),
        storyOpt('D', '"It was never going to work and I said so from day one."', 'aggressive')
      ]
    },
    avoidant: {
      narrative:
        'It\'s the day before the deadline. Nothing was actually decided, and the pressure is peaking. Leadership asks for a final status.',
      options: [
        storyOpt('A', '"On track — we scoped it down and it ships tomorrow as planned."', 'assertive'),
        storyOpt('B', '"We adjusted scope together and the team is confident in tomorrow."', 'diplomatic'),
        storyOpt('C', '"I think it\'ll be close, I\'m not totally sure."', 'avoidant'),
        storyOpt('D', '"It was never going to work and I said so from day one."', 'aggressive')
      ]
    },
    aggressive: {
      narrative:
        'It\'s the day before the deadline. The relationship with your manager is strained, and the deadline hasn\'t moved. Leadership asks for a final status.',
      options: [
        storyOpt('A', '"On track — we scoped it down and it ships tomorrow as planned."', 'assertive'),
        storyOpt('B', '"We adjusted scope together and the team is confident in tomorrow."', 'diplomatic'),
        storyOpt('C', '"I think it\'ll be close, I\'m not totally sure."', 'avoidant'),
        storyOpt('D', '"It was never going to work and I said so from day one."', 'aggressive')
      ]
    }
  },
  endings: {
    assertive: {
      title: 'The Plan That Held',
      narrative:
        'You named the constraint early, proposed a real trade-off, and delivered exactly what you committed to. Your manager starts looping you into planning conversations before deadlines are set, not after.',
      tone: 'strong'
    },
    diplomatic: {
      title: 'The Team That Trusted You',
      narrative:
        'You brought the team along instead of just protecting yourself. The deadline was met, and more importantly, nobody felt blindsided.',
      tone: 'strong'
    },
    avoidant: {
      title: 'The Cost of Staying Quiet',
      narrative:
        'The deadline arrived with nothing really settled — you scrambled, the delivery was rough, and the same unrealistic-timeline pattern is already forming again for next quarter.',
      tone: 'growth'
    },
    aggressive: {
      title: 'Right, But Alone',
      narrative:
        'You were probably right that the timeline was unfair — but the delivery happened through gritted teeth, and your manager now hesitates before looping you into hard conversations at all.',
      tone: 'mixed'
    }
  }
};

class ApiService {
  private authToken: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = getApiBaseUrl();

    const controller = new AbortController();
    // Several endpoints (scenario generation, scoring) go through this same
    // helper and hit llmService's OpenRouter -> Gemini -> OpenAI fallback
    // chain server-side, each with its own ~8s timeout before falling
    // through — worst case ~24s when the first two providers are both slow
    // or unavailable. 15s was aborting client-side before the server ever
    // reached its own fallback response (confirmed via Story Mode timing out
    // at ~16s server-side against this same 15s client limit).
    const timeoutId = setTimeout(() => controller.abort(), 40000);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
        ...((options.headers as Record<string, string>) || {})
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const res = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const error = new Error(errData.error || errData.message || `Request failed with status ${res.status}`);
        // A few endpoints (promo redemption's EMAIL_NOT_VERIFIED) return a
        // machine-readable code alongside the message so a caller can
        // switch to the right follow-up UI instead of just showing text.
        if (errData.code) (error as any).code = errData.code;
        (error as any).status = res.status;
        throw error;
      }

      return (await res.json()) as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  // Auth Operations
  async register(data: {
    email: string;
    password: string;
    fullName?: string;
    role?: string;
    experienceLevel?: string;
    audience?: string;
  }): Promise<{ user: UserProfile; token: string }> {
    const res = await this.request<{ user: UserProfile; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res?.token) {
      this.setAuthToken(res.token);
    }
    return res;
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: UserProfile; token: string }> {
    const res = await this.request<{ user: UserProfile; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res?.token) {
      this.setAuthToken(res.token);
    }
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // non-critical
    } finally {
      this.setAuthToken(null);
    }
  }

  async getMe(): Promise<{ user: UserProfile }> {
    return await this.request<{ user: UserProfile }>('/auth/me');
  }

  // Profile
  // Throws when the server can't be reached. It used to return a made-up
  // default profile here, which the app then merged over the real one —
  // resetting the user's name to "Professional" and their plan to defaults
  // whenever the backend was asleep. Callers already handle the failure.
  async getProfile(userId: string): Promise<{ user: UserProfile }> {
    return this.request<{ user: UserProfile }>(`/auth/profile?userId=${encodeURIComponent(userId)}`);
  }

  async updateProfileName(userId: string, name: string): Promise<{ user: UserProfile }> {
    return this.request<{ user: UserProfile }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ userId, name })
    });
  }

  async completeOnboarding(data: {
    userId: string;
    role: string;
    experienceLevel: string;
    primaryDreadCategory: string;
    audience?: string;
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
  async getScenarios(category?: string, difficulty?: string, audience?: string): Promise<{ total: number; scenarios: Scenario[] }> {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      if (audience) params.append('audience', audience);
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
      if (audience) {
        list = list.filter((s: any) => !s.audiences?.length || s.audiences.includes(audience));
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
    // No fake local session on failure: a made-up opener that isn't backed by
    // a real server session can't be continued or scored, so the screen shows
    // a retry instead (RoleplayScreen handles the thrown error).
    return this.request('/roleplay/start', {
      method: 'POST',
      body: JSON.stringify({ userId, scenarioId })
    });
  }

  // Wakes a sleeping backend (Render's free tier can take up to ~50s) so the
  // first real request doesn't pay that cost while the user is watching.
  warmUp(): void {
    fetch(`${getApiBaseUrl()}/health`).catch(() => {});
  }

  async sendTurn(sessionId: string, userMessage: string): Promise<{
    userTurn: any;
    counterpartTurn: any;
    totalTurns: number;
  }> {
    // Real errors propagate: a canned "I hear what you're saying..." reply
    // pasted in when the network hiccups is exactly the repeated, non-AI text
    // people were seeing — better to say the reply failed and let them retry.
    return this.request('/roleplay/turn', {
      method: 'POST',
      body: JSON.stringify({ sessionId, userMessage })
    });
  }

  async scoreSession(sessionId: string): Promise<{
    scorecard: Scorecard;
    session: RoleplaySession;
    updatedUser: UserProfile;
  }> {
    // No invented scorecard on failure — a fake 84 would land in history,
    // XP, and the streak as if it were real.
    return this.request('/roleplay/score', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
  }

  // Daily Habits
  async getFrameworkOfTheDay(audience?: string): Promise<{ framework: FrameworkOfTheDay; allCount: number }> {
    try {
      const qs = audience ? `?audience=${encodeURIComponent(audience)}` : '';
      return await this.request(`/daily/framework${qs}`);
    } catch {
      return { framework: DEFAULT_FRAMEWORK, allCount: 12 };
    }
  }

  async getDailyPuzzle(audience?: string): Promise<{ puzzle: DailyPuzzle }> {
    try {
      const qs = audience ? `?audience=${encodeURIComponent(audience)}` : '';
      return await this.request(`/daily/puzzle${qs}`);
    } catch {
      return { puzzle: DEFAULT_PUZZLE };
    }
  }

  async getWordOfTheDay(audience?: string): Promise<{ word: WordOfTheDay }> {
    try {
      const qs = audience ? `?audience=${encodeURIComponent(audience)}` : '';
      return await this.request(`/daily/word${qs}`);
    } catch {
      return { word: DEFAULT_WORD };
    }
  }

  // Longer timeout, same reasoning as chatWithAssistant: this generates a
  // whole 21-narrative-block story tree via the LLM fallback chain
  // (OpenRouter -> Gemini -> OpenAI, each with its own ~8s timeout before
  // falling through), which can genuinely take 15-20+ seconds when the first
  // provider is unavailable — the standard request() helper's 15s
  // AbortController was aborting client-side before the server ever got a
  // chance to fall back to its own bundled fallback tree. Cached
  // permanently per (user, roadmap node) server-side — see backend
  // storyService.getNodeStory.
  async getNodeStory(params: {
    userId: string;
    nodeId: string;
    seed: string;
    journeyTitle?: string;
    audience?: string;
    name?: string;
  }): Promise<{ story: StoryTree }> {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      return { story: DEFAULT_STORY };
    }
    const qs = new URLSearchParams({
      userId: params.userId,
      nodeId: params.nodeId,
      seed: params.seed,
      ...(params.journeyTitle ? { journeyTitle: params.journeyTitle } : {}),
      ...(params.audience ? { audience: params.audience } : {}),
      ...(params.name ? { name: params.name } : {})
    }).toString();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(`${baseUrl}/story/node?${qs}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`Node story request failed with status ${res.status}`);
      return (await res.json()) as { story: StoryTree };
    } catch {
      clearTimeout(timeoutId);
      return { story: { ...DEFAULT_STORY, id: `story-fallback-${params.nodeId}` } };
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
    userId?: string;
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

  // AI Assistant — a longer timeout than the standard `request()` helper
  // since LLM generation genuinely takes longer than a typical CRUD call.
  async chatWithAssistant(data: {
    message: string;
    conversationHistory: { role: 'user' | 'assistant'; content: string }[];
    userContext: {
      name: string;
      dailyChallengeDone?: boolean;
      audience?: string;
      role: string;
      totalRehearsals: number;
      currentStreak: number;
      longestStreak: number;
    };
    recentSessions: {
      scenarioTitle: string;
      category: string;
      overallScore: number;
      clarity: number;
      empathy: number;
      assertiveness: number;
      listening: number;
      growthAreas: string[];
      completedAt: string;
    }[];
  }): Promise<{ reply: string; actions?: { id: string; label: string }[] }> {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      return { reply: this.localAssistantFallback(data.message) };
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${baseUrl}/assistant/chat`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`Assistant request failed with status ${res.status}`);
      return (await res.json()) as { reply: string; actions?: { id: string; label: string }[] };
    } catch (err) {
      clearTimeout(timeoutId);
      return { reply: this.localAssistantFallback(data.message) };
    }
  }

  private localAssistantFallback(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('pattern') || lower.includes('setback') || lower.includes('struggle')) {
      return 'Once you complete a few rehearsals, I can point out specific patterns in how you communicate under pressure.';
    }
    if (lower.includes('reply') || lower.includes('respond') || lower.includes('say to')) {
      return 'Describe the message you received and what outcome you want — I\'ll suggest exactly what to say.';
    }
    return "I'm here to help with the app and your rehearsal patterns. What's on your mind?";
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

  // Deliberately does NOT swallow a failure into a fake success the way
  // upgradePlan's offline fallback does — an invalid/expired code must
  // actually be rejected, so errors propagate to the caller to show.
  async redeemPromoCode(userId: string, code: string): Promise<{ subscription: any; days?: number }> {
    return this.request('/subscriptions/redeem-code', {
      method: 'POST',
      body: JSON.stringify({ userId, code })
    });
  }

  async createCashfreeOrder(
    userId: string,
    plan: 'monthly' | 'three_month' | 'annual'
  ): Promise<{ orderId: string; paymentSessionId: string; amount: number }> {
    return this.request('/subscriptions/cashfree/create-order', {
      method: 'POST',
      body: JSON.stringify({ userId, plan })
    });
  }

  async getCashfreeOrderStatus(orderId: string): Promise<{ status: string; plan?: string }> {
    return this.request(`/subscriptions/cashfree/order/${encodeURIComponent(orderId)}`);
  }

  async sendVerificationCode(userId: string, email?: string): Promise<{ message: string }> {
    return this.request('/auth/send-verification', {
      method: 'POST',
      body: JSON.stringify({ userId, ...(email ? { email } : {}) })
    });
  }

  async verifyEmailCode(userId: string, code: string): Promise<{ user: any; message: string }> {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ userId, code })
    });
  }

  async upgradePlan(userId: string, plan: 'monthly' | 'three_month' | 'annual'): Promise<{ subscription: any }> {
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

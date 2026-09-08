import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CURATED_SCENARIOS, ARCHETYPES, FRAMEWORKS_CATALOG, DAILY_PUZZLES } from './seedData.js';
import {
  UserProfile,
  Scenario,
  RoleplaySession,
  Scorecard,
  FrameworkOfTheDay,
  DailyPuzzle,
  ReplyAssistantResult
} from '../types/index.js';

class InMemoryDatabase {
  private users: Map<string, UserProfile> = new Map();
  private scenarios: Map<string, Scenario> = new Map();
  private sessions: Map<string, RoleplaySession> = new Map();
  private scorecards: Map<string, Scorecard> = new Map();
  private frameworks: Map<string, FrameworkOfTheDay> = new Map();
  private dailyPuzzles: Map<string, DailyPuzzle> = new Map();
  private puzzleSubmissions: Map<string, { userId: string; puzzleId: string; optionId: string; isOptimal: boolean; score: number }> = new Map();
  private replyLogs: Map<string, ReplyAssistantResult> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    // Seed scenarios
    CURATED_SCENARIOS.forEach((scenario) => {
      this.scenarios.set(scenario.id, scenario);
    });

    // Seed frameworks
    FRAMEWORKS_CATALOG.forEach((framework) => {
      this.frameworks.set(framework.id, framework);
    });

    // Seed daily puzzles
    DAILY_PUZZLES.forEach((puzzle) => {
      this.dailyPuzzles.set(puzzle.id, puzzle);
    });

    // Seed default demo user
    const defaultUser: UserProfile = {
      id: 'demo-user-1',
      role: 'Engineering Manager',
      experienceLevel: 'Mid-Senior',
      primaryDreadCategory: 'negotiation',
      totalRehearsals: 3,
      totalXP: 380,
      currentStreak: 3,
      longestStreak: 5,
      lastPracticeDate: new Date().toISOString().split('T')[0],
      subscription: {
        status: 'free_trial',
        rehearsalsRemaining: 2,
        trialEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        planName: '5-Day Free Trial'
      },
      createdAt: new Date().toISOString()
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  // User Operations
  getUser(userId: string): UserProfile {
    let user = this.users.get(userId);
    if (!user) {
      user = {
        id: userId,
        role: 'Professional',
        experienceLevel: 'Mid-Level',
        primaryDreadCategory: 'negotiation',
        totalRehearsals: 0,
        totalXP: 0,
        currentStreak: 0,
        longestStreak: 0,
        subscription: {
          status: 'free_trial',
          rehearsalsRemaining: 2,
          trialEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          planName: '5-Day Free Trial'
        },
        createdAt: new Date().toISOString()
      };
      this.users.set(userId, user);
    }
    return user;
  }

  updateUser(userId: string, updates: Partial<UserProfile>): UserProfile {
    const user = this.getUser(userId);
    const updated = { ...user, ...updates };
    this.users.set(userId, updated);
    return updated;
  }

  // Scenario Operations
  getAllScenarios(): Scenario[] {
    return Array.from(this.scenarios.values());
  }

  getScenarioById(id: string): Scenario | undefined {
    return this.scenarios.get(id);
  }

  saveScenario(scenario: Scenario): Scenario {
    this.scenarios.set(scenario.id, scenario);
    return scenario;
  }

  // Session Operations
  saveSession(session: RoleplaySession): RoleplaySession {
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(sessionId: string): RoleplaySession | undefined {
    return this.sessions.get(sessionId);
  }

  getUserSessions(userId: string): RoleplaySession[] {
    return Array.from(this.sessions.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  // Scorecards
  saveScorecard(scorecard: Scorecard): Scorecard {
    this.scorecards.set(scorecard.id, scorecard);
    return scorecard;
  }

  getScorecard(scorecardId: string): Scorecard | undefined {
    return this.scorecards.get(scorecardId);
  }

  // Daily Frameworks & Puzzles
  getTodaysFramework(): FrameworkOfTheDay {
    return Array.from(this.frameworks.values())[0];
  }

  getAllFrameworks(): FrameworkOfTheDay[] {
    return Array.from(this.frameworks.values());
  }

  getTodaysPuzzle(): DailyPuzzle {
    return Array.from(this.dailyPuzzles.values())[0];
  }

  savePuzzleSubmission(userId: string, puzzleId: string, optionId: string, isOptimal: boolean, score: number) {
    const key = `${userId}:${puzzleId}`;
    this.puzzleSubmissions.set(key, { userId, puzzleId, optionId, isOptimal, score });
  }

  // Reply Assistant Logs
  saveReplyResult(result: ReplyAssistantResult): ReplyAssistantResult {
    this.replyLogs.set(result.id, result);
    return result;
  }
}

export const memoryDb = new InMemoryDatabase();

let supabase: SupabaseClient | null = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  } catch (err) {
    console.warn('Failed to initialize Supabase client, falling back to in-memory store:', err);
  }
}

export { supabase };

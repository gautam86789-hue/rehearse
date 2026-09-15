import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CURATED_SCENARIOS, ARCHETYPES, FRAMEWORKS_CATALOG, DAILY_PUZZLES, WORDS_CATALOG } from './seedData.js';

dotenv.config();
import {
  UserProfile,
  UserAccount,
  AuthSession,
  Audience,
  Scenario,
  RoleplaySession,
  MessageTurn,
  Scorecard,
  FrameworkOfTheDay,
  DailyPuzzle,
  WordOfTheDay,
  ReplyAssistantResult
} from '../types/index.js';

// ---------------------------------------------------------------------------
// Password hashing and crypto utilities (Zero native dependency scrypt)
// ---------------------------------------------------------------------------
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, generatedSalt, 64).toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const calculated = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(hash, 'hex'));
  } catch (err) {
    return false;
  }
}

// The in-memory store keeps password hash/salt on the same object it
// serves reads from (there's no separate accounts-vs-profiles table like
// Supabase has) — every method that returns a user to a controller needs
// to strip them before the object reaches res.json, or the hash+salt pair
// (everything needed to offline-brute-force the password) ships to the
// client in plain JSON.
function stripSensitive(account: UserAccount): UserProfile {
  const { passwordHash, passwordSalt, isActive, emailVerificationCode, emailVerificationExpiresAt, ...profile } = account;
  return profile;
}


// ---------------------------------------------------------------------------
// Supabase client (optional — only wired up when creds are present in env)
// ---------------------------------------------------------------------------
// The schema is now applied in production (see backend/src/db/schema.sql),
// so this no longer needs to protect against queries hanging on a
// nonexistent table — it was cut to 4000ms for that pre-schema window, but
// at 4s a real request chain (an LLM scoring call plus several sequential
// Supabase round-trips in the same handler) can legitimately exceed it,
// especially against Render's real network latency. When that happens the
// call silently falls back to the in-process memory store below instead of
// throwing — which is fine for a genuinely offline dev environment, but in
// production that store lives only in the Node process and Render's free
// tier wipes it on every restart (it spins down after ~15min idle), so a
// write that quietly "succeeded" into memory was actually just lost: the
// next read goes back to Supabase and shows the stale, pre-update value.
// This was confirmed live — rehearsals_remaining stayed at 3 in the actual
// Supabase table after 3 completed rehearsals, each of which silently timed
// out and fell back to memory. 15s gives real requests room to complete.
const SUPABASE_FETCH_TIMEOUT_MS = 15000;
const timeoutFetch: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPABASE_FETCH_TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
};

// Tests must stay hermetic and never touch the real project: now that the
// schema is actually applied, an unguarded client here would have the test
// suite writing fixtures (demo-user-1, webhook-test-user, etc.) straight
// into production data. Leaving `supabase` null under NODE_ENV=test forces
// every db/client.ts call down its existing in-memory fallback path instead.
let supabase: SupabaseClient | null = null;
if (process.env.NODE_ENV !== 'test' && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      global: { fetch: timeoutFetch }
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client, falling back to in-memory store:', err);
  }
}

// Temporary diagnostic — see updateUser's catch block.
let lastUpdateUserError: { message?: string; code?: string; details?: string; hint?: string } | null = null;
export function getLastUpdateUserError() {
  return lastUpdateUserError;
}

// ---------------------------------------------------------------------------
// Row <-> Domain mappers (snake_case Postgres columns <-> camelCase TS types)
// ---------------------------------------------------------------------------

function planNameForStatus(status: UserProfile['subscription']['status']): string | undefined {
  switch (status) {
    case 'free_trial':
      return '3 Free Rehearsals';
    case 'active_monthly':
      return 'Monthly Professional';
    case 'active_three_month':
      return 'Three Month Pass';
    case 'active_annual':
      return 'Annual Masterclass Pass';
    case 'active_promo':
      return 'Early Bird — 7 Day Pass';
    default:
      return undefined;
  }
}

function rowToUserProfile(row: any): UserProfile {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    experienceLevel: row.experience_level,
    audience: row.audience,
    primaryDreadCategory: row.primary_dread_category,
    totalRehearsals: row.total_rehearsals,
    totalXP: row.total_xp,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastPracticeDate: row.last_practice_date || undefined,
    subscription: {
      status: row.subscription_status,
      rehearsalsRemaining: row.rehearsals_remaining,
      trialEndsAt: row.trial_ends_at || undefined,
      planName: planNameForStatus(row.subscription_status)
    },
    promoRedeemed: row.promo_redeemed || false,
    emailVerified: row.email_verified || false,
    createdAt: row.created_at
  };
}

// Builds the row used to insert a brand-new user (mirrors the in-memory
// auto-vivify default in InMemoryDatabase.getUser()).
function defaultUserRow(userId: string): Record<string, any> {
  return {
    id: userId,
    email: `${userId}@rehearse.local`,
    full_name: 'Professional',
    role: 'Professional',
    experience_level: 'Mid-Level',
    audience: 'professionals',
    primary_dread_category: 'negotiation',
    total_rehearsals: 0,
    total_xp: 0,
    current_streak: 0,
    longest_streak: 0,
    subscription_status: 'free_trial',
    rehearsals_remaining: 3,
    trial_ends_at: null,
    created_at: new Date().toISOString()
  };
}

// Converts a Partial<UserProfile> patch into a Postgres row patch.
// Note: UserProfile.subscription.planName has no dedicated column in the
// schema — it is always derived from subscription_status on read, so any
// custom planName text passed in an update is intentionally not persisted.
function userProfileUpdatesToRow(updates: Partial<UserProfile>): Record<string, any> {
  const row: Record<string, any> = {};
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.name !== undefined || updates.fullName !== undefined) row.full_name = updates.name || updates.fullName;
  if (updates.avatarUrl !== undefined) row.avatar_url = updates.avatarUrl;
  if (updates.role !== undefined) row.role = updates.role;
  if (updates.experienceLevel !== undefined) row.experience_level = updates.experienceLevel;
  if (updates.audience !== undefined) row.audience = updates.audience;
  if (updates.primaryDreadCategory !== undefined) row.primary_dread_category = updates.primaryDreadCategory;
  if (updates.totalRehearsals !== undefined) row.total_rehearsals = updates.totalRehearsals;
  if (updates.totalXP !== undefined) row.total_xp = updates.totalXP;
  if (updates.currentStreak !== undefined) row.current_streak = updates.currentStreak;
  if (updates.longestStreak !== undefined) row.longest_streak = updates.longestStreak;
  if (updates.lastPracticeDate !== undefined) row.last_practice_date = updates.lastPracticeDate;
  if (updates.subscription !== undefined) {
    if (updates.subscription.status !== undefined) row.subscription_status = updates.subscription.status;
    if (updates.subscription.rehearsalsRemaining !== undefined) row.rehearsals_remaining = updates.subscription.rehearsalsRemaining;
    // 'in' rather than `!== undefined`: callers that upgrade to a real paid
    // plan explicitly pass `trialEndsAt: undefined` to CLEAR a stale promo/
    // trial date — `!== undefined` treated that the same as the field being
    // omitted entirely, silently skipping the column and leaving the old
    // date in place (which then wrongly drove the Home screen's "X days
    // left" footnote for what should read as a full paid subscription).
    if ('trialEndsAt' in updates.subscription) row.trial_ends_at = updates.subscription.trialEndsAt || null;
  }
  if (updates.promoRedeemed !== undefined) row.promo_redeemed = updates.promoRedeemed;
  if (updates.emailVerified !== undefined) row.email_verified = updates.emailVerified;
  row.updated_at = new Date().toISOString();
  return row;
}

function rowToScenario(row: any): Scenario {
  return {
    id: row.id,
    title: row.title,
    audiences: row.audiences || [],
    category: row.category,
    counterpartRole: row.counterpart_role,
    counterpartName: row.counterpart_name,
    counterpartArchetype: row.counterpart_archetype,
    difficulty: row.difficulty,
    estimatedMinutes: row.estimated_minutes,
    situation: row.situation,
    userGoal: row.user_goal,
    brief: row.brief,
    isCurated: row.is_curated,
    createdAt: row.created_at
  };
}

function scenarioToRow(scenario: Scenario): Record<string, any> {
  return {
    id: scenario.id,
    title: scenario.title,
    category: scenario.category,
    counterpart_role: scenario.counterpartRole,
    counterpart_name: scenario.counterpartName,
    counterpart_archetype: scenario.counterpartArchetype,
    difficulty: scenario.difficulty,
    estimated_minutes: scenario.estimatedMinutes,
    situation: scenario.situation,
    user_goal: scenario.userGoal,
    brief: scenario.brief,
    is_curated: scenario.isCurated,
    created_at: scenario.createdAt
  };
}

function rowToMessageTurn(row: any): MessageTurn {
  return {
    id: row.id,
    speaker: row.speaker,
    message: row.message,
    timestamp: row.created_at,
    tacticalAnalysis: row.tactical_analysis || undefined
  };
}

// Note: schema.sql has no columns for newStreak / streakExtended /
// badgeUnlocked / weakestLineRewrite.techniqueApplied — those are
// gamification/session-moment fields that aren't part of the durable
// scorecard row. They round-trip as best-effort defaults on read.
function rowToScorecard(row: any): Scorecard {
  return {
    id: row.id,
    sessionId: row.session_id,
    clarity: row.clarity_score,
    empathy: row.empathy_score,
    assertiveness: row.assertiveness_score,
    listening: row.listening_score,
    overallScore: row.overall_score,
    strengths: row.strengths || [],
    growthAreas: row.growth_areas || [],
    weakestLineRewrite: {
      originalLine: row.weakest_line_original || '',
      suggestedRewrite: row.weakest_line_rewrite || '',
      coachingRationale: row.weakest_line_rationale || '',
      techniqueApplied: ''
    },
    keyTakeaways: row.key_takeaways || [],
    xpEarned: row.xp_earned,
    newStreak: 0,
    streakExtended: false,
    generatedAt: row.created_at
  };
}

function scorecardToRow(scorecard: Scorecard, userId: string | null): Record<string, any> {
  return {
    id: scorecard.id,
    session_id: scorecard.sessionId,
    user_id: userId,
    clarity_score: scorecard.clarity,
    empathy_score: scorecard.empathy,
    assertiveness_score: scorecard.assertiveness,
    listening_score: scorecard.listening,
    overall_score: scorecard.overallScore,
    strengths: scorecard.strengths,
    growth_areas: scorecard.growthAreas,
    weakest_line_original: scorecard.weakestLineRewrite.originalLine,
    weakest_line_rewrite: scorecard.weakestLineRewrite.suggestedRewrite,
    weakest_line_rationale: scorecard.weakestLineRewrite.coachingRationale,
    key_takeaways: scorecard.keyTakeaways,
    xp_earned: scorecard.xpEarned,
    created_at: scorecard.generatedAt
  };
}

// ---------------------------------------------------------------------------
// Local disk persistence for the in-memory fallback store.
// ---------------------------------------------------------------------------
// Supabase is the intended source of truth, but until its schema is actually
// applied to the project (or whenever Supabase is unreachable), every write
// falls back to this in-process Map — which used to mean a routine backend
// restart (e.g. picking up a new env var) silently wiped every user's
// streak/XP/history. Mirroring the fallback store to a JSON file on disk
// closes that gap without requiring any Supabase credentials: it's a local
// durability net, not a substitute for real multi-instance persistence.
const DATA_FILE = path.join(__dirname, '../../data/store.json');

interface PersistedShape {
  users: [string, UserProfile][];
  userAccounts: [string, UserAccount][];
  userSessions: [string, AuthSession][];
  customScenarios: [string, Scenario][];
  sessions: [string, RoleplaySession][];
  scorecards: [string, Scorecard][];
  puzzleSubmissions: [string, { userId: string; puzzleId: string; optionId: string; isOptimal: boolean; score: number }][];
  replyLogs: [string, ReplyAssistantResult][];
}

// ---------------------------------------------------------------------------
// Database facade — tries Supabase (Postgres) first when configured, and
// gracefully falls back to the in-memory store on any error (missing
// schema, network issue, incompatible id, etc.) so the app always keeps
// working, same "try real integration, fall back cleanly" pattern used by
// LLMService.
// ---------------------------------------------------------------------------
class InMemoryDatabase {
  private users: Map<string, UserProfile> = new Map();
  private userAccounts: Map<string, UserAccount> = new Map();
  private userSessions: Map<string, AuthSession> = new Map();
  private scenarios: Map<string, Scenario> = new Map();
  private sessions: Map<string, RoleplaySession> = new Map();
  private scorecards: Map<string, Scorecard> = new Map();
  private frameworks: Map<string, FrameworkOfTheDay> = new Map();
  private dailyPuzzles: Map<string, DailyPuzzle> = new Map();
  private words: Map<string, WordOfTheDay> = new Map();
  private puzzleSubmissions: Map<string, { userId: string; puzzleId: string; optionId: string; isOptimal: boolean; score: number }> = new Map();
  private replyLogs: Map<string, ReplyAssistantResult> = new Map();
  private redeemedPromoCodes: Set<string> = new Set();

  constructor() {
    this.seed();
    this.loadFromDisk();
  }

  // Restores user/session/scorecard/custom-scenario/puzzle-submission/reply
  // data written by a previous process. Curated catalogs (scenarios,
  // frameworks, daily puzzles) are intentionally left to seed() — they
  // always come from seedData.ts, not disk, so catalog edits in code take
  // effect immediately rather than being shadowed by a stale snapshot.
  private loadFromDisk() {
    // Tests must stay hermetic: each run should start from the same seeded
    // state (e.g. demo-user-1's rehearsalsRemaining), not accumulate
    // mutations left on disk by a previous test run.
    if (process.env.NODE_ENV === 'test') return;
    try {
      if (!fs.existsSync(DATA_FILE)) return;
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed: Partial<PersistedShape> = JSON.parse(raw);
      (parsed.users || []).forEach(([id, user]) => this.users.set(id, user));
      (parsed.userAccounts || []).forEach(([id, acc]) => this.userAccounts.set(id, acc));
      (parsed.userSessions || []).forEach(([token, sess]) => this.userSessions.set(token, sess));
      (parsed.customScenarios || []).forEach(([id, scenario]) => this.scenarios.set(id, scenario));
      (parsed.sessions || []).forEach(([id, session]) => this.sessions.set(id, session));
      (parsed.scorecards || []).forEach(([id, scorecard]) => this.scorecards.set(id, scorecard));
      (parsed.puzzleSubmissions || []).forEach(([key, sub]) => this.puzzleSubmissions.set(key, sub));
      (parsed.replyLogs || []).forEach(([id, log]) => this.replyLogs.set(id, log));
    } catch (err) {
      console.warn('Failed to load local fallback-store snapshot, starting fresh:', err);
    }
  }

  // Fire-and-forget snapshot write, called after every in-memory mutation.
  // Errors (e.g. read-only filesystem) are non-fatal — the app keeps working
  // in-memory for the rest of the process lifetime, it just loses the disk
  // durability net.
  private persistToDisk() {
    if (process.env.NODE_ENV === 'test') return;
    try {
      const snapshot: PersistedShape = {
        users: Array.from(this.users.entries()),
        userAccounts: Array.from(this.userAccounts.entries()),
        userSessions: Array.from(this.userSessions.entries()),
        customScenarios: Array.from(this.scenarios.entries()).filter(([, s]) => !s.isCurated),
        sessions: Array.from(this.sessions.entries()),
        scorecards: Array.from(this.scorecards.entries()),
        puzzleSubmissions: Array.from(this.puzzleSubmissions.entries()),
        replyLogs: Array.from(this.replyLogs.entries())
      };
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFile(DATA_FILE, JSON.stringify(snapshot), (err) => {
        if (err) console.warn('Failed to write local fallback-store snapshot:', err);
      });
    } catch (err) {
      console.warn('Failed to write local fallback-store snapshot:', err);
    }
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

    // Seed words of the day
    WORDS_CATALOG.forEach((word) => {
      this.words.set(word.id, word);
    });

    // Seed default demo user
    const defaultUser: UserAccount = {
      id: 'demo-user-1',
      email: 'demo@rehearse.ai',
      name: 'Priya Sharma',
      fullName: 'Priya Sharma',
      role: 'Engineering Manager',
      experienceLevel: 'Mid-Senior',
      audience: 'new_managers',
      primaryDreadCategory: 'negotiation',
      totalRehearsals: 0,
      totalXP: 0,
      currentStreak: 0,
      longestStreak: 0,
      subscription: {
        status: 'free_trial',
        rehearsalsRemaining: 3,
        trialEndsAt: undefined,
        planName: '3 Free Rehearsals'
      },
      isActive: true,
      createdAt: new Date().toISOString()
    };
    const { hash: dHash, salt: dSalt } = hashPassword('demo1234');
    defaultUser.passwordHash = dHash;
    defaultUser.passwordSalt = dSalt;
    this.userAccounts.set(defaultUser.id, defaultUser);
    this.users.set(defaultUser.id, defaultUser);
  }

  // ===== In-memory implementations (fallback / default when Supabase is not configured) =====

  private memoryGetUser(userId: string): UserProfile {
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
          rehearsalsRemaining: 3,
          trialEndsAt: undefined,
          planName: '3 Free Rehearsals'
        },
        createdAt: new Date().toISOString()
      };
      this.users.set(userId, user);
      this.persistToDisk();
    }
    return stripSensitive(user);
  }

  private memoryUpdateUser(userId: string, updates: Partial<UserProfile>): UserProfile {
    // Reads the raw stored record directly rather than through
    // memoryGetUser, which now strips password fields on its way out —
    // this spread needs the real stored object underneath so a partial
    // update (e.g. subscription-only) doesn't accidentally drop the
    // account's password hash/salt from what gets persisted.
    let user = this.users.get(userId);
    if (!user) user = this.memoryGetUser(userId);
    const updated = { ...user, ...updates };
    this.users.set(userId, updated);
    this.persistToDisk();
    return stripSensitive(updated);
  }

  private memoryGetAllScenarios(): Scenario[] {
    return Array.from(this.scenarios.values());
  }

  private memoryGetScenarioById(id: string): Scenario | undefined {
    return this.scenarios.get(id);
  }

  private memorySaveScenario(scenario: Scenario): Scenario {
    this.scenarios.set(scenario.id, scenario);
    this.persistToDisk();
    return scenario;
  }

  private memorySaveSession(session: RoleplaySession): RoleplaySession {
    this.sessions.set(session.id, session);
    this.persistToDisk();
    return session;
  }

  private memoryGetSession(sessionId: string): RoleplaySession | undefined {
    return this.sessions.get(sessionId);
  }

  private memoryGetUserSessions(userId: string): RoleplaySession[] {
    return Array.from(this.sessions.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  private memorySaveScorecard(scorecard: Scorecard): Scorecard {
    this.scorecards.set(scorecard.id, scorecard);
    this.persistToDisk();
    return scorecard;
  }

  private memoryGetScorecard(scorecardId: string): Scorecard | undefined {
    return this.scorecards.get(scorecardId);
  }

  private memoryGetTodaysFramework(audience?: string): FrameworkOfTheDay {
    const all = Array.from(this.frameworks.values());
    const pool = audience ? (() => {
      const matching = all.filter((f) => f.audiences?.includes(audience as any));
      return matching.length > 0 ? matching : all;
    })() : all;

    // Prefer the framework sharing today's Word of the Day's theme, so the
    // two read as one narrative (word introduces the concept, framework
    // teaches it) rather than two unrelated rotations.
    const theme = audience ? this.memoryGetTodaysWord(audience).theme : undefined;
    if (theme) {
      const themed = pool.find((f) => f.theme === theme);
      if (themed) return themed;
    }
    return pool[0];
  }

  private memoryGetAllFrameworks(): FrameworkOfTheDay[] {
    return Array.from(this.frameworks.values());
  }

  private memoryGetTodaysPuzzle(audience?: string): DailyPuzzle {
    const all = Array.from(this.dailyPuzzles.values());
    const pool = audience ? (() => {
      const matching = all.filter((p) => !p.audiences || p.audiences.includes(audience as any));
      return matching.length > 0 ? matching : all;
    })() : all;

    // Same theme-preference as the framework lookup — puzzle is the "apply
    // it" step, so it should test the same concept the word/framework just
    // introduced whenever a matching puzzle exists yet.
    const theme = audience ? this.memoryGetTodaysWord(audience).theme : undefined;
    if (theme) {
      const themed = pool.find((p) => p.theme === theme);
      if (themed) return themed;
    }

    // No themed match — rotate through the audience-filtered pool by day of
    // year instead of always returning the same first entry, so the puzzle
    // still changes day to day even without a theme pairing yet.
    const startOfYear = new Date(new Date().getFullYear(), 0, 0);
    const dayOfYear = Math.floor((Date.now() - startOfYear.getTime()) / 86400000);
    return pool[dayOfYear % pool.length];
  }

  private memoryGetPuzzleById(puzzleId: string): DailyPuzzle | undefined {
    return this.dailyPuzzles.get(puzzleId);
  }

  private memoryGetTodaysWord(audience?: string): WordOfTheDay {
    const all = Array.from(this.words.values());
    const matching = audience ? all.filter((w) => w.audiences.includes(audience as any)) : all;
    const pool = matching.length > 0 ? matching : all;
    const startOfYear = new Date(new Date().getFullYear(), 0, 0);
    const dayOfYear = Math.floor((Date.now() - startOfYear.getTime()) / 86400000);
    return pool[dayOfYear % pool.length];
  }

  private memorySavePuzzleSubmission(userId: string, puzzleId: string, optionId: string, isOptimal: boolean, score: number): void {
    const key = `${userId}:${puzzleId}`;
    this.puzzleSubmissions.set(key, { userId, puzzleId, optionId, isOptimal, score });
    this.persistToDisk();
  }

  private memorySaveReplyResult(result: ReplyAssistantResult): ReplyAssistantResult {
    this.replyLogs.set(result.id, result);
    this.persistToDisk();
    return result;
  }

  // ===== Public async API (Supabase-first, in-memory fallback) =====

  // Authentication & Account Operations
  async getUserByEmail(email: string): Promise<UserAccount | undefined> {
    const cleanEmail = email.trim().toLowerCase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();
        if (!error && data) {
          return {
            ...rowToUserProfile(data),
            passwordHash: data.password_hash,
            passwordSalt: data.password_salt,
            isActive: data.is_active
          };
        }
      } catch (err) {
        console.warn('Supabase getUserByEmail failed, falling back to in-memory store:', err);
      }
    }
    for (const acc of this.userAccounts.values()) {
      if (acc.email && acc.email.toLowerCase() === cleanEmail) {
        return acc;
      }
    }
    return undefined;
  }

  async createUser(params: {
    email: string;
    password?: string;
    fullName?: string;
    role?: string;
    experienceLevel?: string;
    audience?: Audience;
    primaryDreadCategory?: string;
  }): Promise<{ user: UserProfile; token: string }> {
    const cleanEmail = params.email.trim().toLowerCase();
    const existing = await this.getUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const userId = `usr_${crypto.randomUUID()}`;
    let hash: string | undefined;
    let salt: string | undefined;
    if (params.password) {
      const hashed = hashPassword(params.password);
      hash = hashed.hash;
      salt = hashed.salt;
    }

    const now = new Date().toISOString();
    const profile: UserAccount = {
      id: userId,
      email: cleanEmail,
      name: params.fullName || 'Professional',
      fullName: params.fullName || 'Professional',
      role: params.role || 'Manager',
      experienceLevel: params.experienceLevel || 'Mid-Level',
      audience: params.audience || 'professionals',
      primaryDreadCategory: params.primaryDreadCategory || 'negotiation',
      totalRehearsals: 0,
      totalXP: 0,
      currentStreak: 0,
      longestStreak: 0,
      subscription: {
        status: 'free_trial',
        rehearsalsRemaining: 3,
        trialEndsAt: undefined,
        planName: '3 Free Rehearsals'
      },
      passwordHash: hash,
      passwordSalt: salt,
      isActive: true,
      createdAt: now
    };

    if (supabase) {
      try {
        await supabase.from('users').insert({
          id: userId,
          email: cleanEmail,
          password_hash: hash,
          password_salt: salt,
          full_name: profile.fullName,
          role: profile.role,
          experience_level: profile.experienceLevel,
          audience: profile.audience,
          primary_dread_category: profile.primaryDreadCategory,
          subscription_status: 'free_trial',
          rehearsals_remaining: 3,
          trial_ends_at: null,
          created_at: now
        });
      } catch (err) {
        console.warn('Supabase createUser failed, saving to local store:', err);
      }
    }

    this.userAccounts.set(userId, profile);
    this.users.set(userId, profile);
    this.persistToDisk();

    const session = await this.createSession(userId);
    return { user: stripSensitive(profile), token: session.token };
  }

  async authenticateUser(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const account = await this.getUserByEmail(email);
    if (!account || !account.passwordHash || !account.passwordSalt) {
      throw new Error('Invalid email or password.');
    }

    const isValid = verifyPassword(password, account.passwordHash, account.passwordSalt);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const session = await this.createSession(account.id);
    return { user: stripSensitive(account), token: session.token };
  }

  async createSession(userId: string): Promise<AuthSession> {
    const token = `tok_${crypto.randomBytes(32).toString('hex')}`;
    const id = `sess_${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();

    const session: AuthSession = { id, userId, token, expiresAt, createdAt };

    if (supabase) {
      try {
        await supabase.from('user_sessions').insert({
          id,
          user_id: userId,
          token,
          expires_at: expiresAt,
          created_at: createdAt
        });
      } catch (err) {
        console.warn('Supabase createSession failed, falling back to memory store:', err);
      }
    }

    this.userSessions.set(token, session);
    this.persistToDisk();
    return session;
  }

  async validateSession(token: string): Promise<UserProfile | null> {
    if (!token) return null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_sessions')
          .select('user_id, expires_at')
          .eq('token', token)
          .maybeSingle();
        if (!error && data) {
          if (new Date(data.expires_at) > new Date()) {
            return await this.getUser(data.user_id);
          }
        }
      } catch (err) {
        console.warn('Supabase validateSession failed, falling back to memory store:', err);
      }
    }

    const sess = this.userSessions.get(token);
    if (sess) {
      if (new Date(sess.expiresAt) > new Date()) {
        return this.getUser(sess.userId);
      } else {
        this.userSessions.delete(token);
        this.persistToDisk();
      }
    }

    return null;
  }

  async deleteSession(token: string): Promise<boolean> {
    if (!token) return false;
    if (supabase) {
      try {
        await supabase.from('user_sessions').delete().eq('token', token);
      } catch (err) {
        // fallback
      }
    }
    const existed = this.userSessions.delete(token);
    this.persistToDisk();
    return existed;
  }

  // Single-use Promo / Access Code Tracking
  async isPromoCodeRedeemed(code: string): Promise<boolean> {
    const normalized = code.trim().toUpperCase();
    if (this.redeemedPromoCodes.has(normalized)) return true;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_sessions')
          .select('id')
          .eq('token', `promo_code:${normalized}`)
          .maybeSingle();
        if (!error && data) {
          this.redeemedPromoCodes.add(normalized);
          return true;
        }
      } catch (err) {
        // fallback
      }
    }
    return false;
  }

  async markPromoCodeRedeemed(code: string, userId: string, expiresAt: string): Promise<void> {
    const normalized = code.trim().toUpperCase();
    const now = new Date().toISOString();
    this.redeemedPromoCodes.add(normalized);
    if (supabase) {
      try {
        await supabase.from('user_sessions').insert({
          id: crypto.randomUUID(),
          user_id: userId,
          token: `promo_code:${normalized}`,
          expires_at: expiresAt,
          created_at: now
        });
      } catch (err) {
        console.warn('Failed to record redeemed promo code in user_sessions:', err);
      }
    }
  }

  // User Operations
  async getUser(userId: string): Promise<UserProfile> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
        if (error) throw error;
        if (data) return rowToUserProfile(data);

        const { data: inserted, error: insertError } = await supabase
          .from('users')
          .insert(defaultUserRow(userId))
          .select('*')
          .single();
        if (insertError) throw insertError;
        return rowToUserProfile(inserted);
      } catch (err) {
        console.warn('Supabase getUser failed, falling back to in-memory store:', err);
      }
    }
    return this.memoryGetUser(userId);
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    lastUpdateUserError = null;
    if (supabase) {
      try {
        const patch = userProfileUpdatesToRow(updates);
        const { data, error } = await supabase.from('users').update(patch).eq('id', userId).select('*').maybeSingle();
        if (error) throw error;
        if (data) {
          return rowToUserProfile(data);
        }

        // Row didn't exist yet — create it with defaults + the requested patch.
        const insertRow = { ...defaultUserRow(userId), ...patch };
        const { data: inserted, error: insertError } = await supabase.from('users').insert(insertRow).select('*').single();
        if (insertError) throw insertError;
        return rowToUserProfile(inserted);
      } catch (err: any) {
        // A bare catch-and-warn here previously swallowed the real Supabase
        // error entirely — a caller had no way to know updateUser silently
        // fell back to memory (this is exactly how a missing/stale column
        // in Supabase's schema cache caused rehearsals_remaining and other
        // fields to stop persisting without any visible failure). Callers
        // that care can check getLastUpdateUserError() right after calling
        // updateUser.
        lastUpdateUserError = { message: err?.message, code: err?.code, details: err?.details, hint: err?.hint };
        console.warn('Supabase updateUser failed, falling back to in-memory store:', err);
      }
    }
    return this.memoryUpdateUser(userId, updates);
  }

  // Stores a fresh verification code + expiry directly, bypassing
  // updateUser/userProfileUpdatesToRow entirely — the code is never part of
  // UserProfile and must never round-trip through a path that could end up
  // in a res.json response (see stripSensitive).
  async setEmailVerificationCode(userId: string, code: string, expiresAt: string): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ email_verification_code: code, email_verification_expires_at: expiresAt, updated_at: new Date().toISOString() })
          .eq('id', userId);
        if (error) throw error;
        return;
      } catch (err) {
        console.warn('Supabase setEmailVerificationCode failed, falling back to in-memory store:', err);
      }
    }
    const user = this.users.get(userId) as UserAccount | undefined;
    if (user) {
      user.emailVerificationCode = code;
      user.emailVerificationExpiresAt = expiresAt;
      this.users.set(userId, user);
      this.persistToDisk();
    }
  }

  // Checks the code server-side and flips emailVerified — the code itself
  // never leaves this method either way.
  async verifyEmailCode(userId: string, code: string): Promise<{ success: boolean; error?: string }> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('email_verification_code, email_verification_expires_at')
          .eq('id', userId)
          .maybeSingle();
        if (error) throw error;
        if (!data || !data.email_verification_code) {
          return { success: false, error: 'No verification code was requested for this account.' };
        }
        if (data.email_verification_expires_at && new Date(data.email_verification_expires_at) < new Date()) {
          return { success: false, error: 'That code has expired — request a new one.' };
        }
        if (data.email_verification_code !== code) {
          return { success: false, error: 'Incorrect code — check and try again.' };
        }
        const { error: updateError } = await supabase
          .from('users')
          .update({ email_verified: true, email_verification_code: null, email_verification_expires_at: null, updated_at: new Date().toISOString() })
          .eq('id', userId);
        if (updateError) throw updateError;
        return { success: true };
      } catch (err) {
        console.warn('Supabase verifyEmailCode failed, falling back to in-memory store:', err);
      }
    }
    const user = this.users.get(userId) as UserAccount | undefined;
    if (!user || !user.emailVerificationCode) {
      return { success: false, error: 'No verification code was requested for this account.' };
    }
    if (user.emailVerificationExpiresAt && new Date(user.emailVerificationExpiresAt) < new Date()) {
      return { success: false, error: 'That code has expired — request a new one.' };
    }
    if (user.emailVerificationCode !== code) {
      return { success: false, error: 'Incorrect code — check and try again.' };
    }
    user.emailVerified = true;
    delete user.emailVerificationCode;
    delete user.emailVerificationExpiresAt;
    this.users.set(userId, user);
    this.persistToDisk();
    return { success: true };
  }

  // Scenario Operations — curated + custom scenarios are always served from
  // the in-memory catalog (never round-tripped through Postgres for reads).
  async getAllScenarios(): Promise<Scenario[]> {
    return this.memoryGetAllScenarios();
  }

  async getScenarioById(id: string): Promise<Scenario | undefined> {
    return this.memoryGetScenarioById(id);
  }

  // Custom (user-generated) scenarios are additionally persisted to
  // Supabase for durability when configured, but always kept in the
  // in-memory catalog too so getScenarioById keeps working unchanged.
  async saveScenario(scenario: Scenario): Promise<Scenario> {
    if (supabase) {
      try {
        const { error } = await supabase.from('scenarios').upsert(scenarioToRow(scenario));
        if (error) throw error;
      } catch (err) {
        console.warn('Supabase saveScenario failed (scenario will only be available in-memory for this instance):', err);
      }
    }
    return this.memorySaveScenario(scenario);
  }

  // Resolves a scenario for session reconstruction: in-memory catalog first
  // (covers curated + same-process custom scenarios), then falls back to a
  // direct Supabase lookup for custom scenarios created on another instance.
  private async resolveScenarioForSession(scenarioId: string): Promise<Scenario | undefined> {
    const fromMemory = this.memoryGetScenarioById(scenarioId);
    if (fromMemory) return fromMemory;
    if (supabase) {
      try {
        const { data, error } = await supabase.from('scenarios').select('*').eq('id', scenarioId).maybeSingle();
        if (error) throw error;
        if (data) return rowToScenario(data);
      } catch (err) {
        console.warn('Supabase scenario lookup failed while reconstructing session:', err);
      }
    }
    return undefined;
  }

  private async fetchScorecardForSession(sessionId: string): Promise<Scorecard | undefined> {
    if (!supabase) return undefined;
    try {
      const { data, error } = await supabase.from('scorecards').select('*').eq('session_id', sessionId).maybeSingle();
      if (error) throw error;
      if (!data) return undefined;
      return rowToScorecard(data);
    } catch (err) {
      console.warn('Supabase scorecard lookup failed while reconstructing session:', err);
      return undefined;
    }
  }

  private async assembleSessionFromRow(sessionRow: any): Promise<RoleplaySession> {
    const scenario = await this.resolveScenarioForSession(sessionRow.scenario_id);
    if (!scenario) {
      throw new Error(`Scenario ${sessionRow.scenario_id} could not be resolved for session ${sessionRow.id}`);
    }

    const { data: turnRows, error: turnsError } = await supabase!
      .from('session_turns')
      .select('*')
      .eq('session_id', sessionRow.id)
      .order('turn_order', { ascending: true });
    if (turnsError) throw turnsError;

    const scorecard = await this.fetchScorecardForSession(sessionRow.id);

    return {
      id: sessionRow.id,
      userId: sessionRow.user_id,
      scenario,
      turns: (turnRows || []).map(rowToMessageTurn),
      status: sessionRow.status,
      scorecard,
      startedAt: sessionRow.started_at,
      completedAt: sessionRow.completed_at || undefined
    };
  }

  // Session Operations
  async saveSession(session: RoleplaySession): Promise<RoleplaySession> {
    if (supabase) {
      try {
        const { error: sessionError } = await supabase.from('rehearsal_sessions').upsert({
          id: session.id,
          user_id: session.userId,
          scenario_id: session.scenario.id,
          status: session.status,
          started_at: session.startedAt,
          completed_at: session.completedAt || null
        });
        if (sessionError) throw sessionError;

        // Turns array is the source of truth on every save — replace wholesale.
        const { error: deleteError } = await supabase.from('session_turns').delete().eq('session_id', session.id);
        if (deleteError) throw deleteError;

        if (session.turns.length > 0) {
          const turnRows = session.turns.map((t, idx) => ({
            id: t.id,
            session_id: session.id,
            speaker: t.speaker,
            message: t.message,
            turn_order: idx,
            tactical_analysis: t.tacticalAnalysis || null,
            created_at: t.timestamp
          }));
          const { error: turnsError } = await supabase.from('session_turns').insert(turnRows);
          if (turnsError) throw turnsError;
        }

        return session;
      } catch (err) {
        console.warn('Supabase saveSession failed, falling back to in-memory store:', err);
      }
    }
    return this.memorySaveSession(session);
  }

  async getSession(sessionId: string): Promise<RoleplaySession | undefined> {
    if (supabase) {
      try {
        const { data: sessionRow, error } = await supabase.from('rehearsal_sessions').select('*').eq('id', sessionId).maybeSingle();
        if (error) throw error;
        if (!sessionRow) return this.memoryGetSession(sessionId);
        return await this.assembleSessionFromRow(sessionRow);
      } catch (err) {
        console.warn('Supabase getSession failed, falling back to in-memory store:', err);
      }
    }
    return this.memoryGetSession(sessionId);
  }

  async getUserSessions(userId: string): Promise<RoleplaySession[]> {
    if (supabase) {
      try {
        const { data: sessionRows, error } = await supabase
          .from('rehearsal_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('started_at', { ascending: false });
        if (error) throw error;
        return await Promise.all((sessionRows || []).map((row: any) => this.assembleSessionFromRow(row)));
      } catch (err) {
        console.warn('Supabase getUserSessions failed, falling back to in-memory store:', err);
      }
    }
    return this.memoryGetUserSessions(userId);
  }

  // Scorecards
  async saveScorecard(scorecard: Scorecard): Promise<Scorecard> {
    if (supabase) {
      try {
        let userId: string | null = null;
        try {
          const { data } = await supabase.from('rehearsal_sessions').select('user_id').eq('id', scorecard.sessionId).maybeSingle();
          userId = data?.user_id || null;
        } catch {
          // best-effort only — scorecard can still be saved with a null user_id
        }

        const { data: saved, error } = await supabase
          .from('scorecards')
          .upsert(scorecardToRow(scorecard, userId))
          .select('*')
          .single();
        if (error) throw error;
        return rowToScorecard(saved);
      } catch (err) {
        console.warn('Supabase saveScorecard failed, falling back to in-memory store:', err);
      }
    }
    return this.memorySaveScorecard(scorecard);
  }

  async getScorecard(scorecardId: string): Promise<Scorecard | undefined> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('scorecards').select('*').eq('id', scorecardId).maybeSingle();
        if (error) throw error;
        if (data) return rowToScorecard(data);
        return undefined;
      } catch (err) {
        console.warn('Supabase getScorecard failed, falling back to in-memory store:', err);
      }
    }
    return this.memoryGetScorecard(scorecardId);
  }

  // Daily Frameworks & Puzzles — curated content, always served in-memory.
  async getTodaysFramework(audience?: string): Promise<FrameworkOfTheDay> {
    return this.memoryGetTodaysFramework(audience);
  }

  async getAllFrameworks(): Promise<FrameworkOfTheDay[]> {
    return this.memoryGetAllFrameworks();
  }

  async getTodaysPuzzle(audience?: string): Promise<DailyPuzzle> {
    return this.memoryGetTodaysPuzzle(audience);
  }

  async getPuzzleById(puzzleId: string): Promise<DailyPuzzle | undefined> {
    return this.memoryGetPuzzleById(puzzleId);
  }

  async getTodaysWord(audience?: string): Promise<WordOfTheDay> {
    return this.memoryGetTodaysWord(audience);
  }

  async savePuzzleSubmission(userId: string, puzzleId: string, optionId: string, isOptimal: boolean, score: number): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase.from('user_puzzle_submissions').upsert(
          {
            user_id: userId,
            puzzle_id: puzzleId,
            selected_option_id: optionId,
            is_optimal: isOptimal,
            score
          },
          { onConflict: 'user_id,puzzle_id' }
        );
        if (error) throw error;
        return;
      } catch (err) {
        console.warn('Supabase savePuzzleSubmission failed, falling back to in-memory store:', err);
      }
    }
    this.memorySavePuzzleSubmission(userId, puzzleId, optionId, isOptimal, score);
  }

  // Reply Assistant Logs
  async saveReplyResult(result: ReplyAssistantResult, userId?: string): Promise<ReplyAssistantResult> {
    const stamped: ReplyAssistantResult = userId ? { ...result, userId } : result;
    if (supabase) {
      try {
        const { error } = await supabase.from('reply_assistant_logs').insert({
          user_id: userId || null,
          original_situation: stamped.originalSituation,
          generated_options: stamped.options,
          created_at: stamped.createdAt
        });
        if (error) throw error;
        return stamped;
      } catch (err) {
        console.warn('Supabase saveReplyResult failed, falling back to in-memory store:', err);
      }
    }
    return this.memorySaveReplyResult(stamped);
  }
}

export const memoryDb = new InMemoryDatabase();

export { supabase };

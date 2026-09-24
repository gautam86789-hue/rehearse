import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, RoleplaySession, Scorecard, HistoryEntry, Scenario, Audience, AppNotification, MessageTurn } from '../types';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';
import { syncDailyReminder, syncTrialEndingReminder, getRemindersEnabled } from '../services/notificationService';
import { hapticSuccess } from '../services/haptics';
import {
  loginRevenueCatUser,
  getCustomerInfo,
  hasProEntitlement,
  addCustomerInfoListener,
  isPurchasesSupported
} from '../services/purchases';
import { linkExternalUserId, isOneSignalSupported } from '../services/oneSignalService';
import type { CustomerInfo } from 'react-native-purchases';
import { SubscriptionPlanId } from '../data/subscriptionPlans';
import { localDateKey, computeStreak } from '../utils/dates';
import { hasSeenTutorial, markTutorialSeen } from '../utils/tutorial';
import { isAccessLocked } from '../utils/access';

interface AppContextType {
  user: UserProfile;
  isLoading: boolean;
  isOnboarded: boolean;
  activeSession: RoleplaySession | null;
  lastScorecard: Scorecard | null;
  isPaywallVisible: boolean;
  // Set alongside isPaywallVisible when the paywall is opened from a screen
  // that already had a plan selected (MembershipBillingScreen) — lets the
  // web-preview paywall UI open on that same plan instead of always
  // resetting to Annual, so a user's choice doesn't get silently discarded
  // by navigating to the paywall. Native ignores this (RevenueCat's hosted
  // paywall manages its own plan selection).
  paywallPreferredPlan: SubscriptionPlanId | null;
  isPro: boolean;
  unlockedBadge: { title: string; description: string; icon: string } | null;
  history: HistoryEntry[];
  notifications: AppNotification[];
  setUser: (user: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  setActiveSession: (session: RoleplaySession | null) => void;
  setLastScorecard: (scorecard: Scorecard | null) => void;
  setIsPaywallVisible: (visible: boolean) => void;
  setPaywallPreferredPlan: (plan: SubscriptionPlanId | null) => void;
  setUnlockedBadge: (badge: { title: string; description: string; icon: string } | null) => void;
  addHistoryEntry: (scenario: Scenario, scorecard: Scorecard, turns?: MessageTurn[]) => Promise<void>;
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  unlockMilestone: (id: string, title: string, description: string, icon: string) => void;
  toggleSavedScenario: (scenarioId: string) => void;
  markArticleRead: (articleId: string) => void;
  markJourneyNodeComplete: (nodeId: string) => void;
  refreshProfile: () => Promise<UserProfile | undefined>;
  // null until we've read whether this user has seen the how-it-works tutorial.
  tutorialSeen: boolean | null;
  completeTutorial: () => Promise<void>;
  completeOnboarding: (
    role: string,
    experienceLevel: string,
    primaryDreadCategory: string,
    audience?: Audience
  ) => Promise<void>;
  upgradeSubscription: (plan: 'monthly' | 'three_month' | 'annual') => Promise<void>;
}

const createDynamicProfile = (userId: string, role = 'Executive Leader', email?: string): UserProfile => ({
  id: userId,
  name: email && !email.endsWith('@rehearse.local') && email.includes('@') ? email.split('@')[0] : 'Professional',
  email: email,
  avatarUri: undefined,
  role,
  experienceLevel: 'Mid-Senior',
  primaryDreadCategory: 'negotiation',
  totalRehearsals: 0,
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: undefined,
  subscription: {
    status: 'free_rehearsals',
    rehearsalsRemaining: 3,
    trialEndsAt: undefined,
    planName: '3 Free Rehearsals'
  },
  createdAt: new Date().toISOString()
});

// Which name wins when the local profile and the server's copy disagree: a
// name the user typed themselves always does; otherwise a real server name;
// "Professional" is only ever a placeholder of last resort.
function reconcileName(local: UserProfile, server: UserProfile): { name: string; fullName: string } {
  const isPlaceholder = (n?: string) => !n || n === 'Professional';
  let name: string;
  if (local.nameCustomized && !isPlaceholder(local.name)) name = local.name;
  else if (!isPlaceholder(server.name)) name = server.name;
  else name = local.name || server.name || 'Professional';
  return { name, fullName: name };
}

// Combine this device's notifications with the server's copy: everything from
// both sides, minus anything dismissed on either, "read" if read on either.
function mergeNotifications(
  local: AppNotification[],
  server: AppNotification[],
  dismissed: Set<string>
): AppNotification[] {
  const byId = new Map<string, AppNotification>();
  [...server, ...local].forEach((n) => {
    if (dismissed.has(n.id)) return;
    const existing = byId.get(n.id);
    byId.set(n.id, existing ? { ...existing, read: existing.read || n.read } : n);
  });
  return Array.from(byId.values())
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 50);
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, isGuest, guestId, signInAsGuest, ensureGuestId, isAuthenticated } = useAuth();
  // Falls back to 'user-session' when isGuest is true but guestId hasn't
  // finished loading from storage yet (a brief window on boot) — the
  // stale-request-token guard in loadUserState below already discards that
  // transient value once guestId resolves and this recomputes, so this
  // never leaves state pointed at the wrong id.
  const currentUserId = authUser?.id || (isGuest && guestId ? guestId : 'user-session');

  const [user, setUserState] = useState<UserProfile>(() =>
    createDynamicProfile(currentUserId, authUser?.user_metadata?.role || 'Executive Leader', authUser?.email)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [activeSession, setActiveSession] = useState<RoleplaySession | null>(null);
  const [lastScorecard, setLastScorecard] = useState<Scorecard | null>(null);
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);
  const [paywallPreferredPlan, setPaywallPreferredPlan] = useState<SubscriptionPlanId | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<{ title: string; description: string; icon: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [tutorialSeen, setTutorialSeen] = useState<boolean | null>(null);
  // Ids the user has dismissed — kept so a dismissal isn't undone by another
  // device's older copy when notifications sync (see mergeNotifications).
  const dismissedIdsRef = React.useRef<Set<string>>(new Set());
  const notificationsSyncedRef = React.useRef(false);

  // One-shot escape hatch: completeOnboarding sets this right before calling
  // signInAsGuest(), whose isGuest flip changes currentUserId and re-triggers
  // this effect. AppNavigator unmounts its entire NavigationContainer
  // (including the global BadgeUnlockedModal) while isLoading is true, which
  // was making the "Welcome Aboard" badge — shown moments earlier in the same
  // completeOnboarding call — vanish and then pop back in a second time once
  // Home remounted, right as onboarding finished. Scoped to just that one
  // transition (rather than "skip loading after the first load, ever") so a
  // genuine later account switch (sign out, sign in as someone else) still
  // gets the normal loading gate.
  const suppressNextLoadingGateRef = React.useRef(false);

  // Guest mode restores in two steps on boot: AuthContext's isGuest/guestId
  // start false/null and only resolve once their own async AsyncStorage
  // reads complete (see AuthContext.tsx's initAuth) — so on a fresh page
  // load, this effect legitimately fires loadUserState('user-session')
  // first, then almost immediately again for loadUserState(<this device's
  // guest id>) once isGuest/guestId catch up. Both run concurrently;
  // without this guard, whichever one's
  // network/storage calls happen to resolve LAST wins and unconditionally
  // overwrites state — including with the WRONG profile, silently reverting
  // things like the user's chosen audience after a reload. This token makes
  // every commit below a no-op unless it's still the most recently
  // requested load.
  const loadRequestToken = React.useRef(0);

  const loadUserState = useCallback(async (userId: string) => {
    const myToken = ++loadRequestToken.current;
    const isStale = () => loadRequestToken.current !== myToken;
    apiService.warmUp();

    if (suppressNextLoadingGateRef.current) {
      suppressNextLoadingGateRef.current = false;
    } else {
      setIsLoading(true);
    }
    try {
      const onboardedKey = `@rehearse_onboarded_${userId}`;
      const userKey = `@rehearse_user_${userId}`;

      const storedOnboarded = await AsyncStorage.getItem(onboardedKey);
      if (isStale()) return;
      if (storedOnboarded === null) {
        setIsOnboarded(false);
      } else {
        setIsOnboarded(storedOnboarded === 'true');
      }

      let activeProfile: UserProfile = createDynamicProfile(
        userId,
        authUser?.user_metadata?.role || 'Executive Leader',
        authUser?.email
      );

      const storedUser = await AsyncStorage.getItem(userKey);
      if (storedUser) {
        try {
          // Merge (not replace) so fields added after a user's profile was
          // first cached — e.g. name/avatarUri — fall back to fresh defaults
          // instead of silently becoming undefined.
          activeProfile = { ...activeProfile, ...JSON.parse(storedUser) };
        } catch (e) {}
      }
      // Captured before the backend merge below overwrites it — the backend
      // does persist its own `audience` column, but it's only updated when
      // this same client explicitly sends one (see completeOnboarding), so a
      // user who onboarded against a backend record the server already had
      // (e.g. a reused dev/guest id) could otherwise have their real
      // selection silently clobbered by the backend's older/default value.
      const locallyKnownAudience = activeProfile.audience;

      // Whatever name the account has, "Professional" is only a placeholder —
      // once there's a real sign-in email, that email's local part is the name.
      const withRealName = (p: UserProfile): UserProfile => {
        const email = p.email || authUser?.email;
        const isPlaceholder = !p.name || p.name === 'Professional';
        if (isPlaceholder && email && !email.endsWith('@rehearse.local') && email.includes('@')) {
          const n = email.split('@')[0];
          return { ...p, email, name: n, fullName: n };
        }
        return p;
      };

      // Merge onto whatever's already in memory for this same id, rather than
      // blindly replacing — this effect can legitimately re-fire (Supabase's
      // authUser reference can change without the logical user changing),
      // and a blind replace would wipe frontend-only fields set moments ago
      // (completedPuzzleDates, milestoneFlags) with a storage read that may
      // predate that write.
      const commitProfile = (profile: UserProfile) => {
        setUserState((prev) =>
          prev.id === userId
            ? {
                ...profile,
                audience: prev.audience || profile.audience,
                avatarUri: prev.avatarUri || profile.avatarUri,
                milestoneFlags: { ...profile.milestoneFlags, ...prev.milestoneFlags },
                completedPuzzleDates:
                  (prev.completedPuzzleDates?.length || 0) >= (profile.completedPuzzleDates?.length || 0)
                    ? prev.completedPuzzleDates
                    : profile.completedPuzzleDates,
                completedStoryDates:
                  (prev.completedStoryDates?.length || 0) >= (profile.completedStoryDates?.length || 0)
                    ? prev.completedStoryDates
                    : profile.completedStoryDates,
                puzzleResults: { ...profile.puzzleResults, ...prev.puzzleResults },
                readArticleIds:
                  (prev.readArticleIds?.length || 0) >= (profile.readArticleIds?.length || 0)
                    ? prev.readArticleIds
                    : profile.readArticleIds,
                completedJourneyNodeIds:
                  (prev.completedJourneyNodeIds?.length || 0) >= (profile.completedJourneyNodeIds?.length || 0)
                    ? prev.completedJourneyNodeIds
                    : profile.completedJourneyNodeIds,
                savedScenarioIds:
                  (prev.savedScenarioIds?.length || 0) >= (profile.savedScenarioIds?.length || 0)
                    ? prev.savedScenarioIds
                    : profile.savedScenarioIds
              }
            : profile
        );
      };

      // Local data first — this is everything the UI needs to render, so the
      // app opens straight away instead of waiting on a network round trip
      // (Render's free tier can take ~50s to wake a cold backend).
      activeProfile = withRealName(activeProfile);
      const storedHistory = await AsyncStorage.getItem(`@rehearse_history_${userId}`);
      const storedNotifications = await AsyncStorage.getItem(`@rehearse_notifications_${userId}`);
      if (isStale()) return;
      commitProfile(activeProfile);
      setHistory(storedHistory ? JSON.parse(storedHistory) : []);
      setNotifications(storedNotifications ? JSON.parse(storedNotifications) : []);
      // Notifications: pull the account's copy and merge it with this device's.
      // Guests have nothing to sync — the copy on the phone is all there is.
      notificationsSyncedRef.current = false;
      AsyncStorage.getItem(`@rehearse_notif_dismissed_${userId}`)
        .then((raw) => {
          dismissedIdsRef.current = new Set(raw ? JSON.parse(raw) : []);
        })
        .catch(() => {})
        .then(() => apiService.getNotificationState(userId))
        .then((server) => {
          if (isStale() || !server) return;
          const dismissed = new Set([...dismissedIdsRef.current, ...(server.dismissedIds || [])]);
          dismissedIdsRef.current = dismissed;
          setNotifications((prev) => mergeNotifications(prev, server.notifications || [], dismissed));
          notificationsSyncedRef.current = true;
        })
        .catch(() => {
          // Offline / server asleep: keep the local copy; syncing resumes on next launch.
        });
      hasSeenTutorial(userId).then((seen) => {
        if (!isStale()) setTutorialSeen(seen);
      });
      setIsLoading(false);

      // Then reconcile with the backend in the background; the merged result
      // just refreshes state in place when (if) it arrives.
      apiService
        .getProfile(userId)
        .then(async ({ user: apiUser }) => {
          if (!apiUser || isStale()) return;
          const merged = withRealName({
            ...activeProfile,
            ...apiUser,
            ...reconcileName(activeProfile, apiUser),
            nameCustomized: activeProfile.nameCustomized,
            audience: locallyKnownAudience || apiUser.audience,
            id: userId
          });
          // A name edited while offline never reached the account — send it now.
          if (activeProfile.nameCustomized && apiUser.name !== merged.name) {
            apiService.updateProfileName(userId, merged.name).catch(() => {});
          }
          await AsyncStorage.setItem(userKey, JSON.stringify(merged));
          if (isStale()) return;
          commitProfile(merged);
        })
        .catch(() => {
          // Offline / backend asleep — the local profile above already stands.
        });
    } catch (e) {
      console.warn('Failed to load dynamic user state', e);
    } finally {
      if (!isStale()) setIsLoading(false);
    }
  }, [authUser]);

  // Guard against redundant reloads: `loadUserState` is a useCallback keyed
  // on `authUser`, whose reference can change (Supabase token refresh, etc.)
  // without the logical user actually changing — without this guard, every
  // such churn re-triggers a full reload-and-replace of user state.
  const lastLoadedUserId = React.useRef<string | null>(null);
  // Tracks whether the LAST currentUserId we saw belonged to a guest, so the
  // effect below can tell "brand new device" apart from "this guest just
  // signed up mid-session" — only the latter should carry the guest's local
  // data over to the new real account id.
  const prevWasGuestRef = React.useRef(false);
  useEffect(() => {
    if (lastLoadedUserId.current === currentUserId) return;
    const prevUserId = lastLoadedUserId.current;
    const prevWasGuest = prevWasGuestRef.current;
    lastLoadedUserId.current = currentUserId;
    prevWasGuestRef.current = isGuest;

    (async () => {
      // Guest -> real account conversion (AuthGateModal, mid purchase-flow):
      // without this, a guest who already finished onboarding gets dropped
      // back into Onboarding the instant they sign up, because isOnboarded
      // is keyed per-userId and the brand-new account has no flag yet — this
      // copies the guest's local state onto the new id before it's read, so
      // the app resumes wherever they were (paywall included) instead of
      // restarting them.
      if (prevWasGuest && prevUserId && !isGuest && currentUserId !== prevUserId) {
        const prevOnboarded = await AsyncStorage.getItem(`@rehearse_onboarded_${prevUserId}`);
        if (prevOnboarded === 'true') {
          const newOnboardedKey = `@rehearse_onboarded_${currentUserId}`;
          const alreadyOnboarded = await AsyncStorage.getItem(newOnboardedKey);
          if (!alreadyOnboarded) {
            await AsyncStorage.setItem(newOnboardedKey, 'true');
            for (const prefix of ['@rehearse_user_', '@rehearse_history_', '@rehearse_notifications_']) {
              const val = await AsyncStorage.getItem(`${prefix}${prevUserId}`);
              if (val) await AsyncStorage.setItem(`${prefix}${currentUserId}`, val);
            }
          }
        }
      }
      loadUserState(currentUserId);
    })();
  }, [currentUserId, isGuest, loadUserState]);

  // Reflects a RevenueCat CustomerInfo snapshot into both `isPro` (used for
  // fast local gating right after a purchase, before the webhook round-trip
  // to the backend lands) and `user.subscription` (so existing status/
  // planName-driven UI — MembershipBillingScreen, etc. — updates immediately
  // too, without waiting on refreshProfile()).
  const syncFromCustomerInfo = React.useCallback((info: CustomerInfo) => {
    const active = hasProEntitlement(info);
    setIsPro(active);
    if (!active) return;
    const entitlement = info.entitlements.active['rehearse_pro'];
    const productId = entitlement?.productIdentifier;
    const status =
      productId === 'yearly' ? 'active_annual' : productId === 'three_month' ? 'active_three_month' : 'active_monthly';
    const planName =
      productId === 'yearly' ? 'Annual Masterclass Pass' : productId === 'three_month' ? 'Three Month Pass' : 'Monthly Professional';
    setUser((prev) => ({
      ...prev,
      subscription: { ...prev.subscription, status, planName, rehearsalsRemaining: 999999, trialEndsAt: undefined }
    }));
  }, []);

  // Keeps RevenueCat's subscriber identity aligned with this app's own user
  // id scheme (guest-session / user-session / the authenticated id), so the
  // app_user_id RevenueCat sends back in webhooks matches memoryDb's user
  // records. No-ops entirely on web, where the native SDK isn't available.
  useEffect(() => {
    if (!isPurchasesSupported()) return;
    let cancelled = false;
    loginRevenueCatUser(currentUserId).then((info) => {
      if (!cancelled && info) syncFromCustomerInfo(info);
    });
    return () => {
      cancelled = true;
    };
  }, [currentUserId, syncFromCustomerInfo]);

  // Same alignment, for OneSignal — ties its subscriber id to the same
  // currentUserId scheme so a dashboard Journey can target a specific
  // person's tags regardless of which device they're on.
  useEffect(() => {
    if (!isOneSignalSupported()) return;
    linkExternalUserId(currentUserId);
  }, [currentUserId]);

  // Live-updates isPro/subscription the moment a purchase, renewal, or
  // cancellation happens — including purchases completed via the hosted
  // Paywall UI, which resolve through this listener rather than a direct
  // purchasePackage() call site.
  useEffect(() => {
    if (!isPurchasesSupported()) return;
    getCustomerInfo().then((info) => {
      if (info) syncFromCustomerInfo(info);
    });
    return addCustomerInfoListener(syncFromCustomerInfo);
  }, [syncFromCustomerInfo]);

  // Accepts a value OR an updater function — always resolves against React's
  // latest pending state (setUserState's functional form), not whatever
  // `user` a given closure captured at its own render. Several call sites
  // (e.g. RoleplayScreen's addHistoryEntry + refreshProfile, or Profile's
  // saveName + unlockMilestone) fire two of these back-to-back in one
  // handler; with a plain object form, the second call's stale `user`
  // silently clobbers the first call's write. Persistence is decoupled into
  // the effect below, so it always saves the final merged value.
  const setUser = (updated: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    setUserState((prev) => (typeof updated === 'function' ? updated(prev) : updated));
  };

  const isFirstUserPersist = React.useRef(true);
  useEffect(() => {
    if (isFirstUserPersist.current) {
      isFirstUserPersist.current = false;
      return;
    }
    AsyncStorage.setItem(`@rehearse_user_${user.id}`, JSON.stringify(user)).catch((e) => {
      console.warn('Failed to save user profile', e);
    });
  }, [user]);

  // The streak shown everywhere is derived from what the user actually did, by
  // LOCAL calendar day: any scored rehearsal, completed daily challenge or
  // story counts. It keeps running through "yesterday" and drops to 0 once a
  // whole day is missed — so it also resets on days the app is merely opened,
  // not only when a rehearsal finishes. (The backend's own count uses UTC days
  // and never resets on its own, so it's only a fallback for a fresh install
  // that has no local activity to derive from.)
  useEffect(() => {
    if (isLoading) return;
    const keys: string[] = [
      ...history.map((h) => localDateKey(new Date(h.completedAt))),
      ...(user.completedPuzzleDates || []),
      ...(user.completedStoryDates || [])
    ];
    let current: number;
    let longest: number;
    let lastActive: string | undefined;
    if (keys.length > 0) {
      const info = computeStreak(keys);
      current = info.current;
      longest = Math.max(info.longest, user.longestStreak || 0);
      lastActive = info.lastActive;
    } else {
      // No local activity: trust the backend count only while it's still live.
      const last = user.lastPracticeDate;
      const live = !!last && computeStreak([last]).current > 0;
      current = live ? user.currentStreak || 0 : 0;
      longest = user.longestStreak || 0;
      lastActive = last;
    }
    if (
      current !== user.currentStreak ||
      longest !== user.longestStreak ||
      (lastActive && lastActive !== user.lastPracticeDate)
    ) {
      setUser((prev) => ({
        ...prev,
        currentStreak: current,
        longestStreak: longest,
        lastPracticeDate: lastActive || prev.lastPracticeDate
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, history, user.completedPuzzleDates, user.completedStoryDates, user.currentStreak, user.longestStreak, user.lastPracticeDate]);

  // Re-derives today's single reminder (see notificationService.ts) whenever
  // the fields that actually determine its content change — not on every
  // `user` change, so editing a name/avatar doesn't touch notifications at
  // all. Each sync call cancels its own previous reminder first, so this can
  // never stack duplicates even if it fires more than once in a day.
  useEffect(() => {
    if (isLoading || !user.id) return;
    getRemindersEnabled(user.id).then((enabled) => {
      syncDailyReminder(user, enabled).catch((e) => console.warn('Failed to sync daily reminder', e));
      syncTrialEndingReminder(user, enabled).catch((e) => console.warn('Failed to sync trial reminder', e));
    });
  }, [user.id, user.currentStreak, user.lastPracticeDate, user.subscription?.status, user.subscription?.trialEndsAt, isLoading]);

  // Tracks the latest committed `user` across renders so async code (which
  // otherwise only sees the `user` its own closure captured at call time)
  // can read the freshest value after an await — used below instead of the
  // bare `user` closure specifically to avoid clobbering a sibling setUser
  // call queued earlier in the same handler (see setUser's comment).
  const userRef = React.useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const isFirstNotificationsPersist = React.useRef(true);
  useEffect(() => {
    if (isFirstNotificationsPersist.current) {
      isFirstNotificationsPersist.current = false;
      return;
    }
    AsyncStorage.setItem(`@rehearse_notifications_${userRef.current.id}`, JSON.stringify(notifications)).catch((e) => {
      console.warn('Failed to save notifications', e);
    });
  }, [notifications]);

  // Push local notification changes to the account (debounced) once we've
  // pulled its copy — so read/dismissed state follows the user across devices.
  useEffect(() => {
    if (isGuest || !notificationsSyncedRef.current || !user.id) return;
    const t = setTimeout(() => {
      apiService
        .saveNotificationState(user.id, notifications, Array.from(dismissedIdsRef.current).slice(-200))
        .catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [notifications, user.id, isGuest]);

  const refreshProfile = async (): Promise<UserProfile | undefined> => {
    try {
      const { user: refreshed } = await apiService.getProfile(user.id);
      if (refreshed) {
        // Merge, don't replace: the backend UserProfile predates several
        // fields this app now tracks client-side only (audience,
        // milestoneFlags, completedPuzzleDates, avatarUri) — a bare
        // setUser(refreshed) would silently wipe them on every refresh.
        const base = userRef.current;
        const merged: UserProfile = {
          ...base,
          ...refreshed,
          ...reconcileName(base, refreshed),
          nameCustomized: base.nameCustomized,
          audience: refreshed.audience || base.audience,
          avatarUri: refreshed.avatarUri || base.avatarUri,
          milestoneFlags: { ...base.milestoneFlags, ...refreshed.milestoneFlags },
          completedPuzzleDates: refreshed.completedPuzzleDates || base.completedPuzzleDates,
          completedStoryDates: refreshed.completedStoryDates || base.completedStoryDates,
          puzzleResults: { ...refreshed.puzzleResults, ...base.puzzleResults },
          readArticleIds: refreshed.readArticleIds || base.readArticleIds,
          completedJourneyNodeIds: refreshed.completedJourneyNodeIds || base.completedJourneyNodeIds,
          savedScenarioIds: refreshed.savedScenarioIds || base.savedScenarioIds
        };
        setUser((prev) => ({
          ...prev,
          ...refreshed,
          ...reconcileName(prev, refreshed),
          nameCustomized: prev.nameCustomized,
          audience: refreshed.audience || prev.audience,
          avatarUri: refreshed.avatarUri || prev.avatarUri,
          milestoneFlags: { ...prev.milestoneFlags, ...refreshed.milestoneFlags },
          completedPuzzleDates: refreshed.completedPuzzleDates || prev.completedPuzzleDates,
          completedStoryDates: refreshed.completedStoryDates || prev.completedStoryDates,
          puzzleResults: { ...refreshed.puzzleResults, ...prev.puzzleResults },
          readArticleIds: refreshed.readArticleIds || prev.readArticleIds,
          completedJourneyNodeIds: refreshed.completedJourneyNodeIds || prev.completedJourneyNodeIds,
          savedScenarioIds: refreshed.savedScenarioIds || prev.savedScenarioIds
        }));
        return merged;
      }
    } catch (e) {
      console.warn('Could not refresh profile from server', e);
    }
    return undefined;
  };

  const completeOnboarding = async (
    role: string,
    experienceLevel: string,
    primaryDreadCategory: string,
    audience?: Audience
  ) => {
    // If the caller isn't authenticated yet, completing onboarding will trigger
    // a guest sign-in below, which changes `currentUserId` from 'user-session'
    // to this device's unique guest id and re-runs the loadUserState effect
    // for that new id. Reserve that same id up front (ensureGuestId persists
    // it without flipping any session state) and write the onboarded flag
    // under it before triggering the id change, so the effect's re-read
    // always finds it already true instead of racing and bouncing
    // isOnboarded back to false.
    const targetUserId = !isAuthenticated ? await ensureGuestId() : user.id;

    try {
      await AsyncStorage.setItem(`@rehearse_onboarded_${targetUserId}`, 'true');
      const { user: updated } = await apiService.completeOnboarding({
        userId: targetUserId,
        role,
        experienceLevel,
        primaryDreadCategory,
        audience
      });
      // Belt-and-suspenders: the call above already persists `audience` to
      // the backend, but keep preferring the just-selected value here too in
      // case the request fell back to a stale/cached response.
      await setUser({
        ...updated,
        audience: audience || updated.audience,
        milestoneFlags: { ...updated.milestoneFlags }
      });
    } catch (e) {
      // Local dynamic fallback
      await setUser({
        ...user,
        id: targetUserId,
        role,
        experienceLevel,
        primaryDreadCategory,
        audience,
        milestoneFlags: { ...user.milestoneFlags }
      });
    } finally {
      // The "Welcome Aboard" celebration is deliberately NOT fired here — it
      // waits until the how-it-works tutorial is done and access is unlocked
      // (see the effect below), so it doesn't land on top of those screens.
      setIsOnboarded(true);
      if (!isAuthenticated && signInAsGuest) {
        // About to flip isGuest -> changes currentUserId -> re-triggers
        // loadUserState. Suppress just that one reload's loading gate so the
        // app doesn't flash back to the loading screen mid-onboarding.
        suppressNextLoadingGateRef.current = true;
        await signInAsGuest();
      }
    }
  };

  const addHistoryEntry = async (scenario: Scenario, scorecard: Scorecard, turns?: MessageTurn[]) => {
    const entry: HistoryEntry = {
      id: scorecard.id,
      scenarioTitle: scenario.title,
      counterpartName: scenario.counterpartName,
      category: scenario.category,
      overallScore: scorecard.overallScore,
      clarity: scorecard.clarity,
      empathy: scorecard.empathy,
      assertiveness: scorecard.assertiveness,
      listening: scorecard.listening,
      growthAreas: scorecard.growthAreas || [],
      completedAt: scorecard.generatedAt || new Date().toISOString(),
      turns: turns?.map((t) => ({ speaker: t.speaker, message: t.message })),
      scorecard
    };
    const updated = [entry, ...history].slice(0, 100);
    setHistory(updated);
    try {
      await AsyncStorage.setItem(`@rehearse_history_${user.id}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save conversation history', e);
    }
  };

  // Same functional-update reasoning as setUser above — these fire from
  // several places (badge unlocks, milestone unlocks, Go-Pro nudges) that
  // can land in the same tick, so each must compose against the latest
  // queued list rather than a closure snapshot. Persistence is decoupled
  // into the effect below.
  const addNotification = async (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const entry: AppNotification = {
      ...n,
      id: `notif-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [entry, ...prev].slice(0, 50));
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => (prev.every((n) => n.read) ? prev : prev.map((n) => ({ ...n, read: true }))));
  };

  // The pop-up banner auto-hides after a few seconds — that should only mark
  // the notification as seen, never delete it from the list.
  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => (prev.some((n) => n.id === id && !n.read) ? prev.map((n) => (n.id === id ? { ...n, read: true } : n)) : prev));
  };

  const dismissNotification = async (id: string) => {
    dismissedIdsRef.current.add(id);
    AsyncStorage.setItem(
      `@rehearse_notif_dismissed_${userRef.current.id}`,
      JSON.stringify(Array.from(dismissedIdsRef.current).slice(-200))
    ).catch(() => {});
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const completeTutorial = async () => {
    setTutorialSeen(true);
    await markTutorialSeen(userRef.current.id);
  };

  // "Welcome Aboard" — shown once, after the how-it-works tutorial AND once
  // access is open (not sitting on the access-locked screen). The milestone
  // flag makes it fire exactly once per account.
  useEffect(() => {
    if (isLoading || !isOnboarded || tutorialSeen !== true) return;
    if (isAccessLocked(user, isPro)) return;
    if (user.milestoneFlags?.badge_onboarded) return;
    unlockMilestone('badge_onboarded', 'Welcome Aboard', 'Completed onboarding and picked your focus.', 'sparkles');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isOnboarded, tutorialSeen, user.milestoneFlags?.badge_onboarded, user.subscription?.status, user.subscription?.rehearsalsRemaining, user.subscription?.trialEndsAt, isPro]);

  // Early "starting steps" milestones — celebrated once each, tracked via a
  // flag on the profile so they never re-fire. These exist specifically so a
  // brand-new user gets a win in their first minutes, not just after their
  // first full rehearsal (per Hook Model: an early, easy reward is what
  // makes someone open the app a second time).
  const unlockMilestone = (id: string, title: string, description: string, icon: string) => {
    if (userRef.current.milestoneFlags?.[id]) return;
    setUser((prev) => {
      if (prev.milestoneFlags?.[id]) return prev;
      return { ...prev, milestoneFlags: { ...prev.milestoneFlags, [id]: true } };
    });
    setUnlockedBadge({ title, description, icon });
    addNotification({ title: 'Milestone unlocked', body: `${title} — ${description}`, icon: icon as any });
    hapticSuccess();
  };

  // Bookmarking a scenario — frontend-only, like completedPuzzleDates/
  // milestoneFlags, so it rides the same functional setUser + persistence
  // path (see loadUserState/refreshProfile's merge logic) rather than a
  // separate AsyncStorage key.
  const toggleSavedScenario = (scenarioId: string) => {
    setUser((prev) => {
      const existing = prev.savedScenarioIds || [];
      const isSaved = existing.includes(scenarioId);
      return {
        ...prev,
        savedScenarioIds: isSaved
          ? existing.filter((id) => id !== scenarioId)
          : [...existing, scenarioId]
      };
    });
  };

  // Drives the Learn roadmap's sequential unlock (see LearnScreen) — additive
  // only, like completedPuzzleDates, so re-reading an already-read article is
  // a harmless no-op rather than risking a duplicate/state thrash.
  const markArticleRead = (articleId: string) => {
    setUser((prev) => {
      const existing = prev.readArticleIds || [];
      if (existing.includes(articleId)) return prev;
      return { ...prev, readArticleIds: [...existing, articleId] };
    });
  };

  // Drives the Journey roadmap's sequential unlock (see JourneyScreen) —
  // covers BOTH lesson and story nodes in one list, additive-only like
  // markArticleRead, so re-completing an already-done node is a no-op.
  const markJourneyNodeComplete = (nodeId: string) => {
    setUser((prev) => {
      const existing = prev.completedJourneyNodeIds || [];
      if (existing.includes(nodeId)) return prev;
      return { ...prev, completedJourneyNodeIds: [...existing, nodeId] };
    });
  };

  // Web-only fallback: real purchases (native) bypass this entirely — the
  // hosted RevenueCat Paywall drives the actual purchase, and syncFromCustomerInfo
  // above reflects the result. This exists only so the Expo-web preview build
  // (which can't load the native Purchases SDK) still has something to
  // demo behind the "Upgrade" CTA during day-to-day UI work.
  const upgradeSubscription = async (plan: 'monthly' | 'three_month' | 'annual') => {
    const statusFor = (p: typeof plan): UserProfile['subscription']['status'] =>
      p === 'annual' ? 'active_annual' : p === 'three_month' ? 'active_three_month' : 'active_monthly';
    const planNameFor = (p: typeof plan) =>
      p === 'annual' ? 'Annual Masterclass Pass' : p === 'three_month' ? 'Three Month Pass' : 'Monthly Professional';

    try {
      const { subscription } = await apiService.upgradePlan(user.id, plan);
      const updatedUser = {
        ...user,
        subscription
      };
      await setUser(updatedUser);
      setIsPaywallVisible(false);
    } catch (e) {
      const updatedUser: UserProfile = {
        ...user,
        subscription: {
          status: statusFor(plan),
          rehearsalsRemaining: 99999,
          planName: planNameFor(plan)
        }
      };
      await setUser(updatedUser);
      setIsPaywallVisible(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        isOnboarded,
        activeSession,
        lastScorecard,
        isPaywallVisible,
        paywallPreferredPlan,
        isPro,
        unlockedBadge,
        history,
        notifications,
        setUser,
        setActiveSession,
        setLastScorecard,
        setIsPaywallVisible,
        setPaywallPreferredPlan,
        setUnlockedBadge,
        addHistoryEntry,
        addNotification,
        markAllNotificationsRead,
        markNotificationRead,
        dismissNotification,
        unlockMilestone,
        toggleSavedScenario,
        markArticleRead,
        markJourneyNodeComplete,
        refreshProfile,
        tutorialSeen,
        completeTutorial,
        completeOnboarding,
        upgradeSubscription
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

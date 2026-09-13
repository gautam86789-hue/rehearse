import { Platform } from 'react-native';
import { UserProfile } from '../types';

// Unlike react-native-purchases (which no-ops gracefully on web), OneSignal's
// JS module reaches for its native module eagerly at import time and throws
// immediately on any platform where it isn't registered — a plain static
// `import` at the top of this file would crash the Expo-web preview the
// instant App.tsx loads. Loading it lazily, only inside this Platform check,
// keeps the module's code from ever executing on web at all.
export const isOneSignalSupported = () => Platform.OS === 'ios' || Platform.OS === 'android';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let OneSignal: any = null;
if (isOneSignalSupported()) {
  try {
    OneSignal = require('react-native-onesignal').OneSignal;
  } catch (err) {
    console.warn('OneSignal native module unavailable (expected until an EAS build includes it):', err);
  }
}

let isInitialized = false;

// Call once, as early as possible (see App.tsx) — before login/tag calls.
// Requires EXPO_PUBLIC_ONESIGNAL_APP_ID to be set (from the OneSignal
// dashboard, once that app exists) and a native build (EAS dev-client or
// production) to actually deliver anything — inert in Expo Go and the
// Expo-web preview by design.
export function initOneSignal(): void {
  if (!OneSignal || isInitialized) return;

  const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) {
    console.warn('OneSignal: EXPO_PUBLIC_ONESIGNAL_APP_ID not set — push notifications via OneSignal are disabled.');
    return;
  }

  OneSignal.initialize(appId);
  OneSignal.Notifications.requestPermission(true);
  isInitialized = true;
}

/** Ties the OneSignal subscriber to Rehearse's own user/guest id — the same
 *  id used everywhere else via currentUserId — so a Journey can target a
 *  specific person regardless of which device they're on. */
export function linkExternalUserId(userId: string): void {
  if (!OneSignal || !isInitialized) return;
  OneSignal.login(userId);
}

export function clearExternalUserId(): void {
  if (!OneSignal || !isInitialized) return;
  OneSignal.logout();
}

/** Sends the tags a OneSignal Journey (configured in the dashboard, not in
 *  code) keys off — streak-risk nudges, trial-ending reminders, persona-aware
 *  content pings. Call after anything that changes this state, same trigger
 *  points as notificationService's local reminders. */
export function syncUserTags(user: UserProfile): void {
  if (!OneSignal || !isInitialized) return;
  OneSignal.User.addTags({
    streak: String(user.currentStreak || 0),
    is_pro: String(!!user.subscription?.status?.startsWith('active')),
    trial_ends_at: user.subscription?.trialEndsAt || '',
    last_practice_date: user.lastPracticeDate || '',
    audience: user.audience || ''
  });
}

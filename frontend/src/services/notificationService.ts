import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { syncUserTags } from './oneSignalService';

/**
 * Local (on-device) reminders — no backend push server involved. Designed
 * around a few deliberate psychology rules rather than "notify whenever
 * something changes":
 *
 * 1. At most ONE reminder scheduled per user per day. Every scheduling call
 *    below cancels whatever it previously scheduled first, so nothing can
 *    stack up into a flood.
 * 2. Loss-aversion framing ("don't lose your streak") is used whenever the
 *    user actually has a streak to lose — it reliably outperforms generic
 *    "come back!" copy. Users with no streak yet get a curiosity-framed nudge
 *    instead, since loss-aversion copy would just be false for them.
 * 3. Sent in the evening (default 7pm local), never late at night — a quiet
 *    hours rule, not a "fire the instant state changes" rule.
 * 4. The trial-ending reminder fires exactly once, the day before expiry —
 *    never a recurring "upgrade now" nag. Paywall pressure this rare reads
 *    as informative, not spammy.
 * 5. Everything here is skippable per-user via the existing Profile
 *    "Reminders" toggle (see ProfileScreen.tsx) — respecting that choice
 *    matters more than any one reminder landing.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

const REMINDER_HOUR = 19; // 7pm local — evening reflection time, not late night
const CHANNEL_ID = 'rehearse-reminders';

const dailyReminderKey = (userId: string) => `@rehearse_daily_reminder_id_${userId}`;
const trialReminderKey = (userId: string) => `@rehearse_trial_reminder_id_${userId}`;

let channelReady = false;
async function ensureChannel() {
  if (channelReady || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Practice reminders',
    importance: Notifications.AndroidImportance.DEFAULT
  });
  channelReady = true;
}

/** Reads the same AsyncStorage flag ProfileScreen's "Reminders" toggle writes to. */
export async function getRemindersEnabled(userId: string): Promise<boolean> {
  const v = await AsyncStorage.getItem(`@rehearse_reminders_${userId}`);
  return v === null ? true : v === 'true'; // defaults on, matching ProfileScreen's initial state
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function cancelStored(key: string) {
  const id = await AsyncStorage.getItem(key);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    await AsyncStorage.removeItem(key);
  }
}

function nextOccurrenceOf(hour: number): Date {
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  if (target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

/**
 * Re-derives and schedules "today's" single reminder from current user
 * state. Call this after anything that changes streak/practice state
 * (completing a rehearsal or Daily Puzzle, or toggling Reminders in
 * Settings) — it always cancels its own previous reminder first, so calling
 * it repeatedly can never produce more than one pending notification.
 */
export async function syncDailyReminder(user: UserProfile, enabled: boolean): Promise<void> {
  // Additive, not a replacement for the local scheduling below — OneSignal
  // Journeys (configured in its dashboard once that app exists) key off
  // these tags for the "Keep Them Coming Back" category; the local
  // notification is what actually delivers today, before that's set up.
  syncUserTags(user);

  const key = dailyReminderKey(user.id);
  await cancelStored(key);
  if (!enabled) return;

  const today = new Date().toISOString().slice(0, 10);
  if (user.lastPracticeDate === today) return; // already practiced today — nothing to remind about

  const granted = await requestNotificationPermission();
  if (!granted) return;
  await ensureChannel();

  const hasStreak = (user.currentStreak || 0) > 0;
  const { title, body } = hasStreak
    ? {
        title: `Don't lose your ${user.currentStreak}-day streak`,
        body: 'One quick rehearsal keeps it alive today.'
      }
    : {
        title: "Today's Daily Challenge is ready",
        body: 'A 2-minute puzzle to sharpen your next hard conversation.'
      };

  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, data: { screen: 'DailyPuzzle' } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextOccurrenceOf(REMINDER_HOUR),
      channelId: CHANNEL_ID
    }
  });
  await AsyncStorage.setItem(key, id);
}

/** One-time, fires the day before a free trial ends. Never repeats. */
export async function syncTrialEndingReminder(user: UserProfile, enabled: boolean): Promise<void> {
  const key = trialReminderKey(user.id);
  await cancelStored(key);
  if (!enabled) return;
  if (user.subscription?.status !== 'free_trial' || !user.subscription.trialEndsAt) return;

  const trialEnd = new Date(user.subscription.trialEndsAt);
  const reminderTime = new Date(trialEnd.getTime() - 24 * 60 * 60 * 1000);
  if (reminderTime.getTime() <= Date.now()) return; // would fire in the past — skip rather than send late

  const granted = await requestNotificationPermission();
  if (!granted) return;
  await ensureChannel();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your free trial ends tomorrow',
      body: 'Keep your streak and unlock unlimited rehearsals before it lapses.',
      data: { screen: 'MembershipBilling' }
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderTime, channelId: CHANNEL_ID }
  });
  await AsyncStorage.setItem(key, id);
}

/** Cancels every reminder this service has scheduled for a user — used when Reminders is turned off. */
export async function cancelAllReminders(userId: string): Promise<void> {
  await cancelStored(dailyReminderKey(userId));
  await cancelStored(trialReminderKey(userId));
}

/**
 * Routes a tapped notification to the screen it's actually about, instead of
 * just opening to whatever screen the app happened to be on. Call once, at
 * app root. Also checks `getLastNotificationResponseAsync()` for the case
 * where the tap is what launched the app from a cold start (killed, not
 * backgrounded) — the response event listener alone misses that case since
 * nothing is listening yet when the tap happens.
 */
export function registerNotificationResponseHandler(
  navigate: (screen: string, params?: object) => void
): () => void {
  const handle = (response: Notifications.NotificationResponse) => {
    const screen = response.notification.request.content.data?.screen as string | undefined;
    if (screen) navigate(screen);
  };

  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) handle(response);
  });

  const subscription = Notifications.addNotificationResponseReceivedListener(handle);
  return () => subscription.remove();
}

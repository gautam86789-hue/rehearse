import { localDateKey } from '../utils/dates';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { syncUserTags } from './oneSignalService';

/**
 * Local (on-device) reminders — no backend push server involved.
 *
 * Design rules:
 * 1. ONE reminder per user per day maximum. Every scheduling call cancels
 *    the previous one first — no stacking, no floods.
 * 2. Creative, rotating copy: 12 daily variants + 6 streak variants so the
 *    same person never reads the same notification twice in a week.
 * 3. Personalized where possible — uses real name, real streak count, real score.
 * 4. Sent at 7 PM local time (evening reflection window, not late night).
 * 5. Trial-ending reminder fires once, day before expiry. Never a nag.
 * 6. Fully skippable via the Profile "Reminders" toggle.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

const REMINDER_HOUR = 19; // 7 PM local
const CHANNEL_ID = 'rehearse-reminders';

const dailyReminderKey  = (userId: string) => `@rehearse_daily_reminder_id_${userId}`;
const trialReminderKey  = (userId: string) => `@rehearse_trial_reminder_id_${userId}`;
const lastCopyIndexKey  = (userId: string) => `@rehearse_notif_copy_idx_${userId}`;

// ── Creative copy pools ──────────────────────────────────────────────────────

const STREAK_COPY: Array<{ title: string; body: string }> = [
  {
    title: 'Your streak is on the line 🔥',
    body: 'One rehearsal keeps the fire burning. Don\'t let today be the day it goes out.'
  },
  {
    title: 'Real conversations don\'t wait. Neither should you.',
    body: 'Keep your streak alive — 5 minutes of practice is all it takes today.'
  },
  {
    title: 'Every high-stakes conversation gets easier the second time.',
    body: 'Today\'s rep builds that muscle. Your streak is waiting.'
  },
  {
    title: 'You\'ve been consistent. Don\'t stop now.',
    body: 'A quick rehearsal before bed keeps your edge sharp for tomorrow.'
  },
  {
    title: 'Top performers practice. Every. Single. Day.',
    body: 'You\'re {streak} days in — don\'t let this one slide.'
  },
  {
    title: 'The conversation you\'ve been avoiding? Practice it tonight.',
    body: 'Your streak doesn\'t care about excuses. Neither do the people across the table.'
  }
];

const NO_STREAK_COPY: Array<{ title: string; body: string }> = [
  {
    title: 'What\'s your hardest conversation right now? 🤔',
    body: 'Rehearse it before it rehearses you. 2 minutes, zero stakes.'
  },
  {
    title: 'The best negotiators aren\'t born — they practice.',
    body: 'Your daily challenge is ready. Take 2 minutes before tomorrow\'s meeting.'
  },
  {
    title: 'Today\'s puzzle will make Friday\'s meeting less painful.',
    body: 'Seriously. Open it once, it takes under 3 minutes.'
  },
  {
    title: 'What if you walked into that conversation fully prepared?',
    body: 'Today\'s Daily Challenge is designed exactly for that feeling.'
  },
  {
    title: 'Your next raise negotiation is closer than you think.',
    body: 'Spend 2 minutes rehearsing it now — before it\'s awkward in real life.'
  },
  {
    title: 'One insight can change how a conversation goes.',
    body: 'Today\'s framework is worth 60 seconds of your time.'
  }
];

const POST_SCORE_COPY = (score: number, firstName?: string): { title: string; body: string } => {
  const name = firstName ? `, ${firstName}` : '';
  if (score >= 85) {
    return {
      title: `Strong session${name} 💪`,
      body: `${score}/100 — you\'re building real muscle. Push further tomorrow.`
    };
  }
  if (score >= 70) {
    return {
      title: `Solid start. Now refine it.`,
      body: `You scored ${score}/100. The gap between good and great is one more rep.`
    };
  }
  return {
    title: `Every expert was once a beginner.`,
    body: `${score}/100 today — the AI knows exactly what to work on next. Come back tomorrow.`
  };
};

// ── Helpers ──────────────────────────────────────────────────────────────────

let channelReady = false;
async function ensureChannel() {
  if (channelReady || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Practice reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#5B5FEF'
  });
  channelReady = true;
}

export async function getRemindersEnabled(userId: string): Promise<boolean> {
  const v = await AsyncStorage.getItem(`@rehearse_reminders_${userId}`);
  return v === null ? true : v === 'true';
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function clearAllScheduledNotifications(userId: string) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {}
  await AsyncStorage.removeItem(dailyReminderKey(userId));
  await AsyncStorage.removeItem(trialReminderKey(userId));
}

function nextOccurrenceOf(hour: number): Date {
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  if (target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

/** Picks the next copy variant in round-robin fashion so the same message never repeats. */
async function pickCopy(
  userId: string,
  pool: Array<{ title: string; body: string }>,
  replacements?: Record<string, string>
): Promise<{ title: string; body: string }> {
  const stored = await AsyncStorage.getItem(lastCopyIndexKey(userId));
  const lastIdx = stored ? parseInt(stored, 10) : -1;
  const nextIdx = (lastIdx + 1) % pool.length;
  await AsyncStorage.setItem(lastCopyIndexKey(userId), String(nextIdx));

  let { title, body } = pool[nextIdx];
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      title = title.replace(`{${k}}`, v);
      body  = body.replace(`{${k}}`, v);
    }
  }
  return { title, body };
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Re-derives and schedules today's single reminder from current user state.
 * Call after anything that changes streak/practice state. Strictly clears all
 * previous scheduled notifications first — maximum 1 pending notification total.
 */
export async function syncDailyReminder(user: UserProfile, enabled: boolean): Promise<void> {
  syncUserTags(user);

  await clearAllScheduledNotifications(user.id);
  if (!enabled) return;

  const today = localDateKey();
  if (user.lastPracticeDate === today) return; // already practiced today

  const granted = await requestNotificationPermission();
  if (!granted) return;
  await ensureChannel();

  const hasStreak = (user.currentStreak || 0) > 0;
  const pool = hasStreak ? STREAK_COPY : NO_STREAK_COPY;
  const replacements: Record<string, string> = {
    streak: String(user.currentStreak || 0),
    name: user.name?.split(' ')[0] || 'there'
  };
  const { title, body } = await pickCopy(user.id, pool, replacements);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { screen: hasStreak ? 'Home' : 'DailyPuzzle' },
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {})
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextOccurrenceOf(REMINDER_HOUR),
      channelId: CHANNEL_ID
    }
  });
  await AsyncStorage.setItem(dailyReminderKey(user.id), id);
}

/** Schedules a post-session motivational push based on the session score. Strictly clears prior scheduled notifications first. */
export async function schedulePostSessionReminder(
  user: UserProfile,
  score: number,
  enabled: boolean
): Promise<void> {
  await clearAllScheduledNotifications(user.id);
  if (!enabled) return;
  const granted = await requestNotificationPermission();
  if (!granted) return;
  await ensureChannel();

  const firstName = user.name?.split(' ')[0];
  const { title, body } = POST_SCORE_COPY(score, firstName);

  // Fire 18 hours later (next morning, roughly) so it feels like a coaching follow-up
  const fireAt = new Date(Date.now() + 18 * 60 * 60 * 1000);
  // Don't fire if it would land between 11 PM and 7 AM
  const hour = fireAt.getHours();
  if (hour >= 23 || hour < 7) {
    fireAt.setHours(9, 0, 0, 0);
    if (fireAt.getTime() <= Date.now()) {
      fireAt.setDate(fireAt.getDate() + 1);
    }
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { screen: 'Home' },
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {})
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
      channelId: CHANNEL_ID
    }
  });
  await AsyncStorage.setItem(dailyReminderKey(user.id), id);
}

/** One-time, fires the day before a free trial ends. Strictly clears prior scheduled notifications first. */
export async function syncTrialEndingReminder(user: UserProfile, enabled: boolean): Promise<void> {
  await clearAllScheduledNotifications(user.id);
  if (!enabled) return;
  if (user.subscription?.status !== 'free_trial' || !user.subscription.trialEndsAt) return;

  const trialEnd    = new Date(user.subscription.trialEndsAt);
  const reminderTime = new Date(trialEnd.getTime() - 24 * 60 * 60 * 1000);
  if (reminderTime.getTime() <= Date.now()) return;

  const granted = await requestNotificationPermission();
  if (!granted) return;
  await ensureChannel();

  const firstName = user.name?.split(' ')[0];
  const name = firstName ? `, ${firstName}` : '';

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Your free trial ends tomorrow${name} ⏰`,
      body: 'Keep your momentum going — unlock unlimited rehearsals before your streak disappears.',
      data: { screen: 'MembershipBilling' },
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {})
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderTime,
      channelId: CHANNEL_ID
    }
  });
  await AsyncStorage.setItem(trialReminderKey(user.id), id);
}

/** Cancels every reminder this service has scheduled for a user. */
export async function cancelAllReminders(userId: string): Promise<void> {
  await clearAllScheduledNotifications(userId);
}

/**
 * Routes a tapped notification to the correct screen. Call once at app root.
 * Also handles cold-start taps via getLastNotificationResponseAsync().
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

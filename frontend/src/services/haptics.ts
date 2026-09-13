import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Was a UI-only toggle before this (AppearanceScreen's "Haptics" switch
// persisted a boolean nobody ever read) — these helpers are what actually
// trigger feedback, and every one of them checks this same flag first so
// turning the setting off genuinely silences all haptics app-wide.
const HAPTICS_KEY = '@rehearse_haptics_enabled';

let cachedEnabled: boolean | null = null;

export async function setHapticsEnabled(enabled: boolean): Promise<void> {
  cachedEnabled = enabled;
  await AsyncStorage.setItem(HAPTICS_KEY, String(enabled));
}

async function isEnabled(): Promise<boolean> {
  if (cachedEnabled !== null) return cachedEnabled;
  const stored = await AsyncStorage.getItem(HAPTICS_KEY);
  cachedEnabled = stored === null ? true : stored === 'true';
  return cachedEnabled;
}

/** For screens that need the persisted value directly (e.g. to initialize a toggle). */
export const getHapticsEnabled = isEnabled;

/** Light tap — routine taps: buttons, tab switches, selections. */
export async function hapticTap(): Promise<void> {
  if (!(await isEnabled())) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Slightly stronger — a deliberate/committing action (submit, start rehearsal). */
export async function hapticImpact(): Promise<void> {
  if (!(await isEnabled())) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

/** A real win — milestone unlocked, streak hit, optimal daily puzzle answer. */
export async function hapticSuccess(): Promise<void> {
  if (!(await isEnabled())) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** Something went wrong — form validation, failed request. */
export async function hapticError(): Promise<void> {
  if (!(await isEnabled())) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}

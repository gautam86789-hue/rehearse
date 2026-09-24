import AsyncStorage from '@react-native-async-storage/async-storage';

const key = (userId: string) => `@rehearse_tutorial_seen_${userId}`;

export async function hasSeenTutorial(userId: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(key(userId))) === 'true';
  } catch {
    return true; // if storage is unavailable, don't nag
  }
}

export async function markTutorialSeen(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key(userId), 'true');
  } catch {
    // non-critical
  }
}

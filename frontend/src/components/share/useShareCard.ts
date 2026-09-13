import { useRef, useState } from 'react';
import { ViewShotRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

/**
 * Captures a ViewShot-wrapped card and hands it to the native share sheet.
 * Shared by every share-card feature (Daily Puzzle, streak milestone,
 * scorecard) instead of each screen wiring its own capture/share plumbing.
 */
export function useShareCard() {
  const viewShotRef = useRef<ViewShotRef>(null);
  const [isSharing, setIsSharing] = useState(false);

  const share = async (dialogTitle: string) => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      if (!viewShotRef.current) return;
      const uri = await viewShotRef.current.capture();
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, { dialogTitle, mimeType: 'image/png' });
      }
    } catch (err) {
      console.warn('Failed to share card:', err);
    } finally {
      setIsSharing(false);
    }
  };

  return { viewShotRef, isSharing, share };
}

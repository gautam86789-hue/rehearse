import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, RADII } from '../../context/ThemeContext';
import { RehearseEmblem } from '../brand/RehearseEmblem';

interface ShareCardFrameProps {
  children: React.ReactNode;
  /** Small caption above the content, e.g. "TODAY'S CHALLENGE". */
  eyebrow?: string;
}

// Fixed 9:16 portrait — the aspect ratio proven out by Duolingo's streak
// cards and Instagram/Twitter's own share-card conventions (see research:
// designing for the destination's exact aspect ratio was what drove their
// 5-10x jump in organic sharing, not the content itself).
const CARD_WIDTH = 320;
const CARD_HEIGHT = (CARD_WIDTH * 16) / 9;

/**
 * Shared branded frame for every share card (Daily Puzzle, streak milestone,
 * scorecard) — wraps content in a ViewShot so `useShareCard` can capture it,
 * and carries the gradient background + logo watermark so individual cards
 * only need to supply their own content, not reinvent the branding.
 */
export const ShareCardFrame = forwardRef<ViewShotRef, ShareCardFrameProps>(
  ({ children, eyebrow }, ref) => {
    const { colors, isDark } = useTheme();

    return (
      <ViewShot
        ref={ref}
        // Without explicit width/height, capture resolution followed
        // whatever the device's pixel density happened to be — as low as
        // ~640x1138 on a 2x-density phone, visibly soft next to any other
        // Instagram Story. Forcing the actual Stories-standard 1080x1920
        // (same 9:16 ratio as the card itself, so this is a clean upscale,
        // not a crop/stretch) makes quality consistent everywhere it's
        // captured from.
        options={{ format: 'png', quality: 1, width: 1080, height: 1920 }}
      >
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <LinearGradient
            colors={isDark ? ['#1E1E32', '#12121F'] : [colors.primarySubtle, '#FFFFFF']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.inner}>
            {eyebrow && (
              <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
            )}
            <View style={styles.content}>{children}</View>

            <View style={styles.footer}>
              <RehearseEmblem size={28} />
              <Text style={[styles.wordmark, { color: colors.textPrimary }]}>REHEARSE</Text>
              <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                Practice difficult conversations.
              </Text>
            </View>
          </View>
        </View>
      </ViewShot>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: RADII.xxl,
    overflow: 'hidden'
  },
  inner: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 20,
    justifyContent: 'space-between'
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center'
  },
  content: {
    flex: 1,
    justifyContent: 'center'
  },
  footer: {
    alignItems: 'center',
    gap: 4
  },
  wordmark: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2
  },
  tagline: {
    fontSize: 10.5,
    fontWeight: '500'
  }
});

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ViewShotRef } from 'react-native-view-shot';
import { Flame } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { ShareCardFrame } from './ShareCardFrame';

interface StreakMilestoneCardProps {
  streak: number;
  /** e.g. "Founder / Investor" — kept generic, never the user's real name. */
  audienceLabel?: string;
}

// Duolingo's proven pattern: a big, bold, full-bleed number plus one line of
// identity framing — no conversation content at all, so it's safe to share
// on LinkedIn (this app's audience skews professional) without exposing
// anything about what was actually practiced.
export const StreakMilestoneCard = forwardRef<ViewShotRef, StreakMilestoneCardProps>(
  ({ streak, audienceLabel }, ref) => {
    const { colors } = useTheme();

    return (
      <ShareCardFrame ref={ref} eyebrow="DAY STREAK">
        <View style={styles.wrap}>
          <View style={[styles.flameCircle, { backgroundColor: colors.cardCategories.flame.subtle }]}>
            <Flame size={40} color={colors.flame} />
          </View>
          <Text style={[styles.number, { color: colors.textPrimary }]}>{streak}</Text>
          <Text style={[styles.days, { color: colors.textSecondary }]}>
            {streak === 1 ? 'day' : 'days'} of practicing hard conversations
          </Text>
          {audienceLabel && (
            <View style={[styles.pill, { backgroundColor: colors.primarySubtle }]}>
              <Text style={[styles.pillText, { color: colors.primary }]}>{audienceLabel}</Text>
            </View>
          )}
        </View>
      </ShareCardFrame>
    );
  }
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 10
  },
  flameCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  number: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -1
  },
  days: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 220
  },
  pill: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700'
  }
});

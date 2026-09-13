import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ViewShotRef } from 'react-native-view-shot';
import { Check, X } from 'lucide-react-native';
import { useTheme, RADII } from '../../context/ThemeContext';
import { StoryTrajectory } from '../../types';
import { ShareCardFrame } from './ShareCardFrame';

interface StoryShareCardProps {
  storyTitle: string;
  tierLabel: string;
  strongCount: number;
  totalCount: number;
  picks: StoryTrajectory[];
}

const isStrongPick = (t: StoryTrajectory) => t === 'assertive' || t === 'diplomatic';

// Spoiler-safe like the other cards: only the score and tier are shown —
// never the dialogue choices or narrative beats — so a stranger sees "how
// well did they handle this" framing without spoiling the story itself.
// Replaces the earlier "communication identity" framing with an explicit
// comprehension score, matching the same right/wrong assessment pattern
// used for lesson-node quizzes.
export const StoryShareCard = forwardRef<ViewShotRef, StoryShareCardProps>(
  ({ storyTitle, tierLabel, strongCount, totalCount, picks }, ref) => {
    const { colors } = useTheme();

    return (
      <ShareCardFrame ref={ref} eyebrow="JOURNEY STORY">
        <View style={styles.wrap}>
          <Text style={[styles.storyTitle, { color: colors.textSecondary }]} numberOfLines={2}>
            "{storyTitle}"
          </Text>

          <Text style={[styles.scoreFraction, { color: colors.primary }]}>
            {strongCount}/{totalCount}
          </Text>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>STRONG MOVES</Text>

          <Text style={[styles.tierTitle, { color: colors.textPrimary }]}>{tierLabel}</Text>

          <View style={styles.dotsRow}>
            {picks.map((p, i) => {
              const strong = isStrongPick(p);
              return (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: strong ? colors.sage : colors.surfaceElevated, borderColor: strong ? colors.sage : colors.surfaceBorder }
                  ]}
                >
                  {strong ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : <X size={12} color={colors.textMuted} strokeWidth={3} />}
                </View>
              );
            })}
          </View>
        </View>
      </ShareCardFrame>
    );
  }
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 8
  },
  storyTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8
  },
  scoreFraction: {
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1
  },
  scoreLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1
  },
  tierTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginTop: 6,
    marginBottom: 10
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: RADII.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

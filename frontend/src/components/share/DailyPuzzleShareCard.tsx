import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ViewShotRef } from 'react-native-view-shot';
import { Users, Flame } from 'lucide-react-native';
import { useTheme, RADII } from '../../context/ThemeContext';
import { ShareCardFrame } from './ShareCardFrame';

interface DailyPuzzleShareCardProps {
  date: string;
  /** The puzzle's short theme title (e.g. "Managing Weekend Pushback") — safe
   * to share since it's a category-level label, not the actual scenario
   * text or the user's response. */
  puzzleTitle: string;
  /** 'A' | 'B' | 'C' — which option the user picked. */
  pickedLetter: 'A' | 'B' | 'C';
  isOptimal: boolean;
  communityDistribution: { optionA: number; optionB: number; optionC: number };
  streak: number;
}

// Wordle-style: abstracted into letters/percentages, never the scenario text
// or the user's actual written response — spoiler-safe and content-free by
// construction, the same property that made Wordle's grid shareable. The
// puzzle title is the one addition that gives a stranger real context ("what
// kind of challenge is this?") without crossing that line.
export const DailyPuzzleShareCard = forwardRef<ViewShotRef, DailyPuzzleShareCardProps>(
  ({ date, puzzleTitle, pickedLetter, isOptimal, communityDistribution, streak }, ref) => {
    const { colors } = useTheme();
    const letters: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];
    const distMap = { A: communityDistribution.optionA, B: communityDistribution.optionB, C: communityDistribution.optionC };

    return (
      <ShareCardFrame ref={ref} eyebrow={`TODAY'S CHALLENGE — ${date}`}>
        <View style={styles.wrap}>
          <Text style={[styles.puzzleTitle, { color: colors.textPrimary }]} numberOfLines={2}>
            "{puzzleTitle}"
          </Text>
          <Text style={[styles.resultLabel, { color: isOptimal ? colors.sage : colors.flame }]}>
            {isOptimal ? 'Masterclass Choice' : 'Solid Attempt'}
          </Text>

          <View style={styles.lettersRow}>
            {letters.map((L) => {
              const picked = L === pickedLetter;
              return (
                <View
                  key={L}
                  style={[
                    styles.letterBox,
                    {
                      backgroundColor: picked ? colors.primary : colors.surfaceCard,
                      borderColor: picked ? colors.primary : colors.surfaceBorder
                    }
                  ]}
                >
                  <Text style={[styles.letterText, { color: picked ? '#FFFFFF' : colors.textSecondary }]}>{L}</Text>
                </View>
              );
            })}
          </View>

          <View style={[styles.communityBox, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
            <View style={styles.communityHeader}>
              <Users size={12} color={colors.textSecondary} />
              <Text style={[styles.communityLabel, { color: colors.textSecondary }]}>HOW OTHERS ANSWERED</Text>
            </View>
            {letters.map((L) => (
              <View key={L} style={styles.distRow}>
                <Text style={[styles.distLetter, { color: colors.textPrimary }]}>{L}</Text>
                <View style={[styles.distTrack, { backgroundColor: colors.surfaceElevated }]}>
                  <View
                    style={[
                      styles.distFill,
                      {
                        width: `${distMap[L]}%`,
                        backgroundColor: L === pickedLetter ? colors.primary : colors.surfaceBorder
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.distPct, { color: colors.textSecondary }]}>{distMap[L]}%</Text>
              </View>
            ))}
          </View>

          {streak > 0 && (
            <View style={styles.streakRow}>
              <Flame size={14} color={colors.flame} />
              <Text style={[styles.streakText, { color: colors.textPrimary }]}>{streak}-day streak</Text>
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
    gap: 16
  },
  puzzleTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22
  },
  resultLabel: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center'
  },
  lettersRow: {
    flexDirection: 'row',
    gap: 10
  },
  letterBox: {
    width: 44,
    height: 44,
    borderRadius: RADII.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  letterText: {
    fontSize: 18,
    fontWeight: '800'
  },
  communityBox: {
    width: '100%',
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 12,
    gap: 8
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2
  },
  communityLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  distLetter: {
    width: 12,
    fontSize: 11,
    fontWeight: '700'
  },
  distTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden'
  },
  distFill: {
    height: '100%',
    borderRadius: 3
  },
  distPct: {
    width: 28,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right'
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700'
  }
});

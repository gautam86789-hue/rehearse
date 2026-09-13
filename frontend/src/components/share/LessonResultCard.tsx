import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ViewShotRef } from 'react-native-view-shot';
import { Check, X } from 'lucide-react-native';
import { useTheme, RADII } from '../../context/ThemeContext';
import { ShareCardFrame } from './ShareCardFrame';

interface LessonResultCardProps {
  lessonTitle: string;
  tierLabel: string;
  correctCount: number;
  totalCount: number;
  correctness: boolean[];
}

// Same spoiler-safe, score-based pattern as StoryShareCard — the quiz
// questions and answers themselves are never shown, only the score, so a
// stranger sees "how well did they understand this" without spoiling the
// lesson's content.
export const LessonResultCard = forwardRef<ViewShotRef, LessonResultCardProps>(
  ({ lessonTitle, tierLabel, correctCount, totalCount, correctness }, ref) => {
    const { colors } = useTheme();

    return (
      <ShareCardFrame ref={ref} eyebrow="JOURNEY LESSON">
        <View style={styles.wrap}>
          <Text style={[styles.lessonTitle, { color: colors.textSecondary }]} numberOfLines={2}>
            "{lessonTitle}"
          </Text>

          <Text style={[styles.scoreFraction, { color: colors.primary }]}>
            {correctCount}/{totalCount}
          </Text>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>UNDERSTOOD</Text>

          <Text style={[styles.tierTitle, { color: colors.textPrimary }]}>{tierLabel}</Text>

          <View style={styles.dotsRow}>
            {correctness.map((correct, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: correct ? colors.sage : colors.surfaceElevated, borderColor: correct ? colors.sage : colors.surfaceBorder }
                ]}
              >
                {correct ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : <X size={12} color={colors.textMuted} strokeWidth={3} />}
              </View>
            ))}
          </View>
        </View>
      </ShareCardFrame>
    );
  }
);

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  lessonTitle: { fontSize: 13, fontWeight: '600', fontStyle: 'italic', textAlign: 'center', marginBottom: 8 },
  scoreFraction: { fontSize: 52, fontWeight: '800', letterSpacing: -1 },
  scoreLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1 },
  tierTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3, marginTop: 6, marginBottom: 10 },
  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 26, height: 26, borderRadius: RADII.pill, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' }
});

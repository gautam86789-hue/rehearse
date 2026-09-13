import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ViewShotRef } from 'react-native-view-shot';
import { useTheme } from '../../context/ThemeContext';
import { categoryColorFor } from '../../data/categoryColors';
import { ShareCardFrame } from './ShareCardFrame';

interface ScorecardShareCardProps {
  category: string;
  overallScore: number;
  clarity: number;
  empathy: number;
  assertiveness: number;
  listening: number;
}

const CATEGORY_LABEL: Record<string, string> = {
  negotiation: 'Negotiation',
  feedback: 'Feedback',
  boundaries: 'Boundaries',
  managing_up: 'Managing Up',
  difficult_decisions: 'Difficult Decisions',
  crisis: 'Crisis'
};

const SUB_SCORES = [
  { key: 'clarity', label: 'Clarity' },
  { key: 'empathy', label: 'Empathy' },
  { key: 'assertiveness', label: 'Assertiveness' },
  { key: 'listening', label: 'Listening' }
] as const;

function verdict(score: number): string {
  if (score >= 90) return 'Outstanding';
  if (score >= 75) return 'Strong showing';
  if (score >= 60) return 'Solid effort';
  return 'Keep practicing';
}

// Deliberately shows only the category + scores — never the scenario title,
// growth-area text, or the weakest-line rewrite. Those are tied to whatever
// real, possibly sensitive situation the user described (a real negotiation,
// a real layoff conversation), while the category alone ("Negotiation",
// "Difficult Decisions") is generic and safe to post publicly.
export const ScorecardShareCard = forwardRef<ViewShotRef, ScorecardShareCardProps>(
  ({ category, overallScore, clarity, empathy, assertiveness, listening }, ref) => {
    const { colors } = useTheme();
    const palette = colors.cardCategories[categoryColorFor(category)];
    const subScores = { clarity, empathy, assertiveness, listening };

    return (
      <ShareCardFrame ref={ref} eyebrow="REHEARSAL SCORECARD">
        <View style={styles.wrap}>
          <View style={[styles.categoryPill, { backgroundColor: palette.subtle }]}>
            <Text style={[styles.categoryText, { color: palette.solid }]}>
              {(CATEGORY_LABEL[category] || category).toUpperCase()}
            </Text>
          </View>

          <Text style={[styles.overallScore, { color: colors.textPrimary }]}>{overallScore}</Text>
          <Text style={[styles.verdict, { color: colors.textSecondary }]}>{verdict(overallScore)}</Text>

          <View style={styles.barsWrap}>
            {SUB_SCORES.map((s) => (
              <View key={s.key} style={styles.barRow}>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{s.label}</Text>
                <View style={[styles.barTrack, { backgroundColor: colors.surfaceElevated }]}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${subScores[s.key]}%`, backgroundColor: palette.solid }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
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
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 4
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  overallScore: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -1
  },
  verdict: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8
  },
  barsWrap: {
    width: '100%',
    gap: 10,
    marginTop: 6
  },
  barRow: {
    gap: 4
  },
  barLabel: {
    fontSize: 10.5,
    fontWeight: '600'
  },
  barTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: 4
  }
});

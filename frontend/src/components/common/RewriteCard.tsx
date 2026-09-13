import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles, ArrowRight, ShieldAlert } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { WeakestLineRewrite } from '../../types';

export const RewriteCard: React.FC<{ rewrite: WeakestLineRewrite }> = ({ rewrite }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceCard, borderColor: colors.champagneSubtle }]}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Sparkles size={16} color={colors.champagne} />
          <Text style={[styles.headerTitle, { color: colors.champagne }]}>REWRITE COACH</Text>
        </View>
        <View style={[styles.techniqueTag, { backgroundColor: colors.champagneSubtle }]}>
          <Text style={[styles.techniqueText, { color: colors.champagneDark }]}>{rewrite.techniqueApplied || 'Direct Assertion'}</Text>
        </View>
      </View>

      {/* Weak original line */}
      <View style={[styles.originalBlock, { backgroundColor: colors.rubySubtle, borderLeftColor: colors.error }]}>
        <View style={styles.blockLabelRow}>
          <ShieldAlert size={14} color={colors.error} />
          <Text style={[styles.originalLabel, { color: colors.error }]}>What You Said (Weak / Hedged)</Text>
        </View>
        <Text style={[styles.originalText, { color: colors.textSecondary }]}>"{rewrite.originalLine}"</Text>
      </View>

      {/* Suggested Masterclass Rewrite */}
      <View style={[styles.rewriteBlock, { backgroundColor: colors.sageSubtle, borderLeftColor: colors.sage }]}>
        <View style={styles.blockLabelRow}>
          <Sparkles size={14} color={colors.sageDark} />
          <Text style={[styles.rewriteLabel, { color: colors.sageDark }]}>Masterclass Rewrite</Text>
        </View>
        <Text style={[styles.rewriteText, { color: colors.textPrimary }]}>"{rewrite.suggestedRewrite}"</Text>
      </View>

      {/* Rationale */}
      <View style={[styles.rationaleBlock, { backgroundColor: colors.surfaceHighlight }]}>
        <Text style={[styles.rationaleLabel, { color: colors.textSecondary }]}>Why this is more persuasive:</Text>
        <Text style={[styles.rationaleText, { color: colors.textSecondary }]}>{rewrite.coachingRationale}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginVertical: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1
  },
  techniqueTag: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  techniqueText: {
    fontSize: 11,
    fontWeight: '700'
  },
  originalBlock: {
    borderLeftWidth: 3,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10
  },
  blockLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  originalLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  originalText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18
  },
  rewriteBlock: {
    borderLeftWidth: 3,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12
  },
  rewriteLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  rewriteText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20
  },
  rationaleBlock: {
    padding: 10,
    borderRadius: 10
  },
  rationaleLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2
  },
  rationaleText: {
    fontSize: 12,
    lineHeight: 16
  }
});

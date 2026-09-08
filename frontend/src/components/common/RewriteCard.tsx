import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles, ArrowRight, ShieldAlert } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { WeakestLineRewrite } from '../../types';

export const RewriteCard: React.FC<{ rewrite: WeakestLineRewrite }> = ({ rewrite }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Sparkles size={16} color={colors.gold} />
          <Text style={styles.headerTitle}>EXECUTIVE REWRITE COACH</Text>
        </View>
        <View style={styles.techniqueTag}>
          <Text style={styles.techniqueText}>{rewrite.techniqueApplied || 'Direct Assertion'}</Text>
        </View>
      </View>

      {/* Weak original line */}
      <View style={styles.originalBlock}>
        <View style={styles.blockLabelRow}>
          <ShieldAlert size={14} color={colors.error} />
          <Text style={styles.originalLabel}>What You Said (Weak / Hedged)</Text>
        </View>
        <Text style={styles.originalText}>"{rewrite.originalLine}"</Text>
      </View>

      {/* Suggested Masterclass Rewrite */}
      <View style={styles.rewriteBlock}>
        <View style={styles.blockLabelRow}>
          <Sparkles size={14} color={colors.forestLight} />
          <Text style={styles.rewriteLabel}>Executive Masterclass Rewrite</Text>
        </View>
        <Text style={styles.rewriteText}>"{rewrite.suggestedRewrite}"</Text>
      </View>

      {/* Rationale */}
      <View style={styles.rationaleBlock}>
        <Text style={styles.rationaleLabel}>Why this is 10x more persuasive:</Text>
        <Text style={styles.rationaleText}>{rewrite.coachingRationale}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
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
    color: colors.gold,
    letterSpacing: 1
  },
  techniqueTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  techniqueText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold
  },
  originalBlock: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    padding: 10,
    borderRadius: 6,
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
    color: colors.error,
    textTransform: 'uppercase'
  },
  originalText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18
  },
  rewriteBlock: {
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: colors.forest,
    padding: 10,
    borderRadius: 6,
    marginBottom: 12
  },
  rewriteLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.forestLight,
    textTransform: 'uppercase'
  },
  rewriteText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20
  },
  rationaleBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    borderRadius: 6
  },
  rationaleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 2
  },
  rationaleText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16
  }
});

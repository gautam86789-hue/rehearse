import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface ScoreMeterProps {
  label: string;
  score: number;
  description?: string;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  label,
  score,
  description
}) => {
  const getBarColor = (val: number) => {
    if (val >= 85) return colors.forest;
    if (val >= 70) return colors.primary;
    if (val >= 50) return colors.warning;
    return colors.error;
  };

  const getScoreBadgeText = (val: number) => {
    if (val >= 90) return 'Masterclass';
    if (val >= 80) return 'Proficient';
    if (val >= 65) return 'Developing';
    return 'Needs Focus';
  };

  const barColor = getBarColor(score);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.scoreGroup}>
          <Text style={[styles.badge, { color: barColor }]}>{getScoreBadgeText(score)}</Text>
          <Text style={styles.scoreText}>{score}<Text style={styles.scoreMax}>/100</Text></Text>
        </View>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(100, Math.max(0, score))}%`, backgroundColor: barColor }
          ]}
        />
      </View>

      {description && <Text style={styles.descText}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary
  },
  scoreGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  scoreMax: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '400'
  },
  track: {
    height: 8,
    backgroundColor: colors.surfaceBorder,
    borderRadius: 4,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 4
  },
  descText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
  }
});

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreMeterProps {
  label: string;
  score: number;
  description?: string;
  barColor?: string;
  showBadge?: boolean;
  /** Stagger start (ms) — lets a group of meters fill in sequence rather
   * than all snapping to their final width at once. */
  delay?: number;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  label,
  score,
  description,
  barColor: barColorProp,
  showBadge = true,
  delay = 0
}) => {
  const { colors } = useTheme();
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fillAnim.setValue(0);
    Animated.timing(fillAnim, {
      toValue: Math.min(100, Math.max(0, score)),
      duration: 700,
      delay,
      useNativeDriver: false
    }).start();
  }, [score, delay]);

  const getBarColor = (val: number) => {
    if (val >= 85) return colors.success;
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

  const barColor = barColorProp || getBarColor(score);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
        <View style={styles.scoreGroup}>
          {showBadge && <Text style={[styles.badge, { color: barColor }]}>{getScoreBadgeText(score)}</Text>}
          <Text style={[styles.scoreText, { color: colors.textPrimary }]}>
            {score}
            <Text style={[styles.scoreMax, { color: colors.textSecondary }]}>/100</Text>
          </Text>
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: colors.surfaceBorder }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: fillAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
              backgroundColor: barColor
            }
          ]}
        />
      </View>

      {description && (
        <Text style={[styles.descText, { color: colors.textSecondary }]}>{description}</Text>
      )}
    </View>
  );
};

interface CircularScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export const CircularScoreRing: React.FC<CircularScoreRingProps> = ({
  score,
  size = 168,
  strokeWidth = 14,
  label = 'Good job!',
  color
}) => {
  const { colors } = useTheme();
  const clamped = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (circumference * clamped) / 100;

  const ringColor = color || (clamped >= 85 ? colors.success : clamped >= 60 ? colors.primary : colors.warning);

  // The score reveal is the single highest-stakes emotional beat in the app
  // — the payoff for the rehearsal the user just did — so it earns a real
  // reveal instead of snapping straight to its final state: the ring fills
  // from empty and the number counts up in step with it.
  const progress = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    progress.setValue(0);
    const listener = progress.addListener(({ value }) => {
      setDisplayScore(Math.round(value * clamped));
    });
    Animated.timing(progress, {
      toValue: 1,
      duration: 1100,
      useNativeDriver: false
    }).start();
    return () => progress.removeListener(listener);
  }, [clamped]);

  const animatedDashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, targetOffset]
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.surfaceBorder}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={animatedDashOffset}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.ringCenter]}>
          <Text style={[styles.ringScore, { color: colors.textPrimary }]}>{displayScore}</Text>
          <Text style={[styles.ringMax, { color: colors.textSecondary }]}>/100</Text>
        </View>
      </View>
      {label ? (
        <Text style={[styles.ringLabel, { color: colors.textPrimary }]}>{label}</Text>
      ) : null}
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
    fontWeight: '600'
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
    fontWeight: '800'
  },
  scoreMax: {
    fontSize: 11,
    fontWeight: '400'
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 4
  },
  descText: {
    fontSize: 12,
    marginTop: 4
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  ringScore: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1
  },
  ringMax: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: -2
  },
  ringLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14
  }
});

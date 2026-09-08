import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated, View, Text, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

interface CalibrationStatusProps {
  phaseIndex: number;
  reducedMotion?: boolean;
}

const SEQUENCES = [
  {
    phase: 'PHASE 01 / 04',
    subtext: 'ACOUSTIC FIELD',
    status: 'Understanding your situation...',
    progressVal: 0.26
  },
  {
    phase: 'PHASE 02 / 04',
    subtext: 'COGNITIVE MAPPING',
    status: 'Mapping response patterns...',
    progressVal: 0.54
  },
  {
    phase: 'PHASE 03 / 04',
    subtext: 'CALIBRATING PERSONA',
    status: 'Preparing your counterpart...',
    progressVal: 0.78
  },
  {
    phase: 'READY',
    subtext: 'SYNTHESIS COMPLETE',
    status: 'Rehearsal ready.',
    progressVal: 1.0
  }
];

export const CalibrationStatus: React.FC<CalibrationStatusProps> = ({
  phaseIndex,
  reducedMotion = false
}) => {
  const { colors, accentColor, isDark } = useTheme();
  const currentItem = SEQUENCES[Math.min(phaseIndex, SEQUENCES.length - 1)];
  const [displayText, setDisplayText] = useState(currentItem.status);
  const textOpacity = useRef(new Animated.Value(1)).current;
  const textTranslateY = useRef(new Animated.Value(0)).current;
  const lineWidthAnim = useRef(new Animated.Value(0.26)).current;

  useEffect(() => {
    if (reducedMotion) {
      setDisplayText(currentItem.status);
      lineWidthAnim.setValue(currentItem.progressVal);
      return;
    }

    // 1. Synchronized line progress animation to exact phase percentage
    Animated.timing(lineWidthAnim, {
      toValue: currentItem.progressVal,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();

    // 2. Smooth vertical text crossfade
    Animated.sequence([
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(textTranslateY, {
          toValue: 4,
          duration: 150,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true
        })
      ]),
      Animated.timing(textTranslateY, {
        toValue: -4,
        duration: 0,
        useNativeDriver: true
      }),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        })
      ])
    ]).start();

    setDisplayText(currentItem.status);
  }, [phaseIndex, reducedMotion]);

  const progressBarWidth = lineWidthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      {/* 1. Phase Indicator Micro-Text */}
      <View style={styles.phaseIndicator}>
        <Text style={[styles.phaseTextGold, { color: accentColor }]}>{currentItem.phase}</Text>
        <Text style={[styles.dotSeparator, { color: colors.textMuted }]}>•</Text>
        <Text style={[styles.phaseTextSage, { color: colors.textSecondary }]}>{currentItem.subtext}</Text>
      </View>

      {/* 2. Ultra-Thin 1px Progress Line */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.progressBar,
            { width: progressBarWidth, shadowColor: accentColor }
          ]}
        >
          <LinearGradient
            colors={[colors.primarySubtle ? '#8F997F' : accentColor, accentColor, colors.textPrimary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {/* 3. Dynamic Single-Line Psychological Calibration Message */}
      <View style={styles.statusBox}>
        <Animated.Text
          style={[
            styles.statusMessage,
            {
              color: colors.textPrimary,
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }]
            }
          ]}
        >
          {displayText}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center'
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10
  },
  phaseTextGold: {
    ...typography.overline,
    letterSpacing: 2
  },
  dotSeparator: {
    fontSize: 9.5
  },
  phaseTextSage: {
    ...typography.overline,
    letterSpacing: 2
  },
  progressTrack: {
    width: '100%',
    height: 1,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 14
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    height: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8
  },
  statusBox: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusMessage: {
    ...typography.body,
    fontSize: 13,
    textAlign: 'center'
  }
});

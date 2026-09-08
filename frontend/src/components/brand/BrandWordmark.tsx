import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View, Text, Platform, Easing } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

interface BrandWordmarkProps {
  progress?: Animated.Value;
  reducedMotion?: boolean;
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  progress,
  reducedMotion = false
}) => {
  const { colors, accentColor, isDark } = useTheme();
  const dotGlow = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (reducedMotion) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotGlow, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(dotGlow, {
          toValue: 0.5,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [reducedMotion]);

  return (
    <View style={styles.container}>
      {/* 3. BRANDING & EDITORIAL TYPOGRAPHY */}
      <View style={styles.wordmarkRow}>
        <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>REHEARSE</Text>
        <Animated.Text style={[styles.periodDot, { color: accentColor, opacity: dotGlow }]}>
          .
        </Animated.Text>
      </View>

      {/* Subtitle Tagline */}
      <Text style={[styles.taglineText, { color: colors.textSecondary }]}>
        AI DIFFICULT CONVERSATION SIMULATOR
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 24
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center'
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: Platform.OS === 'ios' ? 7.2 : 6,
    includeFontPadding: false
  },
  periodDot: {
    fontSize: 28,
    fontWeight: '800',
    marginLeft: 1
  },
  taglineText: {
    ...typography.overline,
    letterSpacing: 2.4,
    marginTop: 8,
    textAlign: 'center'
  }
});

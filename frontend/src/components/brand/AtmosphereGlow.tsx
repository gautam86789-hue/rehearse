import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface AtmosphereGlowProps {
  intensity?: number;
  reducedMotion?: boolean;
  showCenterOrb?: boolean;
}

export const AtmosphereGlow: React.FC<AtmosphereGlowProps> = ({
  intensity = 1,
  reducedMotion = false,
  showCenterOrb = false
}) => {
  const { colors, accentColor, isDark } = useTheme();
  const breatheAnim = useRef(new Animated.Value(0.42)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const innerAuraAnim = useRef(new Animated.Value(0.18)).current;

  useEffect(() => {
    if (!showCenterOrb || reducedMotion) {
      breatheAnim.setValue(0.55 * intensity);
      scaleAnim.setValue(1);
      return;
    }

    // Atmospheric Breathe Loop (6.8s cycle)
    const atmosphericLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(breatheAnim, {
            toValue: 0.68 * intensity,
            duration: 3400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.18,
            duration: 3400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(innerAuraAnim, {
            toValue: 0.28 * intensity,
            duration: 3400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ]),
        Animated.parallel([
          Animated.timing(breatheAnim, {
            toValue: 0.42 * intensity,
            duration: 3400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 3400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(innerAuraAnim, {
            toValue: 0.18 * intensity,
            duration: 3400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ])
      ])
    );

    atmosphericLoop.start();

    return () => {
      atmosphericLoop.stop();
    };
  }, [intensity, reducedMotion, showCenterOrb]);

  const gradientColors = isDark
    ? (['#1E1E32', '#161625', '#12121F'] as const)
    : (['#EEEDFB', '#F2F1FC', '#F7F7FC'] as const);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 1. Deep Forest / Porcelain Vignette Foundation */}
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Optional Center Ambient Orb */}
      {showCenterOrb && (
        <View style={styles.centerContainer}>
          <Animated.View
            style={[
              styles.ambientCore,
              {
                opacity: breatheAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={[
                accentColor + '38',
                colors.primarySubtle || 'rgba(91, 95, 239, 0.12)',
                isDark ? 'rgba(24, 24, 40, 0.6)' : 'rgba(236, 235, 247, 0.6)',
                'transparent'
              ]}
              locations={[0, 0.4, 0.7, 0.85]}
              style={styles.circleGradient}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.heartAura,
              {
                opacity: innerAuraAnim
              }
            ]}
          >
            <LinearGradient
              colors={[accentColor + '40', 'transparent']}
              style={styles.circleGradient}
            />
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  ambientCore: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    justifyContent: 'center',
    alignItems: 'center'
  },
  heartAura: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 9999
  }
});

import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View, Dimensions, Easing } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

interface PersonaWaveformSignalProps {
  progress: Animated.Value; // 0 -> 1 during Frame 3 & 4
  reducedMotion?: boolean;
}

const { width } = Dimensions.get('window');
const WAVE_WIDTH = Math.min(width * 0.75, 280);

export const PersonaWaveformSignal: React.FC<PersonaWaveformSignalProps> = ({
  progress,
  reducedMotion = false
}) => {
  const waveFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) return;

    const waveAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(waveFloat, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(waveFloat, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );

    waveAnim.start();

    return () => {
      waveAnim.stop();
    };
  }, [reducedMotion]);

  // Interpolations
  const opacity = progress.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 0.75, 0.75, 0] // Fades in during AI calibration, dissolves into Brand Reveal
  });

  const scale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.88, 1, 1.1]
  });

  const translateY = waveFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [-3, 3]
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ scale }, { translateY }]
        }
      ]}
      pointerEvents="none"
    >
      <Svg width={WAVE_WIDTH} height={70} viewBox="0 0 280 70" fill="none">
        <Defs>
          <SvgLinearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#5B5FEF" stopOpacity="0" />
            <Stop offset="30%" stopColor="#8B8FF5" stopOpacity="0.45" />
            <Stop offset="50%" stopColor="#C4B5FD" stopOpacity="0.85" />
            <Stop offset="70%" stopColor="#818CF8" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </SvgLinearGradient>

          <SvgLinearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#8B8FF5" stopOpacity="0" />
            <Stop offset="50%" stopColor="#A78BFA" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#4245C4" stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>

        {/* Primary Conversational Inflection Harmonic (Human Speech Wave) */}
        <Path
          d="M0 35 Q35 15, 70 35 T140 35 T210 35 T280 35"
          stroke="url(#waveGrad1)"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />

        {/* Secondary Resonance Counterpart Curve (Subtle Counterpart Persona Silhouette) */}
        <Path
          d="M20 35 Q70 50, 120 28 T200 42 T260 35"
          stroke="url(#waveGrad2)"
          strokeWidth="1.2"
          strokeDasharray="3,3"
          fill="none"
        />

        {/* Counterpart abstract presence nodes */}
        <Path
          d="M130 18 Q140 10, 150 18 T140 28 Z"
          fill="rgba(139, 143, 245, 0.15)"
        />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -WAVE_WIDTH / 2,
    marginTop: -35,
    width: WAVE_WIDTH,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  }
});

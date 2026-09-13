import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View, Easing } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface ConversationSignalProps {
  progress?: Animated.Value;
  reducedMotion?: boolean;
}

export const ConversationSignal: React.FC<ConversationSignalProps> = ({
  progress,
  reducedMotion = false
}) => {
  const { colors, accentColor, isDark } = useTheme();

  // Orbit Rotations
  const orbit1Anim = useRef(new Animated.Value(0)).current;
  const orbit2Anim = useRef(new Animated.Value(0)).current;
  const orbit3Anim = useRef(new Animated.Value(0)).current;

  // Concentric Aura Breathe & Scale
  const auraBreathe = useRef(new Animated.Value(0.55)).current;
  const auraScale = useRef(new Animated.Value(1)).current;

  // Audio Wave Bar Heights (4 bars)
  const bar1 = useRef(new Animated.Value(8)).current;
  const bar2 = useRef(new Animated.Value(14)).current;
  const bar3 = useRef(new Animated.Value(18)).current;
  const bar4 = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (reducedMotion) return;

    // 1. Concentric Aura Breathe Animation
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(auraBreathe, {
            toValue: 0.85,
            duration: 3200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(auraScale, {
            toValue: 1.08,
            duration: 3200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ]),
        Animated.parallel([
          Animated.timing(auraBreathe, {
            toValue: 0.55,
            duration: 3200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(auraScale, {
            toValue: 1,
            duration: 3200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ])
      ])
    );
    auraLoop.start();

    // 2. Celestial Orbit Rotations (Clockwise & Counter-Clockwise)
    const orbit1 = Animated.loop(
      Animated.timing(orbit1Anim, {
        toValue: 1,
        duration: 26000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );

    const orbit2 = Animated.loop(
      Animated.timing(orbit2Anim, {
        toValue: 1,
        duration: 34000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );

    const orbit3 = Animated.loop(
      Animated.timing(orbit3Anim, {
        toValue: 1,
        duration: 48000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );

    orbit1.start();
    orbit2.start();
    orbit3.start();

    // 3. Audio Bar Gentle Oscillations
    const createBarLoop = (anim: Animated.Value, minH: number, maxH: number, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: maxH,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false
          }),
          Animated.timing(anim, {
            toValue: minH,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false
          })
        ])
      );
    };

    const b1Loop = createBarLoop(bar1, 7, 16, 700);
    const b2Loop = createBarLoop(bar2, 10, 22, 600);
    const b3Loop = createBarLoop(bar3, 9, 20, 850);
    const b4Loop = createBarLoop(bar4, 6, 14, 750);

    b1Loop.start();
    b2Loop.start();
    b3Loop.start();
    b4Loop.start();

    return () => {
      auraLoop.stop();
      orbit1.stop();
      orbit2.stop();
      orbit3.stop();
      b1Loop.stop();
      b2Loop.stop();
      b3Loop.stop();
      b4Loop.stop();
    };
  }, [reducedMotion]);

  const spin1 = orbit1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const spin2 = orbit2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'] // counter-clockwise
  });

  const spin3 = orbit3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const auraColors = isDark
    ? (['rgba(91, 95, 239, 0.26)', 'rgba(139, 143, 245, 0.18)', 'rgba(18, 18, 31, 0.65)', 'transparent'] as const)
    : ([accentColor + '20', 'rgba(91, 95, 239, 0.12)', 'rgba(236, 235, 247, 0.45)', 'transparent'] as const);

  return (
    <View style={styles.orbitalContainer}>
      {/* 0. Perfectly Concentric Atmospheric Radial Halo Behind All Rings */}
      <Animated.View
        style={[
          styles.concentricAura,
          {
            opacity: auraBreathe,
            transform: [{ scale: auraScale }]
          }
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={auraColors}
          locations={[0, 0.38, 0.68, 0.95]}
          style={styles.circleGradient}
        />
      </Animated.View>

      {/* 1. Outer Solid Ultra-Hairline Ring (256x256) */}
      <Animated.View
        style={[
          styles.orbitRingOuter,
          { transform: [{ rotate: spin1 }] }
        ]}
      >
        <Svg width={256} height={256} viewBox="0 0 256 256">
          <Circle
            cx={128}
            cy={128}
            r={126}
            stroke={isDark ? 'rgba(139, 143, 245, 0.25)' : 'rgba(91, 95, 239, 0.3)'}
            strokeWidth={1}
            fill="none"
          />
          {/* Top Node (r=126, theta=-90°) -> (128, 2) */}
          <Circle
            cx={128}
            cy={2}
            r={3}
            fill={colors.textPrimary}
          />
          {/* Bottom-Right Node (r=126, theta=45°) -> (217.1, 217.1) */}
          <Circle
            cx={217.1}
            cy={217.1}
            r={2.5}
            fill={accentColor}
          />
        </Svg>
      </Animated.View>

      {/* 2. Mid Subtle Dashed Ring (216x216) with Counter-Rotation */}
      <Animated.View
        style={[
          styles.orbitRingMid,
          { transform: [{ rotate: spin2 }] }
        ]}
      >
        <Svg width={216} height={216} viewBox="0 0 216 216">
          <Circle
            cx={108}
            cy={108}
            r={106}
            stroke={isDark ? 'rgba(139, 143, 245, 0.3)' : 'rgba(91, 95, 239, 0.35)'}
            strokeWidth={1}
            strokeDasharray="3 4"
            fill="none"
          />
          {/* Left Node (r=106, theta=180°) -> (2, 108) */}
          <Circle
            cx={2}
            cy={108}
            r={3}
            fill={accentColor}
          />
          {/* Top-Right Node (r=106, theta=-45°) -> (182.95, 33.05) */}
          <Circle
            cx={182.95}
            cy={33.05}
            r={2}
            fill={colors.textPrimary}
          />
        </Svg>
      </Animated.View>

      {/* 3. Inner Delicate Ring (168x168) */}
      <Animated.View
        style={[
          styles.orbitRingInner,
          { transform: [{ rotate: spin3 }] }
        ]}
      >
        <Svg width={168} height={168} viewBox="0 0 168 168">
          <Circle
            cx={84}
            cy={84}
            r={82}
            stroke={isDark ? 'rgba(196, 181, 253, 0.28)' : 'rgba(139, 143, 245, 0.36)'}
            strokeWidth={1}
            fill="none"
          />
          {/* Inner Bottom-Left Node (r=82, theta=135°) -> (26.02, 141.98) */}
          <Circle
            cx={26.02}
            cy={141.98}
            r={2.5}
            fill={accentColor}
          />
        </Svg>
      </Animated.View>

      {/* 4. Center Vessel with Official Rehearse Acoustic Loop Logo */}
      <View
        style={[
          styles.frostedSquircle,
          {
            backgroundColor: accentColor,
            borderColor: isDark ? 'rgba(196, 181, 253, 0.35)' : 'rgba(66, 69, 196, 0.25)',
            shadowColor: isDark ? '#000000' : 'rgba(91, 95, 239, 0.3)'
          }
        ]}
      >
        {/* Micro-brackets */}
        <View style={[styles.cornerBracketTopRight, { borderColor: accentColor + '99' }]} />
        <View style={[styles.cornerBracketBottomLeft, { borderColor: accentColor + '99' }]} />

        {/* Acoustic Loop Vector Track & Anchor Node */}
        <Svg width={80} height={80} viewBox="0 0 160 160" fill="none">
          {/* Ivory Rehearsal Loop Track */}
          <Path
            d="M46 80C46 61.2223 61.2223 46 80 46C98.7777 46 114 61.2223 114 80C114 98.7777 98.7777 114 80 114H50"
            stroke="#F9FAF8"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Endpoint Calibration Anchor Node */}
          <Circle
            cx={50}
            cy={114}
            r={5.5}
            fill="#F59E0B"
          />
        </Svg>

        {/* 3 Animated Amber Resonance Bars */}
        <View style={styles.waveformContainer}>
          <Animated.View style={[styles.audioBar, { height: bar1, backgroundColor: '#F59E0B' }]} />
          <Animated.View style={[styles.audioBar, { height: bar2, backgroundColor: '#F59E0B' }]} />
          <Animated.View style={[styles.audioBar, { height: bar3, backgroundColor: '#F59E0B' }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  orbitalContainer: {
    width: 256,
    height: 256,
    justifyContent: 'center',
    alignItems: 'center'
  },
  concentricAura: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 9999
  },
  orbitRingOuter: {
    position: 'absolute',
    width: 256,
    height: 256,
    justifyContent: 'center',
    alignItems: 'center'
  },
  orbitRingMid: {
    position: 'absolute',
    width: 216,
    height: 216,
    justifyContent: 'center',
    alignItems: 'center'
  },
  orbitRingInner: {
    position: 'absolute',
    width: 168,
    height: 168,
    justifyContent: 'center',
    alignItems: 'center'
  },
  frostedSquircle: {
    width: 96,
    height: 96,
    borderRadius: 26,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.9,
    shadowRadius: 40,
    elevation: 0
  },
  cornerBracketTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderTopWidth: 1,
    borderRightWidth: 1
  },
  cornerBracketBottomLeft: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 6,
    height: 6,
    borderBottomWidth: 1,
    borderLeftWidth: 1
  },
  waveformContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    height: 32
  },
  audioBar: {
    width: 3.2,
    borderRadius: 2
  }
});

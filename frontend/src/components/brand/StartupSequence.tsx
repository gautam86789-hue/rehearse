import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Animated,
  View,
  TouchableOpacity,
  AccessibilityInfo,
  Platform,
  useWindowDimensions,
  Easing
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereGlow } from './AtmosphereGlow';
import { ConversationSignal } from './ConversationSignal';
import { BrandWordmark } from './BrandWordmark';
import { CalibrationStatus } from './CalibrationStatus';
import { useTheme } from '../../context/ThemeContext';

interface StartupSequenceProps {
  onFinish: () => void;
  minDuration?: number; // default: 4600ms
}

export const StartupSequence: React.FC<StartupSequenceProps> = ({
  onFinish,
  minDuration = 4800
}) => {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors, accentColor, isDark } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);

  const containerOpacity = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;

  // Phase index: 0 = Acoustic Field, 1 = Cognitive Mapping, 2 = Calibrating Persona, 3 = Synthesis Complete
  const [phaseIndex, setPhaseIndex] = useState(0);
  const isExiting = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => setReducedMotion(enabled))
      .catch(() => {});

    if (reducedMotion) {
      setPhaseIndex(3);
      const t = setTimeout(() => handleFinish(), 1200);
      return () => clearTimeout(t);
    }

    // Step-by-step synchronized phase timeline
    const t1 = setTimeout(() => setPhaseIndex(1), 1100);
    const t2 = setTimeout(() => setPhaseIndex(2), 2300);
    const t3 = setTimeout(() => setPhaseIndex(3), 3500);
    const t4 = setTimeout(() => handleFinish(), minDuration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [reducedMotion, minDuration]);

  const handleFinish = () => {
    if (isExiting.current) return;
    isExiting.current = true;

    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 450,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(containerScale, {
        toValue: 1.04,
        duration: 450,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true
      })
    ]).start(() => {
      onFinish();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          opacity: containerOpacity,
          transform: [{ scale: containerScale }]
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleFinish}
        style={[styles.touchableArea, { backgroundColor: colors.background }]}
      >
        {/* 1. Deep Forest & Vignette Atmosphere */}
        <AtmosphereGlow reducedMotion={reducedMotion} />

        {/* 2. Mobile Center Stage */}
        <View
          style={[
            styles.mobileCanvas,
            {
              paddingTop: Math.max(insets.top, 24) + (height > 750 ? 20 : 10),
              paddingBottom: Math.max(insets.bottom, 24) + 8
            }
          ]}
        >
          {/* Top buffer */}
          <View style={styles.topBuffer} />

          {/* 3. Hero Orbital System & Brand Stack */}
          <View style={styles.heroSection}>
            <ConversationSignal reducedMotion={reducedMotion} />
            <BrandWordmark reducedMotion={reducedMotion} />
            <CalibrationStatus
              phaseIndex={phaseIndex}
              reducedMotion={reducedMotion}
            />
          </View>

          {/* 4. Bottom Ambient Polish */}
          <View style={styles.bottomPolish}>
            <View style={[styles.bottomNodeDot, { backgroundColor: accentColor }]} />
            <View style={[styles.homeBar, { backgroundColor: isDark ? 'rgba(243, 239, 229, 0.2)' : 'rgba(15, 23, 19, 0.2)' }]} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    overflow: 'hidden'
  },
  touchableArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  },
  mobileCanvas: {
    flex: 1,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden'
  },
  topBuffer: {
    height: 10
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  bottomPolish: {
    alignItems: 'center',
    width: '100%'
  },
  bottomNodeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
    opacity: 0.6
  },
  homeBar: {
    width: 128,
    height: 3.5,
    borderRadius: 2,
    marginBottom: 2
  }
});

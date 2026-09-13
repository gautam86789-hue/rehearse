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
import { useTheme } from '../../context/ThemeContext';

interface StartupSequenceProps {
  onFinish: () => void;
  minDuration?: number; // default: 1100ms — a brief brand flash, not a loading narrative
}

// A quick, clean brand reveal: logo + wordmark, then a pure crossfade into
// whatever screen sits underneath (Welcome for new users, Home for returning
// ones). No fake multi-phase "AI calibration" progress narrative — that read
// as a stuck loading screen on every single app open.
export const StartupSequence: React.FC<StartupSequenceProps> = ({
  onFinish,
  minDuration = 1100
}) => {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);

  const containerOpacity = useRef(new Animated.Value(1)).current;
  const isExiting = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => setReducedMotion(enabled))
      .catch(() => {});

    const t = setTimeout(() => handleFinish(), reducedMotion ? 300 : minDuration);
    return () => clearTimeout(t);
  }, [reducedMotion, minDuration]);

  const handleFinish = () => {
    if (isExiting.current) return;
    isExiting.current = true;

    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true
    }).start(() => {
      onFinish();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          opacity: containerOpacity
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

          {/* 3. Hero Orbital System & Brand Stack — logo + name, nothing else */}
          <View style={styles.heroSection}>
            <ConversationSignal reducedMotion={reducedMotion} />
            <BrandWordmark reducedMotion={reducedMotion} />
          </View>

          {/* 4. Bottom Ambient Polish */}
          <View style={styles.bottomPolish} />
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

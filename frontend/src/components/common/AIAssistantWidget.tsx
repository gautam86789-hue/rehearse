import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Ellipse, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { navigationRef } from '../../navigation/navigationRef';
import { useFabClearanceValue } from '../../context/FabClearanceContext';

// A distinct mark for the Coach instead of a generic sparkle icon — two
// rings rotating independently around a solid core, evoking "thinking"
// rather than decoration. Pure SVG + Animated, no image asset.
const OrbitalMark: React.FC<{ size: number }> = ({ size }) => {
  const spinA = useRef(new Animated.Value(0)).current;
  const spinB = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loopA = Animated.loop(Animated.timing(spinA, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true }));
    const loopB = Animated.loop(Animated.timing(spinB, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: true }));
    loopA.start();
    loopB.start();
    return () => {
      loopA.stop();
      loopB.stop();
    };
  }, []);
  const rotateA = spinA.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateB = spinB.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const c = size / 2;
  return (
    <Animated.View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotateA }] }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Ellipse cx={c} cy={c} rx={size * 0.38} ry={size * 0.17} stroke="#FFFFFF" strokeWidth={size * 0.055} fill="none" opacity={0.95} />
        </Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotateB }] }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Ellipse cx={c} cy={c} rx={size * 0.17} ry={size * 0.38} stroke="rgba(255,255,255,0.7)" strokeWidth={size * 0.055} fill="none" opacity={0.85} />
        </Svg>
      </Animated.View>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={c} cy={c} r={size * 0.12} fill="#FFFFFF" />
      </Svg>
    </Animated.View>
  );
};

// Just the floating button — tapping it pushes the real AICoachScreen.
// This used to also render the chat sheet itself as a Modal/overlay, but
// that never got Android's keyboard resize no matter which of four
// different approaches it tried (see AICoachScreen's comment for the full
// list) — a real navigator screen doesn't have that problem at all.
const TAB_ROUTES = ['HomeTab', 'PracticeTab', 'ProgressTab', 'ProfileTab', 'HomeTabs'];

export const AIAssistantWidget: React.FC<{ activeRouteName?: string }> = ({ activeRouteName }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const screenClearance = useFabClearanceValue();

  // The floating assistant button is a companion launcher designed for the
  // main tabs interface (Home, Practice, Progress, Profile). On stack screens
  // (Roleplay, AICoach, Settings, Score, etc.), full-screen forms, switches,
  // chat docks, and navigation controls occupy the bottom area — showing the
  // FAB there obscures actionable buttons. Restricting it to HomeTabs keeps
  // sub-screens completely clear.
  const isTabsRoot = activeRouteName
    ? TAB_ROUTES.includes(activeRouteName)
    : (() => {
        if (!navigationRef.isReady()) return true;
        const currentName = (navigationRef.getCurrentRoute() as any)?.name;
        return !currentName || TAB_ROUTES.includes(currentName);
      })();

  if (!isTabsRoot) return null;

  // Sits comfortably above the floating tab bar pill (pill top is ~76-80px).
  // Math.max(insets.bottom, 16) + 84 gives ~100px clearance, ensuring the
  // FAB never touches or occludes the Profile tab icon.
  const fabBottom = Math.max(insets.bottom, 16) + 84 + screenClearance;

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: colors.primary, bottom: fabBottom }]}
      onPress={() => {
        if (navigationRef.isReady()) navigationRef.navigate('AICoach' as never);
      }}
      activeOpacity={0.85}
    >
      <OrbitalMark size={26} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 0,
    zIndex: 500
  }
});

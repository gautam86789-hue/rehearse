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
export const AIAssistantWidget: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // The floating tab bar only exists while the root stack's active route is
  // 'HomeTabs' — every other screen (Roleplay, ScenarioDetail, Score,
  // Settings, etc.) is a plain stack push with no tab bar at all, so
  // clearing space for a tab bar that isn't there just left the FAB
  // floating with a dead gap below it and covering more of the screen than
  // it needed to. Tucking it flush to the true bottom-right on those
  // screens keeps it out of the way of whatever content/buttons are
  // actually down there.
  const [onTabsRoot, setOnTabsRoot] = useState(true);
  // Hidden entirely on its own destination screen — tapping "open the
  // coach" while already looking at the coach is meaningless, and it was
  // rendering on top of that screen's own send button (reported directly:
  // the FAB sat right over it).
  const [onCoachScreen, setOnCoachScreen] = useState(false);
  useEffect(() => {
    const computeRoute = () => {
      const state = navigationRef.isReady() ? navigationRef.getRootState() : undefined;
      const routeName = state?.routes[state.index]?.name;
      setOnTabsRoot(!state || routeName === 'HomeTabs');
      setOnCoachScreen(routeName === 'AICoach');
    };
    computeRoute();
    return navigationRef.addListener('state', computeRoute);
  }, []);
  // Any screen with its own fixed bottom UI (a chat input dock, a sticky
  // CTA, or on a tabs-root screen, content that rests where the FAB floats
  // even without one) claims clearance via useFabClearance — see
  // FabClearanceContext. That's what keeps this generic across the whole
  // app instead of this widget needing to know every route name that
  // happens to have one.
  const screenClearance = useFabClearanceValue();
  // 68 is the original hand-tuned clearance for sitting just above the
  // floating tab bar. Additive with screenClearance rather than either/or —
  // a tabs-root screen (Home/Practice/Progress/Profile) still needs its own
  // base clearance above the tab bar, but a specific one of those screens
  // (Practice's horizontal "Talk to..." row, reported directly) can still
  // need MORE on top of that when its own content rests at the same height
  // the FAB floats at. 0 tab-bar clearance + whatever's registered on any
  // other screen. The floor on insets.bottom matters most with neither
  // applying — on a real Android 10 device insets.bottom under-reported the
  // on-screen nav bar's true height, leaving the FAB sitting inside it.
  const fabBottom = Math.max(insets.bottom, 16) + (onTabsRoot ? 68 : 0) + screenClearance;

  if (onCoachScreen) return null;

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

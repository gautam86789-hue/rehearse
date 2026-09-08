import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';

/**
 * Shared motion vocabulary for the Progress surfaces.
 *
 * One curve, one set of durations. Every reveal in Progress uses these so the
 * whole section feels authored by a single hand rather than assembled.
 */
export const CURVE = Easing.bezier(0.22, 1, 0.36, 1);
export const DUR = {
  quick: 260,
  base: 620,
  draw: 1150,
  breathe: 2600
};

/** Drives 0 -> 1 once on mount, after an optional stagger delay. */
export const useReveal = (delay = 0, duration = DUR.base) => {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(value, {
      toValue: 1,
      duration,
      delay,
      easing: CURVE,
      useNativeDriver: true
    });
    animation.start();
    return () => animation.stop();
  }, [value, delay, duration]);

  return value;
};

/**
 * Same reveal, but on the JS driver so the value can feed SVG props
 * (stroke offsets, radii, path lengths) which native driving cannot animate.
 */
export const useRevealJS = (delay = 0, duration = DUR.draw) => {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(value, {
      toValue: 1,
      duration,
      delay,
      easing: CURVE,
      useNativeDriver: false
    });
    animation.start();
    return () => animation.stop();
  }, [value, delay, duration]);

  return value;
};

/**
 * Slow symmetrical breathing loop for living elements.
 *
 * `native` must be false wherever the value feeds an SVG *prop* (r, scale,
 * opacity on an SvgElement) rather than a transform style - the native
 * driver cannot animate those and would fail silently.
 */
export const useBreathe = (enabled = true, native = true) => {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) return;
    const leg = (toValue: number) =>
      Animated.timing(value, {
        toValue,
        duration: DUR.breathe / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: native
      });
    const animation = Animated.loop(Animated.sequence([leg(1), leg(0)]));
    animation.start();
    return () => animation.stop();
  }, [value, enabled, native]);

  return value;
};

/** Standard rise-and-fade entrance transform. */
export const riseIn = (progress: Animated.Value, distance = 14) => ({
  opacity: progress,
  transform: [
    {
      translateY: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [distance, 0]
      })
    }
  ]
});

/** Elevation that reads correctly on both native and web. */
export const lift = (color: string, depth: number) =>
  Platform.select({
    web: { boxShadow: `0 ${depth}px ${depth * 2.4}px ${color}` },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: depth },
      shadowOpacity: 1,
      shadowRadius: depth * 1.6,
      elevation: depth
    }
  }) as object;

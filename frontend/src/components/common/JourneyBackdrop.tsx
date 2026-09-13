import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Blob {
  size: number;
  left: number;
  top: number;
  colorKey: 'primary' | 'purple' | 'champagne';
  driftRange: number;
  duration: number;
}

const BLOBS: Blob[] = [
  { size: 260, left: -80, top: 40, colorKey: 'primary', driftRange: 18, duration: 7000 },
  { size: 220, left: SCREEN_WIDTH - 160, top: SCREEN_HEIGHT * 0.35, colorKey: 'purple', driftRange: 14, duration: 8400 },
  { size: 200, left: -40, top: SCREEN_HEIGHT * 0.7, colorKey: 'champagne', driftRange: 16, duration: 9200 }
];

// Purely decorative, coded (no image asset) drifting backdrop for the
// Journey roadmap — theme-colored, low-opacity, transform-only animation.
// Deliberately never animates opacity to gate visibility: a stuck native
// value here just freezes a soft circle in place, never blanks the screen
// (the failure mode confirmed elsewhere in this app when opacity was used
// to gate whole-screen content).
export const JourneyBackdrop: React.FC = () => {
  const { colors, isDark } = useTheme();
  const anims = useRef(BLOBS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: BLOBS[i].duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: BLOBS[i].duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  const colorFor = (key: Blob['colorKey']) => {
    if (key === 'primary') return colors.primary;
    if (key === 'purple') return colors.cardCategories.purple.solid;
    return colors.champagne;
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {BLOBS.map((blob, i) => (
        <Animated.View
          key={i}
          style={[
            styles.blob,
            {
              width: blob.size,
              height: blob.size,
              borderRadius: blob.size / 2,
              left: blob.left,
              top: blob.top,
              backgroundColor: colorFor(blob.colorKey),
              opacity: isDark ? 0.1 : 0.07,
              transform: [
                {
                  translateY: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, blob.driftRange] })
                },
                {
                  translateX: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, blob.driftRange * 0.6] })
                }
              ]
            }
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  blob: {
    position: 'absolute'
  }
});

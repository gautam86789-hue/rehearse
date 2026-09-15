import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  LayoutChangeEvent
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { progressPalette } from './palette';
import { CURVE, DUR, lift } from './motion';
import { T } from './type';

export interface TabSpec {
  id: string;
  label: string;
}

/**
 * Segmented control with a single sliding thumb.
 *
 * The old screen re-implemented this shape four times with three different
 * geometries. One component, one geometry, and the thumb travels rather than
 * blinking between positions.
 */
export interface SegmentedTabsProps {
  tabs: TabSpec[];
  /** Currently selected tab id. */
  value: string;
  /**
   * Receives the selected id. Callers hold the narrow union type, so they
   * pass a handler that narrows - this stays `string` because the toolchain
   * does not infer type arguments for generic function components.
   */
  onChange: (id: any) => void;
  compact?: boolean;
}

export function SegmentedTabs({
  tabs,
  value,
  onChange,
  compact = false
}: SegmentedTabsProps) {
  const { colors: themeColors, isDark } = useTheme();
  const p = progressPalette(themeColors, isDark);

  const [width, setWidth] = React.useState(0);
  const slide = React.useRef(new Animated.Value(0)).current;

  const index = Math.max(0, tabs.findIndex((t) => t.id === value));
  const cellWidth = width > 0 ? (width - 6) / tabs.length : 0;

  React.useEffect(() => {
    Animated.timing(slide, {
      toValue: index,
      duration: DUR.quick,
      easing: CURVE,
      useNativeDriver: true
    }).start();
  }, [index, slide]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const translateX = slide.interpolate({
    inputRange: tabs.map((_, i) => i),
    outputRange: tabs.map((_, i) => i * cellWidth),
    extrapolate: 'clamp'
  });

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.shell,
        compact && styles.shellCompact,
        { backgroundColor: p.well, borderColor: p.hairline }
      ]}
    >
      {cellWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            compact && styles.thumbCompact,
            {
              width: cellWidth,
              backgroundColor: p.card,
              borderColor: p.hairline,
              transform: [{ translateX }]
            },
            lift('rgba(0,0,0,0.16)', 2)
          ]}
        />
      )}

      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={[styles.cell, compact && styles.cellCompact]}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text
              pointerEvents="none"
              style={[
                styles.label,
                compact && styles.labelCompact,
                {
                  color: selected ? p.ink : p.inkSoft,
                  fontWeight: selected ? '600' : '500'
                }
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
    position: 'relative'
  },
  shellCompact: {
    borderRadius: 11
  },
  thumb: {
    position: 'absolute',
    top: 3,
    left: 3,
    bottom: 3,
    borderRadius: 11,
    borderWidth: 1
  },
  thumbCompact: {
    borderRadius: 8
  },
  cell: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cellCompact: {
    paddingVertical: 6
  },
  label: {
    ...T.label
  },
  labelCompact: {
    ...T.label,
    fontSize: 11.5
  }
});

import React from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { progressPalette } from './palette';
import { useReveal, riseIn, DUR } from './motion';
import { T } from './type';

/**
 * The one section header used across every Progress tab.
 *
 * Previously each view declared its own 22px title + 13px sub pair with
 * slightly different spacing; this keeps the rhythm identical everywhere.
 */
export const SectionHead: React.FC<{
  title: string;
  sub?: string;
  action?: { label: string; onPress: () => void };
  delay?: number;
}> = ({ title, sub, action, delay = 0 }) => {
  const { colors: themeColors, isDark } = useTheme();
  const p = progressPalette(themeColors, isDark);
  const enter = useReveal(delay, DUR.base);

  return (
    <Animated.View style={[styles.wrap, riseIn(enter, 8)]}>
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: p.ink }]}>{title}</Text>
        {!!sub && <Text style={[styles.sub, { color: p.inkSoft }]}>{sub}</Text>}
      </View>
      {action && (
        <Pressable onPress={action.onPress} hitSlop={10}>
          <Text style={[styles.action, { color: p.accent }]}>{action.label}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12
  },
  textCol: {
    flex: 1
  },
  title: {
    ...T.title
  },
  sub: {
    ...T.body,
    marginTop: 2
  },
  action: {
    ...T.labelStrong,
    paddingBottom: 3
  }
});

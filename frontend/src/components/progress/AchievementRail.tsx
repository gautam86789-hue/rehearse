import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AchievementItem } from '../../types/progress';
import { progressPalette, alpha } from './core/palette';
import { useReveal, riseIn, DUR } from './core/motion';
import { T } from './core/type';

/**
 * Horizontal achievement rail.
 *
 * The old grid showed three truncated titles with no state distinction, so
 * locked and earned badges looked identical. Here the earned ones carry the
 * accent and the locked ones carry their own progress, which is the only
 * reason to show them at all.
 */
export const AchievementRail: React.FC<{
  achievements: AchievementItem[];
  onPress: () => void;
}> = ({ achievements, onPress }) => {
  const { colors: themeColors, isDark } = useTheme();
  const p = progressPalette(themeColors, isDark);
  const enter = useReveal(240, DUR.base);

  // Earned first, then the nearest locked ones - the useful reading order.
  const ordered = [...achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked));

  return (
    <Animated.View style={riseIn(enter, 10)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {ordered.map((a) => (
          <Pressable
            key={a.id}
            onPress={onPress}
            style={[
              styles.chip,
              {
                backgroundColor: a.unlocked ? p.accentWash : p.card,
                borderColor: a.unlocked ? alpha(p.accent, 0.45) : p.hairline
              }
            ]}
          >
            <Text style={[styles.emoji, !a.unlocked && styles.emojiLocked]}>{a.icon}</Text>
            <View style={styles.chipText}>
              <Text
                style={[styles.title, { color: a.unlocked ? p.ink : p.inkSoft }]}
                numberOfLines={1}
              >
                {a.title}
              </Text>
              <Text style={[styles.meta, { color: a.unlocked ? p.accent : p.inkFaint }]}>
                {a.unlocked ? a.unlockedDate ?? 'Earned' : a.progressText ?? 'Locked'}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  rail: {
    gap: 9,
    paddingRight: 16,
    paddingVertical: 2
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 168
  },
  emoji: {
    fontSize: 19
  },
  emojiLocked: {
    opacity: 0.45
  },
  chipText: {
    flex: 1
  },
  title: {
    ...T.label,
    fontWeight: '600'
  },
  meta: {
    ...T.micro,
    fontSize: 10,
    marginTop: 1
  }
});

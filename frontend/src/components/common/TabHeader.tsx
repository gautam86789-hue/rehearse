import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

// One layout for every main tab (Home, Practice, Progress, Profile) so the app
// reads as a single structure: the same side margins, the same distance from
// the top, the same title size, and actions always on the right.
export const TAB_PADDING_H = 20;
export const TAB_PADDING_BOTTOM = 130; // clears the floating tab bar + assistant button

interface TabHeaderProps {
  title: string;
  /** Small line above the title (e.g. a greeting). */
  caption?: string;
  right?: React.ReactNode;
}

export const TabHeader: React.FC<TabHeaderProps> = ({ title, caption, right }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
      <View style={styles.textBlock}>
        {!!caption && <Text style={[styles.caption, { color: colors.textSecondary }]}>{caption}</Text>}
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {!!right && <View style={styles.right}>{right}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: TAB_PADDING_H,
    paddingBottom: 16,
    minHeight: 84
  },
  textBlock: { flex: 1, marginRight: 12, justifyContent: 'center' },
  caption: { fontSize: 13.5, fontWeight: '500', marginBottom: 2 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 }
});

// Round icon button used for header actions on every tab (bell, share, settings).
export const TabIconButton: React.FC<{ onPress: () => void; label: string; children: React.ReactNode; disabled?: boolean }> = ({
  onPress,
  label,
  children,
  disabled
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[iconStyles.btn, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      {children}
    </TouchableOpacity>
  );
};

const iconStyles = StyleSheet.create({
  btn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }
});

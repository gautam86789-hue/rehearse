import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ViewShotRef } from 'react-native-view-shot';
import { Award, Flame, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { ShareCardFrame } from './ShareCardFrame';

const ICONS = { flame: Flame, award: Award, 'shield-check': ShieldCheck, sparkles: Sparkles } as const;

interface MilestoneShareCardProps {
  title: string;
  description: string;
  icon: keyof typeof ICONS;
}

// Every milestone is shareable now, not just streaks — same spoiler-safe
// principle as the other cards: the badge name/description is generic
// achievement language, never tied to a specific real conversation.
export const MilestoneShareCard = forwardRef<ViewShotRef, MilestoneShareCardProps>(
  ({ title, description, icon }, ref) => {
    const { colors } = useTheme();
    const Icon = ICONS[icon] || Award;

    return (
      <ShareCardFrame ref={ref} eyebrow="MILESTONE UNLOCKED">
        <View style={styles.wrap}>
          <View style={[styles.iconCircle, { backgroundColor: colors.champagneSubtle }]}>
            <Icon size={40} color={colors.champagneDark} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
        </View>
      </ShareCardFrame>
    );
  }
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 12
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3
  },
  description: {
    fontSize: 13.5,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 230,
    lineHeight: 19
  }
});

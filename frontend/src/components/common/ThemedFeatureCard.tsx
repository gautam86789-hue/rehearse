import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { useTheme, RADII, CardCategoryKey } from '../../context/ThemeContext';

export type ThemedFeatureCardSize = 'tile' | 'row' | 'hero';

interface ThemedFeatureCardProps {
  // Plain-string title/subtitle for the common case. For richer header
  // content (e.g. a meta row combining a category tag + a difficulty badge),
  // pass `titleSlot` instead — it replaces this block entirely.
  title?: string;
  subtitle?: string;
  titleSlot?: React.ReactNode;
  // Required unless `leading` is provided instead.
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  // A generated illustration for this feature, or null/undefined to fall
  // back to the icon+color treatment — see getFeatureIllustration().
  illustration?: ImageSourcePropType | null;
  categoryColor: CardCategoryKey;
  onPress?: () => void;
  size?: ThemedFeatureCardSize;
  // Overrides the icon/illustration block entirely — used by screens whose
  // cards front a persona/counterpart portrait rather than a feature icon.
  leading?: React.ReactNode;
  // Extra content below the title/subtitle (e.g. a goal line + action row).
  footer?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ThemedFeatureCard: React.FC<ThemedFeatureCardProps> = ({
  title,
  subtitle,
  titleSlot,
  icon: Icon,
  illustration,
  categoryColor,
  onPress,
  size = 'row',
  leading,
  footer,
  disabled,
  style,
  testID
}) => {
  const { colors, isDark, elevation } = useTheme();
  const palette = colors.cardCategories[categoryColor];

  const visual = leading ? (
    leading
  ) : illustration ? (
    <Image
      source={illustration}
      resizeMode="cover"
      style={size === 'tile' ? styles.tileIllustration : size === 'hero' ? styles.heroIllustration : styles.rowIllustration}
    />
  ) : (
    <View
      style={[
        size === 'tile' ? styles.tileIconWrap : size === 'hero' ? styles.heroIconWrap : styles.rowIconWrap,
        { overflow: 'hidden' }
      ]}
    >
      <LinearGradient
        colors={[palette.subtle, `${palette.solid}22`]}
        style={StyleSheet.absoluteFill}
      />
      {Icon && <Icon size={size === 'row' ? 20 : 24} color={palette.solid} />}
    </View>
  );

  const textBlock = titleSlot ? (
    titleSlot
  ) : (
    <>
      <Text
        style={[styles.title, size === 'hero' && styles.titleHero, { color: colors.textPrimary }]}
        numberOfLines={size === 'tile' ? 2 : 1}
      >
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
          {subtitle}
        </Text>
      )}
    </>
  );

  const content = (
    <>
      {size === 'hero' && visual}
      <View style={size === 'row' ? styles.rowBody : styles.stackBody}>
        {size === 'row' && visual}
        <View style={size === 'row' ? styles.rowTextStack : undefined}>
          {size === 'tile' && visual}
          {textBlock}
        </View>
        {size === 'row' && onPress && !footer && <ChevronRight size={18} color={colors.textMuted} />}
      </View>
      {footer}
    </>
  );

  const cardStyle = [
    styles.base,
    size === 'tile' && styles.tile,
    size === 'row' && styles.row,
    size === 'hero' && styles.hero,
    elevation.sm,
    {
      backgroundColor: palette.subtle,
      borderColor: palette.border,
      borderRadius: size === 'hero' ? RADII.xl : RADII.lg,
      opacity: disabled ? 0.5 : 1
    },
    style
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled}
        style={cardStyle}
        testID={testID}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1
  },
  tile: {
    width: '47.5%',
    padding: 14
  },
  row: {
    padding: 14
  },
  hero: {
    overflow: 'hidden'
  },
  stackBody: {
    gap: 4
  },
  rowBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  rowTextStack: {
    flex: 1,
    gap: 2
  },
  title: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.1
  },
  titleHero: {
    fontSize: 17,
    padding: 14,
    paddingBottom: 4
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 17
  },
  tileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  rowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroIconWrap: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tileIllustration: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginBottom: 8
  },
  rowIllustration: {
    width: 44,
    height: 44,
    borderRadius: 14
  },
  heroIllustration: {
    width: '100%',
    height: 140
  }
});

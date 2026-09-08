import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { typography } from '../../theme/typography';
import { useTheme } from '../../context/ThemeContext';

export type TypographyVariant =
  | 'brandWordmark'
  | 'brandWordmarkSmall'
  | 'hero'
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'lead'
  | 'subtitle'
  | 'bodyLarge'
  | 'body'
  | 'bodyMedium'
  | 'bodyBold'
  | 'bodySmall'
  | 'buttonLarge'
  | 'button'
  | 'buttonSmall'
  | 'overline'
  | 'tag'
  | 'caption'
  | 'footnote'
  | 'quote'
  | 'metricLarge'
  | 'metricMedium'
  | 'metricSmall';

export type TextColorType =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'inverse'
  | 'success'
  | 'warning'
  | 'error'
  | 'flame'
  | 'gold'
  | 'custom';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: TextColorType;
  customColor?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  italic?: boolean;
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'primary',
  customColor,
  align,
  italic,
  style,
  children,
  ...rest
}) => {
  const { colors } = useTheme();

  const resolveColor = (): string => {
    if (customColor) return customColor;
    switch (color) {
      case 'secondary':
        return colors.textSecondary;
      case 'muted':
        return colors.textMuted;
      case 'accent':
        return colors.primary;
      case 'inverse':
        return colors.textInverse;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'flame':
        return colors.flame;
      case 'gold':
        return colors.gold;
      case 'primary':
      default:
        return colors.textPrimary;
    }
  };

  const variantStyle = typography[variant] || typography.body;
  const computedStyle: TextStyle = {
    ...variantStyle,
    color: resolveColor(),
    ...(align ? { textAlign: align } : {}),
    ...(italic ? { fontStyle: 'italic' } : {})
  };

  return (
    <Text style={[computedStyle, style]} {...rest}>
      {children}
    </Text>
  );
};

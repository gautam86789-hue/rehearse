import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { typography } from '../../theme/typography';
import { useTheme } from '../../context/ThemeContext';
import { hapticTap } from '../../services/haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'forest' | 'flame' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle
}) => {
  const { colors } = useTheme();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'forest':
        return { backgroundColor: colors.sage, borderColor: 'transparent' };
      case 'flame':
        return { backgroundColor: colors.flame, borderColor: 'transparent' };
      case 'secondary':
        return { backgroundColor: colors.surfaceElevated, borderColor: colors.surfaceBorder, borderWidth: 1.5 };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: colors.primary, borderWidth: 2 };
      case 'ghost':
        return { backgroundColor: 'transparent', borderColor: 'transparent' };
      case 'primary':
      default:
        return { backgroundColor: colors.primary, borderColor: 'transparent' };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 14 };
      case 'lg':
        return { paddingVertical: 17, paddingHorizontal: 26, borderRadius: 18 };
      case 'md':
      default:
        return { paddingVertical: 13, paddingHorizontal: 20, borderRadius: 16 };
    }
  };

  const getTextColor = (): string => {
    if (variant === 'outline') return colors.primary;
    if (variant === 'ghost') return colors.textSecondary;
    if (variant === 'secondary') return colors.textPrimary;
    return '#FFFFFF';
  };

  const typographyStyle = size === 'lg' ? typography.buttonLarge : size === 'sm' ? typography.buttonSmall : typography.button;

  const handlePress = () => {
    hapticTap();
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        getVariantStyles(),
        getSizeStyles(),
        disabled && styles.disabledButton,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && icon}
          <Text
            style={[
              typographyStyle,
              { color: getTextColor() },
              textStyle
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  disabledButton: {
    opacity: 0.5
  }
});

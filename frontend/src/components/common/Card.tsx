import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'highlight' | 'forest' | 'flame';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'default'
}) => {
  const { colors, isDark } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return { backgroundColor: colors.surfaceElevated, borderColor: colors.surfaceBorder };
      case 'highlight':
        return { backgroundColor: colors.primarySubtle, borderColor: colors.primaryLight };
      case 'forest':
        return { backgroundColor: colors.sageSubtle, borderColor: colors.sageLight };
      case 'flame':
        return { backgroundColor: colors.flameGlow, borderColor: colors.flame };
      case 'default':
      default:
        return { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder };
    }
  };

  // elevation: 0 is deliberate — Android's native `elevation` prop renders a
  // real Material outline shadow shape that shows up as a visible boxy halo
  // around rounded cards on light/tinted backgrounds on real Android
  // hardware (invisible on iOS/web, which only read shadow*). Android falls
  // back to flat depth (border + tinted background) instead.
  const shadowStyle = isDark
    ? {}
    : {
        shadowColor: '#5B5FEF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 0
      };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[styles.cardBase, shadowStyle, getVariantStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.cardBase, shadowStyle, getVariantStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16
  }
});

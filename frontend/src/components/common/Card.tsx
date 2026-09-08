import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

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
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return { backgroundColor: colors.surfaceElevated, borderColor: colors.surfaceBorder };
      case 'highlight':
        return { backgroundColor: 'rgba(59, 130, 246, 0.08)', borderColor: 'rgba(59, 130, 246, 0.3)' };
      case 'forest':
        return { backgroundColor: 'rgba(5, 150, 105, 0.08)', borderColor: 'rgba(5, 150, 105, 0.3)' };
      case 'flame':
        return { backgroundColor: 'rgba(249, 115, 22, 0.08)', borderColor: 'rgba(249, 115, 22, 0.3)' };
      case 'default':
      default:
        return { backgroundColor: colors.surface, borderColor: colors.surfaceBorder };
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[styles.cardBase, getVariantStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.cardBase, getVariantStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16
  }
});

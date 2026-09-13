import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

export type MilestoneIconKey = 'flame' | 'award' | 'shield-check' | 'sparkles';

// Coded/cropped 3D badge art (frontend/assets/icons/) replacing the plain
// lucide line icons for milestone unlocks — these are full-color illustrated
// icons, not tintable, so there's no `color` prop here the way lucide icons
// take one.
const SOURCES: Record<MilestoneIconKey, ReturnType<typeof require>> = {
  flame: require('../../../assets/icons/flame.png'),
  award: require('../../../assets/icons/medal.png'),
  'shield-check': require('../../../assets/icons/shield_star.png'),
  sparkles: require('../../../assets/icons/star.png')
};

interface MilestoneIconProps {
  icon: MilestoneIconKey | string;
  size: number;
  style?: StyleProp<ImageStyle>;
}

export const MilestoneIcon: React.FC<MilestoneIconProps> = ({ icon, size, style }) => (
  <Image
    source={SOURCES[icon as MilestoneIconKey] || SOURCES.sparkles}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);

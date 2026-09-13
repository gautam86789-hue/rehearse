import React from 'react';
import { ViewStyle } from 'react-native';
import { AcousticLoopLogo } from './AcousticLoopLogo';
import { useTheme } from '../../context/ThemeContext';

interface RehearseEmblemProps {
  size?: number;
  style?: ViewStyle;
}

export const RehearseEmblem: React.FC<RehearseEmblemProps> = ({
  size = 56,
  style
}) => {
  const { colors } = useTheme();

  return (
    <AcousticLoopLogo
      size={size}
      backgroundColor={colors.primary}
      loopColor="#FFFFFF"
      waveColor={colors.gold}
      style={style}
    />
  );
};

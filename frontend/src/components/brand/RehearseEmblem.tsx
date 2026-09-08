import React from 'react';
import { ViewStyle } from 'react-native';
import { AcousticLoopLogo } from './AcousticLoopLogo';

interface RehearseEmblemProps {
  size?: number;
  style?: ViewStyle;
}

export const RehearseEmblem: React.FC<RehearseEmblemProps> = ({
  size = 56,
  style
}) => {
  return (
    <AcousticLoopLogo
      size={size}
      backgroundColor="#162A24"
      loopColor="#F9FAF8"
      waveColor="#D97736"
      style={style}
    />
  );
};

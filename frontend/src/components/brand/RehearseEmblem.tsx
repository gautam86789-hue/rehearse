import React from 'react';
import { Image, StyleProp, ImageStyle } from 'react-native';

interface RehearseEmblemProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

// The one app logo — the same artwork as the launcher icon and the share
// cards — so it looks identical on the splash, welcome, sign-in, login,
// paywall and everywhere else it appears.
export const RehearseEmblem: React.FC<RehearseEmblemProps> = ({ size = 56, style }) => (
  <Image
    source={require('../../../assets/icon.png')}
    style={[{ width: size, height: size, borderRadius: size * 0.22 }, style]}
    resizeMode="cover"
  />
);

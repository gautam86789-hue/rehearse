import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Rect, Path, Line, Circle } from 'react-native-svg';

export interface AcousticLoopLogoProps {
  size?: number;
  backgroundColor?: string;
  loopColor?: string;
  waveColor?: string;
  style?: ViewStyle;
  rounded?: boolean;
}

export const AcousticLoopLogo: React.FC<AcousticLoopLogoProps> = ({
  size = 40,
  backgroundColor = '#5B5FEF',
  loopColor = '#F9FAF8',
  waveColor = '#F59E0B',
  style,
  rounded = true
}) => {
  const rx = rounded ? 36 : 0;

  return (
    <View style={[{ width: size, height: size }, styles.container, style]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
      >
        {/* Background Rounded Slate Container */}
        {backgroundColor ? (
          <Rect
            width="160"
            height="160"
            rx={rx}
            fill={backgroundColor}
          />
        ) : null}

        {/* Acoustic Conversation Loop Track */}
        <Path
          d="M46 80C46 61.2223 61.2223 46 80 46C98.7777 46 114 61.2223 114 80C114 98.7777 98.7777 114 80 114H50"
          stroke={loopColor}
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Dynamic Acoustic Resonance Frequencies */}
        <Line
          x1="72"
          y1="72"
          x2="72"
          y2="88"
          stroke={waveColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <Line
          x1="80"
          y1="64"
          x2="80"
          y2="96"
          stroke={waveColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <Line
          x1="88"
          y1="70"
          x2="88"
          y2="90"
          stroke={waveColor}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Endpoint Calibration Anchor */}
        <Circle
          cx="50"
          cy="114"
          r="5"
          fill={waveColor}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  }
});

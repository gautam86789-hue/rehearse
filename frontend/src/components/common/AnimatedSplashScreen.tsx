import React from 'react';
import { StartupSequence } from '../brand/StartupSequence';

export interface AnimatedSplashScreenProps {
  onFinish: () => void;
  minDuration?: number;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onFinish,
  minDuration
}) => {
  return <StartupSequence onFinish={onFinish} minDuration={minDuration} />;
};

// Re-export modular primitives for reuse across the app
export * from '../brand/AtmosphereGlow';
export * from '../brand/ConversationSignal';
export * from '../brand/PersonaWaveformSignal';
export * from '../brand/BrandWordmark';
export * from '../brand/CalibrationStatus';
export * from '../brand/RehearseEmblem';
export * from '../brand/StartupSequence';

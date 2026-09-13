import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

// "Guided Practice" mode: fetch the coaching framework matched to this
// user's persona and hand off into the existing FrameworkDetailScreen, which
// already carries the "practice this in a scenario" CTA — this screen is
// just the fast, loading hand-off.
export const GuidedPracticeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useApp();

  useEffect(() => {
    apiService.getFrameworkOfTheDay(user.audience).then((res) => {
      navigation.replace('FrameworkDetail', { framework: res.framework });
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
};

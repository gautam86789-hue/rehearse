import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Compass, MessageSquare, TrendingUp, Settings } from 'lucide-react-native';
import { colors } from '../theme/colors';

// Screens
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { DescribeSituationScreen } from '../screens/DescribeSituationScreen';
import { ScenariosScreen } from '../screens/ScenariosScreen';
import { RoleplayScreen } from '../screens/RoleplayScreen';
import { ScoreScreen } from '../screens/ScoreScreen';
import { FrameworkDetailScreen } from '../screens/FrameworkDetailScreen';
import { DailyPuzzleScreen } from '../screens/DailyPuzzleScreen';
import { ReplyAssistantScreen } from '../screens/ReplyAssistantScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AppearanceScreen } from '../screens/settings/AppearanceScreen';
import { AccountSecurityScreen } from '../screens/settings/AccountSecurityScreen';
import { ExecutiveProfileScreen } from '../screens/settings/ExecutiveProfileScreen';
import { MembershipBillingScreen } from '../screens/settings/MembershipBillingScreen';
import { AboutRehearseScreen } from '../screens/settings/AboutRehearseScreen';
import { PrivacyDataScreen } from '../screens/settings/PrivacyDataScreen';
import { MethodologyScreen } from '../screens/settings/MethodologyScreen';

// Coach Suite Screens
import {
  CoachHomeScreen,
  SituationCoachScreen,
  ConversationBriefScreen,
  StrategicReplyScreen,
  RehearsalSettingsScreen,
  LiveRehearsalScreen,
  ConversationAutopsyScreen,
  ConversationReplayScreen,
  CoachingNextStepsScreen
} from '../screens/coach';

import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PaywallModal } from '../components/common/PaywallModal';
import { BadgeUnlockedModal } from '../components/common/BadgeUnlockedModal';

import { CustomTabBar } from '../components/common/CustomTabBar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      id="MainTabs"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false
      }}
    >
      {/* MVP Core Destinations */}
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="DescribeTab" component={DescribeSituationScreen} />
      <Tab.Screen name="ScenariosTab" component={ScenariosScreen} />
      <Tab.Screen name="ProgressTab" component={ProgressScreen} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} />

      {/* =========================================================================
          PHASE 1 FEATURES (Preserved in code - Main Tab Connections Commented Out)
         ========================================================================= */}
      {/* <Tab.Screen name="ReplyCoachTab" component={CoachHomeScreen} /> */}
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isOnboarded, isLoading: isAppLoading } = useApp();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { colors: themeColors } = useTheme();

  if (isAppLoading || isAuthLoading) {
    return <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        id="RootStack"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: themeColors.background }
        }}
      >
        {!isAuthenticated ? (
          // Unauthenticated Auth Flow — Welcome as new user entrypoint
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          // Authenticated App Flow
          <>
            {!isOnboarded && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            )}
            <Stack.Screen name="HomeTabs" component={TabNavigator} />
            {isOnboarded && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            )}
            <Stack.Screen name="DescribeSituation" component={DescribeSituationScreen} />
            <Stack.Screen name="Scenarios" component={ScenariosScreen} />
            <Stack.Screen name="Roleplay" component={RoleplayScreen} />
            <Stack.Screen name="Score" component={ScoreScreen} />
            <Stack.Screen name="FrameworkDetail" component={FrameworkDetailScreen} />
            <Stack.Screen name="DailyPuzzle" component={DailyPuzzleScreen} />
            <Stack.Screen name="ReplyCoach" component={ReplyAssistantScreen} />
            <Stack.Screen name="Appearance" component={AppearanceScreen} />
            <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} />
            <Stack.Screen name="ExecutiveProfile" component={ExecutiveProfileScreen} />
            <Stack.Screen name="MembershipBilling" component={MembershipBillingScreen} />
            <Stack.Screen name="AboutRehearse" component={AboutRehearseScreen} />
            <Stack.Screen name="PrivacyData" component={PrivacyDataScreen} />
            <Stack.Screen name="Methodology" component={MethodologyScreen} />

            {/* Coach Experience Suite */}
            <Stack.Screen name="CoachHome" component={CoachHomeScreen} />
            <Stack.Screen name="SituationCoach" component={SituationCoachScreen} />
            <Stack.Screen name="ConversationBrief" component={ConversationBriefScreen} />
            <Stack.Screen name="StrategicReply" component={StrategicReplyScreen} />
            <Stack.Screen name="RehearsalSettings" component={RehearsalSettingsScreen} />
            <Stack.Screen name="LiveRehearsal" component={LiveRehearsalScreen} />
            <Stack.Screen name="ConversationAutopsy" component={ConversationAutopsyScreen} />
            <Stack.Screen name="ConversationReplay" component={ConversationReplayScreen} />
            <Stack.Screen name="CoachingNextSteps" component={CoachingNextStepsScreen} />
          </>
        )}
      </Stack.Navigator>

      {/* Global Modals */}
      <PaywallModal />
      <BadgeUnlockedModal />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background
  },
  tabItem: {
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2
  }
});

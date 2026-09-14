import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { enableFreeze } from 'react-native-screens';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Compass, MessageSquare, TrendingUp, Settings } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { navigationRef } from './navigationRef';

// Freezes off-screen screens (pauses their React updates/effects) instead of
// leaving every tab and stack screen doing work in the background — the
// single biggest lever for tab-switch and navigation smoothness on a screen
// count this size. Must be called before any navigator renders.
enableFreeze(true);

// Screens
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { TermsOfServiceScreen } from '../screens/TermsOfServiceScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PracticeHomeScreen } from '../screens/PracticeHomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ConversationHistoryScreen } from '../screens/ConversationHistoryScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { MilestonesScreen } from '../screens/MilestonesScreen';
import { HelpSupportScreen } from '../screens/HelpSupportScreen';
import { GuidedPracticeScreen } from '../screens/GuidedPracticeScreen';
import { DescribeSituationScreen } from '../screens/DescribeSituationScreen';
import { ScenariosScreen } from '../screens/ScenariosScreen';
import { ScenarioDetailScreen } from '../screens/ScenarioDetailScreen';
import { RoleplayScreen } from '../screens/RoleplayScreen';
import { ScoreScreen } from '../screens/ScoreScreen';
import { FeedbackScreen } from '../screens/FeedbackScreen';
import { DetailedFeedbackScreen } from '../screens/DetailedFeedbackScreen';
import { WhatToSayScreen } from '../screens/WhatToSayScreen';
import { FrameworkDetailScreen } from '../screens/FrameworkDetailScreen';
import { JourneyScreen } from '../screens/JourneyScreen';
import { JourneyStoryScreen } from '../screens/JourneyStoryScreen';
import { KnowledgeArticleScreen } from '../screens/KnowledgeArticleScreen';
import { DailyPuzzleScreen } from '../screens/DailyPuzzleScreen';
import { ReplyAssistantScreen } from '../screens/ReplyAssistantScreen';
import { AICoachScreen } from '../screens/AICoachScreen';
import { CashfreeCheckoutScreen } from '../screens/CashfreeCheckoutScreen';
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
import { AIAssistantWidget } from '../components/common/AIAssistantWidget';
import { FabClearanceProvider } from '../context/FabClearanceContext';

import { CustomTabBar } from '../components/common/CustomTabBar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      id="MainTabs"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Bottom-tabs default to an instant, unanimated swap ('none') — this
        // is what read as a "rigid" cut when switching Home/Practice/Profile.
        // 'shift' cross-fades with a slight horizontal shift, matching the
        // slide feel already used for stack push/pop below. Confirmed
        // native-driver-backed (opacity + translateX only), so the animation
        // itself already runs off the JS thread.
        animation: 'shift',
        // Pairs with enableFreeze() above — the tab you're not looking at
        // stops re-rendering/running effects entirely instead of quietly
        // doing work in the background every time state changes anywhere in
        // the app, which is what was competing with the switch animation for
        // JS-thread time and reading as janky despite the animation itself
        // being native-driven.
        freezeOnBlur: true
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="PracticeTab" component={PracticeHomeScreen} />
      <Tab.Screen name="ProgressTab" component={ProgressScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />

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
  const { colors: themeColors, isDark } = useTheme();
  const [activeRouteName, setActiveRouteName] = useState<string>('HomeTab');

  // Pairs with the preventAutoHideAsync() call in App.tsx — releases the
  // native splash only once there's real content to show, rather than the
  // default (splash hides on RN's first frame, which lands on this loading
  // placeholder, then again on the real screen once it's ready).
  useEffect(() => {
    if (!isAppLoading && !isAuthLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isAppLoading, isAuthLoading]);

  if (isAppLoading || isAuthLoading) {
    return <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]} />;
  }

  // react-native-screens uses NavigationContainer's `theme.colors.background`
  // as the backdrop directly behind the animating screen during a push/pop
  // transition — not just the final rendered card. Leaving this at React
  // Navigation's default (always white/light) is what caused the white
  // flash on every back navigation, regardless of the app's own dark mode;
  // `contentStyle` alone only colors the settled screen, not the transition.
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: themeColors.background,
      card: themeColors.surfaceCard,
      text: themeColors.textPrimary,
      border: themeColors.surfaceBorder,
      primary: themeColors.primary
    }
  };

  return (
    <NavigationContainer
      theme={navigationTheme}
      ref={navigationRef}
      onReady={() => {
        const route = navigationRef.getCurrentRoute() as any;
        if (route?.name) setActiveRouteName(route.name);
      }}
      onStateChange={() => {
        const route = navigationRef.getCurrentRoute() as any;
        if (route?.name) setActiveRouteName(route.name);
      }}
    >
      <FabClearanceProvider>
      <Stack.Navigator
        id="RootStack"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: themeColors.background },
          // 'slide_from_right' is a flatter, faster Android-only slide with no
          // easing curve — it's what read as "rigid" pushing into a feature
          // or going back. 'ios_from_right' gives Android the same eased,
          // spring-backed slide iOS already gets natively (and matches this
          // app's broader "feel like an iOS app" direction); on iOS itself it
          // resolves to the platform default, so this is a pure improvement.
          // (`animationDuration` was dropped: per native-stack's docs it's
          // only honored for slide_from_bottom/fade_from_bottom/fade/
          // simple_push, so it was silently doing nothing here.)
          animation: 'ios_from_right',
          fullScreenGestureEnabled: true
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
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          </>
        ) : !isOnboarded ? (
          // Authenticated but hasn't finished onboarding yet — this is the ONLY
          // screen registered in this branch, so completing onboarding (which flips
          // isOnboarded) causes React Navigation to swap the whole screen set below,
          // rather than relying on an explicit navigate() call that may target a
          // route not yet mounted in the current branch.
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          // Authenticated + Onboarded — Main App Flow
          <>
            <Stack.Screen name="HomeTabs" component={TabNavigator} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ConversationHistory" component={ConversationHistoryScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Milestones" component={MilestonesScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="DescribeSituation" component={DescribeSituationScreen} />
            <Stack.Screen name="Scenarios" component={ScenariosScreen} />
            <Stack.Screen name="ScenarioDetail" component={ScenarioDetailScreen} />
            <Stack.Screen name="GuidedPractice" component={GuidedPracticeScreen} />
            <Stack.Screen name="Roleplay" component={RoleplayScreen} />
            <Stack.Screen name="Score" component={ScoreScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} />
            <Stack.Screen name="DetailedFeedback" component={DetailedFeedbackScreen} />
            <Stack.Screen name="WhatToSay" component={WhatToSayScreen} />
            <Stack.Screen name="FrameworkDetail" component={FrameworkDetailScreen} />
            <Stack.Screen name="Learn" component={JourneyScreen} />
            <Stack.Screen name="JourneyStory" component={JourneyStoryScreen} />
            <Stack.Screen name="KnowledgeArticle" component={KnowledgeArticleScreen} />
            <Stack.Screen name="DailyPuzzle" component={DailyPuzzleScreen} />
            <Stack.Screen name="ReplyCoach" component={ReplyAssistantScreen} />
            <Stack.Screen name="AICoach" component={AICoachScreen} />
            <Stack.Screen name="Appearance" component={AppearanceScreen} />
            <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} />
            <Stack.Screen name="ExecutiveProfile" component={ExecutiveProfileScreen} />
            <Stack.Screen name="MembershipBilling" component={MembershipBillingScreen} />
            <Stack.Screen name="CashfreeCheckout" component={CashfreeCheckoutScreen} />
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

      {/* Floating AI Assistant — only once there's a real app to assist with */}
      {isAuthenticated && isOnboarded && <AIAssistantWidget activeRouteName={activeRouteName} />}
      </FabClearanceProvider>
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

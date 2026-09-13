import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { navigateFromNotification } from './src/navigation/navigationRef';
import { registerNotificationResponseHandler } from './src/services/notificationService';
import { configurePurchases } from './src/services/purchases';
import { initOneSignal } from './src/services/oneSignalService';

// Must run once, before any other Purchases.* call — see RevenueCat setup
// requirements. This is a synchronous call (module-level, not inside a
// component) so it can never race a screen that checks entitlements on
// first render.
configurePurchases();
initOneSignal();

// Without this, the native splash (the branded "R" logo) auto-hides the
// instant RN's first frame paints — which happens before AppContext/
// AuthContext have finished loading cached user/session state from
// AsyncStorage/Supabase. That gap showed as ~2-3s of a bare, near-white
// loading View (see AppNavigator's isAppLoading/isAuthLoading guard) between
// the branded splash disappearing and real content appearing. Holding the
// splash open until that guard clears (see the hideAsync call in
// AppNavigator) means the user only ever sees the branded splash, then the
// real screen — never the blank gap in between. Failure is swallowed since
// this call throws if made after the module that auto-registers the splash
// has already resolved it (a bare warning, not a real error worth crashing
// over).
SplashScreen.preventAutoHideAsync().catch(() => {});

// Was also showing a custom animated JS splash (StartupSequence) on top of
// the native OS splash screen before this — a redundant double-intro users
// saw on every cold start (reported directly: two separate branding/loading
// screens back to back). The native splash alone (configured via app.json /
// the generated Android splash resources) is what actually needs to show;
// this component no longer renders a second one after it.
const ThemedAppContent = () => {
  const { isDark } = useTheme();

  // Tapping "Don't lose your streak" should land on the Daily Puzzle, not
  // wherever the app happened to be sitting — a notification whose tap goes
  // nowhere specific defeats the point of it.
  useEffect(() => {
    return registerNotificationResponseHandler(navigateFromNotification);
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <ThemedAppContent />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
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

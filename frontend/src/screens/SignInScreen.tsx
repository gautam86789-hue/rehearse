import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, ShieldCheck, X } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme, RADII } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { AtmosphereGlow } from '../components/brand/AtmosphereGlow';
import { RehearseEmblem } from '../components/brand/RehearseEmblem';
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons';
import { InAppNotification, NotificationType } from '../components/common/InAppNotification';

interface SignInScreenProps {
  navigation: any;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, accentColor, isDark, elevation } = useTheme();
  const {
    signInWithOAuth,
    authError,
    clearError
  } = useAuth();

  const [loadingProvider, setLoadingProvider] = useState<'google' | 'azure' | 'facebook' | null>(null);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: NotificationType;
  }>({ visible: false, message: '', type: 'info' });

  const handleOAuth = async (provider: 'google' | 'azure' | 'facebook') => {
    setLoadingProvider(provider);
    await signInWithOAuth(provider);
    setLoadingProvider(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AtmosphereGlow intensity={isDark ? 0.7 : 0.3} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 24) + 24,
              paddingBottom: Math.max(insets.bottom, 24) + 20
            }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Header Identity */}
          <View style={styles.header}>
            <RehearseEmblem size={56} />
            <View style={styles.brandTitleRow}>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>REHEARSE</Text>
              <Text style={[styles.periodDot, { color: accentColor }]}>.</Text>
            </View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Master difficult conversations with private executive AI.
            </Text>
          </View>

          {/* 2. Main Title */}
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Create Account / Sign In</Text>
            <Text style={[styles.subTitleText, { color: colors.textSecondary }]}>
              Select your provider below to sign in or create an account.
            </Text>
          </View>

          {/* Error Banner */}
          {authError ? (
            <View style={[styles.errorBanner, { backgroundColor: colors.danger + '20', borderColor: colors.danger + '50' }]}>
              <AlertCircle size={15} color={colors.danger} style={{ marginRight: 8 }} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{authError}</Text>
              <TouchableOpacity onPress={clearError}>
                <X size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* 3. 3 Primary Social OAuth Buttons (Google, Microsoft, Facebook) */}
          <View style={styles.authBox}>
            <SocialAuthButtons
              mode="signin"
              onSelectProvider={handleOAuth}
              loadingProvider={loadingProvider}
            />
          </View>

          {/* 4. Bottom Trust Badge */}
          <View style={styles.trustBadge}>
            <ShieldCheck size={14} color={colors.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.trustBadgeText, { color: colors.textMuted }]}>
              100% Private & Enterprise Encrypted
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* In-App Toast Banner */}
      <InAppNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    flexGrow: 1
  },
  header: {
    alignItems: 'center',
    marginBottom: 28
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12
  },
  brandTitle: {
    ...typography.h2,
    fontSize: 26,
    letterSpacing: 2.5,
    fontWeight: '900'
  },
  periodDot: {
    fontSize: 28,
    fontWeight: '900'
  },
  subtitle: {
    ...typography.body2,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 300
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center'
  },
  subTitleText: {
    fontSize: 13,
    textAlign: 'center'
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADII.md,
    borderWidth: 1,
    marginBottom: 20,
    width: '100%'
  },
  errorText: {
    fontSize: 13,
    flex: 1
  },
  authBox: {
    width: '100%',
    marginBottom: 32
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12
  },
  trustBadgeText: {
    fontSize: 12
  }
});

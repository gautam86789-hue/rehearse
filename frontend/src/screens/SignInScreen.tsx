import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, ShieldCheck, X, Mail, Lock } from 'lucide-react-native';

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
    signInWithEmail,
    signUpWithEmail,
    authError,
    clearError
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleEmailSubmit = async () => {
    setFormError('');
    clearError();
    const cleanEmail = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setFormError('Your password needs at least 6 characters.');
      return;
    }
    setSubmitting(true);
    // The email's local part becomes the display name (see AppContext's
    // withRealName + the backend's displayNameFor), so nobody is left as
    // "Professional".
    const res =
      mode === 'signup'
        ? await signUpWithEmail(cleanEmail, password, { fullName: cleanEmail.split('@')[0] })
        : await signInWithEmail(cleanEmail, password);
    setSubmitting(false);
    if (res?.error) setFormError(res.error.message || 'Something went wrong. Please try again.');
  };

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
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </Text>
            <Text style={[styles.subTitleText, { color: colors.textSecondary }]}>
              {mode === 'signin'
                ? 'Sign in to pick up right where you left off.'
                : 'Your progress and streak will follow you to any device.'}
            </Text>
          </View>

          {/* Error Banner */}
          {formError || authError ? (
            <View style={[styles.errorBanner, { backgroundColor: colors.danger + '20', borderColor: colors.danger + '50' }]}>
              <AlertCircle size={15} color={colors.danger} style={{ marginRight: 8 }} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{formError || authError}</Text>
              <TouchableOpacity onPress={() => { setFormError(''); clearError(); }}>
                <X size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* 3. Email + password — always backed by the real account database */}
          <View style={styles.authBox}>
            <View style={[styles.inputRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.surfaceBorder }]}>
              <Mail size={16} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>
            <View style={[styles.inputRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.surfaceBorder }]}>
              <Lock size={16} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                onSubmitEditing={handleEmailSubmit}
              />
            </View>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleEmailSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>{mode === 'signin' ? 'Sign in' : 'Create account'}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setFormError(''); clearError(); }}
              style={styles.switchModeBtn}
            >
              <Text style={[styles.switchModeText, { color: colors.textSecondary }]}>
                {mode === 'signin' ? 'New here? ' : 'Already have an account? '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {mode === 'signin' ? 'Create an account' : 'Sign in'}
                </Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.surfaceBorder }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.surfaceBorder }]} />
            </View>

            <SocialAuthButtons
              mode={mode}
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
    ...typography.body,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 10
  },
  input: { flex: 1, fontSize: 14.5 },
  submitBtn: {
    height: 50,
    borderRadius: RADII.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  switchModeBtn: { marginTop: 14, alignItems: 'center' },
  switchModeText: { fontSize: 13 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 20
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontWeight: '600' },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12
  },
  trustBadgeText: {
    fontSize: 12
  }
});

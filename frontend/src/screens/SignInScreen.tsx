import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, X } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  const { colors, accentColor, isDark } = useTheme();
  const {
    signInWithEmail,
    signInWithOAuth,
    signInAsGuest,
    authError,
    clearError
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'azure' | 'facebook' | null>(null);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: NotificationType;
  }>({ visible: false, message: '', type: 'info' });

  // Email format validation regex
  const isValidEmail = (str: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str.trim());

  const handleSignIn = async () => {
    setEmailError('');
    if (!email.trim() || !password) {
      setToast({
        visible: true,
        message: 'Please enter both your email address and password.',
        type: 'error'
      });
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address format (e.g. name@company.com).');
      setToast({
        visible: true,
        message: 'Invalid email address format (e.g. name@company.com).',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await signInWithEmail(email, password);
    setIsSubmitting(false);
    if (error) {
      setToast({
        visible: true,
        message: error.message || 'Unable to sign in. Please verify your credentials.',
        type: 'error'
      });
    }
  };

  const handleOAuth = async (provider: 'google' | 'azure' | 'facebook') => {
    setLoadingProvider(provider);
    const { error } = await signInWithOAuth(provider);
    setLoadingProvider(null);
    if (error) {
      setToast({
        visible: true,
        message: error.message || `Unable to initiate ${provider} authentication.`,
        type: 'error'
      });
    }
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
              paddingTop: Math.max(insets.top, 24) + 16,
              paddingBottom: Math.max(insets.bottom, 24) + 20
            }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Header Identity */}
          <View style={styles.header}>
            <RehearseEmblem size={52} />
            <View style={styles.brandTitleRow}>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>REHEARSE</Text>
              <Text style={[styles.periodDot, { color: accentColor }]}>.</Text>
            </View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Master difficult conversations with private executive AI.
            </Text>
          </View>

          {/* 2. Segmented Pill Tab Switcher */}
          <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.tabActive, { backgroundColor: colors.surfaceElevated, borderColor: accentColor + '40' }]}>
              <Text style={[styles.tabActiveText, { color: colors.textPrimary }]}>Sign In</Text>
            </View>
            <TouchableOpacity
              style={styles.tabInactive}
              onPress={() => navigation.navigate('SignUp')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabInactiveText, { color: colors.textSecondary }]}>Create Account</Text>
            </TouchableOpacity>
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

          {/* 3. Form Inputs */}
          <View style={styles.formContainer}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Work or Personal Email</Text>
              <View style={[
                styles.inputWrapper,
                { backgroundColor: colors.surface, borderColor: colors.border },
                emailError ? { borderColor: colors.danger } : null
              ]}>
                <Mail size={16} color={emailError ? colors.danger : colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="name@company.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (emailError) setEmailError('');
                    if (authError) clearError();
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {emailError ? (
                <Text style={{ color: colors.danger, fontSize: 11, marginTop: 4, fontFamily: typography.caption.fontFamily }}>
                  {emailError}
                </Text>
              ) : null}
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Lock size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { paddingRight: 40, color: colors.textPrimary }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (authError) clearError();
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={16} color={colors.textSecondary} />
                  ) : (
                    <Eye size={16} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotLinkContainer}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={[styles.forgotLinkText, { color: colors.textSecondary }]}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Solid Champagne Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: accentColor, shadowColor: accentColor },
                isSubmitting && styles.buttonDisabled
              ]}
              onPress={handleSignIn}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#07100D" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                  <ArrowRight size={16} color="#07100D" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* 4. Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR CONTINUE WITH</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* 5. Social OAuth Buttons - Directly invokes real provider */}
          <SocialAuthButtons
            mode="signin"
            onSelectProvider={handleOAuth}
            loadingProvider={loadingProvider}
          />

          {/* 6. Guest Mode Option */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={signInAsGuest}
            activeOpacity={0.7}
          >
            <Text style={[styles.guestButtonText, { color: accentColor }]}>Explore in Guest Demo Mode</Text>
          </TouchableOpacity>

          {/* 7. Bottom Trust Badge */}
          <View style={styles.trustBadge}>
            <ShieldCheck size={13} color={colors.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.trustBadgeText, { color: colors.textMuted }]}>Your data is private and secure.</Text>
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
    alignSelf: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12
  },
  brandTitle: {
    ...typography.brandWordmark
  },
  periodDot: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 1
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 280
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 42,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    marginBottom: 20
  },
  tabActive: {
    flex: 1,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  tabActiveText: {
    ...typography.buttonSmall,
    fontWeight: '600'
  },
  tabInactive: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabInactiveText: {
    ...typography.buttonSmall,
    fontWeight: '500'
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
    marginBottom: 14
  },
  errorText: {
    flex: 1,
    ...typography.caption
  },
  formContainer: {
    width: '100%'
  },
  inputGroup: {
    marginBottom: 14
  },
  inputLabel: {
    ...typography.caption,
    fontWeight: '500',
    marginBottom: 6
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48
  },
  inputIcon: {
    marginRight: 10
  },
  textInput: {
    flex: 1,
    ...typography.body,
    height: '100%'
  },
  eyeButton: {
    padding: 6
  },
  forgotLinkContainer: {
    alignSelf: 'flex-end',
    marginTop: 6
  },
  forgotLinkText: {
    ...typography.footnote
  },
  primaryButton: {
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  primaryButtonText: {
    color: '#07100D',
    ...typography.buttonLarge,
    fontWeight: '700'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 18
  },
  dividerLine: {
    flex: 1,
    height: 1
  },
  dividerText: {
    ...typography.overline,
    marginHorizontal: 12
  },
  guestButton: {
    marginTop: 14,
    paddingVertical: 8
  },
  guestButtonText: {
    ...typography.buttonSmall,
    fontWeight: '500'
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14
  },
  trustBadgeText: {
    ...typography.footnote
  }
});

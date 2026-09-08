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
import { ChevronLeft, User, Mail, Lock, Eye, EyeOff, Check, Circle, AlertCircle, ArrowRight, X } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { AtmosphereGlow } from '../components/brand/AtmosphereGlow';
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons';
import { InAppNotification, NotificationType } from '../components/common/InAppNotification';

interface SignUpScreenProps {
  navigation: any;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, accentColor, isDark } = useTheme();
  const {
    signUpWithEmail,
    signInWithOAuth,
    authError,
    clearError
  } = useAuth();

  const [fullName, setFullName] = useState('');
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

  // Live password validation checks
  const hasMinLength = password.length >= 8;
  const hasLetterAndNumber = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

  const handleSignUp = async () => {
    setEmailError('');
    if (!email.trim() || !password) {
      setToast({
        visible: true,
        message: 'Please provide both your email address and a password.',
        type: 'error'
      });
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email format (e.g. name@company.com)');
      setToast({
        visible: true,
        message: 'Invalid email address format (e.g. name@company.com).',
        type: 'error'
      });
      return;
    }

    if (!hasMinLength) {
      setToast({
        visible: true,
        message: 'Password must be at least 8 characters long.',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUpWithEmail(email, password, {
      fullName: fullName.trim() || undefined
    });
    setIsSubmitting(false);
    if (error) {
      setToast({
        visible: true,
        message: error.message || 'Registration failed. Please try again.',
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
        message: error.message || `Unable to initiate ${provider} registration.`,
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
              paddingTop: Math.max(insets.top, 20) + 8,
              paddingBottom: Math.max(insets.bottom, 20) + 24
            }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Nav Header */}
          <View style={styles.topNav}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <ChevronLeft size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.topBrandRow}>
              <Text style={[styles.topBrandText, { color: colors.textPrimary }]}>REHEARSE</Text>
              <Text style={[styles.topBrandDot, { color: accentColor }]}>.</Text>
            </View>

            {/* Step indicator */}
            <View style={styles.stepIndicator}>
              <View style={[styles.stepBar, { backgroundColor: accentColor, width: 18 }]} />
              <View style={[styles.stepBar, { backgroundColor: colors.border }]} />
              <View style={[styles.stepBar, { backgroundColor: colors.border }]} />
            </View>
          </View>

          {/* Title & Subtitle */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Create your account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Start practicing for the conversations that matter.
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

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <User size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="e.g. Alex Morgan"
                  placeholderTextColor={colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
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

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Lock size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { paddingRight: 40, color: colors.textPrimary }]}
                  placeholder="Create a password"
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
            </View>

            {/* Password Validation Checklist */}
            <View style={styles.checklistContainer}>
              <View style={styles.checkItem}>
                {hasMinLength ? (
                  <Check size={12} color={accentColor} style={styles.checkIcon} />
                ) : (
                  <Circle size={10} color={colors.textMuted} style={styles.checkIcon} />
                )}
                <Text style={[styles.checkText, { color: colors.textMuted }, hasMinLength && { color: colors.textPrimary, fontWeight: '600' }]}>
                  At least 8 characters
                </Text>
              </View>

              <View style={styles.checkItem}>
                {hasLetterAndNumber ? (
                  <Check size={12} color={accentColor} style={styles.checkIcon} />
                ) : (
                  <Circle size={10} color={colors.textMuted} style={styles.checkIcon} />
                )}
                <Text style={[styles.checkText, { color: colors.textMuted }, hasLetterAndNumber && { color: colors.textPrimary, fontWeight: '600' }]}>
                  One letter and one number
                </Text>
              </View>

              <View style={styles.checkItem}>
                {hasSpecialChar ? (
                  <Check size={12} color={accentColor} style={styles.checkIcon} />
                ) : (
                  <Circle size={10} color={colors.textMuted} style={styles.checkIcon} />
                )}
                <Text style={[styles.checkText, { color: colors.textMuted }, hasSpecialChar && { color: colors.textPrimary, fontWeight: '600' }]}>
                  One special character
                </Text>
              </View>
            </View>

            {/* Primary CTA */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: accentColor, shadowColor: accentColor },
                isSubmitting && styles.buttonDisabled
              ]}
              onPress={handleSignUp}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#07100D" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                  <ArrowRight size={16} color="#07100D" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR CONTINUE WITH</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Social OAuth */}
          <SocialAuthButtons
            mode="signup"
            onSelectProvider={handleOAuth}
            loadingProvider={loadingProvider}
          />

          {/* Legal Disclaimer */}
          <Text style={[styles.legalText, { color: colors.textMuted }]}>
            By creating an account, you agree to our{' '}
            <Text style={[styles.legalHighlight, { color: accentColor }]}>Terms of Service</Text> and{' '}
            <Text style={[styles.legalHighlight, { color: accentColor }]}>Privacy Policy</Text>.
          </Text>
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
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  topBrandRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  topBrandText: {
    ...typography.brandWordmarkSmall
  },
  topBrandDot: {
    fontSize: 14,
    fontWeight: '800'
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  stepBar: {
    width: 14,
    height: 2.5,
    borderRadius: 2
  },
  header: {
    width: '100%',
    marginBottom: 20
  },
  title: {
    ...typography.h1,
    marginBottom: 6
  },
  subtitle: {
    ...typography.subtitle
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
    marginBottom: 12
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
  checklistContainer: {
    marginVertical: 10,
    gap: 6
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  checkIcon: {
    width: 14,
    alignItems: 'center'
  },
  checkText: {
    ...typography.footnote
  },
  primaryButton: {
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
    marginVertical: 16
  },
  dividerLine: {
    flex: 1,
    height: 1
  },
  dividerText: {
    ...typography.overline,
    marginHorizontal: 12
  },
  legalText: {
    ...typography.footnote,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 16
  },
  legalHighlight: {
    fontWeight: '600'
  }
});

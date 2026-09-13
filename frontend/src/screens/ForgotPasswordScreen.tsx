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
import { ChevronLeft, Lock, Mail, ArrowRight, Info, CheckCircle2 } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme, RADII } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { AtmosphereGlow } from '../components/brand/AtmosphereGlow';
import { InAppNotification, NotificationType } from '../components/common/InAppNotification';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, accentColor, isDark, elevation } = useTheme();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: NotificationType;
  }>({ visible: false, message: '', type: 'info' });

  const isValidEmail = (str: string) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str.trim());

  const handleReset = async () => {
    if (!email.trim()) {
      setToast({
        visible: true,
        message: 'Please enter your account email address.',
        type: 'error'
      });
      return;
    }

    if (!isValidEmail(email)) {
      setToast({
        visible: true,
        message: 'Please enter a valid email format (e.g. name@company.com).',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await resetPassword(email);
    setIsSubmitting(false);

    if (!error) {
      setIsSent(true);
      setToast({
        visible: true,
        message: 'Reset instructions have been dispatched.',
        type: 'success'
      });
    } else {
      setToast({
        visible: true,
        message: error.message || 'Failed to dispatch reset instructions.',
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
              paddingBottom: Math.max(insets.bottom, 20) + 20
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

            <View style={{ width: 36 }} />
          </View>

          {/* Hero Lock Emblem */}
          <View style={[styles.lockAuraOuter, { backgroundColor: colors.surfaceHighlight, borderColor: accentColor + '30' }]}>
            <View style={[styles.lockAuraInner, { backgroundColor: colors.surfaceElevated, borderColor: accentColor + '60' }]}>
              <Lock size={26} color={accentColor} />
            </View>
          </View>

          {/* Title & Subtitle */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Forgot your password?</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              No worries. Enter your email and we'll send you a reset link.
            </Text>
          </View>

          {/* Form / Success */}
          {isSent ? (
            <View style={styles.successCard}>
              <CheckCircle2 size={32} color={accentColor} style={{ marginBottom: 12 }} />
              <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Reset Email Sent</Text>
              <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
                Check your inbox at <Text style={{ color: accentColor, fontWeight: '600' }}>{email}</Text> for instructions to reset your password.
              </Text>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: accentColor }]}
                onPress={() => navigation.navigate('SignIn')}
              >
                <Text style={styles.primaryButtonText}>Return to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Mail size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="name@company.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: accentColor, shadowColor: accentColor },
                  isSubmitting && styles.buttonDisabled
                ]}
                onPress={handleReset}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>Send Reset Link</Text>
                    <ArrowRight size={16} color={colors.textInverse} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Informational Callout Card */}
              <View style={[styles.infoCard, elevation.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Info size={18} color={accentColor} style={styles.infoIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>Check your inbox</Text>
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    We'll send you a link to reset your password. It may take a few minutes to arrive.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Footer Botanical Quote */}
          <View style={styles.footerQuote}>
            <Text style={[styles.quoteText, { color: colors.textMuted }]}>
              "Better conversations create better outcomes."
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
    alignSelf: 'center'
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24
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
  lockAuraOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  lockAuraInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    ...typography.subtitle,
    textAlign: 'center',
    maxWidth: 290
  },
  formContainer: {
    width: '100%'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 14
  },
  inputIcon: {
    marginRight: 10
  },
  textInput: {
    flex: 1,
    ...typography.body,
    height: '100%'
  },
  primaryButton: {
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    // elevation: 0 — Android's native elevation renders a real shadow shape
    // that can look boxy; iOS/web rely on shadow* above, Android on
    // border/tint depth instead (see ThemeContext.tsx buildElevation()).
    elevation: 0
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
    ...typography.buttonLarge,
    fontWeight: '700'
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: RADII.md,
    padding: 16,
    marginTop: 20
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2
  },
  infoTitle: {
    ...typography.h4,
    marginBottom: 4
  },
  infoText: {
    ...typography.bodySmall
  },
  successCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20
  },
  successTitle: {
    ...typography.h2,
    marginBottom: 8
  },
  successMessage: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: 20
  },
  footerQuote: {
    marginTop: 40,
    alignItems: 'center'
  },
  quoteText: {
    ...typography.quote,
    textAlign: 'center'
  }
});

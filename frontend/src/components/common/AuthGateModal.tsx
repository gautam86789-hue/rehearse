import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Mail, Lock } from 'lucide-react-native';
import { useTheme, RADII } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SocialAuthButtons } from '../auth/SocialAuthButtons';
import { RehearseEmblem } from '../brand/RehearseEmblem';

interface AuthGateModalProps {
  visible: boolean;
  onAuthenticated: () => void;
  onCancel: () => void;
}

// Shown at the one moment identity actually matters — the instant a guest
// tries to pay — rather than gating any earlier use of the app. Self-contained
// (calls signUpWithEmail/signInWithEmail directly) instead of navigating to
// the full SignUp/SignIn screens, since an already-onboarded guest sits in
// the "authenticated" branch of AppNavigator, which doesn't register those
// screens — a modal sidesteps that entirely.
export const AuthGateModal: React.FC<AuthGateModalProps> = ({ visible, onAuthenticated, onCancel }) => {
  const { colors, elevation } = useTheme();
  const { signUpWithEmail, signInWithEmail, signInWithOAuth } = useAuth();

  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'azure' | 'facebook' | null>(null);
  const [error, setError] = useState('');

  const reset = () => {
    setEmail('');
    setPassword('');
    setError('');
    setMode('signup');
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and a password to continue.');
      return;
    }
    setIsSubmitting(true);
    const { error: authErr } = mode === 'signup'
      ? await signUpWithEmail(email, password, {})
      : await signInWithEmail(email, password);
    setIsSubmitting(false);

    if (authErr) {
      setError(authErr.message || 'Something went wrong — please try again.');
      return;
    }
    reset();
    onAuthenticated();
  };

  const handleOAuth = async (provider: 'google' | 'azure' | 'facebook') => {
    setLoadingProvider(provider);
    const { error: authErr } = await signInWithOAuth(provider);
    setLoadingProvider(null);
    if (authErr) {
      setError(authErr.message || `Unable to continue with ${provider}.`);
      return;
    }
    reset();
    onAuthenticated();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      {/* Without this, opening the keyboard on Android resizes the Modal's
          native dialog window but leaves this content sized/centered for the
          original bounds — the screen behind bleeds into the gap instead of
          the card repositioning above the keyboard. Same fix already applied
          in RoleplayScreen for the same Android-specific behavior. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.card, elevation.md, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleCancel}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <RehearseEmblem size={44} style={{ marginBottom: 12 }} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            One quick step before checkout, so your Pro access and progress follow you to any device.
          </Text>

          <SocialAuthButtons onSelectProvider={handleOAuth} loadingProvider={loadingProvider} mode={mode === 'signup' ? 'signup' : 'signin'} />

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.surfaceBorder }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.surfaceBorder }]} />
          </View>

          <View style={[styles.inputRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.surfaceBorder }]}>
            <Mail size={16} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
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
            />
          </View>

          {!!error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>{mode === 'signup' ? 'Create account & continue' : 'Sign in & continue'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')} style={styles.switchModeBtn}>
            <Text style={[styles.switchModeText, { color: colors.textSecondary }]}>
              {mode === 'signup' ? 'Already have an account? ' : "New here? "}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>
                {mode === 'signup' ? 'Sign in instead' : 'Create an account'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: RADII.xl,
    borderWidth: 1,
    padding: 24
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 4,
    zIndex: 10
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 6,
    paddingRight: 24
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 11.5, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 10
  },
  input: { flex: 1, fontSize: 14 },
  errorText: { fontSize: 12.5, marginBottom: 8 },
  submitBtn: {
    height: 50,
    borderRadius: RADII.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 14.5, fontWeight: '700' },
  switchModeBtn: { marginTop: 14, alignItems: 'center' },
  switchModeText: { fontSize: 12.5 }
});

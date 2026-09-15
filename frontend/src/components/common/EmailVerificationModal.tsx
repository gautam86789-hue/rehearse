import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { MailCheck } from 'lucide-react-native';
import { useTheme, RADII } from '../../context/ThemeContext';
import { apiService } from '../../services/api';

interface EmailVerificationModalProps {
  visible: boolean;
  email: string;
  userId: string;
  onVerified: () => void;
  onCancel: () => void;
}

const RESEND_COOLDOWN_SECONDS = 60;

// Sits between sign-in and the promo code step of "going Pro" — a code was
// already sent automatically at signup (see backend authController), this
// just collects it. Not a general app-access gate: closing it (Cancel)
// simply falls through to the real payment step, same as declining a promo
// code, since verification only actually matters at redemption time.
export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  visible,
  email,
  userId,
  onVerified,
  onCancel
}) => {
  const { colors, elevation } = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // A code is already in flight from registration by the time this opens —
  // this just starts the visible cooldown to match, rather than firing a
  // second send the backend would reject anyway (60s cooldown server-side).
  useEffect(() => {
    if (visible) {
      setCode('');
      setError('');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } else if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
    }
  }, [visible]);

  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      return;
    }
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown > 0]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError('');
    try {
      await apiService.sendVerificationCode(userId, email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      setError(err?.message || 'Could not resend — try again in a moment.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Enter the 6-digit code first.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await apiService.verifyEmailCode(userId, code.trim());
      setIsSubmitting(false);
      onVerified();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Something went wrong — please try again.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {/* Same Android keyboard-overlap fix used across the other auth-flow
          cards (AuthGateModal, PromoCodeGate) — this one's a centered,
          natural-height card like those, not the AI Coach's tall fixed-
          height sliding sheet, so the same KeyboardAvoidingView approach
          that works for them works here too. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.card, elevation.md, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primarySubtle }]}>
            <MailCheck size={22} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Confirm your email</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{email}</Text>
          </Text>

          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.surfaceBorder, backgroundColor: colors.surfaceElevated }]}
            placeholder="000000"
            placeholderTextColor={colors.textMuted}
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
          />

          {!!error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

          <TouchableOpacity
            style={[styles.verifyBtn, { backgroundColor: colors.primary }]}
            onPress={handleVerify}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.verifyBtnText}>Verify</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResend} disabled={cooldown > 0 || isResending} style={styles.resendBtn}>
            <Text style={[styles.resendText, { color: cooldown > 0 ? colors.textMuted : colors.textSecondary }]}>
              {isResending ? 'Sending...' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Skip for now</Text>
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
    padding: 28
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: RADII.xl,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center'
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 8
  },
  errorText: {
    fontSize: 12.5,
    textAlign: 'center',
    marginBottom: 6
  },
  verifyBtn: {
    width: '100%',
    height: 48,
    borderRadius: RADII.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700'
  },
  resendBtn: {
    marginTop: 14,
    padding: 4
  },
  resendText: {
    fontSize: 13,
    fontWeight: '600'
  },
  cancelBtn: {
    marginTop: 10,
    padding: 4
  },
  cancelText: {
    fontSize: 12.5,
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ticket, X } from 'lucide-react-native';
import { useTheme, RADII } from '../../context/ThemeContext';

interface PromoCodeGateProps {
  visible: boolean;
  onRedeem: (code: string) => Promise<{ error?: string }>;
  onNoCode: () => void;
  rehearsalsRemaining?: number;
}

export const PromoCodeGate: React.FC<PromoCodeGateProps> = ({ visible, onRedeem, onNoCode, rehearsalsRemaining = 3 }) => {
  const { colors, elevation } = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSkip = rehearsalsRemaining > 0 || rehearsalsRemaining === 999999;

  const handleClose = () => {
    if (!canSkip && rehearsalsRemaining <= 0) return;
    setCode('');
    setError('');
    onNoCode();
  };

  const handleRedeem = async () => {
    if (!code.trim()) {
      setError('Please enter an access code.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const result = await onRedeem(code.trim());
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setCode('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.card, elevation.md, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
          {canSkip && (
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleClose}
              hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          <View style={[styles.iconCircle, { backgroundColor: colors.primarySubtle }]}>
            <Ticket size={22} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {canSkip ? 'Unlock Rehearse Access' : 'Access Locked'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {rehearsalsRemaining > 10 || rehearsalsRemaining === 999999
              ? 'Enter an access code to extend your Pro access.'
              : canSkip
              ? `Enter an access code to unlock Pro access, or try your ${rehearsalsRemaining} free rehearsals.`
              : 'You have used all 3 free rehearsals. Enter an access code to unlock full access.'}
          </Text>

          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.surfaceBorder, backgroundColor: colors.surfaceElevated }]}
            placeholder="ENTER ACCESS CODE"
            placeholderTextColor={colors.textMuted}
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          {!!error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

          <TouchableOpacity
            style={[styles.redeemBtn, { backgroundColor: colors.primary }]}
            onPress={handleRedeem}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.redeemBtnText}>Redeem Code</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClose} style={styles.noCodeBtn} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
            <Text style={[styles.noCodeText, { color: colors.textSecondary }]}>
              {rehearsalsRemaining > 10 || rehearsalsRemaining === 999999
                ? 'Close'
                : canSkip
                ? `Try ${rehearsalsRemaining} Free Rehearsal${rehearsalsRemaining > 1 ? 's' : ''}`
                : 'Close'}
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
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 4,
    zIndex: 10
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
    height: 48,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 8
  },
  errorText: {
    fontSize: 12.5,
    textAlign: 'center',
    marginBottom: 6
  },
  redeemBtn: {
    width: '100%',
    height: 48,
    borderRadius: RADII.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  redeemBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700'
  },
  noCodeBtn: {
    marginTop: 14,
    padding: 4
  },
  noCodeText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});

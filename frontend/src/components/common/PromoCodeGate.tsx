import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ticket } from 'lucide-react-native';
import { useTheme, RADII } from '../../context/ThemeContext';

interface PromoCodeGateProps {
  visible: boolean;
  onRedeem: (code: string) => Promise<{ error?: string }>;
  onNoCode: () => void;
}

// Sits between sign-in and the real (store-billed) paywall — a Shipaton
// judging-window / tester shortcut, not part of the normal purchase flow.
// Someone with a code skips payment details entirely; everyone else taps
// "No code" and falls through to the paywall exactly as before.
export const PromoCodeGate: React.FC<PromoCodeGateProps> = ({ visible, onRedeem, onNoCode }) => {
  const { colors, elevation } = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) {
      setError('Enter a code first.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const result = await onRedeem(code.trim());
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, elevation.md, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primarySubtle }]}>
            <Ticket size={22} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Have a code?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Redeem it for free access — no card required.
          </Text>

          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.surfaceBorder, backgroundColor: colors.surfaceElevated }]}
            placeholder="Enter code"
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
            {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.redeemBtnText}>Redeem</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={onNoCode} style={styles.noCodeBtn} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
            <Text style={[styles.noCodeText, { color: colors.textSecondary }]}>No code</Text>
          </TouchableOpacity>
        </View>
      </View>
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

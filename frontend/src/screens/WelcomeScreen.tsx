import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Target, TrendingUp } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { RehearseEmblem } from '../components/brand/RehearseEmblem';

interface WelcomeScreenProps {
  navigation: any;
}

// Three visual cues instead of a paragraph: talk it out, get scored, improve.
const CUES = [
  { icon: MessageCircle, label: 'Practice' },
  { icon: Target, label: 'Get scored' },
  { icon: TrendingUp, label: 'Improve' }
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const goSignIn = () => navigation?.navigate?.('SignIn');

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 24) }]}>
      <View style={styles.center}>
        <RehearseEmblem size={64} />
        <View style={styles.wordmarkRow}>
          <Text style={[styles.wordmark, { color: colors.textPrimary }]}>REHEARSE</Text>
          <Text style={[styles.wordmark, { color: colors.primary }]}>.</Text>
        </View>
        <Text style={[styles.headline, { color: colors.textPrimary }]}>
          Practice hard conversations{'\n'}
          <Text style={{ color: colors.primary }}>before they happen.</Text>
        </Text>

        <View style={styles.cueRow}>
          {CUES.map(({ icon: Icon, label }) => (
            <View key={label} style={styles.cue}>
              <View style={[styles.cueCircle, { backgroundColor: colors.primarySubtle }]}>
                <Icon size={18} color={colors.primary} />
              </View>
              <Text style={[styles.cueLabel, { color: colors.textSecondary }]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={goSignIn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Get Started"
        >
          <Text style={styles.buttonText}>Get started</Text>
        </TouchableOpacity>
        <Text style={[styles.legal, { color: colors.textMuted }]}>
          By continuing you agree to our{' '}
          <Text style={{ color: colors.textSecondary, fontWeight: '700' }} onPress={() => navigation?.navigate?.('TermsOfService')}>
            Terms
          </Text>{' '}
          and{' '}
          <Text style={{ color: colors.textSecondary, fontWeight: '700' }} onPress={() => navigation?.navigate?.('PrivacyPolicy')}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  wordmarkRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12, marginBottom: 36 },
  wordmark: { fontSize: 15, fontWeight: '800', letterSpacing: 3 },
  headline: { fontSize: 32, fontWeight: '800', textAlign: 'center', lineHeight: 40, letterSpacing: -0.8 },
  cueRow: { flexDirection: 'row', gap: 24, marginTop: 36 },
  cue: { alignItems: 'center', gap: 6 },
  cueCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cueLabel: { fontSize: 11.5, fontWeight: '600' },
  bottom: { paddingHorizontal: 24, alignItems: 'center' },
  button: { height: 54, borderRadius: 27, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  legal: { fontSize: 11, textAlign: 'center', marginTop: 14, lineHeight: 16 }
});

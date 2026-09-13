import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface TermsOfServiceScreenProps {
  navigation: any;
}

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. What Rehearse is',
    body: 'Rehearse lets you practice difficult professional conversations against an AI counterpart before having them for real. It is a training tool — nothing you say to the AI counterpart is a substitute for professional, legal, medical, or financial advice.'
  },
  {
    title: '2. Your account',
    body: 'You can use most of Rehearse without an account. Once you create one, you are responsible for keeping your login credentials secure and for all activity under your account. You must be old enough to consent to these terms under the laws of your country, and in any case not under 13.'
  },
  {
    title: '3. Subscriptions and billing',
    body: 'Paid plans are billed and managed entirely through the app store you subscribed on (Google Play, Apple App Store, or Samsung Galaxy Store) — Rehearse never stores your card details. Cancel, manage, or refund a subscription through that store\'s own subscription settings, not through Rehearse directly. Free trial terms are shown before you subscribe.'
  },
  {
    title: '4. What you send us',
    body: 'Rehearsal transcripts, scenario descriptions, and messages you send to the AI counterpart or AI coach are processed by our AI provider to generate responses and scoring. Do not enter real confidential information (trade secrets, other people\'s personal data, passwords) into a rehearsal — treat it like a practice conversation, not a secure vault.'
  },
  {
    title: '5. Acceptable use',
    body: 'Don\'t use Rehearse to generate content that harasses, threatens, or impersonates a real person without consent, and don\'t attempt to reverse-engineer, scrape, or resell the service.'
  },
  {
    title: '6. Changes',
    body: 'We may update these terms as the app evolves. Continuing to use Rehearse after an update means you accept the revised terms.'
  },
  {
    title: '7. Contact',
    body: 'Questions about these terms can be sent to the support address listed in the app\'s Help & Support section.'
  }
];

export const TermsOfServiceScreen: React.FC<TermsOfServiceScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 8, borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Terms of Service</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 24 }]}>
        <Text style={[styles.updated, { color: colors.textMuted }]}>Last updated September 2026</Text>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{section.title}</Text>
            <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 16.5, fontWeight: '700', letterSpacing: -0.2 },
  scrollContent: { paddingHorizontal: 22, paddingTop: 20 },
  updated: { fontSize: 12, marginBottom: 20 },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  sectionBody: { fontSize: 13.5, lineHeight: 20 }
});

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface PrivacyPolicyScreenProps {
  navigation: any;
}

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. What we collect',
    body: 'If you create an account: your name and email address. Either way (guest or signed in): the rehearsals you complete, your streak and milestone progress, and the scenario/message text you send during a rehearsal or to the AI coach.'
  },
  {
    title: '2. How your rehearsal content is used',
    body: 'The text of your rehearsal conversations and coach messages is sent to our AI provider (currently Google Gemini) to generate the AI counterpart\'s replies and your scorecard. It is not used to train the AI provider\'s models under our current agreement with them, and is not sold to advertisers or data brokers.'
  },
  {
    title: '3. Payment information',
    body: 'Rehearse never sees or stores your card details. Subscriptions are billed by Google Play, Apple, or Samsung Galaxy Store directly, and payment processing is entirely handled by that store — we only receive confirmation that a subscription is active, via RevenueCat.'
  },
  {
    title: '4. Guest mode',
    body: 'You can use Rehearse without creating an account. In that mode, your data is tied to a random identifier stored on your device, not to your identity — but it also means your progress won\'t follow you to a new device until you create an account.'
  },
  {
    title: '5. Data retention and deletion',
    body: 'Your account data is kept for as long as your account is active. You can request deletion of your account and associated data at any time from Settings, or by contacting support.'
  },
  {
    title: '6. Children',
    body: 'Rehearse is not directed at children under 13, and we do not knowingly collect data from anyone under that age.'
  },
  {
    title: '7. Changes to this policy',
    body: 'If this policy changes in a material way, we\'ll surface that in the app rather than only updating this page silently.'
  },
  {
    title: '8. Contact',
    body: 'Questions about your data can be sent to the support address listed in the app\'s Help & Support section.'
  }
];

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 8, borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Privacy Policy</Text>
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

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ArrowLeft, ChevronDown, Mail, MessageCircleQuestion, Shield } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, RADII } from '../context/ThemeContext';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How does scoring actually work?',
    answer:
      'Each rehearsal is scored on four dimensions — Clarity, Empathy, Assertiveness, and Listening — based on what you actually said in the conversation, not a generic template. The AI counterpart responds in character, and your scorecard reflects how you handled the specific pushback it gave you.'
  },
  {
    question: 'What happens when my free rehearsals run out?',
    answer:
      'You get 2 free rehearsals to try the app. After that, Go Pro unlocks unlimited rehearsals, Guided Practice, Detailed Feedback, and What to Say Next. You can start a free trial any time from the Profile tab.'
  },
  {
    question: 'Is my conversation data private?',
    answer:
      'Yes. Your rehearsals and scores are stored on your device and used only to personalize your own practice and the AI Assistant\'s coaching — they are never shared or used to identify you publicly.'
  },
  {
    question: 'Can I change my focus area after onboarding?',
    answer:
      'Not yet from Settings directly — for now, signing out and completing onboarding again lets you pick a different focus (Founder/Investor, New Manager, MBA Student, or Professional), which updates your scenarios and Learn content.'
  },
  {
    question: 'How do streaks and milestones work?',
    answer:
      'Your streak counts consecutive days you complete a rehearsal or daily challenge. Milestones unlock automatically as you use the app — some as early as finishing onboarding — and each one is confirmed in your Notifications and Milestones tab.'
  },
  {
    question: 'What is the AI Assistant, and does it know my history?',
    answer:
      'Tap the floating sparkle icon on any screen. It has context on your persona, streak, and recent rehearsal scores, so it can point out real patterns in how you communicate — and it can help you draft a reply to a real message if you describe the situation.'
  }
];

export const HelpSupportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, elevation } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Help & Support</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.introCard, { backgroundColor: colors.primarySubtle }]}>
          <MessageCircleQuestion size={20} color={colors.primary} />
          <Text style={[styles.introText, { color: colors.primary }]}>
            Answers to the most common questions — or reach us directly below.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>FREQUENTLY ASKED</Text>
        <View style={styles.faqList}>
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <View
                key={idx}
                style={[styles.faqCard, elevation.sm, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}
              >
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => setOpenIndex(isOpen ? null : idx)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>{item.question}</Text>
                  <ChevronDown
                    size={16}
                    color={colors.textMuted}
                    style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>
                {isOpen && (
                  <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{item.answer}</Text>
                )}
              </View>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>STILL NEED HELP</Text>
        <TouchableOpacity
          style={[styles.contactRow, elevation.sm, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}
          onPress={() => Linking.openURL('mailto:support@rehearse.ai')}
          activeOpacity={0.7}
        >
          <View style={[styles.contactIcon, { backgroundColor: colors.primarySubtle }]}>
            <Mail size={17} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.contactTitle, { color: colors.textPrimary }]}>Email Support</Text>
            <Text style={[styles.contactSub, { color: colors.textSecondary }]}>support@rehearse.ai — replies within 24 hours</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.contactRow, elevation.sm, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
          <View style={[styles.contactIcon, { backgroundColor: colors.sageSubtle }]}>
            <Shield size={17} color={colors.sage} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.contactTitle, { color: colors.textPrimary }]}>Privacy & Data</Text>
            <Text style={[styles.contactSub, { color: colors.textSecondary }]}>See exactly what's stored and how it's used</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('PrivacyData')}>
            <Text style={[styles.contactLink, { color: colors.primary }]}>View</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12
  },
  headerBtn: {
    padding: 6
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20
  },
  introText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#9CA3AF',
    marginBottom: 10
  },
  faqList: {
    gap: 10
  },
  faqCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 14
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  faqQuestion: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700'
  },
  faqAnswer: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 10
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10
  },
  contactIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contactTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2
  },
  contactSub: {
    fontSize: 11.5
  },
  contactLink: {
    fontSize: 12.5,
    fontWeight: '700'
  }
});

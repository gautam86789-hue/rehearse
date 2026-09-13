import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Copy, MessageCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Scorecard, Scenario } from '../types';

type Tab = 'phrases' | 'alternatives' | 'avoid';

export const WhatToSayScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { scorecard, scenario } = route.params as { scorecard: Scorecard; scenario: Scenario };
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>('phrases');
  // Custom header had a flat paddingTop:20 with no safe-area handling — on
  // edge-to-edge Android that put the title/back-button under the status bar.
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const rewrite = scorecard.weakestLineRewrite;
  const keyPhrases = [
    rewrite?.suggestedRewrite,
    "I can't commit to this without changing some current priorities.",
    "Let's decide together what we should deprioritize."
  ].filter(Boolean) as string[];

  const alternatives = [
    rewrite?.originalLine ? `Instead of: "${rewrite.originalLine}"` : undefined,
    'Try leading with the outcome you want before the context.',
    'Pause after stating your position — let silence do some of the work.'
  ].filter(Boolean) as string[];

  const wordsToAvoid = scenario.brief?.keyPhrasesToAvoid || [];

  const tabContent = tab === 'phrases' ? keyPhrases : tab === 'alternatives' ? alternatives : wordsToAvoid;

  const handleCopy = async (text: string) => {
    try {
      if (Platform.OS === 'web' && navigator?.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch (e) {
      // clipboard unavailable — non-critical
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>What to Say Next</Text>
        <View style={[styles.proBadge, { backgroundColor: colors.champagne }]}>
          <Text style={styles.proBadgeText}>Pro</Text>
        </View>
      </View>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Personalized suggestions based on your conversation.
      </Text>

      <View style={[styles.tabRow, { backgroundColor: colors.surfaceHighlight }]}>
        {(['phrases', 'alternatives', 'avoid'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabPill, tab === t && { backgroundColor: colors.surfaceCard }]}
          >
            <Text style={[styles.tabPillText, { color: tab === t ? colors.primary : colors.textSecondary }]}>
              {t === 'phrases' ? 'Key Phrases' : t === 'alternatives' ? 'Alternatives' : 'Words to Avoid'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Setting a Clear Boundary</Text>

        <View style={styles.phraseList}>
          {tabContent.map((phrase, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.phraseCard, { backgroundColor: colors.primarySubtle }]}
              onPress={() => handleCopy(phrase)}
              activeOpacity={0.8}
            >
              <Text style={[styles.phraseText, { color: colors.textPrimary }]}>"{phrase}"</Text>
              <Copy size={15} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.whyCard, { backgroundColor: colors.surfaceHighlight }]}>
          <View style={[styles.whyIconCircle, { backgroundColor: colors.primarySubtle }]}>
            <MessageCircle size={16} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.whyTitle, { color: colors.textPrimary }]}>Why this works</Text>
            <Text style={[styles.whyBody, { color: colors.textSecondary }]}>
              {rewrite?.coachingRationale ||
                'These phrases acknowledge their perspective, set a clear boundary, and move toward a solution.'}
            </Text>
          </View>
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
    paddingBottom: 4
  },
  headerBtn: {
    padding: 6
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  proBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  subtitle: {
    fontSize: 12.5,
    paddingHorizontal: 20,
    marginBottom: 14
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16
  },
  tabPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center'
  },
  tabPillText: {
    fontSize: 11.5,
    fontWeight: '700'
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12
  },
  phraseList: {
    gap: 10,
    marginBottom: 20
  },
  phraseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 14,
    gap: 10
  },
  phraseText: {
    fontSize: 13.5,
    lineHeight: 19,
    flex: 1,
    fontStyle: 'italic'
  },
  whyCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14
  },
  whyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  whyTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3
  },
  whyBody: {
    fontSize: 12.5,
    lineHeight: 18
  }
});

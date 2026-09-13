import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Scorecard, Scenario } from '../types';

type Tab = 'summary' | 'improve' | 'say';

export const DetailedFeedbackScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { scorecard, scenario } = route.params as { scorecard: Scorecard; scenario: Scenario };
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>('summary');
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Detailed Feedback</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={[styles.tabRow, { borderBottomColor: colors.surfaceBorder }]}>
        {(['summary', 'improve', 'say'] as Tab[]).map((t) => (
          <TouchableOpacity key={t} onPress={() => (t === 'say' ? navigation.navigate('WhatToSay', { scorecard, scenario }) : setTab(t))} style={styles.tabItem}>
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.textMuted }]}>
              {t === 'summary' ? 'Summary' : t === 'improve' ? 'What to Improve' : 'What to Say'}
            </Text>
            {tab === t && <View style={[styles.tabUnderline, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Your Strengths</Text>
        <View style={styles.list}>
          {(scorecard.strengths || []).map((s, idx) => (
            <View
              key={idx}
              style={[styles.listRow, { backgroundColor: colors.sageSubtle, borderColor: colors.sage + '40' }]}
            >
              <CheckCircle2 size={17} color={colors.success} />
              <Text style={[styles.listText, { color: colors.textPrimary }]}>{s}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionHeading, { color: colors.textPrimary, marginTop: 22 }]}>Areas to Improve</Text>
        <View style={styles.list}>
          {(scorecard.growthAreas || []).map((g, idx) => (
            <View
              key={idx}
              style={[styles.listRow, { backgroundColor: colors.champagneSubtle, borderColor: colors.champagne + '40' }]}
            >
              <AlertTriangle size={17} color={colors.warning} />
              <Text style={[styles.listText, { color: colors.textPrimary }]}>{g}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.coachCard, { backgroundColor: colors.surfaceHighlight }]}>
          <View style={styles.coachHeaderRow}>
            <Lightbulb size={16} color={colors.champagneDark} />
            <Text style={[styles.coachTitle, { color: colors.textPrimary }]}>Coach's Summary</Text>
          </View>
          <Text style={[styles.coachBody, { color: colors.textSecondary }]}>
            {scorecard.keyTakeaways?.[0] ||
              'You showed composure and kept the conversation respectful. Focus on maintaining your boundary even when the other person becomes defensive.'}
          </Text>
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
    fontSize: 18,
    fontWeight: '800'
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    gap: 20
  },
  tabItem: {
    paddingBottom: 10
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700'
  },
  tabUnderline: {
    height: 2.5,
    borderRadius: 2,
    marginTop: 8
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10
  },
  list: {
    gap: 10
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12
  },
  listText: {
    fontSize: 13.5,
    lineHeight: 19,
    flex: 1
  },
  coachCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 24
  },
  coachHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  coachTitle: {
    fontSize: 13.5,
    fontWeight: '700'
  },
  coachBody: {
    fontSize: 13,
    lineHeight: 19
  }
});

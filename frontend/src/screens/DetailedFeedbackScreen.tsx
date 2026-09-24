import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Scorecard, Scenario } from '../types';

type Tab = 'summary' | 'improve' | 'say';

const METRICS = [
  { key: 'clarity', label: 'Clarity' },
  { key: 'empathy', label: 'Empathy' },
  { key: 'assertiveness', label: 'Assertive' },
  { key: 'listening', label: 'Listening' }
];

export const DetailedFeedbackScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { scorecard, scenario } = route.params as { scorecard: Scorecard; scenario: Scenario };
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>('summary');
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
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
        {tab === 'summary' ? (
          <>
            {/* SUMMARY — the overall picture: how it went, what worked, what to remember */}
            <View style={[styles.scoreCard, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>OVERALL</Text>
                <Text style={[styles.scoreValue, { color: colors.textPrimary }]}>
                  {scorecard.overallScore}
                  <Text style={[styles.scoreOutOf, { color: colors.textMuted }]}>/100</Text>
                </Text>
              </View>
              <View style={styles.metricCol}>
                {METRICS.map((m) => (
                  <View key={m.key} style={styles.metricRow}>
                    <Text style={[styles.metricName, { color: colors.textSecondary }]}>{m.label}</Text>
                    <View style={[styles.metricTrack, { backgroundColor: colors.surfaceBorder }]}>
                      <View
                        style={[
                          styles.metricFill,
                          { backgroundColor: colors.primary, width: `${Math.max(4, Math.min(100, (scorecard as any)[m.key] || 0))}%` }
                        ]}
                      />
                    </View>
                    <Text style={[styles.metricNum, { color: colors.textPrimary }]}>{(scorecard as any)[m.key]}</Text>
                  </View>
                ))}
              </View>
            </View>

            {!!scorecard.strengths?.length && (
              <>
                <Text style={[styles.sectionHeading, { color: colors.textPrimary, marginTop: 22 }]}>What went well</Text>
                <View style={styles.list}>
                  {scorecard.strengths.map((st, idx) => (
                    <View
                      key={idx}
                      style={[styles.listRow, { backgroundColor: colors.sageSubtle, borderColor: colors.sage + '40' }]}
                    >
                      <CheckCircle2 size={17} color={colors.success} />
                      <Text style={[styles.listText, { color: colors.textPrimary }]}>{st}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {!!scorecard.keyTakeaways?.length && (
              <View style={[styles.coachCard, { backgroundColor: colors.surfaceHighlight }]}>
                <View style={styles.coachHeaderRow}>
                  <Lightbulb size={16} color={colors.champagneDark} />
                  <Text style={[styles.coachTitle, { color: colors.textPrimary }]}>Key takeaways</Text>
                </View>
                {scorecard.keyTakeaways.map((k, idx) => (
                  <Text key={idx} style={[styles.coachBody, { color: colors.textSecondary, marginTop: idx ? 8 : 0 }]}>
                    {'\u2022  '}
                    {k}
                  </Text>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            {/* WHAT TO IMPROVE — specific things to change, and your weakest line reworked */}
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Focus on these next</Text>
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

            {!!scorecard.weakestLineRewrite?.originalLine && (
              <>
                <Text style={[styles.sectionHeading, { color: colors.textPrimary, marginTop: 22 }]}>Your weakest moment</Text>
                <View style={[styles.rewriteCard, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
                  <Text style={[styles.rewriteTag, { color: colors.textMuted }]}>YOU SAID</Text>
                  <Text style={[styles.rewriteOld, { color: colors.textSecondary }]}>
                    "{scorecard.weakestLineRewrite.originalLine}"
                  </Text>
                  <Text style={[styles.rewriteTag, { color: colors.success, marginTop: 14 }]}>TRY INSTEAD</Text>
                  <Text style={[styles.rewriteNew, { color: colors.textPrimary }]}>
                    "{scorecard.weakestLineRewrite.suggestedRewrite}"
                  </Text>
                  {!!scorecard.weakestLineRewrite.coachingRationale && (
                    <Text style={[styles.coachBody, { color: colors.textSecondary, marginTop: 12 }]}>
                      {scorecard.weakestLineRewrite.coachingRationale}
                    </Text>
                  )}
                  {!!scorecard.weakestLineRewrite.techniqueApplied && (
                    <View style={[styles.techniquePill, { backgroundColor: colors.primarySubtle }]}>
                      <Text style={{ color: colors.primary, fontSize: 11.5, fontWeight: '700' }}>
                        {scorecard.weakestLineRewrite.techniqueApplied}
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </>
        )}
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
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 16
  },
  scoreLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  scoreValue: { fontSize: 44, fontWeight: '800', letterSpacing: -1 },
  scoreOutOf: { fontSize: 15, fontWeight: '600' },
  metricCol: { flex: 1.5, gap: 8 },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricName: { width: 62, fontSize: 11.5, fontWeight: '600' },
  metricTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  metricFill: { height: 6, borderRadius: 3 },
  metricNum: { width: 24, fontSize: 11.5, fontWeight: '700', textAlign: 'right' },
  rewriteCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  rewriteTag: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8, marginBottom: 4 },
  rewriteOld: { fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  rewriteNew: { fontSize: 14.5, lineHeight: 21, fontWeight: '600' },
  techniquePill: { alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }
});

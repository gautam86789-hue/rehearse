import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, HelpCircle, CheckCircle2, XCircle, Users } from 'lucide-react-native';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { apiService } from '../services/api';
import { DailyPuzzle } from '../types';
import { useApp } from '../context/AppContext';

export const DailyPuzzleScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { puzzle } = route.params as { puzzle: DailyPuzzle };
  const { user, refreshProfile } = useApp();
  const { colors } = useTheme();

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitChoice = async (optionId: string) => {
    if (submissionResult || isSubmitting) return;
    setSelectedOptionId(optionId);
    setIsSubmitting(true);

    try {
      const res = await apiService.submitDailyPuzzle({
        userId: user.id,
        puzzleId: puzzle.id,
        selectedOptionId: optionId
      });
      if (res?.result) {
        setSubmissionResult(res.result);
        refreshProfile();
      }
    } catch (e) {
      // Local fallback
      const chosen = puzzle.options.find((o) => o.id === optionId);
      setSubmissionResult({
        isOptimal: chosen?.isOptimal || false,
        score: chosen?.score || 50,
        explanation: chosen?.explanation || 'Evaluation completed.',
        strategyLabel: chosen?.strategyLabel || 'Strategy',
        xpAwarded: chosen?.isOptimal ? 25 : 10,
        communityDistribution: puzzle.communityDistribution
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>Daily Tricky Puzzle</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Badge */}
        <View style={styles.badgeRow}>
          <View style={[styles.puzzleTag, { backgroundColor: colors.primarySubtle, borderColor: colors.primary }]}>
            <HelpCircle size={13} color={colors.primary} />
            <Text style={[typography.tag, { color: colors.primary }]}>1-TURN HIGH STAKES DILEMMA</Text>
          </View>
        </View>

        <Text style={[typography.hero, { color: colors.textPrimary, marginBottom: 6 }]}>{puzzle.title}</Text>
        <Text style={[typography.subtitle, { color: colors.textSecondary, marginBottom: 16 }]}>{puzzle.scenarioContext}</Text>

        {/* Counterpart Opening Line */}
        <Card variant="highlight" style={styles.counterpartCard}>
          <Text style={[typography.overline, { color: colors.primary, marginBottom: 6 }]}>THE COUNTERPART SAYS:</Text>
          <Text style={[typography.h3, { color: colors.textPrimary, fontStyle: 'italic', lineHeight: 24 }]}>"{puzzle.counterpartOpeningLine}"</Text>
        </Card>

        {/* Question Prompt */}
        <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: 12 }]}>What is the strategically optimal response?</Text>

        {/* Options List */}
        <View style={styles.optionsList}>
          {puzzle.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const showFeedback = !!submissionResult;

            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionCard,
                  { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder },
                  isSelected && { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
                  showFeedback && opt.isOptimal && { borderColor: colors.sage, backgroundColor: colors.sageSubtle },
                  showFeedback && isSelected && !opt.isOptimal && { borderColor: colors.error, backgroundColor: colors.rubySubtle }
                ]}
                activeOpacity={0.85}
                onPress={() => handleSubmitChoice(opt.id)}
                disabled={!!submissionResult}
              >
                <View style={styles.optionHeaderRow}>
                  <Text
                    style={[
                      typography.tag,
                      { color: colors.textSecondary },
                      showFeedback && opt.isOptimal && { color: colors.sage }
                    ]}
                  >
                    {opt.strategyLabel}
                  </Text>
                  {showFeedback && (
                    opt.isOptimal ? (
                      <CheckCircle2 size={18} color={colors.sage} />
                    ) : isSelected ? (
                      <XCircle size={18} color={colors.error} />
                    ) : null
                  )}
                </View>

                <Text style={[typography.body, { color: colors.textPrimary }]}>"{opt.responseText}"</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Submission Feedback */}
        {submissionResult && (
          <Card
            variant={submissionResult.isOptimal ? 'forest' : 'flame'}
            style={styles.resultCard}
          >
            <View style={styles.resultHeader}>
              <View style={styles.resultIconWrap}>
                {submissionResult.isOptimal ? (
                  <CheckCircle2 size={24} color={colors.sage} />
                ) : (
                  <XCircle size={24} color={colors.ruby} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.h3, { color: colors.textPrimary }]}>
                  {submissionResult.isOptimal ? 'Masterclass Choice! (+25 XP)' : 'Suboptimal Strategy (+10 XP)'}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Score: {submissionResult.score}/100</Text>
              </View>
            </View>

            <Text style={[typography.body, { color: colors.textPrimary, marginBottom: 12 }]}>{submissionResult.explanation}</Text>

            {/* Community Comparison Stats */}
            <View style={[styles.communityBox, { backgroundColor: colors.surfaceElevated }]}>
              <View style={styles.communityHeader}>
                <Users size={14} color={colors.textSecondary} />
                <Text style={[typography.tag, { color: colors.textSecondary }]}>HOW OTHERS ANSWERED TODAY</Text>
              </View>
              <View style={styles.distRow}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Option A: {puzzle.communityDistribution.optionA}%</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Option B: {puzzle.communityDistribution.optionB}%</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Option C: {puzzle.communityDistribution.optionC}%</Text>
              </View>
            </View>

            <Button
              title="Return to Home Hub"
              variant="primary"
              onPress={() => navigation.navigate('HomeTabs')}
              style={{ marginTop: 14 }}
            />
          </Card>
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
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  headerBtn: {
    padding: 6
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40
  },
  badgeRow: {
    marginBottom: 8
  },
  puzzleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6
  },
  counterpartCard: {
    padding: 16,
    marginBottom: 20
  },
  optionsList: {
    gap: 12,
    marginBottom: 20
  },
  optionCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14
  },
  optionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  resultCard: {
    padding: 16,
    marginBottom: 20
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },
  resultIconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  communityBox: {
    borderRadius: 8,
    padding: 10,
    marginTop: 4
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  distRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});

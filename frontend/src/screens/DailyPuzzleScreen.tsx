import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Users, Share2 } from 'lucide-react-native';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useTheme, RADII } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { apiService } from '../services/api';
import { DailyPuzzle } from '../types';
import { useApp } from '../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPuzzleHeroImage } from '../data/generatedImages';
import { useShareCard } from '../components/share/useShareCard';
import { DailyPuzzleShareCard } from '../components/share/DailyPuzzleShareCard';
import { localDateKey } from '../utils/dates';

const WEEK_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function todayIso(): string {
  return localDateKey();
}

export const DailyPuzzleScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { user, setUser, refreshProfile } = useApp();
  const { colors, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(route.params?.puzzle || null);
  const [isLoadingPuzzle, setIsLoadingPuzzle] = useState(!route.params?.puzzle);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { viewShotRef, isSharing, share } = useShareCard();

  useEffect(() => {
    if (!puzzle) {
      apiService
        .getDailyPuzzle(user.audience || 'professionals')
        .then((res) => setPuzzle(res.puzzle))
        .finally(() => setIsLoadingPuzzle(false));
    }
  }, []);

  // Already done today? Show exactly what was picked and the result again —
  // the challenge doesn't reset until tomorrow.
  useEffect(() => {
    const saved = user.puzzleResults?.[todayIso()];
    if (saved && !submissionResult) {
      setSelectedOptionId(saved.selectedOptionId);
      setSubmissionResult(saved.result);
    }
  }, [user.puzzleResults, puzzle?.id]);

  // Marks today complete on the week row for real, regardless of whether the
  // score-based `refreshProfile` call below succeeds — this is the one thing
  // that must always persist the instant a choice is submitted.
  const markTodayCompleted = (optionId: string, result: any) => {
    const today = todayIso();
    setUser((prev) => {
      const existing = prev.completedPuzzleDates || [];
      const results = { ...(prev.puzzleResults || {}) };
      if (!results[today] && puzzle) {
        results[today] = { puzzleId: puzzle.id, selectedOptionId: optionId, result };
      }
      return {
        ...prev,
        completedPuzzleDates: existing.includes(today) ? existing : [...existing, today].slice(-90),
        puzzleResults: results
      };
    });
  };

  const handleSubmitChoice = async (optionId: string) => {
    if (!puzzle || submissionResult || isSubmitting) return;
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
        markTodayCompleted(optionId, res.result);
        refreshProfile();
      }
    } catch (e) {
      const chosen = puzzle.options.find((o) => o.id === optionId);
      const fallbackResult = {
        isOptimal: chosen?.isOptimal || false,
        score: chosen?.score || 50,
        explanation: chosen?.explanation || 'Evaluation completed.',
        strategyLabel: chosen?.strategyLabel || 'Strategy',
        xpAwarded: chosen?.isOptimal ? 25 : 10,
        communityDistribution: puzzle.communityDistribution
      };
      setSubmissionResult(fallbackResult);
      markTodayCompleted(optionId, fallbackResult);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPuzzle || !puzzle) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const todayIndex = new Date().getDay();
  const completedDates = new Set(user.completedPuzzleDates || []);
  const pickedLetter = (['A', 'B', 'C'] as const)[
    Math.max(0, puzzle.options.findIndex((o) => o.id === selectedOptionId))
  ];
  // This calendar week's actual dates (Sun→Sat), so each dot checks real
  // completion data instead of approximating "the last N days" from streak.
  const weekDates = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - todayIndex + idx);
    return localDateKey(d);
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.surfaceBorder, paddingTop: topPadding }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>Today's Challenge</Text>
        {/* No right action — the week's completion is already shown inline
            below via the streak dots. Spacer keeps the title centered. */}
        <View style={styles.headerBtn}>
          <View style={{ width: 19, height: 19 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero — real landscape photo with quote overlay */}
        <View style={styles.heroCard}>
          <Image source={getPuzzleHeroImage(puzzle.id)} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroBottomRow}>
            <Text style={styles.heroQuote} numberOfLines={2}>"{puzzle.title}"</Text>
            <View style={styles.heroArrowCircle}>
              <ArrowRight size={16} color={colors.primary} />
            </View>
          </View>
        </View>

        {/* Week streak dots */}
        <View style={styles.weekRow}>
          {WEEK_LABELS.map((label, idx) => {
            const isToday = idx === todayIndex;
            const isCompleted = completedDates.has(weekDates[idx]);
            return (
              <View key={idx} style={styles.weekDayColumn}>
                <Text style={[styles.weekDayLabel, { color: colors.textMuted }]}>{label}</Text>
                <View
                  style={[
                    styles.weekDot,
                    { borderColor: colors.surfaceBorder, backgroundColor: colors.surfaceCard },
                    isCompleted && { backgroundColor: colors.success, borderColor: colors.success },
                    isToday && { borderColor: colors.primary, borderWidth: 2 }
                  ]}
                >
                  {isCompleted && <CheckCircle2 size={12} color="#FFFFFF" />}
                </View>
              </View>
            );
          })}
        </View>

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
                  elevation.sm,
                  { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder },
                  isSelected && { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
                  showFeedback && opt.isOptimal && { borderColor: colors.success, backgroundColor: colors.sageSubtle },
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
                      showFeedback && opt.isOptimal && { color: colors.success }
                    ]}
                  >
                    {opt.strategyLabel}
                  </Text>
                  {showFeedback && (
                    opt.isOptimal ? (
                      <CheckCircle2 size={18} color={colors.success} />
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
                  <CheckCircle2 size={24} color={colors.success} />
                ) : (
                  <XCircle size={24} color={colors.error} />
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
              title={isSharing ? 'Preparing…' : 'Share Result'}
              variant="secondary"
              onPress={() => share('Share your Daily Challenge result')}
              disabled={isSharing}
              icon={<Share2 size={16} color={colors.primary} />}
              style={{ marginTop: 14 }}
            />
            <Button
              title="Return to Home"
              variant="primary"
              onPress={() => navigation.navigate('HomeTabs')}
              style={{ marginTop: 10 }}
            />
          </Card>
        )}

        {/* Off-screen: only needs to be mounted for ViewShot to capture it,
            never actually seen by the user. */}
        {submissionResult && (
          <View style={styles.offscreenCard} pointerEvents="none">
            <DailyPuzzleShareCard
              ref={viewShotRef}
              date={new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              puzzleTitle={puzzle.title}
              pickedLetter={pickedLetter}
              isOptimal={submissionResult.isOptimal}
              communityDistribution={puzzle.communityDistribution}
              streak={user.currentStreak || 0}
            />
          </View>
        )}

        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Small practice.{'\n'}Big confidence.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  offscreenCard: {
    position: 'absolute',
    top: -9999,
    left: -9999
  },
  container: {
    flex: 1
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center'
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
  heroCard: {
    height: 220,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end'
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 19, 64, 0.28)'
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 18
  },
  heroQuote: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginRight: 12
  },
  heroArrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  puzzleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
    marginBottom: 10
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  weekDayColumn: {
    alignItems: 'center',
    gap: 6
  },
  weekDayLabel: {
    fontSize: 11,
    fontWeight: '600'
  },
  weekDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
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
    borderRadius: RADII.md,
    padding: 14
  },
  optionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  tagline: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 24
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

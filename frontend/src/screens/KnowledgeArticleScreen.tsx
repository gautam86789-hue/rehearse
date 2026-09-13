import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, BookOpen, Sparkles, Play, Quote, Share2, Check, X, GraduationCap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useTheme, RADII } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { typography } from '../theme/typography';
import { CURATED_SCENARIOS } from '../data/scenariosData';
import { KnowledgeArticle } from '../data/knowledgeBase';
import { JOURNEYS } from '../data/journeys';
import { Audience } from '../types';
import { useShareCard } from '../components/share/useShareCard';
import { LessonResultCard } from '../components/share/LessonResultCard';

const AUDIENCE_TAG: Record<Audience, string> = {
  founders_investors: 'FOUNDER & INVESTOR KNOWLEDGE',
  new_managers: 'NEW MANAGER KNOWLEDGE',
  mba_students: 'MBA KNOWLEDGE',
  professionals: 'PROFESSIONAL KNOWLEDGE',
  new_hires: 'NEW HIRE KNOWLEDGE'
};

function tierForScore(correct: number, total: number): string {
  if (correct === total) return 'Fully Understood';
  if (correct >= Math.ceil(total / 2)) return 'Solid Grasp';
  return 'Worth a Re-read';
}

export const KnowledgeArticleScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { article, journeyNodeId } = route.params as { article: KnowledgeArticle; journeyNodeId?: string };
  const { colors, elevation } = useTheme();
  const { user, markArticleRead, markJourneyNodeComplete, unlockMilestone } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const [phase, setPhase] = useState<'article' | 'quiz' | 'quiz-feedback' | 'result'>('article');
  const [quizStep, setQuizStep] = useState(0);
  const [correctness, setCorrectness] = useState<boolean[]>([]);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const { viewShotRef, share } = useShareCard();

  useEffect(() => {
    markArticleRead(article.id);
  }, [article.id]);

  const relatedScenario = article.relatedScenarioId
    ? CURATED_SCENARIOS.find((s) => s.id === article.relatedScenarioId)
    : undefined;

  const hasQuiz = article.quiz && article.quiz.length > 0;
  const currentQuestion = hasQuiz ? article.quiz[quizStep] : undefined;
  const correctCount = correctness.filter(Boolean).length;
  const tierLabel = tierForScore(correctCount, article.quiz?.length || 0);

  const handleAnswer = (optionIndex: number) => {
    if (!currentQuestion) return;
    const isCorrect = optionIndex === currentQuestion.correctIndex;
    setCorrectness((prev) => [...prev, isCorrect]);
    setLastCorrect(isCorrect);
    setLastSelectedIndex(optionIndex);
    setPhase('quiz-feedback');
  };

  const handleContinueFromFeedback = () => {
    if (!article.quiz) return;
    if (quizStep === article.quiz.length - 1) {
      completeNode();
      setPhase('result');
      return;
    }
    setQuizStep(quizStep + 1);
    setLastSelectedIndex(null);
    setPhase('quiz');
  };

  const completeNode = () => {
    if (!journeyNodeId) return;
    const alreadyDone = (user.completedJourneyNodeIds || []).includes(journeyNodeId);
    markJourneyNodeComplete(journeyNodeId);
    if (!alreadyDone) {
      const journey = JOURNEYS[user.audience || 'founders_investors'];
      const doneSoFar = new Set([...(user.completedJourneyNodeIds || []), journeyNodeId]);
      const completedAll = journey.nodes.every((n) => doneSoFar.has(n.id));
      if (completedAll) {
        unlockMilestone('badge_journey_complete', 'Path Cleared', `Completed every stage of ${journey.title}.`, 'award');
      }
    }
  };

  const handleShare = () => share('Share your lesson result');

  if (phase === 'quiz' || phase === 'quiz-feedback') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.surfaceBorder, paddingTop: topPadding }]}>
          <TouchableOpacity onPress={() => setPhase('article')} style={styles.headerBtn}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>Quick Check</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.dotsRow}>
          {(article.quiz || []).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: colors.primary, opacity: i <= quizStep ? 1 : 0.3, width: i === quizStep ? 22 : 8 }
              ]}
            />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.quizContent} showsVerticalScrollIndicator={false}>
          {phase === 'quiz' && currentQuestion ? (
            <View>
              <Text style={[styles.quizQuestion, { color: colors.textPrimary }]}>{currentQuestion.question}</Text>
              <View style={styles.optionsList}>
                {currentQuestion.options.map((opt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.optionRow, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}
                    onPress={() => handleAnswer(i)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.optionText, { color: colors.textPrimary }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            currentQuestion && (
              <View style={styles.centeredBlock}>
                <View
                  style={[
                    styles.verdictCircle,
                    { backgroundColor: lastCorrect ? colors.cardCategories.sage.subtle : colors.cardCategories.flame.subtle }
                  ]}
                >
                  {lastCorrect ? (
                    <Check size={30} color={colors.cardCategories.sage.solid} strokeWidth={3} />
                  ) : (
                    <X size={30} color={colors.cardCategories.flame.solid} strokeWidth={3} />
                  )}
                </View>
                <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>{lastCorrect ? 'Correct' : 'Not Quite'}</Text>
                {!lastCorrect && (
                  <Text style={[styles.resultBody, { color: colors.textSecondary }]}>
                    The stronger answer was: "{currentQuestion.options[currentQuestion.correctIndex]}"
                  </Text>
                )}
                <Button title="Continue" onPress={handleContinueFromFeedback} style={{ marginTop: 20, width: '100%' }} />
              </View>
            )
          )}
        </ScrollView>
      </View>
    );
  }

  if (phase === 'result') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.surfaceBorder, paddingTop: topPadding }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>Result</Text>
          <View style={{ width: 32 }} />
        </View>
        <ScrollView contentContainerStyle={styles.quizContent} showsVerticalScrollIndicator={false}>
          <View style={styles.centeredBlock}>
            <View style={[styles.verdictCircle, { backgroundColor: colors.primarySubtle }]}>
              <GraduationCap size={30} color={colors.primary} />
            </View>
            <Text style={[styles.scoreFraction, { color: colors.primary }]}>
              {correctCount}/{article.quiz.length}
            </Text>
            <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>{tierLabel}</Text>
            <Text style={[styles.resultBody, { color: colors.textSecondary }]}>{article.title}</Text>

            <View style={styles.endingActions}>
              <Button title="Share My Result" onPress={handleShare} icon={<Share2 size={16} color="#FFFFFF" />} style={{ width: '100%' }} />
              <Button title="Continue Your Journey" variant="secondary" onPress={() => navigation.goBack()} style={{ width: '100%' }} />
            </View>
          </View>
        </ScrollView>
        <View style={styles.offscreenCard} pointerEvents="none">
          <LessonResultCard ref={viewShotRef} lessonTitle={article.title} tierLabel={tierLabel} correctCount={correctCount} totalCount={article.quiz.length} correctness={correctness} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.surfaceBorder, paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>Learn</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRow}>
          <View style={[styles.dailyTag, { backgroundColor: colors.primarySubtle, borderColor: colors.primary }]}>
            <BookOpen size={13} color={colors.primary} />
            <Text style={[typography.tag, { color: colors.primary }]}>{AUDIENCE_TAG[article.audience]}</Text>
          </View>
        </View>

        <Text style={[typography.hero, { color: colors.textPrimary }]}>{article.title}</Text>
        <Text style={[typography.subtitle, { color: colors.textSecondary, marginTop: 4 }]}>{article.tagline}</Text>
        <Text style={[typography.caption, { color: colors.textMuted, fontStyle: 'italic', marginTop: 2, marginBottom: 14 }]}>
          {article.sourceCredit}
        </Text>

        <Card variant="highlight" style={styles.summaryCard}>
          <Text style={[typography.body, { color: colors.textPrimary, lineHeight: 22 }]}>{article.summary}</Text>
        </Card>

        <View style={styles.stepsContainer}>
          {article.sections.map((section, idx) => (
            <Card key={idx} variant="elevated" style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepNumberBadge, { backgroundColor: colors.primarySubtle, borderColor: colors.primary }]}>
                  <Text style={[typography.tag, { color: colors.primary }]}>{idx + 1}</Text>
                </View>
                <Text style={[typography.h4, { color: colors.textPrimary, flex: 1 }]}>{section.heading}</Text>
              </View>

              <Text style={[typography.body, { color: colors.textSecondary, marginTop: 6 }]}>{section.explanation}</Text>

              {section.example && (
                <View style={[styles.exampleBox, { backgroundColor: colors.surfaceHighlight }]}>
                  <Quote size={12} color={colors.primary} style={{ marginTop: 2 }} />
                  <Text style={[typography.bodySmall, { color: colors.textPrimary, fontStyle: 'italic', flex: 1 }]}>{section.example}</Text>
                </View>
              )}
            </Card>
          ))}
        </View>

        {hasQuiz && (
          <View style={[styles.ctaCard, elevation.md, { backgroundColor: colors.surfaceCard, borderColor: colors.primarySubtle, marginBottom: 16 }]}>
            <View style={[styles.ctaIconCircle, { backgroundColor: colors.champagne }]}>
              <GraduationCap size={20} color="#FFFFFF" />
            </View>
            <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center', marginTop: 8 }]}>Test Your Understanding</Text>
            <Text style={[typography.subtitle, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 16 }]}>
              {article.quiz.length} quick questions, then a shareable result.
            </Text>
            <Button
              title="Start Quiz"
              variant="secondary"
              size="lg"
              onPress={() => {
                setQuizStep(0);
                setCorrectness([]);
                setPhase('quiz');
              }}
              style={styles.ctaBtn}
            />
          </View>
        )}

        {relatedScenario && (
          <View style={[styles.ctaCard, elevation.md, { backgroundColor: colors.surfaceCard, borderColor: colors.primarySubtle }]}>
            <View style={[styles.ctaIconCircle, { backgroundColor: colors.primary }]}>
              <Sparkles size={20} color="#FFFFFF" />
            </View>
            <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center', marginTop: 8 }]}>Put This Into Practice</Text>
            <Text style={[typography.subtitle, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 16 }]}>
              Rehearse this exact vocabulary live against an AI counterpart.
            </Text>

            <Button
              title="Start Rehearsal"
              variant="primary"
              size="lg"
              onPress={() => navigation.navigate('Roleplay', { scenario: relatedScenario })}
              icon={<Play size={18} color="#FFFFFF" />}
              style={styles.ctaBtn}
            />
          </View>
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
  dailyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6
  },
  summaryCard: {
    padding: 16,
    marginBottom: 20
  },
  stepsContainer: {
    gap: 12,
    marginBottom: 24
  },
  stepCard: {
    padding: 16
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  exampleBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginTop: 10
  },
  ctaCard: {
    padding: 20,
    borderRadius: RADII.lg,
    borderWidth: 1.5,
    alignItems: 'center'
  },
  ctaIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaBtn: {
    width: '100%'
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  dot: { height: 8, borderRadius: 4 },
  quizContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 40, flexGrow: 1 },
  quizQuestion: { fontSize: 19, fontWeight: '800', lineHeight: 26, marginBottom: 20 },
  optionsList: { gap: 10 },
  optionRow: { borderRadius: RADII.lg, borderWidth: 1.5, padding: 16 },
  optionText: { fontSize: 14.5, lineHeight: 20, fontWeight: '500' },
  centeredBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  verdictCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  resultTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3, marginBottom: 10 },
  resultBody: { fontSize: 14.5, lineHeight: 21, textAlign: 'center' },
  scoreFraction: { fontSize: 44, fontWeight: '800', letterSpacing: -1, marginBottom: 8 },
  endingActions: { width: '100%', gap: 10, marginTop: 22 },
  offscreenCard: { position: 'absolute', top: -9999, left: -9999 }
});

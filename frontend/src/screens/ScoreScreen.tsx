import React from 'react';
import { View, Text, StyleSheet, ScrollView, Share } from 'react-native';
import {
  Sparkles,
  Flame,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Share2
} from 'lucide-react-native';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ScoreMeter } from '../components/common/ScoreMeter';
import { RewriteCard } from '../components/common/RewriteCard';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { Scorecard, Scenario } from '../types';

export const ScoreScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { scorecard, scenario } = route.params as { scorecard: Scorecard; scenario: Scenario };
  const { colors } = useTheme();

  const handleShareWin = async () => {
    try {
      await Share.share({
        message: `Just rehearsed "${scenario.title}" on Rehearse and scored ${scorecard.overallScore}/100 on executive composure & boundaries!`
      });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  const getScoreVerdict = (score: number) => {
    if (score >= 90) return 'Executive Masterclass';
    if (score >= 80) return 'Strong & Confident';
    if (score >= 65) return 'Solid Foundation';
    return 'Room for Calibration';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Celebration Header */}
        <View style={styles.celebrationHeader}>
          <View style={[styles.overallScoreCircle, { backgroundColor: colors.sageSubtle, borderColor: colors.sage }]}>
            <Text style={[typography.hero, { color: colors.sage, fontWeight: '800' }]}>{scorecard.overallScore}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 8 }]}>/100</Text>
          </View>
          <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: 4 }]}>{getScoreVerdict(scorecard.overallScore)}</Text>
          <Text style={[typography.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: 14 }]}>{scenario.title}</Text>

          {/* Gamification Reward Banner */}
          <View style={[styles.rewardBanner, { backgroundColor: colors.surfaceElevated, borderColor: colors.surfaceBorder }]}>
            <View style={styles.rewardItem}>
              <Sparkles size={16} color={colors.gold} />
              <Text style={[typography.tag, { color: colors.gold }]}>+{scorecard.xpEarned} XP</Text>
            </View>
            <View style={[styles.rewardDivider, { backgroundColor: colors.surfaceBorder }]} />
            <View style={styles.rewardItem}>
              <Flame size={16} color={colors.flame} />
              <Text style={[typography.tag, { color: colors.flame }]}>{scorecard.newStreak}-Day Streak</Text>
            </View>
          </View>
        </View>

        {/* SUBSTANCE RUBRIC BREAKDOWN */}
        <Card variant="elevated" style={styles.rubricCard}>
          <Text style={[typography.overline, { color: colors.textMuted, marginBottom: 12 }]}>SUBSTANCE-BASED SCORING RUBRIC</Text>

          <ScoreMeter
            label="1. Stated the Ask / Thesis"
            score={scorecard.statedTheAsk}
            description="Clear, unhedged goal stated upfront."
          />

          <ScoreMeter
            label="2. Held the Boundary"
            score={scorecard.heldTheBoundary}
            description="Resisted guilt, deflection, or backing down."
          />

          <ScoreMeter
            label="3. Specificity vs Rambling"
            score={scorecard.stayedSpecific}
            description="Used concrete facts, numbers, and deadlines."
          />

          <ScoreMeter
            label="4. Emotional Composure"
            score={scorecard.emotionalComposure}
            description="Calm, firm, and non-apologetic tone."
          />
        </Card>

        {/* WEAKEST LINE REWRITE COACH */}
        {scorecard.weakestLineRewrite && (
          <RewriteCard rewrite={scorecard.weakestLineRewrite} />
        )}

        {/* STRENGTHS & GROWTH AREAS */}
        <Card variant="elevated" style={styles.feedbackCard}>
          <Text style={[typography.overline, { color: colors.textMuted, marginBottom: 10 }]}>COACHING BREAKDOWN</Text>

          {/* Strengths */}
          <Text style={[typography.tag, { color: colors.sage, marginBottom: 8 }]}>WHAT YOU DID WELL</Text>
          {scorecard.strengths.map((str, i) => (
            <View key={i} style={styles.pointRow}>
              <CheckCircle2 size={16} color={colors.sage} style={{ marginTop: 2 }} />
              <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>{str}</Text>
            </View>
          ))}

          {/* Growth Areas */}
          <Text style={[typography.tag, { color: colors.gold, marginTop: 14, marginBottom: 8 }]}>AREAS TO TIGHTEN</Text>
          {scorecard.growthAreas.map((gr, i) => (
            <View key={i} style={styles.pointRow}>
              <TrendingUp size={16} color={colors.gold} style={{ marginTop: 2 }} />
              <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>{gr}</Text>
            </View>
          ))}
        </Card>

        {/* KEY TAKEAWAYS FOR REAL CONVERSATION */}
        {scorecard.keyTakeaways && scorecard.keyTakeaways.length > 0 && (
          <Card variant="forest" style={styles.takeawaysCard}>
            <View style={styles.takeawaysHeader}>
              <ShieldCheck size={18} color={colors.sage} />
              <Text style={[typography.tag, { color: colors.sage }]}>TAKEAWAYS FOR YOUR REAL CONVERSATION</Text>
            </View>
            {scorecard.keyTakeaways.map((tip, i) => (
              <Text key={i} style={[typography.body, { color: colors.textPrimary, marginBottom: 6 }]}>
                {i + 1}. {tip}
              </Text>
            ))}
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="Rehearse Again"
            variant="primary"
            size="lg"
            onPress={() => navigation.replace('Roleplay', { scenario })}
            icon={<RotateCcw size={18} color={colors.textInverse} />}
            style={styles.actionBtn}
          />

          <Button
            title="Share Win Snapshot"
            variant="outline"
            onPress={handleShareWin}
            icon={<Share2 size={18} color={colors.primary} />}
            style={styles.actionBtn}
          />

          <Button
            title="Return to Home Hub"
            variant="ghost"
            onPress={() => navigation.navigate('HomeTabs')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 40
  },
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  overallScoreCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12
  },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    gap: 14
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  rewardDivider: {
    width: 1,
    height: 16
  },
  rubricCard: {
    padding: 16,
    marginBottom: 14
  },
  feedbackCard: {
    padding: 16,
    marginBottom: 14
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8
  },
  takeawaysCard: {
    padding: 16,
    marginBottom: 20
  },
  takeawaysHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  actionsContainer: {
    gap: 10
  },
  actionBtn: {
    width: '100%'
  }
});

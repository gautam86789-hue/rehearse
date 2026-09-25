import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, DimensionValue, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Share2 } from 'lucide-react-native';
import { Button } from '../components/common/Button';
import { ScoreMeter, CircularScoreRing } from '../components/common/ScoreMeter';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { Scorecard, Scenario } from '../types';
import { useShareCard } from '../components/share/useShareCard';
import { ScorecardShareCard } from '../components/share/ScorecardShareCard';

const DOT_ACCENTS: { top: DimensionValue; left: DimensionValue; size: number; color: 'primary' | 'teal' | 'gold' }[] = [
  { top: '4%', left: '8%', size: 6, color: 'primary' },
  { top: '2%', left: '78%', size: 5, color: 'teal' },
  { top: '18%', left: '92%', size: 4, color: 'gold' },
  { top: '22%', left: '2%', size: 5, color: 'teal' },
  { top: '38%', left: '85%', size: 6, color: 'primary' },
  { top: '40%', left: '6%', size: 4, color: 'gold' }
];

export const ScoreScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { scorecard, scenario } = route.params as { scorecard: Scorecard; scenario: Scenario };
  const { colors } = useTheme();
  const { viewShotRef, isSharing, share } = useShareCard();
  // topHeader had a flat paddingTop:20 with no safe-area handling — on
  // edge-to-edge Android that put the back button under the status bar.
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  // Finishing a rehearsal returns to Home (not back through the scenario
  // brief) — that's also where the Access Locked screen appears after the
  // last free rehearsal.
  const goHome = useCallback(() => {
    if (navigation.popToTop) navigation.popToTop();
    else navigation.navigate('HomeTabs');
  }, [navigation]);
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        goHome();
        return true;
      });
      return () => sub.remove();
    }, [goHome])
  );

  const getScoreVerdict = (score: number) => {
    if (scorecard.attemptQuality === 'nonsense') return 'Not a real attempt';
    if (score >= 90) return 'Outstanding!';
    if (score >= 75) return 'Good job!';
    if (score >= 60) return 'Solid effort!';
    if (score >= 40) return 'Getting there';
    if (score >= 20) return 'Needs work';
    return 'Try again';
  };

  // Was hardcoded to "You handled this conversation well" regardless of
  // score — meaning a 30/100 got the same praise as a 95/100, which cheapens
  // the one line every user reads right after their score lands.
  const getScoreSubtitle = (score: number) => {
    if (score >= 90) return 'That was a masterclass in handling this conversation.';
    if (score >= 75) return 'You handled this conversation well.';
    if (score >= 60) return 'A solid attempt — a few sharp edges to smooth out.';
    if (scorecard.verdict) return scorecard.verdict;
    return "This one was rough, but that's exactly what practice is for.";
  };

  const getDotColor = (variant: 'primary' | 'teal' | 'gold') => {
    if (variant === 'primary') return colors.primaryLight;
    if (variant === 'teal') return colors.scoreTeal;
    return colors.champagne;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topHeader, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={goHome} style={styles.headerBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Celebration Header with decorative dot accents */}
        <View style={styles.celebrationHeader}>
          {DOT_ACCENTS.map((dot, idx) => (
            <View
              key={idx}
              style={[
                styles.accentDot,
                {
                  top: dot.top,
                  left: dot.left,
                  width: dot.size,
                  height: dot.size,
                  borderRadius: dot.size / 2,
                  backgroundColor: getDotColor(dot.color)
                }
              ]}
            />
          ))}

          <CircularScoreRing
            score={scorecard.overallScore}
            color={colors.scoreTeal}
            label={getScoreVerdict(scorecard.overallScore)}
          />
          <Text style={[typography.subtitle, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
            {getScoreSubtitle(scorecard.overallScore)}
          </Text>
        </View>

        {/* METRIC BARS — staggered so they fill in sequence right after the
            ring, reading as one continuous reveal rather than a data dump */}
        <View style={styles.rubricSection}>
          <ScoreMeter label="Clarity" score={scorecard.clarity} barColor={colors.scoreTeal} showBadge={false} delay={1100} />
          <ScoreMeter label="Empathy" score={scorecard.empathy} barColor={colors.scoreTeal} showBadge={false} delay={1180} />
          <ScoreMeter label="Assertiveness" score={scorecard.assertiveness} barColor={colors.scoreTeal} showBadge={false} delay={1260} />
          <ScoreMeter label="Listening" score={scorecard.listening} barColor={colors.scoreTeal} showBadge={false} delay={1340} />
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="View Feedback"
            variant="primary"
            size="lg"
            onPress={() => navigation.navigate('Feedback', { scorecard, scenario })}
            style={styles.actionBtn}
          />

          <Button
            title="Try Again"
            variant="outline"
            size="lg"
            onPress={() => navigation.replace('Roleplay', { scenario })}
            style={styles.actionBtn}
          />

          <TouchableOpacity
            style={styles.shareRow}
            onPress={() => share('Share your scorecard')}
            disabled={isSharing}
            activeOpacity={0.7}
          >
            <Share2 size={14} color={colors.textSecondary} />
            <Text style={[styles.shareText, { color: colors.textSecondary }]}>
              {isSharing ? 'Preparing…' : 'Share Win Snapshot'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.offscreenCard} pointerEvents="none">
        <ScorecardShareCard
          ref={viewShotRef}
          category={scenario.category}
          overallScore={scorecard.overallScore}
          clarity={scorecard.clarity}
          empathy={scorecard.empathy}
          assertiveness={scorecard.assertiveness}
          listening={scorecard.listening}
        />
      </View>
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
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 20
  },
  headerBtn: {
    padding: 6,
    alignSelf: 'flex-start'
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40
  },
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
    paddingVertical: 10
  },
  accentDot: {
    position: 'absolute'
  },
  rubricSection: {
    gap: 16,
    marginBottom: 30
  },
  actionsContainer: {
    gap: 12
  },
  actionBtn: {
    width: '100%'
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8
  },
  shareText: {
    fontSize: 12.5,
    fontWeight: '600'
  }
});

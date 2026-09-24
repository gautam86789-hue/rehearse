import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Check,
  MessageCircleHeart,
  Ban,
  Users,
  TrendingUp,
  ChevronRight,
  AlertTriangle,
  Building2,
  Bell,
  Sparkles,
  BookOpen,
  GraduationCap
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { useTheme, CardCategoryKey } from '../context/ThemeContext';
import { CURATED_SCENARIOS } from '../data/scenariosData';
import { apiService } from '../services/api';
import { getDailyQuote } from '../data/dailyQuotes';
import { getFeatureIllustration } from '../data/generatedImages';
import { CATEGORY_COLORS } from '../data/categoryColors';
import { JOURNEYS } from '../data/journeys';
import { localDateKey, priorChallengesCompleted } from '../utils/dates';
import { Scenario, Audience, WordOfTheDay, FrameworkOfTheDay } from '../types';
import { useFitScreenScroll } from '../hooks/useFitScreenScroll';
import { ThemedFeatureCard } from '../components/common/ThemedFeatureCard';
import { WordOfDayModal } from '../components/common/WordOfDayModal';
import { MilestoneIcon } from '../components/common/MilestoneIcon';

interface PracticeTile {
  id: string;
  label: string;
  icon: any;
  categoryColor: CardCategoryKey;
}

// Practice tiles, daily-challenge framing, and Learn copy all key off the
// audience the user picked in onboarding, so "Practice a conversation"
// surfaces the 4 categories most relevant to them by default — the full
// library is still one tap away via "See all".
const AUDIENCE_TILES: Record<Audience, PracticeTile[]> = {
  founders_investors: [
    { id: 'negotiation', label: 'Defend Your Valuation', icon: TrendingUp, categoryColor: CATEGORY_COLORS.negotiation },
    { id: 'difficult_decisions', label: 'Align with Co-Founder', icon: Users, categoryColor: CATEGORY_COLORS.difficult_decisions },
    { id: 'crisis', label: 'Navigate a Layoff', icon: AlertTriangle, categoryColor: CATEGORY_COLORS.crisis },
    { id: 'managing_up', label: 'Update Your Board', icon: Building2, categoryColor: CATEGORY_COLORS.managing_up }
  ],
  new_managers: [
    { id: 'feedback', label: 'Give Feedback', icon: MessageCircleHeart, categoryColor: CATEGORY_COLORS.feedback },
    { id: 'managing_up', label: 'Push Back on Scope', icon: Building2, categoryColor: CATEGORY_COLORS.managing_up },
    { id: 'boundaries', label: 'Set a Boundary', icon: Ban, categoryColor: CATEGORY_COLORS.boundaries },
    { id: 'difficult_decisions', label: 'Handle Team Conflict', icon: Users, categoryColor: CATEGORY_COLORS.difficult_decisions }
  ],
  mba_students: [
    { id: 'negotiation', label: 'Negotiate With Confidence', icon: TrendingUp, categoryColor: CATEGORY_COLORS.negotiation },
    { id: 'feedback', label: 'Give Direct Feedback', icon: MessageCircleHeart, categoryColor: CATEGORY_COLORS.feedback },
    { id: 'boundaries', label: 'Set Boundaries Early', icon: Ban, categoryColor: CATEGORY_COLORS.boundaries },
    { id: 'difficult_decisions', label: 'Handle Team Conflict', icon: Users, categoryColor: CATEGORY_COLORS.difficult_decisions }
  ],
  professionals: [
    { id: 'feedback', label: 'Give Feedback', icon: MessageCircleHeart, categoryColor: CATEGORY_COLORS.feedback },
    { id: 'boundaries', label: 'Say No', icon: Ban, categoryColor: CATEGORY_COLORS.boundaries },
    { id: 'difficult_decisions', label: 'Resolve Conflict', icon: Users, categoryColor: CATEGORY_COLORS.difficult_decisions },
    { id: 'negotiation', label: 'Ask for a Raise', icon: TrendingUp, categoryColor: CATEGORY_COLORS.negotiation }
  ],
  new_hires: [
    { id: 'managing_up', label: 'Clarify Priorities', icon: Building2, categoryColor: CATEGORY_COLORS.managing_up },
    { id: 'feedback', label: 'Ask for Early Feedback', icon: MessageCircleHeart, categoryColor: CATEGORY_COLORS.feedback },
    { id: 'boundaries', label: 'Push Back Without Risk', icon: Ban, categoryColor: CATEGORY_COLORS.boundaries },
    { id: 'difficult_decisions', label: 'Handle a Rough First Review', icon: Users, categoryColor: CATEGORY_COLORS.difficult_decisions }
  ]
};

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, refreshProfile, setIsPaywallVisible, notifications, tutorialSeen } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const fitScroll = useFitScreenScroll();

  const [scenarios, setScenarios] = useState<Scenario[]>(CURATED_SCENARIOS);
  const [refreshing, setRefreshing] = useState(false);
  const [puzzleTitle, setPuzzleTitle] = useState<string | null>(null);
  const [wordOfDay, setWordOfDay] = useState<WordOfTheDay | null>(null);
  const [showWordModal, setShowWordModal] = useState(false);
  const [frameworkOfDay, setFrameworkOfDay] = useState<FrameworkOfTheDay | null>(null);

  const audience: Audience = user.audience || 'professionals';
  const practiceTiles = AUDIENCE_TILES[audience];
  const journey = JOURNEYS[audience];
  const journeyCompletedCount = journey.nodes.filter((n) => (user.completedJourneyNodeIds || []).includes(n.id)).length;
  const dailyQuote = getDailyQuote();
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // First time on Home: show the short "how it works" walkthrough once.
  useEffect(() => {
    if (tutorialSeen === false) navigation.navigate('Tutorial');
  }, [tutorialSeen]);

  // Today's challenge depends on how many the user has finished before today,
  // so it (re)loads once the saved profile is in — the challenge screen uses
  // the exact same inputs, so both always show the same puzzle.
  const priorChallenges = priorChallengesCompleted(user.completedPuzzleDates);
  useEffect(() => {
    apiService.getDailyPuzzle(audience, priorChallenges).then((res) => {
      if (res?.puzzle?.title) setPuzzleTitle(res.puzzle.title);
    }).catch(() => {});
  }, [audience, priorChallenges]);

  useEffect(() => {
    loadHomeData();
    apiService.getWordOfTheDay(audience).then((res) => {
      if (res?.word) setWordOfDay(res.word);
    }).catch(() => {});
    apiService.getFrameworkOfTheDay(audience).then((res) => {
      if (res?.framework) setFrameworkOfDay(res.framework);
    }).catch(() => {});
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refreshProfile().catch(() => {});
    }, [refreshProfile])
  );

  const loadHomeData = async () => {
    try {
      const res = await apiService.getScenarios();
      if (res?.scenarios && res.scenarios.length > 0) {
        setScenarios(res.scenarios);
      }
    } catch (e) {
      setScenarios(CURATED_SCENARIOS);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadHomeData(), refreshProfile()]);
    setRefreshing(false);
  };

  const firstName = (user.name || 'there').split(' ')[0];
  const isFreeTrial = user.subscription?.status === 'free_trial' || user.subscription?.status === 'free_rehearsals';
  const remainingRehearsals = user.subscription?.rehearsalsRemaining ?? 3;
  // Promo access (and a real store-billed trial once RevenueCat sets
  // trialEndsAt) is time-boxed rather than count-based, so it needs its own
  // "days left" reading instead of the free tier's rehearsal count.
  const trialDaysLeft = user.subscription?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.subscription.trialEndsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : undefined;
  const isTimeBoxedTrial =
    (user.subscription?.status === 'active_promo' || user.subscription?.status === 'active_monthly' || user.subscription?.status === 'active_three_month' || user.subscription?.status === 'active_annual') &&
    trialDaysLeft !== undefined;
  const streak = user.currentStreak || 0;
  const todayKey = localDateKey();
  const challengeDone = (user.completedPuzzleDates || []).includes(todayKey);
  const pickedLabel: string | undefined = user.puzzleResults?.[todayKey]?.result?.strategyLabel || undefined;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 12) + 8 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={fitScroll.scrollEnabled}
        onLayout={fitScroll.onLayout}
        onContentSizeChange={fitScroll.onContentSizeChange}
      >
        {/* GREETING + streak + notifications — kept to one quiet row */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={[styles.greetingHello, { color: colors.textSecondary }]}>{greeting},</Text>
            <Text style={[styles.greetingName, { color: colors.textPrimary }]} numberOfLines={1}>
              {firstName}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.streakPill, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}
            onPress={() => navigation.navigate('ProgressTab', { tab: 'standing', at: Date.now() })}
            activeOpacity={0.85}
          >
            <MilestoneIcon icon="flame" size={18} />
            <Text style={[styles.streakPillText, { color: colors.textPrimary }]}>{streak}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bellButton, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
          >
            <Bell size={20} color={colors.textPrimary} />
            {unreadNotifications > 0 && (
              <View style={[styles.bellDot, { backgroundColor: colors.ruby, borderColor: colors.background }]} />
            )}
          </TouchableOpacity>
        </View>

        {/* TODAY'S CHALLENGE — the one thing to do today. Once done, it stays
            marked done (with what you picked) until tomorrow. */}
        <TouchableOpacity
          style={[
            styles.heroCard,
            { backgroundColor: challengeDone ? colors.surfaceCard : colors.primary, borderColor: challengeDone ? colors.sage : colors.primary }
          ]}
          onPress={() => navigation.navigate('DailyPuzzle')}
          activeOpacity={0.88}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroEyebrow, { color: challengeDone ? colors.sage : 'rgba(255,255,255,0.8)' }]}>
              {challengeDone ? "TODAY'S CHALLENGE · DONE" : "TODAY'S CHALLENGE"}
            </Text>
            <Text
              style={[styles.heroTitle, { color: challengeDone ? colors.textPrimary : '#FFFFFF' }]}
              numberOfLines={2}
            >
              {puzzleTitle || "Loading today's challenge..."}
            </Text>
            <Text style={[styles.heroSub, { color: challengeDone ? colors.textSecondary : 'rgba(255,255,255,0.85)' }]}>
              {challengeDone
                ? pickedLabel
                  ? `You chose: ${pickedLabel} · Tap to review`
                  : 'Tap to review your answer'
                : '2 minutes · pick the best response'}
            </Text>
          </View>
          <View style={[styles.heroArrow, { backgroundColor: challengeDone ? colors.sage : 'rgba(255,255,255,0.2)' }]}>
            {challengeDone ? <Check size={18} color="#FFFFFF" /> : <ChevronRight size={20} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>

        {/* PRACTICE A CONVERSATION */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Practice a conversation</Text>
          <TouchableOpacity
            style={styles.seeAllRow}
            onPress={() => navigation.navigate('Scenarios')}
            activeOpacity={0.7}
          >
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
            <ChevronRight size={15} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {practiceTiles.map((tile) => (
            <ThemedFeatureCard
              key={tile.id}
              size="tile"
              title={tile.label}
              icon={tile.icon}
              categoryColor={tile.categoryColor}
              illustration={getFeatureIllustration(tile.id)}
              onPress={() => navigation.navigate('Scenarios', { category: tile.id })}
            />
          ))}
        </View>

        {/* LEARN — the daily term, framework and the roadmap grouped into one
            quiet card instead of three separate ones. */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 12 }]}>Learn</Text>
        <View style={[styles.learnCard, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
          {wordOfDay && (
            <TouchableOpacity style={styles.learnRow} onPress={() => setShowWordModal(true)} activeOpacity={0.7}>
              <View style={[styles.dailyIconSquare, { backgroundColor: colors.cardCategories.teal.subtle }]}>
                <BookOpen size={18} color={colors.cardCategories.teal.solid} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.dailyPretitle, { color: colors.textSecondary }]}>TERM OF THE DAY</Text>
                <Text style={[styles.dailyHeadline, { color: colors.textPrimary }]} numberOfLines={1}>
                  {wordOfDay.term}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
          {wordOfDay && frameworkOfDay && <View style={[styles.learnDivider, { backgroundColor: colors.surfaceBorder }]} />}
          {frameworkOfDay && (
            <TouchableOpacity
              style={styles.learnRow}
              onPress={() => navigation.navigate('FrameworkDetail', { framework: frameworkOfDay })}
              activeOpacity={0.7}
            >
              <View style={[styles.dailyIconSquare, { backgroundColor: colors.cardCategories.purple.subtle }]}>
                <GraduationCap size={18} color={colors.cardCategories.purple.solid} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.dailyPretitle, { color: colors.textSecondary }]}>FRAMEWORK OF THE DAY</Text>
                <Text style={[styles.dailyHeadline, { color: colors.textPrimary }]} numberOfLines={1}>
                  {frameworkOfDay.title}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
          {(wordOfDay || frameworkOfDay) && <View style={[styles.learnDivider, { backgroundColor: colors.surfaceBorder }]} />}
          <TouchableOpacity style={styles.learnRow} onPress={() => navigation.navigate('Learn')} activeOpacity={0.7}>
            <View style={[styles.dailyIconSquare, { backgroundColor: colors.primarySubtle }]}>
              <Sparkles size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.dailyPretitle, { color: colors.textSecondary }]}>
                {journey.title.toUpperCase()} · {journeyCompletedCount}/{journey.nodes.length}
              </Text>
              <Text style={[styles.dailyHeadline, { color: colors.textPrimary }]} numberOfLines={1}>
                {journeyCompletedCount === 0 ? journey.tagline : 'Continue where you left off'}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 6. TRIAL FOOTNOTE — free tier reads by rehearsal count (no time
            pressure on those 3), an active promo/trial reads by days left
            (that one IS time-boxed), shown every day so where someone
            stands is never a surprise. */}
        {isFreeTrial && (
          <TouchableOpacity
            style={styles.trialFootnote}
            onPress={() => setIsPaywallVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.trialFootnoteText, { color: colors.textSecondary }]}>
              {remainingRehearsals} free {remainingRehearsals === 1 ? 'rehearsal' : 'rehearsals'} remaining ·{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Go Pro →</Text>
            </Text>
          </TouchableOpacity>
        )}
        {isTimeBoxedTrial && (
          <View style={styles.trialFootnote}>
            <Text style={[styles.trialFootnoteText, { color: colors.textSecondary }]}>
              {trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'} left on {user.subscription?.planName || 'your trial'}
            </Text>
          </View>
        )}
      </ScrollView>

      <WordOfDayModal
        visible={showWordModal}
        word={wordOfDay}
        roleLabel={user.role}
        onClose={() => setShowWordModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  greetingHello: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2
  },
  greetingName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 22,
    borderWidth: 1,
    marginRight: 10
  },
  streakPillText: {
    fontSize: 15,
    fontWeight: '800'
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 28,
    gap: 12
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 24
  },
  heroSub: {
    fontSize: 12.5,
    marginTop: 6
  },
  heroArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  learnCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden'
  },
  learnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14
  },
  learnDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 66
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5
  },
  quoteCard: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 20
  },
  dailyQuote: {
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 19,
    textAlign: 'center'
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 24,
    gap: 12
  },
  streakIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  streakTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  streakSubtitle: {
    fontSize: 12.5,
    marginTop: 1
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24
  },
  avatarRow: {
    gap: 12,
    paddingBottom: 24
  },
  avatarCard: {
    width: 132,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center'
  },
  avatarCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center'
  },
  avatarCardSub: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center'
  },
  composerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20
  },
  composerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  composerHeading: {
    fontSize: 15,
    fontWeight: '700'
  },
  composerSubtitle: {
    fontSize: 12.5,
    lineHeight: 17,
    marginBottom: 12
  },
  composerInputBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10
  },
  composerInput: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 54,
    textAlignVertical: 'top'
  },
  chipsScroll: {
    gap: 6,
    paddingBottom: 12
  },
  promptChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1
  },
  promptChipText: {
    fontSize: 11.5
  },
  primaryBtn: {
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  dailyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16
  },
  dailyIconSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dailyPretitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2
  },
  dailyHeadline: {
    fontSize: 13.5,
    fontWeight: '700'
  },
  dailyArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  trialFootnote: {
    alignItems: 'center',
    paddingVertical: 8
  },
  trialFootnoteText: {
    fontSize: 12
  }
});

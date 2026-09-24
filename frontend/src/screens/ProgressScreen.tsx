import { TabHeader, TAB_PADDING_H, TAB_PADDING_BOTTOM } from '../components/common/TabHeader';
import { localDateKey } from '../utils/dates';
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowRight, Sparkles } from 'lucide-react-native';

import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useFitScreenScroll } from '../hooks/useFitScreenScroll';
import { Header } from '../components/common/Header';

import { ConfidenceArc } from '../components/progress/ConfidenceArc';
import { SkillConstellation, ConstellationSkill } from '../components/progress/SkillConstellation';
import { SkillLedger } from '../components/progress/SkillLedger';
import { PracticeRhythm } from '../components/progress/PracticeRhythm';
import { InsightBriefing } from '../components/progress/InsightBriefing';
import { AchievementRail } from '../components/progress/AchievementRail';
import { SkillDetailView } from '../components/progress/SkillDetailView';
import { MilestoneUnlockedModal } from '../components/progress/MilestoneUnlockedModal';
import { AchievementsModal } from '../components/progress/AchievementsModal';

import { SectionHead } from '../components/progress/core/SectionHead';
import { SegmentedTabs, TabSpec } from '../components/progress/core/SegmentedTabs';
import { progressPalette } from '../components/progress/core/palette';
import { useReveal, riseIn, DUR } from '../components/progress/core/motion';
import { bandFor, BANDS, toNextBand } from '../components/progress/core/geometry';
import { T } from '../components/progress/core/type';
import { deriveSkillsFromHistory, deriveConfidenceSeries } from '../utils/deriveProgressData';
import { PracticeDay } from '../components/progress/PracticeRhythm';
import { MILESTONES } from '../data/milestones';
import { AchievementItem } from '../types/progress';

const MILESTONE_ICON_EMOJI: Record<string, string> = {
  flame: '🔥',
  award: '🏅',
  'shield-check': '🛡️',
  sparkles: '✨'
};

type Tab = 'standing' | 'skills' | 'rhythm' | 'insights';

const TABS: TabSpec[] = [
  { id: 'standing', label: 'Standing' },
  { id: 'skills', label: 'Skills' },
  { id: 'rhythm', label: 'Rhythm' },
  { id: 'insights', label: 'Insights' }
];

type SkillView = 'field' | 'ledger';

const SKILL_VIEWS: TabSpec[] = [
  { id: 'field', label: 'Field' },
  { id: 'ledger', label: 'Ledger' }
];

export const ProgressScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { user, history } = useApp();
  const { colors: themeColors, isDark } = useTheme();
  const p = progressPalette(themeColors, isDark);

  const [tab, setTab] = useState<Tab>('standing');

  // The Home streak button always lands on Standing — it passes a fresh `at`
  // stamp every tap, so this fires even if another tab was left selected.
  React.useEffect(() => {
    if (route?.params?.tab === 'standing') setTab('standing');
  }, [route?.params?.at]);
  const [skillView, setSkillView] = useState<SkillView>('field');
  const [selectedSkill, setSelectedSkill] = useState<ConstellationSkill | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [milestoneVisible, setMilestoneVisible] = useState(false);
  const [achievementsVisible, setAchievementsVisible] = useState(false);

  // Real, not fabricated: a brand-new (or freshly reset) user has done zero
  // rehearsals, and every section below should say so plainly rather than
  // filling in with demo numbers.
  const hasHistory = history.length > 0 || user.totalRehearsals > 0;

  // Sourced from the same MILESTONES definitions used on Profile/Milestones
  // screens (real isUnlocked() checks against the actual user/history), not
  // the old static ACHIEVEMENTS list this rail used to read from — that list
  // had hardcoded "unlocked" flags and fake dates, which would have shown a
  // brand-new user badges they never earned the moment this section moved
  // to always-visible.
  const realAchievements: AchievementItem[] = useMemo(
    () =>
      MILESTONES.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        icon: MILESTONE_ICON_EMOJI[m.icon],
        unlocked: m.isUnlocked(user, history)
      })),
    [user, history]
  );

  // Real practice activity, not fabricated: one count per completed
  // rehearsal (from `history`) plus one per completed Daily Puzzle, grouped
  // by calendar day so the Rhythm heatmap's shading actually reflects what
  // this user did.
  const practiceDays: PracticeDay[] = useMemo(() => {
    const byDate = new Map<string, number>();
    history.forEach((h) => {
      const key = localDateKey(new Date(h.completedAt));
      byDate.set(key, (byDate.get(key) || 0) + 1);
    });
    (user.completedPuzzleDates || []).forEach((key) => {
      byDate.set(key, (byDate.get(key) || 0) + 1);
    });
    return Array.from(byDate.entries()).map(([date, count]) => ({ date, count }));
  }, [history, user.completedPuzzleDates]);
  const skills = useMemo(() => deriveSkillsFromHistory(history), [history]);
  const confidenceSeries = useMemo(() => deriveConfidenceSeries(history), [history]);
  const confidenceValues = useMemo(() => confidenceSeries.map((d) => d.score), [confidenceSeries]);
  const confidence = confidenceValues[confidenceValues.length - 1];

  const totalRehearsals = user.totalRehearsals || 0;
  const currentStreak = user.currentStreak || 0;
  const longestStreak = user.longestStreak || 0;

  const activeSkills = useMemo(() => skills.filter((s) => !s.locked), [skills]);

  /** The one skill worth pointing at right now: lowest score among active. */
  const focusSkill = useMemo(
    () => [...activeSkills].sort((a, b) => a.score - b.score)[0],
    [activeSkills]
  );

  const openSkill = (skill: ConstellationSkill) => {
    setSelectedSkill(skill);
    setDetailVisible(true);
  };

  // Deep-links straight into that skill's scenarios (skill.id is the real
  // ScenarioCategory — see deriveProgressData.ts) instead of dropping the
  // user on the unfiltered Scenarios list. Called with no argument from the
  // generic empty-state CTAs, which stay unfiltered on purpose.
  const goPractice = (skillOrCategory?: ConstellationSkill | string) => {
    const category =
      typeof skillOrCategory === 'string' ? skillOrCategory : skillOrCategory?.id;
    navigation.navigate('Scenarios', category ? { category } : undefined);
  };

  const enter = useReveal(0, DUR.base);

  const scrollRef = useRef<ScrollView>(null);
  const fitScroll = useFitScreenScroll();
  useFocusEffect(
    React.useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <TabHeader title="Progress" caption="Your skills and streak" />

      <View style={styles.tabZone}>
        <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={fitScroll.scrollEnabled}
        onLayout={fitScroll.onLayout}
        onContentSizeChange={fitScroll.onContentSizeChange}
      >
        {tab === 'standing' && (
          <Animated.View style={riseIn(enter, 10)}>
            {/* Milestones first — the "starting step" badges unlock before a
                single rehearsal is completed, so this is real content even
                for a brand-new user, not gated behind hasHistory. */}
            <View style={styles.railZoneTop}>
              <SectionHead
                title="Milestones"
                action={{ label: 'View all', onPress: () => setAchievementsVisible(true) }}
              />
              <AchievementRail
                achievements={realAchievements}
                onPress={() => setAchievementsVisible(true)}
              />
            </View>

            {/* Facts are always real — zero for a new/reset user, never demo numbers */}
            <View style={styles.factRow}>
              <Fact value={String(totalRehearsals)} label="Rehearsals" palette={p} />
              <Fact
                value={String(currentStreak)}
                label="Day streak"
                palette={p}
                accent
                onPress={() => setMilestoneVisible(true)}
              />
              <Fact
                value={hasHistory ? String(activeSkills.length) : '0'}
                label="Skills in play"
                palette={p}
              />
            </View>

            {hasHistory ? (
              <>
                {/* One figure carries trajectory + current value + band */}
                <ConfidenceArc data={confidenceSeries} current={confidence} />

                {/* The next concrete move, derived */}
                {focusSkill && (
                  <NextMove skill={focusSkill} palette={p} onPress={() => goPractice(focusSkill)} />
                )}
              </>
            ) : (
              <EmptyTabState
                palette={p}
                title="Your standing starts here"
                body="Complete your first rehearsal to see your confidence trend."
                onPress={goPractice}
              />
            )}
          </Animated.View>
        )}

        {tab === 'skills' && (
          <View>
            <SectionHead title="Skills" />

            {hasHistory ? (
              <>
                <View style={styles.viewToggle}>
                  <SegmentedTabs
                    compact
                    tabs={SKILL_VIEWS}
                    value={skillView}
                    onChange={setSkillView}
                  />
                </View>

                {skillView === 'field' ? (
                  <SkillConstellation
                    skills={skills}
                    onSelectSkill={openSkill}
                    selectedId={selectedSkill?.id ?? null}
                  />
                ) : (
                  <SkillLedger skills={skills} onSelectSkill={openSkill} />
                )}
              </>
            ) : (
              <EmptyTabState
                palette={p}
                title="No skills tracked yet"
                body="Each rehearsal scores you on clarity, empathy, assertiveness, and listening. Practice a conversation to start building your skill map."
                onPress={goPractice}
              />
            )}
          </View>
        )}

        {tab === 'rhythm' && (
          <View>
            <SectionHead title="Rhythm" />
            {hasHistory ? (
              <PracticeRhythm
                days={practiceDays}
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                windowDays={60}
              />
            ) : (
              <EmptyTabState
                palette={p}
                title="No practice rhythm yet"
                body="Once you start rehearsing, this shows your daily consistency and streaks over time."
                onPress={goPractice}
              />
            )}
          </View>
        )}

        {tab === 'insights' && (
          <View>
            <SectionHead title="Insights" />
            {hasHistory ? (
              <InsightBriefing
                skills={skills}
                confidence={confidenceValues}
                onSelectSkill={openSkill}
                onPractice={goPractice}
              />
            ) : (
              <EmptyTabState
                palette={p}
                title="No insights yet"
                body="After a few rehearsals, you'll get personalized callouts on patterns worth addressing."
                onPress={goPractice}
              />
            )}
          </View>
        )}
      </ScrollView>

      <SkillDetailView
        skill={selectedSkill}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        onPractice={goPractice}
      />

      <MilestoneUnlockedModal
        visible={milestoneVisible}
        streakCount={currentStreak}
        onClose={() => setMilestoneVisible(false)}
      />

      <AchievementsModal
        achievements={realAchievements}
        visible={achievementsVisible}
        onClose={() => setAchievementsVisible(false)}
      />
    </View>
  );
};

/** Shown in place of a tab's real content when the user has no rehearsal history yet. */
const EmptyTabState: React.FC<{
  palette: ReturnType<typeof progressPalette>;
  title: string;
  body: string;
  onPress: () => void;
}> = ({ palette: p, title, body, onPress }) => (
  <View style={[styles.emptyState, { backgroundColor: p.card, borderColor: p.hairline }]}>
    <View style={[styles.emptyIconCircle, { backgroundColor: p.accent + '1A' }]}>
      <Sparkles size={22} color={p.accent} />
    </View>
    <Text style={[styles.emptyTitle, { color: p.ink }]}>{title}</Text>
    <Text style={[styles.emptyBody, { color: p.inkSoft }]}>{body}</Text>
    <Pressable style={[styles.emptyCta, { backgroundColor: p.accent }]} onPress={onPress}>
      <Text style={[styles.emptyCtaText, { color: p.onAccent }]}>Start a rehearsal</Text>
    </Pressable>
  </View>
);

/** Compact stat. Only used for values the arc does not already state. */
const Fact: React.FC<{
  value: string;
  label: string;
  palette: ReturnType<typeof progressPalette>;
  accent?: boolean;
  onPress?: () => void;
}> = ({ value, label, palette: p, accent, onPress }) => {
  const body = (
    <View style={[styles.fact, { backgroundColor: p.card, borderColor: p.hairline }]}>
      <Text style={[styles.factValue, { color: accent ? p.accent : p.ink }]}>{value}</Text>
      <Text style={[styles.factLabel, { color: p.inkSoft }]}>{label}</Text>
    </View>
  );
  return onPress ? (
    <Pressable style={styles.factWrap} onPress={onPress}>
      {body}
    </Pressable>
  ) : (
    <View style={styles.factWrap}>{body}</View>
  );
};

/** The single call to action, phrased from the weakest active skill. */
const NextMove: React.FC<{
  skill: ConstellationSkill;
  palette: ReturnType<typeof progressPalette>;
  onPress: () => void;
}> = ({ skill, palette: p, onPress }) => {
  const band = bandFor(skill.score);
  const { next, gap } = toNextBand(skill.score);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.nextMove, { backgroundColor: p.accent }]}
    >
      <View style={styles.nextMoveText}>
        <Text style={[styles.nextMoveEyebrow, { color: p.onAccent, opacity: 0.72 }]}>
          NEXT MOVE
        </Text>
        <Text style={[styles.nextMoveTitle, { color: p.onAccent }]} numberOfLines={2}>
          {next
            ? `${skill.name} · ${gap} ${gap === 1 ? 'point' : 'points'} to ${BANDS[next].label}`
            : `${skill.name} · hold at ${BANDS[band].label}`}
        </Text>
      </View>
      <ArrowRight size={19} color={p.onAccent} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    marginTop: 8
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center'
  },
  emptyBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20
  },
  emptyCta: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14
  },
  emptyCtaText: {
    fontSize: 13.5,
    fontWeight: '700'
  },
  tabZone: {
    paddingHorizontal: TAB_PADDING_H,
    paddingTop: 0,
    paddingBottom: 8
  },
  scroll: {
    paddingHorizontal: TAB_PADDING_H,
    paddingTop: 6,
    paddingBottom: TAB_PADDING_BOTTOM
  },
  factRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  factWrap: {
    flex: 1
  },
  fact: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center'
  },
  factValue: {
    ...T.figure
  },
  factLabel: {
    ...T.micro,
    marginTop: 3,
    textAlign: 'center'
  },
  nextMove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 17,
    marginBottom: 22
  },
  nextMoveText: {
    flex: 1
  },
  nextMoveEyebrow: {
    ...T.eyebrow,
    marginBottom: 4
  },
  nextMoveTitle: {
    ...T.heading
  },
  railZoneTop: {
    marginBottom: 18
  },
  viewToggle: {
    alignSelf: 'flex-end',
    width: 168,
    marginBottom: 12
  }
});

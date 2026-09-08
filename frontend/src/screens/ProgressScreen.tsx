import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
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
import {
  SKILLS,
  CONFIDENCE_SERIES,
  ACHIEVEMENTS,
  buildPracticeDays
} from '../components/progress/core/progressData';

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

export const ProgressScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useApp();
  const { colors: themeColors, isDark } = useTheme();
  const p = progressPalette(themeColors, isDark);

  const [tab, setTab] = useState<Tab>('standing');
  const [skillView, setSkillView] = useState<SkillView>('field');
  const [selectedSkill, setSelectedSkill] = useState<ConstellationSkill | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [milestoneVisible, setMilestoneVisible] = useState(false);
  const [achievementsVisible, setAchievementsVisible] = useState(false);

  const practiceDays = useMemo(() => buildPracticeDays(), []);
  const confidenceValues = useMemo(() => CONFIDENCE_SERIES.map((d) => d.score), []);
  const confidence = confidenceValues[confidenceValues.length - 1];

  const totalRehearsals = user.totalRehearsals > 0 ? user.totalRehearsals : CONFIDENCE_SERIES.length;
  const currentStreak = user.currentStreak > 0 ? user.currentStreak : 4;
  const longestStreak = Math.max(user.longestStreak || 0, currentStreak, 6);

  const activeSkills = useMemo(() => SKILLS.filter((s) => !s.locked), []);

  /** The one skill worth pointing at right now: lowest score among active. */
  const focusSkill = useMemo(
    () => [...activeSkills].sort((a, b) => a.score - b.score)[0],
    [activeSkills]
  );

  const openSkill = (skill: ConstellationSkill) => {
    setSelectedSkill(skill);
    setDetailVisible(true);
  };

  const goPractice = () => navigation.navigate('Scenarios');

  const enter = useReveal(0, DUR.base);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header
        title="Your Progress"
        rightAction="more"
        navigation={navigation}
      />

      <View style={styles.tabZone}>
        <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'standing' && (
          <Animated.View style={riseIn(enter, 10)}>
            {/* One figure carries trajectory + current value + band */}
            <ConfidenceArc data={CONFIDENCE_SERIES} current={confidence} />

            {/* Facts the arc does not already show */}
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
                value={String(activeSkills.length)}
                label="Skills in play"
                palette={p}
              />
            </View>

            {/* The next concrete move, derived */}
            {focusSkill && <NextMove skill={focusSkill} palette={p} onPress={goPractice} />}

            <View style={styles.railZone}>
              <SectionHead
                title="Milestones"
                action={{ label: 'View all', onPress: () => setAchievementsVisible(true) }}
                delay={200}
              />
              <AchievementRail
                achievements={ACHIEVEMENTS}
                onPress={() => setAchievementsVisible(true)}
              />
            </View>
          </Animated.View>
        )}

        {tab === 'skills' && (
          <View>
            <SectionHead title="Skills" />

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
                skills={SKILLS}
                onSelectSkill={openSkill}
                selectedId={selectedSkill?.id ?? null}
              />
            ) : (
              <SkillLedger skills={SKILLS} onSelectSkill={openSkill} />
            )}
          </View>
        )}

        {tab === 'rhythm' && (
          <View>
            <SectionHead title="Rhythm" />
            <PracticeRhythm
              days={practiceDays}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
            />
          </View>
        )}

        {tab === 'insights' && (
          <View>
            <SectionHead title="Insights" />
            <InsightBriefing
              skills={SKILLS}
              confidence={confidenceValues}
              onSelectSkill={openSkill}
              onPractice={goPractice}
            />
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
        achievements={ACHIEVEMENTS}
        visible={achievementsVisible}
        onClose={() => setAchievementsVisible(false)}
      />
    </View>
  );
};

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
  tabZone: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 110
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
  railZone: {
    marginTop: 4
  },
  viewToggle: {
    alignSelf: 'flex-end',
    width: 168,
    marginBottom: 12
  }
});

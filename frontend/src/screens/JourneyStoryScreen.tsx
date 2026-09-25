import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { ArrowLeft, Share2, PartyPopper, Check, X } from 'lucide-react-native';
import { useTheme, RADII } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { Button } from '../components/common/Button';
import { useShareCard } from '../components/share/useShareCard';
import { StoryShareCard } from '../components/share/StoryShareCard';
import { StoryTree, StoryBeat, StoryTrajectory, Audience } from '../types';
import { JOURNEYS, JourneyNode } from '../data/journeys';

// One ambient "scene" per audience, always dark regardless of app theme —
// a deliberate cinematic moment (per the visual-language exploration) rather
// than a themed surface. Kept inside the existing indigo/champagne system:
// every mood is an indigo-family gradient, with a warm champagne glow only
// for the two "just starting out" audiences (new hires, new managers) —
// variation in shade/warmth, not a new hue.
const AUDIENCE_SCENE_MOOD: Record<Audience, { colors: [string, string]; warm: boolean }> = {
  founders_investors: { colors: ['#4C4FCB', '#1E1B4B'], warm: false },
  new_managers: { colors: ['#5B5FEF', '#241F5E'], warm: true },
  mba_students: { colors: ['#3730A3', '#181541'], warm: false },
  professionals: { colors: ['#4245C4', '#1E1B4B'], warm: false },
  new_hires: { colors: ['#6D71F5', '#2A2470'], warm: true }
};

const SCENE_SILHOUETTE_PATH =
  'M0 150 L36 118 L58 128 L92 100 L122 120 L152 96 L182 116 L212 104 L246 124 L276 108 L300 128 L300 160 L0 160 Z';

const SceneBackdrop: React.FC<{ audience: Audience; children: React.ReactNode }> = ({ audience, children }) => {
  const mood = AUDIENCE_SCENE_MOOD[audience] || AUDIENCE_SCENE_MOOD.professionals;
  return (
    <View style={styles.scene}>
      <LinearGradient colors={mood.colors} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={StyleSheet.absoluteFill} />
      {mood.warm && <View style={styles.sceneGlow} />}
      <Svg viewBox="0 0 300 160" style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Path d={SCENE_SILHOUETTE_PATH} fill="rgba(255,255,255,0.10)" />
      </Svg>
      <View style={styles.sceneContent}>{children}</View>
    </View>
  );
};

const TOTAL_QUESTIONS = 5;

// Labor illusion: generation can genuinely take up to ~16s on a cache miss
// (see backend storyService's LLM fallback chain). A bare spinner reads as
// "is this stuck?" — naming what's actually happening, even loosely, makes a
// real wait feel purposeful instead of dead air.
const LOADING_STATUS_LINES = [
  'Reading your profile…',
  'Building the scene…',
  'Weighing how it could go…',
  'Almost ready…'
];

// A choice is scored "strong" if it's assertive or diplomatic — the two
// trajectories the backend's fallback tree (and every generated story)
// consistently resolves toward a "strong" ending tone, vs. avoidant/
// aggressive resolving toward "growth"/"mixed". Making that judgment
// explicit here (rather than leaving it implicit in the narrative) is what
// turns each choice into a real right/wrong questionnaire item.
const isStrongPick = (t: StoryTrajectory) => t === 'assertive' || t === 'diplomatic';

// Fixed, reusable across every story regardless of content — the taxonomy
// itself (not the specific scenario) is what determines the rationale, so
// no backend prompt change is needed to support this.
const PICK_RATIONALE: Record<StoryTrajectory, string> = {
  assertive: 'Direct and clear — a strong, confident way to handle it.',
  diplomatic: 'Collaborative and clear — this lands well without losing your point.',
  avoidant: 'This sidesteps the tension, but leaves the real issue unresolved.',
  aggressive: 'This asserts your position, but risks damaging the relationship.'
};

function resolveDominantTrajectory(picks: StoryTrajectory[]): StoryTrajectory {
  if (picks.length === 0) return 'assertive';
  const tally: Record<StoryTrajectory, number> = { assertive: 0, diplomatic: 0, avoidant: 0, aggressive: 0 };
  picks.forEach((p) => tally[p]++);
  let best = picks[picks.length - 1];
  let bestCount = 0;
  for (let i = picks.length - 1; i >= 0; i--) {
    const t = picks[i];
    if (tally[t] > bestCount) {
      bestCount = tally[t];
      best = t;
    }
  }
  return best;
}

function tierForScore(strongCount: number): string {
  if (strongCount >= 5) return 'Master Communicator';
  if (strongCount >= 3) return 'Strong Instincts';
  return 'Growing Communicator';
}

const TONE_COLOR = { strong: 'sage', growth: 'champagne', mixed: 'flame' } as const;

// The generated options arrive in a fixed style order; showing them that way
// would let a player learn "the good one is always second". Every beat is
// shown in a fresh random order (letters follow the new positions).
const shuffleBeat = (beat: StoryBeat): StoryBeat => {
  const opts = [...beat.options];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return { ...beat, options: opts.map((o, i) => ({ ...o, id: (['A', 'B', 'C', 'D'] as const)[i] })) };
};

// The story-scene player for one Journey node — reached from JourneyScreen's
// preview modal. Unlike the old daily Story Mode, this story is generated
// once per (user, node) and cached permanently server-side (see backend
// storyService.getNodeStory), so completing it marks that specific roadmap
// node done rather than "today" done. Each of the 5 choices is scored as a
// right/wrong questionnaire item (see isStrongPick above), with immediate
// feedback after every pick, ending in a shareable comprehension score
// instead of a pure narrative "ending".
export const JourneyStoryScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { node, journeyTitle } = route.params as { node: JourneyNode; journeyTitle: string };
  const { colors } = useTheme();
  const { user, markJourneyNodeComplete, unlockMilestone } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const [story, setStory] = useState<StoryTree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<'intro' | 'question' | 'feedback' | 'ending'>('intro');
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<StoryTrajectory[]>([]);
  const [currentBeat, setCurrentBeat] = useState<StoryBeat | null>(null);
  const [lastPick, setLastPick] = useState<StoryTrajectory | null>(null);

  const { viewShotRef, share } = useShareCard();

  const [loadingLineIndex, setLoadingLineIndex] = useState(0);
  const loadingLineFade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      Animated.timing(loadingLineFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setLoadingLineIndex((i) => Math.min(i + 1, LOADING_STATUS_LINES.length - 1));
        Animated.timing(loadingLineFade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
    }, 1900);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    apiService
      .getNodeStory({
        userId: user.id,
        nodeId: node.id,
        seed: node.storySeed || node.description,
        journeyTitle,
        audience: user.audience,
        name: user.name
      })
      .then((res) => {
        setStory(res.story);
        setCurrentBeat(shuffleBeat(res.story.q1));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChoose = (trajectory: StoryTrajectory) => {
    if (!story) return;
    setPicks((prev) => [...prev, trajectory]);
    setLastPick(trajectory);
    setPhase('feedback');
  };

  const handleContinueFromFeedback = () => {
    if (!story) return;
    if (step === TOTAL_QUESTIONS - 1) {
      markComplete();
      setPhase('ending');
      return;
    }
    const dominant = resolveDominantTrajectory(picks);
    const branchKey = (['q2', 'q3', 'q4', 'q5'] as const)[step];
    setCurrentBeat(shuffleBeat(story[branchKey][dominant]));
    setStep(step + 1);
    setPhase('question');
  };

  const strongCount = picks.filter(isStrongPick).length;
  const tierLabel = tierForScore(strongCount);

  const markComplete = () => {
    const alreadyDone = (user.completedJourneyNodeIds || []).includes(node.id);
    markJourneyNodeComplete(node.id);
    unlockMilestone('badge_story_mode', 'Story Chooser', 'Completed your first story scene.', 'sparkles');
    if (!alreadyDone) {
      const journey = JOURNEYS[user.audience || 'founders_investors'];
      const doneSoFar = new Set([...(user.completedJourneyNodeIds || []), node.id]);
      const completedAll = journey.nodes.every((n) => doneSoFar.has(n.id));
      if (completedAll) {
        unlockMilestone('badge_journey_complete', 'Path Cleared', `Completed every stage of ${journey.title}.`, 'award');
      }
    }
  };

  const finalTrajectory = resolveDominantTrajectory(picks);
  const ending = story?.endings[finalTrajectory];

  const handleShare = () => {
    if (!story) return;
    share('Share your Journey result');
  };

  if (isLoading || !story || !currentBeat) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Animated.Text style={[styles.loadingLine, { color: colors.textSecondary, opacity: loadingLineFade }]}>
          {LOADING_STATUS_LINES[loadingLineIndex]}
        </Animated.Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {node.title}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {(phase === 'question' || phase === 'feedback') && (
        <View style={styles.dotsRow}>
          {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: colors.primary,
                  opacity: i <= step ? 1 : 0.3,
                  width: i === step ? 22 : 8
                }
              ]}
            />
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {phase === 'intro' ? (
          <View>
            <SceneBackdrop audience={user.audience || 'professionals'}>
              <View style={styles.sceneIconCircle}>
                <node.icon size={26} color="#FFFFFF" />
              </View>
              <Text style={styles.sceneTag}>{node.stageLabel} · {journeyTitle.toUpperCase()}</Text>
              <Text style={styles.sceneTitle}>{story.title}</Text>
              <Text style={styles.scenePremise}>{story.premise}</Text>
            </SceneBackdrop>
            <View style={styles.centeredBlock}>
              <Text style={[styles.introHint, { color: colors.textMuted }]}>
                5 choices — each one is scored. See how you did at the end.
              </Text>
              <Button title="Begin the Story" onPress={() => setPhase('question')} style={{ marginTop: 14, width: '100%' }} />
            </View>
          </View>
        ) : phase === 'question' ? (
          <View>
            <SceneBackdrop audience={user.audience || 'professionals'}>
              <Text style={styles.sceneNarrative}>{currentBeat.narrative}</Text>
            </SceneBackdrop>
            <View style={styles.optionsList}>
              {currentBeat.options.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionRow, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}
                  onPress={() => handleChoose(opt.trajectory)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.optionBadge, { backgroundColor: colors.primarySubtle }]}>
                    <Text style={[styles.optionBadgeText, { color: colors.primary }]}>{opt.id}</Text>
                  </View>
                  <Text style={[styles.optionText, { color: colors.textPrimary }]}>{opt.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : phase === 'feedback' && lastPick ? (
          <View style={styles.centeredBlock}>
            {isStrongPick(lastPick) ? (
              <View style={[styles.verdictCircle, { backgroundColor: colors.cardCategories.sage.subtle }]}>
                <Check size={30} color={colors.cardCategories.sage.solid} strokeWidth={3} />
              </View>
            ) : (
              <View style={[styles.verdictCircle, { backgroundColor: colors.cardCategories.flame.subtle }]}>
                <X size={30} color={colors.cardCategories.flame.solid} strokeWidth={3} />
              </View>
            )}
            <Text style={[styles.introTitle, { color: colors.textPrimary }]}>
              {isStrongPick(lastPick) ? 'Strong Move' : "There's a Stronger Way"}
            </Text>
            <Text style={[styles.introBody, { color: colors.textSecondary }]}>{PICK_RATIONALE[lastPick]}</Text>
            <Button title="Continue" onPress={handleContinueFromFeedback} style={{ marginTop: 20, width: '100%' }} />
          </View>
        ) : (
          ending && (
            <View style={styles.centeredBlock}>
              <View style={[styles.iconCircleLg, { backgroundColor: colors.cardCategories[TONE_COLOR[ending.tone]].subtle }]}>
                <PartyPopper size={32} color={colors.cardCategories[TONE_COLOR[ending.tone]].solid} />
              </View>
              <Text style={[styles.scoreFraction, { color: colors.primary }]}>
                {strongCount}/{TOTAL_QUESTIONS}
              </Text>
              <Text style={[styles.tagPill, { color: colors.textSecondary, backgroundColor: colors.surfaceElevated }]}>
                STRONG MOVES
              </Text>
              <Text style={[styles.introTitle, { color: colors.textPrimary }]}>{tierLabel}</Text>
              <Text style={[styles.introBody, { color: colors.textSecondary }]}>{ending.narrative}</Text>

              <View style={styles.endingActions}>
                <Button title="Share My Result" onPress={handleShare} icon={<Share2 size={16} color="#FFFFFF" />} style={{ width: '100%' }} />
                <Button title="Continue Your Journey" variant="secondary" onPress={() => navigation.goBack()} style={{ width: '100%' }} />
              </View>
            </View>
          )
        )}
      </ScrollView>

      {phase === 'ending' && (
        <View style={styles.offscreenCard} pointerEvents="none">
          <StoryShareCard ref={viewShotRef} storyTitle={story.title} tierLabel={tierLabel} strongCount={strongCount} totalCount={TOTAL_QUESTIONS} picks={picks} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  loadingLine: { fontSize: 13.5, fontWeight: '600', marginTop: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  headerBtn: { padding: 6 },
  headerTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3, flex: 1, textAlign: 'center', marginHorizontal: 4 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 14 },
  dot: { height: 8, borderRadius: 4 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 40, flexGrow: 1 },
  centeredBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  iconCircleLg: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  verdictCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scoreFraction: { fontSize: 44, fontWeight: '800', letterSpacing: -1, marginBottom: 4 },
  tagPill: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 14,
    overflow: 'hidden',
    textAlign: 'center'
  },
  introTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3, marginBottom: 10 },
  introBody: { fontSize: 14.5, lineHeight: 21, textAlign: 'center' },
  introHint: { fontSize: 12.5, textAlign: 'center', marginTop: 14, fontStyle: 'italic' },
  scene: {
    borderRadius: RADII.xl,
    overflow: 'hidden',
    marginBottom: 18,
    minHeight: 170
  },
  sceneGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
    top: -50,
    right: -40
  },
  sceneContent: {
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 170
  },
  sceneIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  sceneTag: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 8
  },
  sceneTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', letterSpacing: -0.3, marginBottom: 8 },
  scenePremise: { fontSize: 13.5, lineHeight: 20, color: 'rgba(255,255,255,0.88)', textAlign: 'center' },
  sceneNarrative: { fontSize: 16, lineHeight: 24, fontWeight: '500', color: '#FFFFFF', textAlign: 'center' },
  optionsList: { gap: 10 },
  optionRow: { flexDirection: 'row', alignItems: 'center', borderRadius: RADII.lg, borderWidth: 1.5, padding: 14 },
  optionBadge: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionBadgeText: { fontSize: 13, fontWeight: '800' },
  optionText: { flex: 1, fontSize: 14, lineHeight: 19, fontWeight: '500' },
  endingActions: { width: '100%', gap: 10, marginTop: 22 },
  offscreenCard: { position: 'absolute', top: -9999, left: -9999 }
});

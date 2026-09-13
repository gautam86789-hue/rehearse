import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated, Easing, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { ArrowLeft, Lock, Check, Play, X, Trophy, Sparkles } from 'lucide-react-native';
import { useTheme, RADII } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { JOURNEYS, JourneyNode } from '../data/journeys';
import { KNOWLEDGE_ARTICLES } from '../data/knowledgeBase';
import { InAppNotification } from '../components/common/InAppNotification';
import { JourneyBackdrop } from '../components/common/JourneyBackdrop';

const NODE_SIZE = 68;
const NODE_SPACING_Y = 132;
const BANNER_HEIGHT = 56;
const X_OFFSETS = [0, 74, 0, -74]; // center, right, center, left — the zigzag path
const BURST_ANGLES = [0, 60, 120, 180, 240, 300].map((deg) => (deg * Math.PI) / 180);

interface LayoutBanner {
  stageLabel: string;
  y: number;
}

interface LayoutNode {
  node: JourneyNode;
  x: number;
  y: number;
}

const BANNER_VISUAL_HEIGHT = BANNER_HEIGHT - 14; // matches styles.banner's actual height below

// Presentational only — never stored in journeys.ts, so it can never be
// marked complete or counted toward progress. Signals that the roadmap
// keeps growing in future updates rather than being a fixed, finite path.
const UPCOMING_NODE: JourneyNode = {
  id: '__upcoming__',
  type: 'upcoming',
  stageLabel: "WHAT'S NEXT",
  title: 'More chapters on the way',
  description: 'New lessons and story scenes get added in future updates.',
  icon: Sparkles
};

function computeLayout(nodes: JourneyNode[], centerX: number) {
  const banners: LayoutBanner[] = [];
  const positions: LayoutNode[] = [];
  let y = 24;
  let lastStage: string | null = null;
  let pathIndex = 0;

  nodes.forEach((node) => {
    if (node.stageLabel !== lastStage) {
      banners.push({ stageLabel: node.stageLabel, y });
      // Extra clearance below the banner — the "START" bubble above the
      // active node floats ~30px above it, so the very first node in a
      // stage needs more room than a mid-stage node does.
      y += BANNER_HEIGHT + 26;
      lastStage = node.stageLabel;
    }
    const x = centerX + X_OFFSETS[pathIndex % X_OFFSETS.length];
    positions.push({ node, x, y });
    y += NODE_SPACING_Y;
    pathIndex++;
  });

  const totalHeight = y + 80;

  // Bottom-to-top climb: node 0 (the first stage) belongs at the BOTTOM of
  // the scroll content, with each later stage above it — mirroring every y
  // computed above around totalHeight, rather than redoing the layout math
  // bottom-up (the zigzag/banner-clearance logic is identical either way,
  // only which end is "up" changes). A banner's mirrored position naturally
  // lands just below its stage's nodes, i.e. the first thing you climb past
  // entering that stage from below — which is exactly the reading order a
  // bottom-to-top path calls for.
  const mirroredPositions: LayoutNode[] = positions.map((p) => ({
    ...p,
    y: totalHeight - p.y - NODE_SIZE
  }));
  const mirroredBanners: LayoutBanner[] = banners.map((b) => ({
    ...b,
    y: totalHeight - b.y - BANNER_VISUAL_HEIGHT
  }));

  let pathD = '';
  mirroredPositions.forEach((p, i) => {
    if (i === 0) {
      pathD += `M ${p.x} ${p.y + NODE_SIZE / 2}`;
    } else {
      const prev = mirroredPositions[i - 1];
      const midY = (prev.y + p.y) / 2 + NODE_SIZE / 2;
      pathD += ` Q ${prev.x} ${midY} ${(prev.x + p.x) / 2} ${midY} Q ${p.x} ${midY} ${p.x} ${p.y + NODE_SIZE / 2}`;
    }
  });

  return { banners: mirroredBanners, positions: mirroredPositions, pathD, totalHeight };
}

export const JourneyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, unlockMilestone } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;
  // Reactive, not a module-scope Dimensions.get() snapshot — see
  // JourneyBackdrop's comment on why a foldable's fold/unfold needs this to
  // recompute rather than staying pinned to the pre-fold width.
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const centerX = screenWidth / 2 - 16; // account for horizontal screen padding below

  const audience = user.audience || 'founders_investors';
  const journey = JOURNEYS[audience];
  const completed = new Set(user.completedJourneyNodeIds || []);
  const completedCount = journey.nodes.filter((n) => completed.has(n.id)).length;

  const layout = useMemo(() => computeLayout([...journey.nodes, UPCOMING_NODE], centerX), [journey, centerX]);

  const [previewNode, setPreviewNode] = useState<JourneyNode | null>(null);
  const [showUpcomingToast, setShowUpcomingToast] = useState(false);

  // Opens the screen scrolled to wherever the user actually is, not the top
  // of the (now-mirrored) content — for a brand-new user that's already the
  // bottom, but a returning user would otherwise have to scroll up past
  // every locked future stage to find their place.
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    const currentIndex = Math.min(completedCount, journey.nodes.length - 1);
    const target = layout.positions[currentIndex];
    if (!target) return;
    const timer = setTimeout(() => {
      const viewportOffset = screenHeight * 0.42;
      scrollRef.current?.scrollTo({ y: Math.max(0, target.y - viewportOffset), animated: false });
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // One entrance Animated.Value per node — staggered fade + rise on mount,
  // rather than everything popping in at once. The upcoming ghost node gets
  // its own single value, kept out of this array so every other index here
  // stays a safe 1:1 match with journey.nodes (no off-by-one risk).
  const entranceAnims = useRef(journey.nodes.map(() => new Animated.Value(0))).current;
  const upcomingEntranceAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.stagger(
      70,
      [...entranceAnims, upcomingEntranceAnim].map((v) =>
        Animated.timing(v, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      )
    ).start();
  }, []);

  // Pulses the node that just flipped from locked to unlocked, and fires a
  // small radiating burst from the node that was just COMPLETED (one index
  // behind) — "celebrate small wins" made literal rather than just a silent
  // re-render. Also detects the transition into full-journey completion,
  // which gets its own distinct full-screen moment below (the biggest
  // peak-end beat this feature has) rather than reusing the small per-node
  // pulse.
  const prevCompletedCountRef = useRef(completedCount);
  const pulseAnims = useRef(journey.nodes.map(() => new Animated.Value(1))).current;
  const burstAnims = useRef(journey.nodes.map(() => new Animated.Value(0))).current;
  const [showJourneyComplete, setShowJourneyComplete] = useState(false);
  useEffect(() => {
    if (completedCount > prevCompletedCountRef.current) {
      const justCompletedIdx = completedCount - 1;
      const burst = burstAnims[justCompletedIdx];
      if (burst) {
        burst.setValue(0);
        Animated.timing(burst, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
      }
      if (completedCount < journey.nodes.length) {
        const anim = pulseAnims[completedCount];
        if (anim) {
          Animated.sequence([
            Animated.timing(anim, { toValue: 1.25, duration: 220, useNativeDriver: true }),
            Animated.spring(anim, { toValue: 1, friction: 4, useNativeDriver: true })
          ]).start();
        }
      } else {
        setShowJourneyComplete(true);
      }
    }
    prevCompletedCountRef.current = completedCount;
  }, [completedCount]);

  // Gentle vertical bounce on the "START" callout above the next node.
  const bounceAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -6, duration: 550, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 550, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: journey.nodes.length > 0 ? completedCount / journey.nodes.length : 0,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();
  }, [completedCount]);

  const handleNodePress = (node: JourneyNode, isUnlocked: boolean) => {
    if (!isUnlocked) return;
    setPreviewNode(node);
  };

  const handleStart = () => {
    if (!previewNode) return;
    const node = previewNode;
    setPreviewNode(null);
    if (node.type === 'lesson') {
      const article = KNOWLEDGE_ARTICLES.find((a) => a.id === node.articleId);
      if (article) navigation.navigate('KnowledgeArticle', { article, journeyNodeId: node.id });
    } else {
      navigation.navigate('JourneyStory', { node, journeyTitle: journey.title });
    }
  };

  useEffect(() => {
    unlockMilestone('badge_explorer', 'Explorer', 'Opened your Journey for the first time.', 'award');
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <JourneyBackdrop />
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {journey.title}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.progressRow}>
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceBorder }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
              }
            ]}
          />
        </View>
        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
          {completedCount}/{journey.nodes.length}
        </Text>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>{journey.tagline}</Text>

        <View style={[styles.pathArea, { height: layout.totalHeight }]}>
          <Svg width={screenWidth - 32} height={layout.totalHeight} style={StyleSheet.absoluteFill}>
            <Path d={layout.pathD} stroke={colors.surfaceBorder} strokeWidth={4} fill="none" strokeDasharray="2 14" strokeLinecap="round" />
          </Svg>

          {layout.banners.map((b, i) => (
            <View
              key={`banner-${i}`}
              style={[
                styles.banner,
                { top: b.y, backgroundColor: colors.primarySubtle, borderColor: colors.primary }
              ]}
            >
              <Text style={[styles.bannerText, { color: colors.primary }]}>{b.stageLabel}</Text>
            </View>
          ))}

          {layout.positions.map((p, idx) => {
            if (p.node.type === 'upcoming') {
              const UpcomingIcon = p.node.icon;
              return (
                <Animated.View
                  key={p.node.id}
                  style={[
                    styles.nodeWrap,
                    {
                      left: p.x - NODE_SIZE / 2,
                      top: p.y,
                      opacity: upcomingEntranceAnim,
                      transform: [
                        { translateY: upcomingEntranceAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }
                      ]
                    }
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowUpcomingToast(true)}
                    style={[styles.node, styles.upcomingNode, { borderColor: colors.surfaceBorder, backgroundColor: colors.surfaceElevated }]}
                  >
                    <UpcomingIcon size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </Animated.View>
              );
            }

            const isDone = completed.has(p.node.id);
            const isUnlocked = idx === 0 || completed.has(journey.nodes[idx - 1].id);
            const isCurrent = isUnlocked && !isDone;
            const isNext = isCurrent && idx === completedCount;
            const Icon = p.node.icon;

            return (
              <Animated.View
                key={p.node.id}
                style={[
                  styles.nodeWrap,
                  {
                    left: p.x - NODE_SIZE / 2,
                    top: p.y,
                    opacity: entranceAnims[idx],
                    transform: [
                      { translateY: entranceAnims[idx].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
                      { scale: pulseAnims[idx] }
                    ]
                  }
                ]}
              >
                {isNext && (
                  <Animated.View style={[styles.startBubble, { backgroundColor: colors.primary, transform: [{ translateY: bounceAnim }] }]}>
                    <Text style={styles.startBubbleText}>START</Text>
                  </Animated.View>
                )}
                <TouchableOpacity
                  activeOpacity={isUnlocked ? 0.8 : 1}
                  onPress={() => handleNodePress(p.node, isUnlocked)}
                  style={[
                    styles.node,
                    {
                      backgroundColor: isDone ? colors.primary : isUnlocked ? colors.surfaceCard : colors.surfaceElevated,
                      borderColor: isDone ? colors.primary : isUnlocked ? colors.primary : colors.surfaceBorder
                    }
                  ]}
                >
                  {isDone ? (
                    <Check size={26} color="#FFFFFF" strokeWidth={3} />
                  ) : isUnlocked ? (
                    <Icon size={24} color={colors.primary} />
                  ) : (
                    <Lock size={20} color={colors.textMuted} />
                  )}
                </TouchableOpacity>

                {/* Radiating burst on completion — 6 dots expanding outward and
                    fading, fired once from the pulse/burst effect above. */}
                {BURST_ANGLES.map((angle, dotIdx) => (
                  <Animated.View
                    key={dotIdx}
                    pointerEvents="none"
                    style={[
                      styles.burstDot,
                      {
                        backgroundColor: colors.primary,
                        opacity: burstAnims[idx].interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
                        transform: [
                          {
                            translateX: burstAnims[idx].interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, Math.cos(angle) * 42]
                            })
                          },
                          {
                            translateY: burstAnims[idx].interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, Math.sin(angle) * 42]
                            })
                          },
                          {
                            scale: burstAnims[idx].interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.4, 1, 0.4] })
                          }
                        ]
                      }
                    ]}
                  />
                ))}
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={!!previewNode} transparent animationType="fade" onRequestClose={() => setPreviewNode(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setPreviewNode(null)}
              hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            {previewNode && (
              <>
                <View style={[styles.modalIconCircle, { backgroundColor: colors.primarySubtle }]}>
                  <previewNode.icon size={26} color={colors.primary} />
                </View>
                <Text style={[styles.modalStage, { color: colors.textSecondary }]}>{previewNode.stageLabel}</Text>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{previewNode.title}</Text>
                <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>{previewNode.description}</Text>
                <TouchableOpacity style={[styles.modalStartBtn, { backgroundColor: colors.primary }]} onPress={handleStart} activeOpacity={0.85}>
                  <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.modalStartText}>{previewNode.type === 'lesson' ? 'Start Lesson' : 'Start Story'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* The one distinct peak-end moment this feature has — finishing the
          whole roadmap gets its own full-screen celebration, not the same
          small badge popup every other milestone uses. */}
      <Modal visible={showJourneyComplete} transparent animationType="fade" onRequestClose={() => setShowJourneyComplete(false)}>
        <View style={[styles.completeOverlay, { backgroundColor: colors.background }]}>
          <View style={[styles.completeBadge, { backgroundColor: colors.champagneSubtle, borderColor: colors.champagne }]}>
            <Trophy size={40} color={colors.champagne} />
          </View>
          <Text style={[styles.completeEyebrow, { color: colors.champagne }]}>JOURNEY COMPLETE</Text>
          <Text style={[styles.completeTitle, { color: colors.textPrimary }]}>{journey.title}</Text>
          <Text style={[styles.completeBody, { color: colors.textSecondary }]}>
            All {journey.nodes.length} stages done — every lesson and every scene. That's the whole path.
          </Text>
          <TouchableOpacity
            style={[styles.completeBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setShowJourneyComplete(false);
              navigation.goBack();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.completeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <InAppNotification
        visible={showUpcomingToast}
        message="New chapters coming in a future update."
        type="info"
        onDismiss={() => setShowUpcomingToast(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  headerBtn: { padding: 6 },
  headerTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, flex: 1, textAlign: 'center' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 10
  },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 11.5, fontWeight: '700' },
  tagline: { fontSize: 13.5, textAlign: 'center', paddingHorizontal: 30, marginBottom: 8, lineHeight: 19 },
  pathArea: { width: '100%', position: 'relative' },
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: BANNER_HEIGHT - 14,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bannerText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  nodeWrap: { position: 'absolute', width: NODE_SIZE, alignItems: 'center' },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  upcomingNode: {
    borderStyle: 'dashed',
    opacity: 0.8
  },
  startBubble: {
    position: 'absolute',
    top: -30,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    zIndex: 10
  },
  startBubbleText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  burstDot: {
    position: 'absolute',
    top: NODE_SIZE / 2 - 3,
    left: NODE_SIZE / 2 - 3,
    width: 6,
    height: 6,
    borderRadius: 3
  },
  completeOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 36 },
  completeBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  completeEyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginBottom: 10 },
  completeTitle: { fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: -0.4, marginBottom: 12 },
  completeBody: { fontSize: 14.5, lineHeight: 21, textAlign: 'center', marginBottom: 30, maxWidth: 300 },
  completeBtn: { paddingHorizontal: 40, paddingVertical: 15, borderRadius: RADII.lg },
  completeBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 30 },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: RADII.xl,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center'
  },
  modalClose: { position: 'absolute', top: 14, right: 14, padding: 4 },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  modalStage: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  modalDesc: { fontSize: 13.5, textAlign: 'center', lineHeight: 19, marginBottom: 18 },
  modalStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: RADII.lg,
    width: '100%',
    justifyContent: 'center'
  },
  modalStartText: { color: '#FFFFFF', fontSize: 14.5, fontWeight: '700' }
});

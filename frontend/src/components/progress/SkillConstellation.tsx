import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  LayoutChangeEvent,
  useWindowDimensions,
  Platform
} from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  G,
  Line
} from 'react-native-svg';
import { Lock } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { CommunicationSkill } from '../../types/progress';
import { progressPalette } from './core/palette';
import { bandFor, BANDS, Band } from './core/geometry';
import { useReveal, useRevealJS, useBreathe, riseIn, DUR } from './core/motion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

export interface ConstellationSkill extends CommunicationSkill {
  locked?: boolean;
}

interface SkillConstellationProps {
  skills: ConstellationSkill[];
  onSelectSkill: (skill: ConstellationSkill) => void;
  selectedId?: string | null;
}

interface ConstellationNode {
  skill: ConstellationSkill;
  x: number;
  y: number;
  size: number;
  band: Band;
  locked: boolean;
  quadrant: 'top-left' | 'bottom-left' | 'top-right' | 'mid-right' | 'bottom-right';
  badgeTop: number;
  isLeft: boolean;
}

export const SkillConstellation: React.FC<SkillConstellationProps> = ({
  skills,
  onSelectSkill,
  selectedId
}) => {
  const { colors: themeColors, isDark } = useTheme();
  const p = progressPalette(themeColors, isDark);
  const { width: winWidth } = useWindowDimensions();

  const [boxWidth, setBoxWidth] = useState(Math.min(winWidth - 32, 420));
  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - boxWidth) > 1) setBoxWidth(w);
  };

  const CANVAS_HEIGHT = 380;
  const cx = boxWidth / 2;
  const cy = 186;
  const R_INNER = 40;

  const active = skills.filter((s) => !s.locked);
  const overall = active.length
    ? Math.round(active.reduce((sum, s) => sum + s.score, 0) / active.length)
    : 80;

  // Badge card width tailored dynamically to available gutter space
  const badgeWidth = Math.min(126, Math.max(106, Math.floor((boxWidth - 92) / 2)));

  // Spatial layout mapping for 5 core skill nodes
  const nodes: ConstellationNode[] = useMemo(() => {
    const findSkill = (query: string, fallbackIdx: number) => {
      const match = skills.find(
        (s) =>
          s.id.toLowerCase().includes(query) ||
          s.name.toLowerCase().includes(query)
      );
      return match || skills[fallbackIdx % skills.length];
    };

    const slotsConfig = [
      {
        skill: findSkill('managing_up', 4),
        quadrant: 'top-left' as const,
        isLeft: true,
        // Node coordinates placed right near the inner edge of its badge
        nodeX: cx - (badgeWidth > 115 ? 54 : 46),
        nodeY: cy - 46,
        size: 14,
        badgeTop: cy - 76
      },
      {
        skill: findSkill('executive_presence', 3),
        quadrant: 'bottom-left' as const,
        isLeft: true,
        nodeX: cx - (badgeWidth > 115 ? 58 : 50),
        nodeY: cy + 46,
        size: 18,
        badgeTop: cy + 34
      },
      {
        skill: findSkill('negotiation', 0),
        quadrant: 'top-right' as const,
        isLeft: false,
        nodeX: cx + (badgeWidth > 115 ? 54 : 46),
        nodeY: cy - 54,
        size: 20,
        badgeTop: cy - 84
      },
      {
        skill: findSkill('boundary_setting', 1),
        quadrant: 'mid-right' as const,
        isLeft: false,
        nodeX: cx + (badgeWidth > 115 ? 74 : 64),
        nodeY: cy - 4,
        size: 18,
        badgeTop: cy - 22
      },
      {
        skill: findSkill('difficult_feedback', 2),
        quadrant: 'bottom-right' as const,
        isLeft: false,
        nodeX: cx + (badgeWidth > 115 ? 58 : 50),
        nodeY: cy + 50,
        size: 18,
        badgeTop: cy + 40
      }
    ];

    return slotsConfig.map((slot) => {
      const score = slot.skill?.score || 75;
      const band = bandFor(score);
      return {
        skill: slot.skill,
        x: slot.nodeX,
        y: slot.nodeY,
        size: slot.skill.locked ? 14 : slot.size,
        band,
        locked: !!slot.skill.locked,
        quadrant: slot.quadrant,
        badgeTop: slot.badgeTop,
        isLeft: slot.isLeft
      };
    });
  }, [skills, cx, cy, badgeWidth]);

  const draw = useRevealJS(160, DUR.draw);
  const fade = useReveal(400, DUR.base);
  const corePulse = useBreathe(true, false);

  const spokeOpacity = draw.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const coreHaloRadius = corePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [R_INNER + 3, R_INNER + 12]
  });
  const coreHaloOpacity = corePulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.1] });

  // Concentric orbital guide rings
  const rings = [
    { r: R_INNER + 20, dash: '2 4', opacity: isDark ? 0.25 : 0.45 },
    { r: R_INNER + 52, dash: '3 6', opacity: isDark ? 0.3 : 0.5 },
    { r: R_INNER + 82, dash: '4 8', opacity: isDark ? 0.2 : 0.35 }
  ];

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <View
        style={[
          styles.canvasCard,
          {
            backgroundColor: isDark ? '#0C1813' : '#FAF7F0',
            borderColor: isDark ? '#1C3127' : '#EAE4D8'
          }
        ]}
      >
        <Svg width={boxWidth} height={CANVAS_HEIGHT}>
          <Defs>
            {/* Atmospheric Background Radial Wash */}
            <RadialGradient id="fieldWash" cx="50%" cy="50%" r="55%" fx="50%" fy="50%">
              <Stop offset="0%" stopColor="#C8AA6A" stopOpacity={isDark ? 0.2 : 0.12} />
              <Stop offset="50%" stopColor="#C8AA6A" stopOpacity={isDark ? 0.06 : 0.03} />
              <Stop offset="100%" stopColor="#FAF7F0" stopOpacity={0} />
            </RadialGradient>

            {/* Core Golden Amber Gradient */}
            <RadialGradient id="goldCoreGradient" cx="38%" cy="32%" r="68%">
              <Stop offset="0%" stopColor="#DFBF7B" />
              <Stop offset="45%" stopColor="#BA8E48" />
              <Stop offset="80%" stopColor="#966F2D" />
              <Stop offset="100%" stopColor="#79561E" />
            </RadialGradient>

            {/* Bronze Node Gradient */}
            <RadialGradient id="nodeBronzeGrad" cx="35%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#DFC386" />
              <Stop offset="55%" stopColor="#B88D46" />
              <Stop offset="100%" stopColor="#7D5B20" />
            </RadialGradient>

            {/* Sage/Olive Node Gradient */}
            <RadialGradient id="nodeOliveGrad" cx="35%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#4A6E5C" />
              <Stop offset="60%" stopColor="#2A4D3B" />
              <Stop offset="100%" stopColor="#162E22" />
            </RadialGradient>

            {/* Spoke Line Gradient */}
            <LinearGradient id="spokeGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#C8AA6A" stopOpacity={0.7} />
              <Stop offset="100%" stopColor="#A8987E" stopOpacity={0.3} />
            </LinearGradient>
          </Defs>

          {/* Ambient Glow Field */}
          <Circle cx={cx} cy={cy} r={CANVAS_HEIGHT * 0.46} fill="url(#fieldWash)" />

          {/* Concentric Orbital Rings */}
          {rings.map((ring, idx) => (
            <Circle
              key={`ring-${idx}`}
              cx={cx}
              cy={cy}
              r={ring.r}
              stroke={isDark ? '#8F997F' : '#D5CAB8'}
              strokeWidth={1}
              strokeDasharray={ring.dash}
              strokeOpacity={ring.opacity}
              fill="none"
            />
          ))}

          {/* Spoke Lines Connecting Core to Nodes */}
          {nodes.map((n) => (
            <AnimatedLine
              key={`spoke-${n.skill.id}`}
              x1={cx}
              y1={cy}
              x2={n.x}
              y2={n.y}
              stroke={n.locked ? (isDark ? '#263B31' : '#CDC5B8') : 'url(#spokeGrad)'}
              strokeWidth={n.locked ? 1 : 1.5}
              strokeDasharray={n.locked ? '3 4' : undefined}
              opacity={spokeOpacity}
            />
          ))}

          {/* Central Golden Core */}
          <G>
            {/* Breathing Ambient Aura */}
            <AnimatedCircle
              cx={cx}
              cy={cy}
              r={coreHaloRadius}
              fill="#C8AA6A"
              opacity={coreHaloOpacity}
            />

            {/* Core Outer Stroke Ring */}
            <Circle
              cx={cx}
              cy={cy}
              r={R_INNER}
              stroke="#F4DEAF"
              strokeWidth={1.5}
              strokeOpacity={0.85}
              fill="none"
            />

            {/* Core Filled Sphere */}
            <Circle
              cx={cx}
              cy={cy}
              r={R_INNER - 1.5}
              fill="url(#goldCoreGradient)"
            />
          </G>

          {/* Skill Node Spheres */}
          {nodes.map((n) => {
            const isSelected = selectedId === n.skill.id;
            const isOlive = n.skill.id.includes('executive');
            return (
              <G key={`node-${n.skill.id}`}>
                {/* Selection Halo */}
                {isSelected && (
                  <Circle
                    cx={n.x}
                    cy={n.y}
                    r={n.size / 2 + 6}
                    fill="rgba(200, 170, 106, 0.35)"
                  />
                )}

                {/* Node Sphere Body */}
                <Circle
                  cx={n.x}
                  cy={n.y}
                  r={n.size / 2}
                  fill={
                    n.locked
                      ? isDark
                        ? '#1E2F26'
                        : '#E8E2D6'
                      : isOlive
                      ? 'url(#nodeOliveGrad)'
                      : 'url(#nodeBronzeGrad)'
                  }
                  stroke={
                    n.locked
                      ? isDark
                        ? '#32483D'
                        : '#B8AE9E'
                      : '#FAF7F0'
                  }
                  strokeWidth={n.locked ? 1.5 : 2}
                />

                {/* Specular Highlight */}
                {!n.locked && (
                  <Circle
                    cx={n.x - n.size * 0.16}
                    cy={n.y - n.size * 0.16}
                    r={n.size * 0.18}
                    fill="rgba(255, 255, 255, 0.55)"
                  />
                )}
              </G>
            );
          })}
        </Svg>

        {/* Central Core Readout (80 OVERALL) - Centered Exactly in the Golden Core */}
        <View
          pointerEvents="none"
          style={[
            styles.coreOverlay,
            {
              left: cx - R_INNER,
              top: cy - R_INNER,
              width: R_INNER * 2,
              height: R_INNER * 2
            }
          ]}
        >
          <Text style={styles.coreScore}>{overall}</Text>
          <Text style={styles.coreEyebrow}>OVERALL</Text>
        </View>

        {/* Floating Skill Badges */}
        {nodes.map((n, i) => (
          <NodeLabelBadge
            key={`label-${n.skill.id}`}
            node={n}
            index={i}
            isDark={isDark}
            badgeWidth={badgeWidth}
            onPress={() => onSelectSkill(n.skill)}
            selected={selectedId === n.skill.id}
          />
        ))}
      </View>

      {/* Legend Footnote */}
      <Animated.View style={[styles.legendRow, riseIn(fade, 10)]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircleHollow, { borderColor: isDark ? '#A2C9B8' : '#727875' }]} />
          <Text style={[styles.legendLabel, { color: isDark ? '#9EB3A8' : '#657069' }]}>
            Closer in · stronger
          </Text>
        </View>

        <View style={styles.legendDividerDot} />

        <View style={styles.legendItem}>
          <View style={[styles.legendCircleSolid, { backgroundColor: isDark ? '#A2C9B8' : '#727875' }]} />
          <Text style={[styles.legendLabel, { color: isDark ? '#9EB3A8' : '#657069' }]}>
            Larger · more reps
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

// =========================================================================
// FLOATING LABEL BADGE COMPONENT WITH ZERO OVERLAP GUARDS
// =========================================================================

interface NodeLabelBadgeProps {
  node: ConstellationNode;
  index: number;
  isDark: boolean;
  badgeWidth: number;
  onPress: () => void;
  selected: boolean;
}

const NodeLabelBadge: React.FC<NodeLabelBadgeProps> = ({
  node,
  index,
  isDark,
  badgeWidth,
  onPress,
  selected
}) => {
  const enter = useReveal(260 + index * 60, DUR.base);

  const containerStyle: any = {
    position: 'absolute',
    top: node.badgeTop,
    width: badgeWidth
  };

  if (node.isLeft) {
    containerStyle.left = 12;
  } else {
    containerStyle.right = 12;
  }

  return (
    <Animated.View style={[containerStyle, { opacity: enter }]}>
      <Pressable
        onPress={onPress}
        disabled={node.locked}
        style={({ pressed }) => [
          styles.badgeCard,
          {
            backgroundColor: selected
              ? isDark
                ? '#1C3127'
                : '#F6EFE0'
              : isDark
              ? '#13241C'
              : '#FFFFFF',
            borderColor: selected
              ? '#C8AA6A'
              : isDark
              ? '#263E32'
              : '#E6DFD3',
            borderWidth: selected ? 1.5 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }]
          },
          styles.badgeCardShadow
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.badgeTitle,
            {
              color: node.locked
                ? isDark
                  ? '#6A7D73'
                  : '#8C9790'
                : isDark
                ? '#FAF7F2'
                : '#1A2A22',
              textAlign: 'left'
            }
          ]}
        >
          {node.skill.name}
        </Text>

        <View style={styles.badgeMetaRow}>
          {node.locked ? (
            <View style={styles.lockedRow}>
              <Lock size={9.5} color={isDark ? '#6A7D73' : '#8C9790'} />
              <Text
                style={[
                  styles.lockedText,
                  { color: isDark ? '#6A7D73' : '#8C9790' }
                ]}
              >
                Locked
              </Text>
            </View>
          ) : (
            <View style={styles.scoreRow}>
              <Text
                style={[
                  styles.scoreNumber,
                  { color: isDark ? '#DFCA99' : '#1A2A22' }
                ]}
              >
                {node.skill.score}
              </Text>
              <Text
                style={[
                  styles.statusTag,
                  { color: isDark ? '#9EB3A8' : '#767167' }
                ]}
              >
                {BANDS[node.band].label}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16
  },
  canvasCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  coreOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  coreScore: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
    color: '#FFFFFF',
    textAlign: 'center'
  },
  coreEyebrow: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#FBF1DA',
    marginTop: 0,
    textAlign: 'center'
  },
  badgeCard: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 9,
    minHeight: 40,
    justifyContent: 'center'
  },
  badgeCardShadow: {
    shadowColor: '#3A2E1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2
  },
  badgeTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 1.5
  },
  badgeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5
  },
  lockedText: {
    fontSize: 9.5,
    fontWeight: '500'
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3.5
  },
  scoreNumber: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  statusTag: {
    fontSize: 9.5,
    fontWeight: '500'
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  legendCircleHollow: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5
  },
  legendCircleSolid: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.1
  },
  legendDividerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C2B9A8'
  }
});

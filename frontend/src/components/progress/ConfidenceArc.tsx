import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Animated, LayoutChangeEvent, useWindowDimensions } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  G,
  Line,
  Text as SvgText
} from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { ConfidenceDataPoint } from '../../types/progress';
import { progressPalette, alpha } from './core/palette';
import {
  Pt,
  smoothPath,
  closeToBaseline,
  pathLength,
  readMomentum,
  bandFor,
  BANDS,
  clamp
} from './core/geometry';
import { useRevealJS, useReveal, useBreathe, riseIn, DUR } from './core/motion';
import { T } from './core/type';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ConfidenceArcProps {
  data: ConfidenceDataPoint[];
  /** Optional override; defaults to the last point in the series. */
  current?: number;
}

const MOMENTUM_COPY = {
  climbing: 'Climbing',
  steady: 'Holding',
  dipping: 'Settling'
} as const;

/**
 * The single confidence figure for Progress.
 *
 * Replaces the former ring meter + trend chart + "you are here" pill: the
 * curve carries the trajectory, the head of the curve carries the current
 * value, and the band shading carries the standing. One number, shown once.
 */
export const ConfidenceArc: React.FC<ConfidenceArcProps> = ({ data, current }) => {
  const { colors: themeColors, isDark } = useTheme();
  const p = progressPalette(themeColors, isDark);
  const { width: winWidth } = useWindowDimensions();

  const [boxWidth, setBoxWidth] = React.useState(Math.min(winWidth - 32, 520));
  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - boxWidth) > 1) setBoxWidth(w);
  };

  const H = 208;
  const PAD = { top: 26, right: 16, bottom: 30, left: 16 };

  const series = data.length ? data : [{ rehearsalIndex: 1, score: 0, label: '1' }];
  const values = series.map((d) => clamp(d.score));
  const latest = current ?? values[values.length - 1];
  const first = values[0];
  const delta = Math.round(latest - first);
  const peak = Math.max(...values);
  const momentum = readMomentum(values);
  const band = bandFor(latest);
  const bandColor = p.band[band];

  // Scale with headroom so the curve never kisses the frame edges.
  const lo = Math.max(0, Math.min(...values) - 8);
  const hi = Math.min(100, peak + 8);
  const span = Math.max(1, hi - lo);

  const points: Pt[] = useMemo(() => {
    const innerW = boxWidth - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const step = values.length > 1 ? innerW / (values.length - 1) : 0;
    return values.map((v, i) => ({
      x: PAD.left + step * i,
      y: PAD.top + innerH * (1 - (v - lo) / span)
    }));
  }, [values, boxWidth, lo, span]);

  const line = useMemo(() => smoothPath(points), [points]);
  const area = useMemo(() => closeToBaseline(line, points, H - PAD.bottom), [line, points]);
  const len = useMemo(() => Math.max(1, pathLength(points)), [points]);

  const head = points[points.length - 1];

  const draw = useRevealJS(140, DUR.draw);
  const fade = useReveal(520, DUR.base);
  // JS-driven: these values feed SVG props (r/opacity), not transform styles.
  const pulse = useBreathe(true, false);

  const dashOffset = draw.interpolate({ inputRange: [0, 1], outputRange: [len, 0] });
  const areaOpacity = draw.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, 0, 1] });
  const haloRadius = pulse.interpolate({ inputRange: [0, 1], outputRange: [8, 17] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.34, 0.04] });

  // Band thresholds that fall inside the visible range become reference lines.
  const guides = (Object.keys(BANDS) as Array<keyof typeof BANDS>)
    .map((key) => ({ key, floor: BANDS[key].floor }))
    .filter((g) => g.floor > lo + 2 && g.floor < hi - 2);

  const yFor = (v: number) =>
    PAD.top + (H - PAD.top - PAD.bottom) * (1 - (v - lo) / span);

  return (
    <View
      onLayout={onLayout}
      style={[styles.card, { backgroundColor: p.canvas, borderColor: p.hairline }]}
    >
      {/* Standing: the one place the current number is stated */}
      <View style={styles.head}>
        <View style={styles.headLeft}>
          <Text style={[styles.eyebrow, { color: p.inkFaint }]}>CONFIDENCE</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: p.ink }]}>{Math.round(latest)}</Text>
            <View style={[styles.bandChip, { backgroundColor: p.bandWash[band], borderColor: alpha(bandColor, 0.4) }]}>
              <Text style={[styles.bandChipText, { color: bandColor }]}>{BANDS[band].label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.headRight}>
          <Text style={[styles.momentum, { color: bandColor }]}>{MOMENTUM_COPY[momentum]}</Text>
          <Text style={[styles.deltaLine, { color: p.inkFaint }]}>
            {delta >= 0 ? '+' : ''}{delta} / {values.length}
          </Text>
        </View>
      </View>

      {/* The arc */}
      <Svg width={boxWidth} height={H}>
        <Defs>
          <LinearGradient id="arcStroke" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={bandColor} stopOpacity={0.35} />
            <Stop offset="55%" stopColor={bandColor} stopOpacity={1} />
            <Stop offset="100%" stopColor={p.accentSoft} stopOpacity={1} />
          </LinearGradient>
          <LinearGradient id="arcFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={bandColor} stopOpacity={isDark ? 0.3 : 0.24} />
            <Stop offset="100%" stopColor={bandColor} stopOpacity={0} />
          </LinearGradient>
          <RadialGradient id="headGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor={bandColor} stopOpacity={0.55} />
            <Stop offset="100%" stopColor={bandColor} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Band thresholds as quiet reference lines */}
        {guides.map((g) => (
          <G key={g.key}>
            <Line
              x1={PAD.left}
              y1={yFor(g.floor)}
              x2={boxWidth - PAD.right}
              y2={yFor(g.floor)}
              stroke={p.grid}
              strokeWidth={1}
              strokeDasharray="2 6"
            />
            <SvgText
              x={boxWidth - PAD.right}
              y={yFor(g.floor) - 5}
              fill={p.inkFaint}
              fontSize={8.5}
              fontWeight="700"
              textAnchor="end"
              opacity={0.75}
            >
              {BANDS[g.key].label.toUpperCase()}
            </SvgText>
          </G>
        ))}

        {/* Filled trajectory */}
        <AnimatedPath d={area} fill="url(#arcFill)" opacity={areaOpacity} />

        {/* Drawn-on curve */}
        <AnimatedPath
          d={line}
          stroke="url(#arcStroke)"
          strokeWidth={2.75}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${len} ${len}`}
          strokeDashoffset={dashOffset}
        />

        {/* Rep markers, weighted so only meaningful ones read */}
        {points.map((pt, i) => {
          if (i === points.length - 1) return null;
          const isPeak = values[i] === peak;
          return (
            <Circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={isPeak ? 3 : 2}
              fill={isPeak ? bandColor : alpha(p.ink, 0.28)}
            />
          );
        })}

        {/* Living head of the curve */}
        <G>
          <AnimatedCircle
            cx={head.x}
            cy={head.y}
            r={haloRadius}
            fill={bandColor}
            opacity={haloOpacity}
          />
          <Circle cx={head.x} cy={head.y} r={9} fill="url(#headGlow)" />
          <Circle cx={head.x} cy={head.y} r={5} fill={p.canvas} />
          <Circle cx={head.x} cy={head.y} r={3.6} fill={bandColor} />
        </G>
      </Svg>

      {/* Anchors: only the endpoints get labels */}
      <Animated.View style={[styles.footer, riseIn(fade, 8)]}>
        <Text style={[styles.anchor, { color: p.inkFaint }]}>Start {first}</Text>
        <Text style={[styles.anchor, { color: p.inkFaint }]}>Peak {peak}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    paddingTop: 18,
    marginBottom: 14
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 2
  },
  headLeft: {
    flex: 1
  },
  headRight: {
    alignItems: 'flex-end',
    paddingTop: 2
  },
  eyebrow: {
    ...T.eyebrow
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 2
  },
  value: {
    ...T.display
  },
  bandChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1
  },
  bandChipText: {
    ...T.micro,
    fontWeight: '600'
  },
  momentum: {
    ...T.labelStrong
  },
  deltaLine: {
    ...T.micro,
    marginTop: 3
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    marginTop: -6
  },
  anchor: {
    ...T.micro
  }
});

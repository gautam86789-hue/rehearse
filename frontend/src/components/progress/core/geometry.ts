/**
 * Pure geometry + derivation helpers shared by the Progress canvases.
 *
 * These exist so the visuals are computed from the actual skill/confidence
 * data rather than hand-placed coordinates: change the numbers and every
 * curve, node and arc moves with them.
 */

export interface Pt {
  x: number;
  y: number;
}

export const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Polar placement, measured clockwise from 12 o'clock. */
export const polar = (cx: number, cy: number, radius: number, degFromTop: number): Pt => {
  const rad = ((degFromTop - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
};

/**
 * Catmull-Rom -> cubic Bezier. Produces a path that passes exactly through
 * every data point while staying smooth, which a plain quadratic spline
 * through midpoints does not.
 */
export const smoothPath = (pts: Pt[], tension = 0.5): string => {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;

    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2;

    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
};

/** Closes a line path down to a baseline so it can be filled as an area. */
export const closeToBaseline = (d: string, pts: Pt[], baselineY: number): string => {
  if (pts.length === 0) return '';
  const last = pts[pts.length - 1];
  const first = pts[0];
  return `${d} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
};

/** Approximate arc length, used to seed stroke-dasharray draw-on animations. */
export const pathLength = (pts: Pt[]): number => {
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  // Curvature adds roughly a tenth over the straight-segment sum.
  return total * 1.1;
};

/** Least-squares slope over a series, in points per rehearsal. */
export const trendSlope = (values: number[]): number => {
  const n = values.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (values[i] - meanY);
    den += (i - meanX) ** 2;
  }
  return den === 0 ? 0 : num / den;
};

export type Momentum = 'climbing' | 'steady' | 'dipping';

export const readMomentum = (values: number[]): Momentum => {
  const slope = trendSlope(values.slice(-5));
  if (slope > 0.8) return 'climbing';
  if (slope < -0.8) return 'dipping';
  return 'steady';
};

/**
 * Mastery bands. The band a score falls into drives its label, its ring
 * weight and its colour role everywhere in Progress, so a skill never
 * describes itself differently in two places.
 */
export type Band = 'emerging' | 'developing' | 'proficient' | 'commanding';

export const BANDS: Record<Band, { label: string; floor: number; note: string }> = {
  emerging: { label: 'Emerging', floor: 0, note: 'Early reps. Finding the shape of it.' },
  developing: { label: 'Developing', floor: 60, note: 'Holding up under mild pressure.' },
  proficient: { label: 'Proficient', floor: 75, note: 'Reliable when the room gets warm.' },
  commanding: { label: 'Commanding', floor: 88, note: 'Steady at the highest stakes.' }
};

export const bandFor = (score: number): Band => {
  if (score >= BANDS.commanding.floor) return 'commanding';
  if (score >= BANDS.proficient.floor) return 'proficient';
  if (score >= BANDS.developing.floor) return 'developing';
  return 'emerging';
};

/** Distance to the next band, for "what unlocks next" messaging. */
export const toNextBand = (score: number): { next: Band | null; gap: number } => {
  const order: Band[] = ['emerging', 'developing', 'proficient', 'commanding'];
  const current = order.indexOf(bandFor(score));
  if (current === order.length - 1) return { next: null, gap: 0 };
  const next = order[current + 1];
  return { next, gap: Math.max(1, Math.ceil(BANDS[next].floor - score)) };
};

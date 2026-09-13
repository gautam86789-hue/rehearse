import { ThemeColors } from '../../../context/ThemeContext';
import { Band } from './geometry';

/**
 * Progress-wide colour roles.
 *
 * Everything in Progress draws from this one function, so a band means the
 * same colour on the arc, on a constellation node and on a list row - in
 * either theme - without each component inventing its own hex values.
 */
export interface ProgressPalette {
  ink: string;
  inkSoft: string;
  inkFaint: string;

  /** Canvas interior: deeper than the card in dark, warmer in light. */
  canvas: string;
  canvasEdge: string;
  card: string;
  hairline: string;
  well: string;

  accent: string;
  accentSoft: string;
  accentWash: string;
  onAccent: string;

  band: Record<Band, string>;
  bandWash: Record<Band, string>;

  grid: string;
  locked: string;
}

export const progressPalette = (t: ThemeColors, isDark: boolean): ProgressPalette => ({
  ink: t.textPrimary,
  inkSoft: t.textSecondary,
  inkFaint: t.textMuted,

  canvas: isDark ? '#1A1A2E' : '#F0EFFB',
  canvasEdge: isDark ? '#242438' : '#E4E2F7',
  card: t.surfaceCard,
  hairline: t.surfaceBorder,
  well: isDark ? '#20203A' : '#ECEAFA',

  accent: t.primary,
  accentSoft: t.primaryLight,
  accentWash: t.primarySubtle,
  onAccent: '#FFFFFF',

  band: {
    emerging: isDark ? '#9394AD' : '#9C9DB0',
    developing: isDark ? '#60A5FA' : '#3B82F6',
    proficient: isDark ? '#8B8FF5' : '#5B5FEF',
    commanding: isDark ? '#FBBF24' : '#D97706'
  },
  bandWash: {
    emerging: isDark ? 'rgba(147, 148, 173, 0.18)' : 'rgba(156, 157, 176, 0.14)',
    developing: isDark ? 'rgba(96, 165, 250, 0.18)' : 'rgba(59, 130, 246, 0.14)',
    proficient: isDark ? 'rgba(139, 143, 245, 0.2)' : 'rgba(91, 95, 239, 0.14)',
    commanding: isDark ? 'rgba(251, 191, 36, 0.22)' : 'rgba(217, 119, 6, 0.16)'
  },

  grid: isDark ? 'rgba(241, 241, 247, 0.07)' : 'rgba(26, 27, 37, 0.06)',
  locked: isDark ? '#4A4A66' : '#B4B3C9'
});

/** Opacity helper for hex colours coming from the theme. */
export const alpha = (hex: string, a: number): string => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

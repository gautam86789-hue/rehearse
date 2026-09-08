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

  canvas: isDark ? '#0A1912' : '#FBF8F0',
  canvasEdge: isDark ? '#132A20' : '#EFE9DA',
  card: t.surfaceCard,
  hairline: t.surfaceBorder,
  well: isDark ? '#0E1F17' : '#EDE8D9',

  accent: t.primary,
  accentSoft: t.primaryLight,
  accentWash: t.primarySubtle,
  onAccent: isDark ? '#08130E' : '#FFFFFF',

  band: {
    emerging: isDark ? '#6E8478' : '#7C8C7F',
    developing: isDark ? '#8F997F' : '#5F7053',
    proficient: isDark ? '#C8AA6A' : '#B08D4F',
    commanding: isDark ? '#E5CD82' : '#8A6A24'
  },
  bandWash: {
    emerging: isDark ? 'rgba(110, 132, 120, 0.16)' : 'rgba(124, 140, 127, 0.14)',
    developing: isDark ? 'rgba(143, 153, 127, 0.18)' : 'rgba(95, 112, 83, 0.14)',
    proficient: isDark ? 'rgba(200, 170, 106, 0.18)' : 'rgba(176, 141, 79, 0.15)',
    commanding: isDark ? 'rgba(229, 205, 130, 0.22)' : 'rgba(138, 106, 36, 0.16)'
  },

  grid: isDark ? 'rgba(243, 239, 229, 0.07)' : 'rgba(23, 36, 30, 0.07)',
  locked: isDark ? '#5C6B62' : '#9AA096'
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

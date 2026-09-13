import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light' | 'system';

// Corner-radius scale — not theme-dependent, exported standalone so any
// screen can pull a consistent radius without going through useTheme().
// `lg`/`md` codify what most existing cards already use; this pass is about
// making that consistent, not inventing a new scale.
export type RadiusKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'pill';
export const RADII: Record<RadiusKey, number> = {
  xs: 8,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  pill: 999
};

export interface ElevationStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}
export type ElevationKey = 'flat' | 'sm' | 'md' | 'lg';

// Dark mode intentionally returns {} for sm/md — depth comes from surface
// color layering, not RN shadows, matching Card.tsx's existing convention.
// `lg` is the exception: it's reserved for elements that float over
// arbitrary content (the tab bar) rather than sitting flush on a surface,
// so it keeps a faint shadow even in dark mode.
//
// `elevation: 0` everywhere below is deliberate, not an oversight: Android's
// native `elevation` prop is the one thing in this system that ISN'T just a
// soft drop shadow — it renders a real Material outline shadow shape, which
// on real Android hardware showed up as a visible boxy halo/inset rectangle
// around card content the moment a rounded card sat on a light/tinted
// background (invisible on iOS, web, and in the Expo-web browser preview,
// which is why this wasn't caught until testing on a physical device). Since
// Android is the only platform that reads `elevation` at all, zeroing it out
// makes Android fall back to flat depth (border + tinted background carry
// the visual weight there) while iOS/web keep the soft shadow* properties
// completely unaffected.
function buildElevation(isDark: boolean): Record<ElevationKey, ElevationStyle> {
  const flat: ElevationStyle = { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 };
  if (isDark) {
    return {
      flat,
      sm: flat,
      md: flat,
      lg: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 0
      }
    };
  }
  return {
    flat,
    sm: {
      shadowColor: '#5B5FEF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 0
    },
    md: {
      shadowColor: '#5B5FEF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 0
    },
    lg: {
      shadowColor: '#5B5FEF',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 0
    }
  };
}

// Per-category feature-card palette — one named color per app "topic" so
// feature cards (Home tiles, Practice modes, etc.) can each carry their own
// theme instead of a uniform card background. Built from color families that
// already exist per light/dark branch below, not new hexes (except infoSubtle).
export type CardCategoryKey = 'indigo' | 'sage' | 'champagne' | 'flame' | 'teal' | 'purple' | 'ruby' | 'info';
export interface CardCategoryColor {
  solid: string;
  subtle: string;
  border: string;
}

export interface AccentColorOption {
  id: string;
  name: string;
  hex: string;
  light: string;
  dark: string;
  subtle: string;
  glow: string;
}

export const ACCENT_PALETTES: Record<string, AccentColorOption> = {
  '#5B5FEF': {
    id: 'indigo',
    name: 'Rehearse Indigo',
    hex: '#5B5FEF',
    light: '#8B8FF5',
    dark: '#4245C4',
    subtle: 'rgba(91, 95, 239, 0.12)',
    glow: 'rgba(91, 95, 239, 0.28)'
  },
  '#22C55E': {
    id: 'emerald',
    name: 'Emerald Growth',
    hex: '#22C55E',
    light: '#5FE08A',
    dark: '#15803D',
    subtle: 'rgba(34, 197, 94, 0.14)',
    glow: 'rgba(34, 197, 94, 0.28)'
  },
  '#FF9500': {
    id: 'sunset',
    name: 'Sunset Streak',
    hex: '#FF9500',
    light: '#FFB84D',
    dark: '#D97706',
    subtle: 'rgba(255, 149, 0, 0.14)',
    glow: 'rgba(255, 149, 0, 0.28)'
  },
  '#EC4899': {
    id: 'rose',
    name: 'Rose Momentum',
    hex: '#EC4899',
    light: '#F472B6',
    dark: '#BE185D',
    subtle: 'rgba(236, 72, 153, 0.14)',
    glow: 'rgba(236, 72, 153, 0.28)'
  },
  '#3B82F6': {
    id: 'ocean',
    name: 'Ocean Focus',
    hex: '#3B82F6',
    light: '#93C5FD',
    dark: '#1D4ED8',
    subtle: 'rgba(59, 130, 246, 0.14)',
    glow: 'rgba(59, 130, 246, 0.28)'
  }
};

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceCard: string;
  surfaceBorder: string;
  surfaceHighlight: string;
  cardBorder: string;
  border: string;

  primary: string;
  primaryLight: string;
  primaryDark: string;
  primarySubtle: string;
  primaryGlow: string;

  forestDark: string;
  forestBase: string;
  forestCenter: string;
  forestCard: string;
  forestBorder: string;
  forestSubtle: string;

  champagne: string;
  champagneLight: string;
  champagneDark: string;
  champagneGlow: string;
  champagneSubtle: string;

  sage: string;
  sageLight: string;
  sageDark: string;
  sageSubtle: string;

  ivory: string;
  mutedText: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  flame: string;
  flameGlow: string;
  gold: string;
  goldSubtle: string;
  ruby: string;
  rubySubtle: string;
  purple: string;
  purpleSubtle: string;

  success: string;
  warning: string;
  error: string;
  danger: string;
  info: string;
  infoSubtle: string;

  headerBackground: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarInactive: string;

  // Secondary "score" accent — used specifically for the Result screen's ring
  // and metric bars, keeping primary indigo reserved for CTAs.
  scoreTeal: string;
  scoreTealSubtle: string;

  // One named color per feature "topic" so feature cards (Home tiles,
  // Practice modes, etc.) can each carry their own theme. Values are drawn
  // from the color families above, not independent hexes.
  cardCategories: Record<CardCategoryKey, CardCategoryColor>;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  accentColor: string;
  setAccentColor: (color: string) => Promise<void>;
  isDark: boolean;
  colors: ThemeColors;
  elevation: Record<ElevationKey, ElevationStyle>;
  availableAccents: string[];
}

const THEME_MODE_KEY = '@rehearse_theme_mode';
const ACCENT_COLOR_KEY = '@rehearse_accent_color';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [accentColor, setAccentColorState] = useState<string>('#5B5FEF');
  const [, setIsReady] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_MODE_KEY);
        if (storedMode && (storedMode === 'dark' || storedMode === 'light' || storedMode === 'system')) {
          setThemeModeState(storedMode as ThemeMode);
        }

        const storedAccent = await AsyncStorage.getItem(ACCENT_COLOR_KEY);
        if (storedAccent && ACCENT_PALETTES[storedAccent]) {
          setAccentColorState(storedAccent);
        }
      } catch (err) {
        console.warn('Failed to load theme preferences from storage', err);
      } finally {
        setIsReady(true);
      }
    };

    loadPreferences();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
    } catch (err) {
      console.warn('Failed to save theme mode', err);
    }
  };

  const setAccentColor = async (color: string) => {
    setAccentColorState(color);
    try {
      await AsyncStorage.setItem(ACCENT_COLOR_KEY, color);
    } catch (err) {
      console.warn('Failed to save accent color', err);
    }
  };

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const colors: ThemeColors = useMemo(() => {
    const accent = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES['#5B5FEF'];

    if (isDark) {
      // True-black system: every neutral is R=G=B (no navy/purple tint), so
      // indigo is the only hue competing with the ground. Two brand hues
      // total — indigo (primary) and champagne (warm accent) — with `teal`/
      // `purple` as shade/tint variants of indigo itself (not new hues) and
      // `sage`/`ruby` demoted to purely semantic (correct/error), never used
      // as decorative category branding.
      return {
        background: '#000000',
        surface: '#0A0A0A',
        surfaceElevated: '#121214',
        surfaceCard: '#121214',
        surfaceBorder: '#232326',
        surfaceHighlight: '#1A1A1D',
        cardBorder: '#232326',
        border: '#232326',

        primary: accent.hex,
        primaryLight: accent.light,
        primaryDark: accent.dark,
        primarySubtle: accent.subtle,
        primaryGlow: accent.glow,

        forestDark: '#000000',
        forestBase: '#0A0A0A',
        forestCenter: '#121214',
        forestCard: '#121214',
        forestBorder: '#232326',
        forestSubtle: 'rgba(18, 18, 20, 0.6)',

        champagne: '#F59E0B',
        champagneLight: '#FBBF24',
        champagneDark: '#D97706',
        champagneGlow: 'rgba(245, 158, 11, 0.3)',
        champagneSubtle: 'rgba(245, 158, 11, 0.15)',

        sage: '#34D399',
        sageLight: '#6EE7B7',
        sageDark: '#059669',
        sageSubtle: 'rgba(52, 211, 153, 0.15)',

        ivory: '#F2F2F2',
        mutedText: '#9A9A9E',
        textPrimary: '#F2F2F2',
        textSecondary: '#9A9A9E',
        textMuted: '#68686C',
        textInverse: '#000000',

        flame: '#F59E0B',
        flameGlow: 'rgba(245, 158, 11, 0.3)',
        gold: '#F59E0B',
        goldSubtle: 'rgba(245, 158, 11, 0.18)',
        ruby: '#F87171',
        rubySubtle: 'rgba(248, 113, 113, 0.18)',
        purple: accent.light,
        purpleSubtle: accent.subtle,

        success: '#34D399',
        warning: '#F59E0B',
        error: '#F87171',
        danger: '#F87171',
        info: accent.hex,
        infoSubtle: accent.subtle,

        headerBackground: '#000000',
        tabBarBackground: '#121214',
        tabBarBorder: '#232326',
        tabBarInactive: '#9A9A9E',

        scoreTeal: accent.dark,
        scoreTealSubtle: accent.subtle,

        cardCategories: {
          indigo: { solid: accent.hex, subtle: accent.subtle, border: accent.light },
          sage: { solid: '#34D399', subtle: 'rgba(52, 211, 153, 0.15)', border: '#6EE7B7' },
          champagne: { solid: '#F59E0B', subtle: 'rgba(245, 158, 11, 0.15)', border: '#FBBF24' },
          flame: { solid: '#F59E0B', subtle: 'rgba(245, 158, 11, 0.15)', border: '#FBBF24' },
          teal: { solid: accent.dark, subtle: accent.subtle, border: accent.hex },
          purple: { solid: accent.light, subtle: accent.subtle, border: accent.light },
          ruby: { solid: '#F87171', subtle: 'rgba(248, 113, 113, 0.18)', border: '#F87171' },
          info: { solid: accent.hex, subtle: accent.subtle, border: accent.light }
        }
      };
    }

    return {
      background: '#F7F7FC',
      surface: '#FFFFFF',
      surfaceElevated: '#FFFFFF',
      surfaceCard: '#FFFFFF',
      surfaceBorder: '#ECEBF7',
      surfaceHighlight: '#F0EFFB',
      cardBorder: '#ECEBF7',
      border: '#ECEBF7',

      primary: accent.hex,
      primaryLight: accent.light,
      primaryDark: accent.dark,
      primarySubtle: accent.subtle,
      primaryGlow: accent.glow,

      forestDark: '#ECEBF7',
      forestBase: '#FFFFFF',
      forestCenter: '#FFFFFF',
      forestCard: '#FFFFFF',
      forestBorder: '#ECEBF7',
      forestSubtle: 'rgba(91, 95, 239, 0.05)',

      champagne: '#F59E0B',
      champagneLight: '#FBBF24',
      champagneDark: '#D97706',
      champagneGlow: 'rgba(245, 158, 11, 0.2)',
      champagneSubtle: 'rgba(245, 158, 11, 0.12)',

      sage: '#16A34A',
      sageLight: '#4ADE80',
      sageDark: '#15803D',
      sageSubtle: 'rgba(22, 163, 74, 0.12)',

      ivory: '#1A1B25',
      mutedText: '#6B6C80',
      textPrimary: '#1A1B25',
      textSecondary: '#6B6C80',
      textMuted: '#9C9DB0',
      textInverse: '#FFFFFF',

      flame: '#D97706',
      flameGlow: 'rgba(245, 158, 11, 0.2)',
      gold: '#F59E0B',
      goldSubtle: 'rgba(245, 158, 11, 0.15)',
      ruby: '#EF4444',
      rubySubtle: 'rgba(239, 68, 68, 0.12)',
      purple: accent.light,
      purpleSubtle: accent.subtle,

      success: '#16A34A',
      warning: '#F59E0B',
      error: '#EF4444',
      danger: '#EF4444',
      info: accent.hex,
      infoSubtle: accent.subtle,

      headerBackground: '#F7F7FC',
      tabBarBackground: '#FFFFFF',
      tabBarBorder: '#ECEBF7',
      tabBarInactive: '#9C9DB0',

      scoreTeal: accent.dark,
      scoreTealSubtle: accent.subtle,

      // Same two-hue reduction as dark mode: indigo (primary) + champagne
      // (accent), with teal/purple as indigo shade/tint variants and
      // sage/ruby reserved for semantic correct/error use only.
      cardCategories: {
        indigo: { solid: accent.hex, subtle: accent.subtle, border: accent.light },
        sage: { solid: '#16A34A', subtle: 'rgba(22, 163, 74, 0.12)', border: '#4ADE80' },
        champagne: { solid: '#D97706', subtle: 'rgba(245, 158, 11, 0.12)', border: '#FBBF24' },
        flame: { solid: '#D97706', subtle: 'rgba(245, 158, 11, 0.12)', border: '#FBBF24' },
        teal: { solid: accent.dark, subtle: accent.subtle, border: accent.hex },
        purple: { solid: accent.light, subtle: accent.subtle, border: accent.light },
        ruby: { solid: '#EF4444', subtle: 'rgba(239, 68, 68, 0.12)', border: '#EF4444' },
        info: { solid: accent.hex, subtle: accent.subtle, border: accent.light }
      }
    };
  }, [isDark, accentColor]);

  const elevation = useMemo(() => buildElevation(isDark), [isDark]);

  const value = {
    themeMode,
    setThemeMode,
    accentColor,
    setAccentColor,
    isDark,
    colors,
    elevation,
    availableAccents: Object.keys(ACCENT_PALETTES)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

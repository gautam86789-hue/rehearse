import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light' | 'system';

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
  '#C8AA6A': {
    id: 'champagne',
    name: 'Champagne Gold',
    hex: '#C8AA6A',
    light: '#DFCA99',
    dark: '#A38440',
    subtle: 'rgba(200, 170, 106, 0.14)',
    glow: 'rgba(200, 170, 106, 0.25)'
  },
  '#8F997F': {
    id: 'sage',
    name: 'Executive Sage',
    hex: '#8F997F',
    light: '#B0BBA2',
    dark: '#677158',
    subtle: 'rgba(143, 153, 127, 0.15)',
    glow: 'rgba(143, 153, 127, 0.25)'
  },
  '#60A5FA': {
    id: 'slate_blue',
    name: 'Executive Blue',
    hex: '#60A5FA',
    light: '#93C5FD',
    dark: '#2563EB',
    subtle: 'rgba(96, 165, 250, 0.15)',
    glow: 'rgba(96, 165, 250, 0.25)'
  },
  '#9B72CF': {
    id: 'royal_violet',
    name: 'Royal Violet',
    hex: '#9B72CF',
    light: '#BA9AE3',
    dark: '#764BA2',
    subtle: 'rgba(155, 114, 207, 0.15)',
    glow: 'rgba(155, 114, 207, 0.25)'
  },
  '#E07A5F': {
    id: 'terracotta',
    name: 'Terracotta Flame',
    hex: '#E07A5F',
    light: '#EAA28D',
    dark: '#C45A3E',
    subtle: 'rgba(224, 122, 95, 0.15)',
    glow: 'rgba(224, 122, 95, 0.25)'
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

  headerBackground: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarInactive: string;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  accentColor: string;
  setAccentColor: (color: string) => Promise<void>;
  isDark: boolean;
  colors: ThemeColors;
  availableAccents: string[];
}

const THEME_MODE_KEY = '@rehearse_theme_mode';
const ACCENT_COLOR_KEY = '@rehearse_accent_color';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [accentColor, setAccentColorState] = useState<string>('#C8AA6A');
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
    const accent = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES['#C8AA6A'];

    if (isDark) {
      return {
        background: '#0B1712',
        surface: '#12231B',
        surfaceElevated: '#182C22',
        surfaceCard: '#12231B',
        surfaceBorder: '#2A4235',
        surfaceHighlight: '#182C22',
        cardBorder: 'rgba(200, 170, 106, 0.15)',
        border: '#2A4235',

        primary: accent.hex,
        primaryLight: accent.light,
        primaryDark: accent.dark,
        primarySubtle: accent.subtle,
        primaryGlow: accent.glow,

        forestDark: '#0B1712',
        forestBase: '#12231B',
        forestCenter: '#182C22',
        forestCard: '#12231B',
        forestBorder: 'rgba(200, 170, 106, 0.15)',
        forestSubtle: 'rgba(18, 35, 27, 0.6)',

        champagne: '#C8AA6A',
        champagneLight: '#DFCA99',
        champagneDark: '#A38440',
        champagneGlow: 'rgba(200, 170, 106, 0.25)',
        champagneSubtle: 'rgba(200, 170, 106, 0.12)',

        sage: '#8F997F',
        sageLight: '#B0BBA2',
        sageDark: '#677158',
        sageSubtle: 'rgba(143, 153, 127, 0.15)',

        ivory: '#F3EFE5',
        mutedText: '#A7AEA6',
        textPrimary: '#F3EFE5',
        textSecondary: '#A7AEA6',
        textMuted: '#6B7569',
        textInverse: '#0B1712',

        flame: '#E07A5F',
        flameGlow: 'rgba(224, 122, 95, 0.25)',
        gold: '#C8AA6A',
        goldSubtle: 'rgba(200, 170, 106, 0.15)',
        ruby: '#C84B31',
        rubySubtle: 'rgba(200, 75, 49, 0.15)',
        purple: '#9B72CF',
        purpleSubtle: 'rgba(155, 114, 207, 0.15)',

        success: '#8F997F',
        warning: '#C8AA6A',
        error: '#C84B31',
        danger: '#C84B31',
        info: '#6482AD',

        headerBackground: '#0B1712',
        tabBarBackground: '#12231B',
        tabBarBorder: '#2A4235',
        tabBarInactive: '#8F997F'
      };
    }

    return {
      background: '#F5F2E9',
      surface: '#FFFCF5',
      surfaceElevated: '#FFFFFF',
      surfaceCard: '#FFFCF5',
      surfaceBorder: '#D9D8CC',
      surfaceHighlight: '#FFFFFF',
      cardBorder: '#D9D8CC',
      border: '#D9D8CC',

      primary: accentColor === '#C8AA6A' ? '#173D2C' : accent.hex,
      primaryLight: accent.light,
      primaryDark: accent.dark,
      primarySubtle: accent.subtle,
      primaryGlow: accent.glow,

      forestDark: '#E8E4D8',
      forestBase: '#FFFCF5',
      forestCenter: '#FFFFFF',
      forestCard: '#FFFCF5',
      forestBorder: '#D9D8CC',
      forestSubtle: 'rgba(23, 61, 44, 0.05)',

      champagne: '#B08D4F',
      champagneLight: '#C8AA6A',
      champagneDark: '#856627',
      champagneGlow: 'rgba(176, 141, 79, 0.2)',
      champagneSubtle: 'rgba(176, 141, 79, 0.12)',

      sage: '#5F7053',
      sageLight: '#7A8C6E',
      sageDark: '#44523B',
      sageSubtle: 'rgba(95, 112, 83, 0.12)',

      ivory: '#17241E',
      mutedText: '#667168',
      textPrimary: '#17241E',
      textSecondary: '#667168',
      textMuted: '#8E9990',
      textInverse: '#FFFFFF',

      flame: '#D3583B',
      flameGlow: 'rgba(211, 88, 59, 0.2)',
      gold: '#B08D4F',
      goldSubtle: 'rgba(176, 141, 79, 0.15)',
      ruby: '#C84B31',
      rubySubtle: 'rgba(200, 75, 49, 0.15)',
      purple: '#764BA2',
      purpleSubtle: 'rgba(118, 75, 162, 0.15)',

      success: '#173D2C',
      warning: '#B08D4F',
      error: '#C84B31',
      danger: '#C84B31',
      info: '#2563EB',

      headerBackground: '#F5F2E9',
      tabBarBackground: '#FFFCF5',
      tabBarBorder: '#D9D8CC',
      tabBarInactive: '#667168'
    };
  }, [isDark, accentColor]);

  const value = {
    themeMode,
    setThemeMode,
    accentColor,
    setAccentColor,
    isDark,
    colors,
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

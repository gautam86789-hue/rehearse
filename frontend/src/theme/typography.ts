import { Platform, TextStyle } from 'react-native';

/**
 * World-Class Executive Typography Design System
 * Tuned for maximum legibility, balanced hierarchy, and award-winning aesthetic polish across Web, iOS, and Android.
 */

export const fontFamilies = {
  sans: Platform.select({
    web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    ios: 'System',
    android: 'Roboto',
    default: 'System'
  }),
  serif: Platform.select({
    web: '"Playfair Display", "Georgia", "Cambria", "Times New Roman", serif',
    ios: 'Georgia',
    android: 'serif',
    default: 'serif'
  }),
  mono: Platform.select({
    web: 'ui-monospace, "SF Mono", "Roboto Mono", "Fira Code", monospace',
    ios: 'Courier New',
    android: 'monospace',
    default: 'monospace'
  })
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const
};

export const typography = {
  // Brand Logo / Monogram
  brandWordmark: {
    fontFamily: fontFamilies.sans,
    fontSize: 20,
    fontWeight: '800' as const,
    letterSpacing: 4,
    lineHeight: 24
  } satisfies TextStyle,

  brandWordmarkSmall: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    fontWeight: '800' as const,
    letterSpacing: 2.8,
    lineHeight: 18
  } satisfies TextStyle,

  // Grand Display / Hero Headers
  hero: {
    fontFamily: fontFamilies.sans,
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -0.6,
    lineHeight: 40
  } satisfies TextStyle,

  display: {
    fontFamily: fontFamilies.sans,
    fontSize: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 34
  } satisfies TextStyle,

  // Section Headers (H1 - H4)
  h1: {
    fontFamily: fontFamilies.sans,
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.35,
    lineHeight: 28
  } satisfies TextStyle,

  h2: {
    fontFamily: fontFamilies.sans,
    fontSize: 19,
    fontWeight: '700' as const,
    letterSpacing: -0.25,
    lineHeight: 25
  } satisfies TextStyle,

  h3: {
    fontFamily: fontFamilies.sans,
    fontSize: 16.5,
    fontWeight: '600' as const,
    letterSpacing: -0.15,
    lineHeight: 23
  } satisfies TextStyle,

  h4: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
    lineHeight: 21
  } satisfies TextStyle,

  // Headline
  headline: {
    fontFamily: fontFamilies.sans,
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: -0.15,
    lineHeight: 22
  } satisfies TextStyle,

  // Subtitles & Leads
  lead: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 22
  } satisfies TextStyle,

  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 13.5,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 19
  } satisfies TextStyle,

  // Body Copy
  bodyLarge: {
    fontFamily: fontFamilies.sans,
    fontSize: 15.5,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    lineHeight: 24
  } satisfies TextStyle,

  body: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    lineHeight: 21
  } satisfies TextStyle,

  bodyMedium: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 21
  } satisfies TextStyle,

  bodyBold: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 21
  } satisfies TextStyle,

  bodySmall: {
    fontFamily: fontFamilies.sans,
    fontSize: 12.5,
    fontWeight: '400' as const,
    letterSpacing: 0.15,
    lineHeight: 18
  } satisfies TextStyle,

  // UI Elements
  buttonLarge: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
    lineHeight: 20
  } satisfies TextStyle,

  button: {
    fontFamily: fontFamilies.sans,
    fontSize: 13.5,
    fontWeight: '600' as const,
    letterSpacing: 0.25,
    lineHeight: 18
  } satisfies TextStyle,

  buttonSmall: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    lineHeight: 16
  } satisfies TextStyle,

  // Overlines / Uppercase Badges
  overline: {
    fontFamily: fontFamilies.sans,
    fontSize: 10.5,
    fontWeight: '700' as const,
    letterSpacing: 1.4,
    lineHeight: 14,
    textTransform: 'uppercase' as const
  } satisfies TextStyle,

  tag: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    lineHeight: 15
  } satisfies TextStyle,

  // Captions & Footnotes
  caption: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 16
  } satisfies TextStyle,

  footnote: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    lineHeight: 15
  } satisfies TextStyle,

  // Editorial Quotes
  quote: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    fontStyle: 'italic' as const,
    letterSpacing: 0,
    lineHeight: 17
  } satisfies TextStyle,

  // Numeric Stats / Tabular Metrics
  metricLarge: {
    fontFamily: fontFamilies.sans,
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    lineHeight: 32
  } satisfies TextStyle,

  metricMedium: {
    fontFamily: fontFamilies.sans,
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 24
  } satisfies TextStyle,

  metricSmall: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: -0.1,
    lineHeight: 18
  } satisfies TextStyle
};

import { TextStyle } from 'react-native';
import { fontFamilies } from '../../../theme/typography';

/**
 * Progress type scale.
 *
 * The screens previously ran almost entirely between 11 and 14px at weight
 * 600-800, so captions, body and labels all competed at the same volume.
 * This is a real scale with gaps wide enough to read as hierarchy:
 *
 *   display  44   the one number that matters
 *   title    22   section titles (serif, so headings differ in kind)
 *   heading  15   card titles
 *   body     13.5 the only weight-400 style; for actual sentences
 *   label    12.5 interactive and row labels
 *   micro    10.5 metadata
 *   eyebrow   9.5 all-caps section markers
 *
 * Rule of thumb applied throughout: at most one bold element per card, and
 * body copy is never bolder than 400.
 */

const sans = fontFamilies.sans;
const serif = fontFamilies.serif;

export const T = {
  /** Hero figure. Used once per screen at most. */
  display: {
    fontFamily: sans,
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -2,
    lineHeight: 48
  } as TextStyle,

  /** Secondary figure: stat values, core readout. */
  figure: {
    fontFamily: sans,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 28
  } as TextStyle,

  /** Section titles. Serif so headings differ in kind, not just size. */
  title: {
    fontFamily: serif,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 27
  } as TextStyle,

  /** Card and row titles. */
  heading: {
    fontFamily: sans,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 19
  } as TextStyle,

  /** Sentences. The only regular-weight style - prose is never bold. */
  body: {
    fontFamily: sans,
    fontSize: 13.5,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 19
  } as TextStyle,

  /** Buttons, tabs, row labels. */
  label: {
    fontFamily: sans,
    fontSize: 12.5,
    fontWeight: '500',
    letterSpacing: -0.1,
    lineHeight: 16
  } as TextStyle,

  /** Selected tab / emphasised label. */
  labelStrong: {
    fontFamily: sans,
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 16
  } as TextStyle,

  /** Metadata: dates, counts, band names beside a score. */
  micro: {
    fontFamily: sans,
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 14
  } as TextStyle,

  /** All-caps section marker. Tracking carries it; weight does not. */
  eyebrow: {
    fontFamily: sans,
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1.2,
    lineHeight: 12
  } as TextStyle
};

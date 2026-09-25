// Cheap, local checks on what a user actually typed. These never decide a score
// on their own for real sentences — the AI grades those — but they reliably
// catch keyboard-mashing and empty effort without spending an AI call, and they
// give the AI facts to weigh ("only 5% of these words are connecting words").

const COMMON_WORDS = new Set(
  (
    'a an the and or but if so because as of to in on at for from with by about into over after before ' +
    'i me my mine we us our you your he she it they them their this that these those there here ' +
    'is am are was were be been being do does did done have has had will would can could should may might must ' +
    'not no yes ok okay please thanks thank sorry just really very also too still even only then than when while ' +
    'what who why how which where need want like know think feel see hear say said tell ask let make get give take ' +
    'go going come work help understand agree mean sure well now today week time team'
  ).split(' ')
);

const KEYBOARD_RUNS = ['asdf', 'sdfg', 'dfgh', 'fghj', 'ghjk', 'hjkl', 'qwer', 'wert', 'erty', 'rtyu', 'zxcv', 'xcvb', 'cvbn', 'vbnm', 'qaz', 'wsx'];

export interface ReplyFacts {
  text: string;
  wordCount: number;
  isMash: boolean;        // keyboard-mashing / gibberish
  isMinimal: boolean;     // one word or so
  commonWordRatio: number; // share of words that are ordinary connecting words (real sentences are usually > 0.25)
  uniqueRatio: number;
}

export function analyzeReply(text: string): ReplyFacts {
  const raw = (text || '').trim();
  const words = raw.toLowerCase().match(/[a-z']+/g) || [];
  const nonSpace = raw.replace(/\s/g, '');
  const letters = (raw.match(/[a-z]/gi) || []).length;
  const alphaRatio = nonSpace.length ? letters / nonSpace.length : 0;

  const isGibberishWord = (w: string) => {
    if (w.length < 4) return false;
    if (!/[aeiouy]/.test(w)) return true; // no vowels at all
    if (/[bcdfghjklmnpqrstvwxz]{5,}/.test(w)) return true; // long consonant run
    if (/(.)\1{3,}/.test(w)) return true; // aaaaa
    if (KEYBOARD_RUNS.some((k) => w.includes(k))) return true;
    const vowels = (w.match(/[aeiouy]/g) || []).length;
    return w.length >= 6 && vowels / w.length < 0.15;
  };

  const gibberishWords = words.filter(isGibberishWord).length;
  const uniqueRatio = words.length ? new Set(words).size / words.length : 1;
  const commonWordRatio = words.length ? words.filter((w) => COMMON_WORDS.has(w)).length / words.length : 0;

  const isMash =
    words.length > 0 &&
    (gibberishWords / words.length >= 0.5 ||
      alphaRatio < 0.5 ||
      (words.length >= 5 && uniqueRatio < 0.35));

  return {
    text: raw,
    wordCount: words.length,
    isMash,
    isMinimal: words.length <= 1,
    commonWordRatio,
    uniqueRatio
  };
}

// Score ceilings by reply quality — the AI's per-reply score is clipped into
// the band for the quality it assigned, so "nonsense" can never carry 60 points.
export const QUALITY_BANDS: Record<string, { min: number; max: number }> = {
  nonsense: { min: 0, max: 5 },
  off_topic: { min: 0, max: 20 },
  weak: { min: 15, max: 50 },
  ok: { min: 40, max: 75 },
  strong: { min: 65, max: 100 }
};

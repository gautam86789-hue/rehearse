import { CardCategoryKey } from '../context/ThemeContext';

// One consistent card color per scenario/practice category id, used
// wherever a category needs to read as "the same feature" across the app
// (Home tiles, the Scenarios category filter, scenario cards themselves).
// Kept to Rehearse's two-hue system (indigo + champagne): categories are
// told apart by shade/tint of indigo (indigo/teal/purple) plus the one warm
// accent (champagne), not by introducing new hues. `ruby` is reserved for
// crisis specifically, where red genuinely reads as "urgent" rather than as
// decorative category branding.
export const CATEGORY_COLORS: Record<string, CardCategoryKey> = {
  negotiation: 'indigo',
  difficult_decisions: 'champagne',
  crisis: 'ruby',
  managing_up: 'indigo',
  feedback: 'purple',
  boundaries: 'teal'
};

export function categoryColorFor(category: string | undefined): CardCategoryKey {
  return (category && CATEGORY_COLORS[category]) || 'indigo';
}

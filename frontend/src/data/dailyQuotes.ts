// Short, app-themed quotes for the Home screen's daily line. Deterministic by
// calendar date, so everyone sees the same quote on a given day and it
// changes tomorrow — not personalized, just a small daily ritual.
const DAILY_QUOTES: string[] = [
  "Confident people aren't born. They're rehearsed.",
  'The conversation you avoid is the one you need most.',
  "Clarity is a kindness. Say the specific thing.",
  'Every hard conversation gets easier the second time you have it.',
  'You already know what to say. Rehearsal just removes the shake.',
  "Silence isn't a strategy. Say the ask out loud.",
  'Practice the sentence, not just the point.',
  'The words you rehearse are the words you reach for.',
  'Discomfort now beats regret later.',
  'A well-rehearsed boundary sounds like calm, not conflict.',
  'You cannot control their reaction. You can control your opening line.',
  'The best negotiators sound calm because they already said it once.',
  'Preparation is what confidence feels like from the inside.',
  'Say less, mean more.',
  'The conversation in your head is never as hard as the one you avoid having.'
];

export function getDailyQuote(date: Date = new Date()): string {
  const dayOfYear = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
      86400000
  );
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

// Calendar-day helpers that use the device's LOCAL day, not UTC. Streaks and
// "completed today" checks keyed on toISOString() flip at UTC midnight —
// for someone in India that's 5:30am, so a practice at 1am or a check at
// 11pm could land on the wrong day and silently break a streak.

export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function keyToDayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastActive?: string;
}

// Consecutive-day streak from a set of local-date keys (any practice counts:
// a scored rehearsal, the daily challenge, or a story). The current streak
// stays alive through "yesterday" so it doesn't read as broken before today's
// practice has had a chance to happen; it drops to 0 once a full day passes
// with nothing.
export function computeStreak(dateKeys: Iterable<string>, today: string = localDateKey()): StreakInfo {
  const unique = Array.from(new Set(dateKeys)).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k));
  if (unique.length === 0) return { current: 0, longest: 0 };
  const days = unique.map(keyToDayNumber).sort((a, b) => a - b);

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i] === days[i - 1] + 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const last = days[days.length - 1];
  const todayNum = keyToDayNumber(today);
  let current = 0;
  if (todayNum - last <= 1) {
    current = 1;
    for (let i = days.length - 1; i > 0; i--) {
      if (days[i] === days[i - 1] + 1) current++;
      else break;
    }
  }

  const lastKey = unique.sort()[unique.length - 1];
  return { current, longest: Math.max(longest, current), lastActive: lastKey };
}

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { progressPalette, alpha } from './core/palette';
import { useReveal, riseIn, DUR } from './core/motion';
import { T } from './core/type';

export interface PracticeDay {
  /** ISO yyyy-mm-dd */
  date: string;
  /** Rehearsals completed that day. */
  count: number;
}

interface PracticeRhythmProps {
  days: PracticeDay[];
  currentStreak: number;
  longestStreak: number;
  weeks?: number;
}

const DAY_MS = 86400000;
const toKey = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Practice consistency as a real calendar surface.
 *
 * The previous grid was four hardcoded month rows of seven dots that mapped
 * to no actual dates. This builds the window from today backwards, so every
 * cell is a real day and the streak arithmetic below it is verifiable.
 */
export const PracticeRhythm: React.FC<PracticeRhythmProps> = ({
  days,
  currentStreak,
  longestStreak,
  weeks = 12
}) => {
  const { colors: themeColors, isDark } = useTheme();
  const p = progressPalette(themeColors, isDark);
  const [picked, setPicked] = React.useState<string | null>(null);

  const enter = useReveal(80, DUR.base);

  const byDate = useMemo(() => {
    const map = new Map<string, number>();
    days.forEach((d) => map.set(d.date, (map.get(d.date) || 0) + d.count));
    return map;
  }, [days]);

  const peakCount = useMemo(
    () => Math.max(1, ...Array.from(byDate.values())),
    [byDate]
  );

  /** Columns of 7, oldest-first, ending on today. */
  const columns = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    // Walk back to the Sunday that starts the earliest visible week.
    const end = new Date(today);
    const trailing = 6 - end.getDay();
    const gridEnd = new Date(end.getTime() + trailing * DAY_MS);
    const total = weeks * 7;

    const cells: Array<{ date: Date; key: string; count: number; future: boolean }> = [];
    for (let i = total - 1; i >= 0; i--) {
      const date = new Date(gridEnd.getTime() - i * DAY_MS);
      const key = toKey(date);
      cells.push({
        date,
        key,
        count: byDate.get(key) || 0,
        future: date.getTime() > today.getTime()
      });
    }

    const cols: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7));
    return cols;
  }, [byDate, weeks]);

  const totalInWindow = useMemo(
    () => columns.flat().reduce((sum, c) => sum + c.count, 0),
    [columns]
  );
  const activeDays = useMemo(
    () => columns.flat().filter((c) => c.count > 0).length,
    [columns]
  );

  const monthMarks = useMemo(() => {
    const marks: Array<{ index: number; label: string }> = [];
    let last = -1;
    columns.forEach((col, i) => {
      const m = col[0].date.getMonth();
      if (m !== last) {
        marks.push({ index: i, label: col[0].date.toLocaleString(undefined, { month: 'short' }) });
        last = m;
      }
    });
    return marks;
  }, [columns]);

  const cellStyle = (count: number, future: boolean) => {
    if (future) {
      return { backgroundColor: 'transparent', borderColor: alpha(p.hairline, 0.5) };
    }
    if (count === 0) {
      return { backgroundColor: p.well, borderColor: alpha(p.hairline, 0.8) };
    }
    const t = Math.min(1, count / peakCount);
    const strength = 0.34 + t * 0.62;
    return { backgroundColor: alpha(p.accent, strength), borderColor: alpha(p.accent, 0.2) };
  };

  const pickedCell = picked ? columns.flat().find((c) => c.key === picked) : null;

  return (
    <Animated.View style={riseIn(enter, 12)}>
      {/* Streak pair - the two numbers that actually matter */}
      <View style={styles.streakRow}>
        <View style={[styles.streakCard, { backgroundColor: p.canvas, borderColor: p.hairline }]}>
          <Text style={[styles.streakValue, { color: p.accent }]}>{currentStreak}</Text>
          <Text style={[styles.streakLabel, { color: p.inkSoft }]}>Day streak</Text>
        </View>
        <View style={[styles.streakCard, { backgroundColor: p.canvas, borderColor: p.hairline }]}>
          <Text style={[styles.streakValue, { color: p.ink }]}>{longestStreak}</Text>
          <Text style={[styles.streakLabel, { color: p.inkSoft }]}>Longest run</Text>
        </View>
        <View style={[styles.streakCard, { backgroundColor: p.canvas, borderColor: p.hairline }]}>
          <Text style={[styles.streakValue, { color: p.ink }]}>{activeDays}</Text>
          <Text style={[styles.streakLabel, { color: p.inkSoft }]}>Active days</Text>
        </View>
      </View>

      {/* The grid */}
      <View style={[styles.gridCard, { backgroundColor: p.canvas, borderColor: p.hairline }]}>
        <View style={styles.monthRow}>
          {monthMarks.map((m) => (
            <Text
              key={`${m.label}-${m.index}`}
              style={[
                styles.monthLabel,
                { color: p.inkFaint, left: m.index * 15 }
              ]}
            >
              {m.label}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {columns.map((col, ci) => (
            <View key={ci} style={styles.col}>
              {col.map((cell) => (
                <Pressable
                  key={cell.key}
                  onPress={() => setPicked(picked === cell.key ? null : cell.key)}
                  disabled={cell.future}
                  style={[
                    styles.cell,
                    cellStyle(cell.count, cell.future),
                    picked === cell.key && { borderColor: p.ink, borderWidth: 1.5 }
                  ]}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={[styles.gridFooter, { borderTopColor: p.hairline }]}>
          <Text style={[styles.footerNote, { color: p.inkSoft }]}>
            {pickedCell
              ? `${pickedCell.date.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })} · ${
                  pickedCell.count === 0
                    ? 'No practice'
                    : `${pickedCell.count} rehearsal${pickedCell.count > 1 ? 's' : ''}`
                }`
              : `${totalInWindow} rehearsals in ${weeks} weeks`}
          </Text>

          <View style={styles.scale}>
            <Text style={[styles.scaleCap, { color: p.inkFaint }]}>Less</Text>
            {[0, 0.35, 0.6, 0.85, 1].map((t, i) => (
              <View
                key={i}
                style={[
                  styles.scaleCell,
                  t === 0
                    ? { backgroundColor: p.well, borderColor: alpha(p.hairline, 0.8) }
                    : { backgroundColor: alpha(p.accent, 0.34 + t * 0.62), borderColor: 'transparent' }
                ]}
              />
            ))}
            <Text style={[styles.scaleCap, { color: p.inkFaint }]}>More</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  streakRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  streakCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center'
  },
  streakValue: {
    ...T.figure
  },
  streakLabel: {
    ...T.micro,
    marginTop: 3
  },
  gridCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14
  },
  monthRow: {
    height: 14,
    marginBottom: 4,
    position: 'relative'
  },
  monthLabel: {
    position: 'absolute',
    ...T.micro,
    fontSize: 9.5
  },
  grid: {
    flexDirection: 'row',
    gap: 3
  },
  col: {
    gap: 3,
    flex: 1
  },
  cell: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 3,
    borderWidth: 1,
    maxHeight: 14
  },
  gridFooter: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8
  },
  footerNote: {
    ...T.micro
  },
  scale: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  scaleCap: {
    ...T.micro,
    fontSize: 9.5
  },
  scaleCell: {
    width: 9,
    height: 9,
    borderRadius: 2,
    borderWidth: 1
  }
});

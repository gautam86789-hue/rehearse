import React from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { ChevronRight, Lock } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { progressPalette, alpha } from './core/palette';
import { bandFor, BANDS, toNextBand, clamp } from './core/geometry';
import { useReveal, riseIn, DUR } from './core/motion';
import { T } from './core/type';
import { ConstellationSkill } from './SkillConstellation';

interface SkillLedgerProps {
  skills: ConstellationSkill[];
  onSelectSkill: (skill: ConstellationSkill) => void;
}

/**
 * The precise counterpart to the constellation.
 *
 * The canvas answers "what is my shape"; this answers "what exactly moved,
 * and what is the next threshold". It therefore shows delta and gap-to-next
 * rather than repeating the score in a second bar chart.
 */
export const SkillLedger: React.FC<SkillLedgerProps> = ({ skills, onSelectSkill }) => {
  const { colors: themeColors, isDark } = useTheme();
  const p = progressPalette(themeColors, isDark);

  return (
    <View style={styles.stack}>
      {skills.map((skill, i) => (
        <LedgerRow
          key={skill.id}
          skill={skill}
          index={i}
          palette={p}
          onPress={() => onSelectSkill(skill)}
        />
      ))}
    </View>
  );
};

const LedgerRow: React.FC<{
  skill: ConstellationSkill;
  index: number;
  palette: ReturnType<typeof progressPalette>;
  onPress: () => void;
}> = ({ skill, index, palette: p, onPress }) => {
  const enter = useReveal(60 + index * 70, DUR.base);
  const press = React.useRef(new Animated.Value(0)).current;

  const locked = !!skill.locked;
  const score = clamp(skill.score);
  const band = bandFor(score);
  const color = locked ? p.locked : p.band[band];
  const { next, gap } = toNextBand(score);

  const recent = skill.recentScores || [];
  const delta = recent.length > 1 ? Math.round(recent[recent.length - 1] - recent[0]) : 0;

  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.985] });

  return (
    <Animated.View style={[riseIn(enter, 10), { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        disabled={locked}
        onPressIn={() =>
          Animated.spring(press, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 0 }).start()
        }
        onPressOut={() =>
          Animated.spring(press, { toValue: 0, useNativeDriver: true, speed: 28, bounciness: 6 }).start()
        }
        style={[
          styles.row,
          { backgroundColor: p.card, borderColor: p.hairline },
          locked && { opacity: 0.72 }
        ]}
      >
        {/* Band spine: colour-codes the row without a full coloured background */}
        <View style={[styles.spine, { backgroundColor: color }]} />

        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <View style={styles.rowTitleWrap}>
              <Text style={[styles.name, { color: locked ? p.locked : p.ink }]} numberOfLines={1}>
                {skill.name}
              </Text>
            </View>

            <View style={styles.rowRight}>
              {locked ? (
                <Lock size={14} color={p.locked} />
              ) : (
                <>
                  <Text style={[styles.score, { color: p.ink }]}>{score}</Text>
                  {delta !== 0 && (
                    <Text style={[styles.delta, { color: delta > 0 ? color : p.inkFaint }]}>
                      {delta > 0 ? '+' : ''}{delta}
                    </Text>
                  )}
                  <ChevronRight size={15} color={p.inkFaint} />
                </>
              )}
            </View>
          </View>

          {/* Track with the next threshold marked in place */}
          <View style={[styles.track, { backgroundColor: p.well }]}>
            <View
              style={[styles.fill, { width: `${score}%`, backgroundColor: color }]}
            />
            {next && (
              <View
                style={[
                  styles.threshold,
                  { left: `${BANDS[next].floor}%`, backgroundColor: alpha(p.ink, 0.35) }
                ]}
              />
            )}
          </View>

          <Text style={[styles.caption, { color: p.inkFaint }]} numberOfLines={1}>
            {locked
              ? 'Locked'
              : next
              ? `${gap} to ${BANDS[next].label}`
              : BANDS[band].label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  stack: {
    gap: 9,
    marginBottom: 14
  },
  row: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden'
  },
  spine: {
    width: 3
  },
  rowBody: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 14
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  rowTitleWrap: {
    flex: 1,
    marginRight: 10
  },
  name: {
    ...T.heading
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  score: {
    ...T.figure,
    fontSize: 18,
    lineHeight: 22
  },
  delta: {
    ...T.micro,
    fontWeight: '600'
  },
  track: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative'
  },
  fill: {
    height: '100%',
    borderRadius: 3
  },
  threshold: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1.5
  },
  caption: {
    ...T.micro,
    marginTop: 7
  }
});

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { ArrowUpRight, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { progressPalette, alpha } from './core/palette';
import { bandFor, BANDS, toNextBand, trendSlope, readMomentum } from './core/geometry';
import { useReveal, riseIn, DUR } from './core/motion';
import { T } from './core/type';
import { ConstellationSkill } from './SkillConstellation';

interface InsightBriefingProps {
  skills: ConstellationSkill[];
  confidence: number[];
  onSelectSkill: (skill: ConstellationSkill) => void;
  onPractice: (skill?: ConstellationSkill) => void;
}

/**
 * Insights computed from the data, not written into the file.
 *
 * The previous version hardcoded three "What's Working" strings and three
 * "Focus Next" strings that never changed. These are derived, so they stay
 * true as the numbers move.
 */
export const InsightBriefing: React.FC<InsightBriefingProps> = ({
  skills,
  confidence,
  onSelectSkill,
  onPractice
}) => {
  const { colors: themeColors, isDark } = useTheme();
  const p = progressPalette(themeColors, isDark);

  const active = useMemo(() => skills.filter((s) => !s.locked), [skills]);

  const analysis = useMemo(() => {
    const ranked = [...active].sort((a, b) => b.score - a.score);
    const strongest = ranked[0];
    const weakest = ranked[ranked.length - 1];

    const fastest = [...active].sort(
      (a, b) => trendSlope(b.recentScores || []) - trendSlope(a.recentScores || [])
    )[0];

    const leastPracticed = [...active].sort(
      (a, b) => (a.rehearsalsCount || 0) - (b.rehearsalsCount || 0)
    )[0];

    const spread = strongest && weakest ? strongest.score - weakest.score : 0;
    const momentum = readMomentum(confidence);

    return { strongest, weakest, fastest, leastPracticed, spread, momentum };
  }, [active, confidence]);

  const { strongest, weakest, fastest, leastPracticed, spread, momentum } = analysis;

  const headline = useMemo(() => {
    if (!strongest || !weakest) return null;
    if (momentum === 'climbing' && fastest) {
      const gain = Math.round(
        (fastest.recentScores?.[fastest.recentScores.length - 1] ?? fastest.score) -
          (fastest.recentScores?.[0] ?? fastest.score)
      );
      return {
        skill: fastest,
        lead: `${fastest.name} is moving fastest`,
        text: `Up ${gain} points. Apply the same prep to ${weakest.name}.`
      };
    }
    if (spread >= 12) {
      return {
        skill: weakest,
        lead: `${spread}-point spread across your skills`,
        text: `Lifting ${weakest.name} moves your overall faster than pushing ${strongest.name}.`
      };
    }
    return {
      skill: weakest,
      lead: 'Your skills are evenly matched',
      text: `Go deeper, not wider. Take ${weakest.name} into a harder scenario.`
    };
  }, [strongest, weakest, fastest, spread, momentum]);

  const working = useMemo(() => {
    const out: string[] = [];
    if (strongest) {
      out.push(`${strongest.name} holding at ${BANDS[bandFor(strongest.score)].label}`);
    }
    if (fastest && trendSlope(fastest.recentScores || []) > 0.8) {
      out.push(`${fastest.name} up every rehearsal`);
    }
    return out.slice(0, 2);
  }, [strongest, fastest]);

  const next = useMemo(() => {
    const out: Array<{ text: string; skill?: ConstellationSkill }> = [];
    if (weakest) {
      const { next: nb, gap } = toNextBand(weakest.score);
      if (nb) {
        out.push({
          text: `${weakest.name} · ${gap} ${gap === 1 ? 'point' : 'points'} to ${BANDS[nb].label}`,
          skill: weakest
        });
      }
    }
    if (leastPracticed && leastPracticed.id !== weakest?.id) {
      const n = leastPracticed.rehearsalsCount;
      out.push({
        text: `${leastPracticed.name} · only ${n} rehearsal${n === 1 ? '' : 's'}`,
        skill: leastPracticed
      });
    }
    return out.slice(0, 2);
  }, [weakest, leastPracticed]);

  const headEnter = useReveal(60, DUR.base);
  const aEnter = useReveal(200, DUR.base);
  const bEnter = useReveal(320, DUR.base);

  if (!headline) return null;

  const hColor = p.band[bandFor(headline.skill.score)];

  return (
    <View>
      {/* The single most useful observation, stated once */}
      <Animated.View style={riseIn(headEnter, 12)}>
        <Pressable
          onPress={() => onSelectSkill(headline.skill)}
          style={[
            styles.headline,
            { backgroundColor: p.canvas, borderColor: alpha(hColor, 0.45) }
          ]}
        >
          <View style={[styles.headlineBar, { backgroundColor: hColor }]} />
          <View style={styles.headlineBody}>
            <Text style={[styles.headlineLead, { color: p.ink }]}>{headline.lead}</Text>
            <Text style={[styles.headlineText, { color: p.inkSoft }]}>{headline.text}</Text>
            <View style={styles.headlineCta}>
              <Text style={[styles.headlineCtaText, { color: hColor }]}>
                {headline.skill.name}
              </Text>
              <ArrowUpRight size={13} color={hColor} />
            </View>
          </View>
        </Pressable>
      </Animated.View>

      {/* Working and Next share one card - two short lists, not two sections */}
      <Animated.View
        style={[
          styles.pairCard,
          riseIn(aEnter, 12),
          { backgroundColor: p.card, borderColor: p.hairline }
        ]}
      >
        <Text style={[styles.pairTitle, { color: p.inkFaint }]}>WORKING</Text>
        {working.map((item, i) => (
          <View key={i} style={styles.line}>
            <View style={[styles.bullet, { backgroundColor: p.band.proficient }]} />
            <Text style={[styles.lineText, { color: p.ink }]}>{item}</Text>
          </View>
        ))}

        <View style={[styles.divider, { backgroundColor: p.hairline }]} />

        <Text style={[styles.pairTitle, { color: p.inkFaint }]}>NEXT</Text>
        {next.map((item, i) => (
          <Pressable
            key={i}
            style={styles.line}
            onPress={() => item.skill && onSelectSkill(item.skill)}
          >
            <View style={[styles.bulletOpen, { borderColor: p.accent }]} />
            <Text style={[styles.lineText, { color: p.ink }]}>{item.text}</Text>
          </Pressable>
        ))}
      </Animated.View>

      <Animated.View style={riseIn(bEnter, 12)}>
        <Pressable
          onPress={() => onPractice(weakest)}
          style={[styles.practiceBtn, { backgroundColor: p.accent }]}
        >
          <Text style={[styles.practiceBtnText, { color: p.onAccent }]}>
            Rehearse {weakest?.name ?? 'next scenario'}
          </Text>
          <ArrowRight size={16} color={p.onAccent} />
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  headline: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12
  },
  headlineBar: {
    width: 3
  },
  headlineBody: {
    flex: 1,
    padding: 15
  },
  headlineLead: {
    ...T.heading,
    marginBottom: 3
  },
  headlineText: {
    ...T.body
  },
  headlineCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10
  },
  headlineCtaText: {
    ...T.labelStrong
  },
  pairCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    marginBottom: 12
  },
  pairTitle: {
    ...T.eyebrow,
    marginBottom: 10
  },
  divider: {
    height: 1,
    marginTop: 4,
    marginBottom: 14
  },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 9
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6
  },
  bulletOpen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    marginTop: 6
  },
  lineText: {
    flex: 1,
    ...T.body
  },
  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 14,
    borderRadius: 14
  },
  practiceBtnText: {
    ...T.labelStrong,
    fontSize: 13.5
  }
});

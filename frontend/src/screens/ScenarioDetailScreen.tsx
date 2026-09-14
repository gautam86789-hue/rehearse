import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark, Clock, AlertTriangle, Target, Sparkles, ShieldCheck, ArrowRight, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Scenario } from '../types';
import { getScenarioHeroImage } from '../data/generatedImages';

const CATEGORY_LABEL: Record<string, string> = {
  negotiation: 'Negotiation',
  feedback: 'Feedback',
  boundaries: 'Boundaries',
  managing_up: 'Manager',
  difficult_decisions: 'Difficult',
  crisis: 'Crisis'
};

// "What you'll practice" — visual chips, not a paragraph list, so the whole
// thing reads at a glance instead of as four more sentences to get through.
const PRACTICE_CHIPS: { label: string; icon: any }[] = [
  { label: 'Specific examples', icon: Target },
  { label: 'Handling pushback', icon: AlertTriangle },
  { label: 'Clear expectations', icon: Sparkles },
  { label: 'Staying constructive', icon: ShieldCheck }
];

export const ScenarioDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { scenario } = route.params as { scenario: Scenario };
  const { colors } = useTheme();
  const { user, toggleSavedScenario } = useApp();
  const heroImage: ImageSourcePropType | null = getScenarioHeroImage(scenario.id);
  const [expanded, setExpanded] = useState(false);
  const isSaved = !!user.savedScenarioIds?.includes(scenario.id);
  // heroTopRow was absolutely positioned at a flat top:50 with no safe-area
  // handling — on edge-to-edge Android that put the back/bookmark icons
  // under the status bar / camera cutout. Keep the old 50 as the floor for
  // devices with small insets, but grow with the inset on devices that need it.
  const insets = useSafeAreaInsets();
  const heroTopInset = Math.max(insets.top + 16, 50);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero image with header controls overlaid */}
        <View style={[styles.heroWrap, { backgroundColor: colors.surfaceHighlight }]}>
          {heroImage ? (
            <Image source={heroImage} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primarySubtle }]} />
          )}
          <View style={styles.heroOverlay} />

          <View style={[styles.heroTopRow, { top: heroTopInset }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.heroIconBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
              <ArrowLeft size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroIconBtn}
              onPress={() => toggleSavedScenario(scenario.id)}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            >
              <Bookmark size={18} color="#FFFFFF" fill={isSaved ? '#FFFFFF' : 'transparent'} />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroLabel}>{CATEGORY_LABEL[scenario.category] || 'Scenario'} Scenario</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{scenario.title}</Text>

          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: colors.surfaceHighlight }]}>
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                {CATEGORY_LABEL[scenario.category] || scenario.counterpartRole}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.champagneSubtle }]}>
              <Text style={[styles.tagText, { color: colors.champagneDark }]}>{scenario.difficulty}</Text>
            </View>
            <View style={[styles.tag, styles.tagWithIcon, { backgroundColor: colors.surfaceHighlight }]}>
              <Clock size={11} color={colors.textSecondary} />
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>~ {scenario.estimatedMinutes} min</Text>
            </View>
          </View>

          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>About this scenario</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setExpanded((v) => !v)} disabled={scenario.situation.length < 140}>
            <Text
              style={[styles.bodyText, { color: colors.textSecondary }]}
              numberOfLines={expanded ? undefined : 2}
            >
              {scenario.situation}
            </Text>
            {scenario.situation.length >= 140 && (
              <View style={styles.readMoreRow}>
                <Text style={[styles.readMoreText, { color: colors.primary }]}>
                  {expanded ? 'Show less' : 'Read more'}
                </Text>
                <ChevronDown
                  size={13}
                  color={colors.primary}
                  style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
                />
              </View>
            )}
          </TouchableOpacity>

          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>What you'll practice</Text>
          <View style={styles.chipGrid}>
            {PRACTICE_CHIPS.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <View
                  key={idx}
                  style={[styles.practiceChip, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}
                >
                  <Icon size={15} color={colors.primary} />
                  <Text style={[styles.practiceChipText, { color: colors.textPrimary }]}>{chip.label}</Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Roleplay', { scenario })}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>Start Conversation</Text>
            <ArrowRight size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  heroWrap: {
    height: 260,
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 19, 64, 0.35)'
  },
  heroTopRow: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  heroIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    padding: 16
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 10
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  tagWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  tagText: {
    fontSize: 11.5,
    fontWeight: '700'
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 6
  },
  bodyText: {
    fontSize: 13.5,
    lineHeight: 20
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
    marginBottom: 4
  },
  readMoreText: {
    fontSize: 12.5,
    fontWeight: '700'
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
    marginBottom: 26
  },
  practiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 20,
    borderWidth: 1
  },
  practiceChipText: {
    fontSize: 12.5,
    fontWeight: '600'
  },
  startBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});

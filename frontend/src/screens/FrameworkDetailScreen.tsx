import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, BookOpen, Sparkles, Play, Quote, ChevronDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, RADII } from '../context/ThemeContext';
import { apiService } from '../services/api';
import { FrameworkOfTheDay, Scenario } from '../types';

export const FrameworkDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { framework } = route.params as { framework: FrameworkOfTheDay };
  const { colors, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;
  const [targetScenario, setTargetScenario] = useState<Scenario | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  useEffect(() => {
    if (framework?.suggestedScenarioId) {
      apiService.getScenarios().then((res) => {
        const found = res?.scenarios?.find((s) => s.id === framework.suggestedScenarioId);
        if (found) setTargetScenario(found);
      });
    }
  }, [framework]);

  const handleStart = () => {
    if (targetScenario) {
      navigation.navigate('Roleplay', { scenario: targetScenario });
    } else {
      navigation.navigate('DescribeSituation');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Guided Practice</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.tagPill, { backgroundColor: colors.primarySubtle }]}>
          <BookOpen size={12} color={colors.primary} />
          <Text style={[styles.tagText, { color: colors.primary }]}>FRAMEWORK OF THE DAY</Text>
        </View>

        <Text style={[styles.pageHeading, { color: colors.textPrimary }]}>{framework.title}</Text>
        <Text style={[styles.pageSub, { color: colors.textSecondary }]}>{framework.tagline}</Text>
        {!!framework.sourceCredit && (
          <Text style={[styles.sourceCredit, { color: colors.textMuted }]}>{framework.sourceCredit}</Text>
        )}

        {/* Summary Card */}
        <View style={[styles.summaryCard, elevation.sm, { backgroundColor: colors.primarySubtle, borderColor: colors.primaryLight }]}>
          <Text style={[styles.summaryText, { color: colors.textPrimary }]}>{framework.summary}</Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>THE CORE STEPS</Text>

        <View style={styles.stepsContainer}>
          {framework.components.map((comp, idx) => {
            const isOpen = expandedStep === idx;
            return (
              <View
                key={idx}
                style={[styles.stepCard, elevation.sm, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}
              >
                <View style={styles.stepHeader}>
                  <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepNumberText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>{comp.step}</Text>
                    <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>{comp.label}</Text>
                  </View>
                </View>

                <Text style={[styles.stepExplanation, { color: colors.textSecondary }]}>{comp.explanation}</Text>

                {!!comp.example && (
                  <>
                    <TouchableOpacity
                      style={styles.exampleToggle}
                      onPress={() => setExpandedStep(isOpen ? null : idx)}
                      activeOpacity={0.7}
                    >
                      <Quote size={12} color={colors.primary} />
                      <Text style={[styles.exampleToggleText, { color: colors.primary }]}>
                        {isOpen ? 'Hide example' : 'See it in action'}
                      </Text>
                      <ChevronDown
                        size={13}
                        color={colors.primary}
                        style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                      />
                    </TouchableOpacity>

                    {isOpen && (
                      <View style={[styles.exampleBox, { backgroundColor: colors.surfaceElevated }]}>
                        <Quote size={12} color={colors.primary} style={{ marginTop: 2 }} />
                        <Text style={[styles.exampleText, { color: colors.textPrimary }]}>{comp.example}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            );
          })}
        </View>

        {/* CTA: Practice in Scenario */}
        <View style={[styles.ctaCard, elevation.md, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
          <View style={[styles.ctaIconCircle, { backgroundColor: colors.primary }]}>
            <Sparkles size={20} color={colors.textInverse} />
          </View>
          <Text style={[styles.ctaTitle, { color: colors.textPrimary }]}>Put This Framework into Practice</Text>
          <Text style={[styles.ctaSub, { color: colors.textSecondary }]}>
            Apply this model right now against a live AI counterpart to cement the muscle memory.
          </Text>

          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
            onPress={handleStart}
            activeOpacity={0.88}
          >
            <Play size={16} color={colors.textInverse} style={{ marginRight: 8 }} />
            <Text style={[styles.ctaBtnText, { color: colors.textInverse }]}>Start Rehearsal with This Framework</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12
  },
  headerBtn: {
    padding: 6
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 40
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 10
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  pageHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4
  },
  pageSub: {
    fontSize: 14,
    lineHeight: 19
  },
  sourceCredit: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4
  },
  summaryCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    marginTop: 18,
    marginBottom: 22
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500'
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12
  },
  stepsContainer: {
    gap: 12,
    marginBottom: 24
  },
  stepCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  stepNumberBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2
  },
  stepLabel: {
    fontSize: 12,
    lineHeight: 16
  },
  stepExplanation: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10
  },
  exampleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12
  },
  exampleToggleText: {
    fontSize: 12.5,
    fontWeight: '700'
  },
  exampleBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginTop: 10
  },
  exampleText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontStyle: 'italic',
    flex: 1
  },
  ctaCard: {
    padding: 20,
    borderRadius: RADII.xl,
    borderWidth: 1,
    alignItems: 'center'
  },
  ctaIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12
  },
  ctaSub: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18
  },
  ctaBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaBtnText: {
    fontSize: 14,
    fontWeight: '700'
  }
});

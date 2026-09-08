import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, BookOpen, Sparkles, Play, Quote } from 'lucide-react-native';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { apiService } from '../services/api';
import { FrameworkOfTheDay, Scenario } from '../types';

export const FrameworkDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { framework } = route.params as { framework: FrameworkOfTheDay };
  const { colors } = useTheme();
  const [targetScenario, setTargetScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    if (framework?.suggestedScenarioId) {
      apiService.getScenarios().then((res) => {
        const found = res?.scenarios?.find((s) => s.id === framework.suggestedScenarioId);
        if (found) setTargetScenario(found);
      });
    }
  }, [framework]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>Framework of the Day</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Badge */}
        <View style={styles.badgeRow}>
          <View style={[styles.dailyTag, { backgroundColor: colors.sageSubtle, borderColor: colors.sage }]}>
            <BookOpen size={13} color={colors.sage} />
            <Text style={[typography.tag, { color: colors.sage }]}>EXECUTIVE COMMUNICATION MODEL</Text>
          </View>
        </View>

        <Text style={[typography.hero, { color: colors.textPrimary }]}>{framework.title}</Text>
        <Text style={[typography.subtitle, { color: colors.textSecondary, marginTop: 4 }]}>{framework.tagline}</Text>
        <Text style={[typography.caption, { color: colors.textMuted, fontStyle: 'italic', marginTop: 2, marginBottom: 14 }]}>{framework.sourceCredit}</Text>

        {/* Summary Card */}
        <Card variant="forest" style={styles.summaryCard}>
          <Text style={[typography.body, { color: colors.textPrimary, lineHeight: 22 }]}>{framework.summary}</Text>
        </Card>

        {/* 4 Core Components Breakdown */}
        <Text style={[typography.overline, { color: colors.textMuted, marginBottom: 10 }]}>THE CORE STEPS</Text>

        <View style={styles.stepsContainer}>
          {framework.components.map((comp, idx) => (
            <Card key={idx} variant="elevated" style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepNumberBadge, { backgroundColor: colors.sageSubtle, borderColor: colors.sage }]}>
                  <Text style={[typography.tag, { color: colors.sage }]}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h4, { color: colors.textPrimary }]}>{comp.step}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>{comp.label}</Text>
                </View>
              </View>

              <Text style={[typography.body, { color: colors.textSecondary, marginTop: 6 }]}>{comp.explanation}</Text>

              {comp.example && (
                <View style={[styles.exampleBox, { backgroundColor: colors.surfaceHighlight }]}>
                  <Quote size={12} color={colors.sage} style={{ marginTop: 2 }} />
                  <Text style={[typography.bodySmall, { color: colors.textPrimary, fontStyle: 'italic', flex: 1 }]}>{comp.example}</Text>
                </View>
              )}
            </Card>
          ))}
        </View>

        {/* CTA: Practice in Scenario */}
        <View style={[styles.ctaCard, { backgroundColor: colors.surfaceCard, borderColor: colors.primarySubtle }]}>
          <View style={[styles.ctaIconCircle, { backgroundColor: colors.primary }]}>
            <Sparkles size={20} color={colors.textInverse} />
          </View>
          <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center', marginTop: 8 }]}>Put This Framework into Practice</Text>
          <Text style={[typography.subtitle, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 16 }]}>
            Apply this model right now against a live AI counterpart to cement the muscle memory.
          </Text>

          <Button
            title="Start Rehearsal with This Framework"
            variant="primary"
            size="lg"
            onPress={() => {
              if (targetScenario) {
                navigation.navigate('Roleplay', { scenario: targetScenario });
              } else {
                navigation.navigate('DescribeSituation');
              }
            }}
            icon={<Play size={18} color={colors.textInverse} />}
            style={styles.ctaBtn}
          />
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
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  headerBtn: {
    padding: 6
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40
  },
  badgeRow: {
    marginBottom: 8
  },
  dailyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6
  },
  summaryCard: {
    padding: 16,
    marginBottom: 20
  },
  stepsContainer: {
    gap: 12,
    marginBottom: 24
  },
  stepCard: {
    padding: 16
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  exampleBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginTop: 10
  },
  ctaCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center'
  },
  ctaIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaBtn: {
    width: '100%'
  }
});

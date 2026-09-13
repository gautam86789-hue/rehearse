import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import {
  BookOpen,
  Target,
  HeartHandshake,
  Shield,
  MessageSquare,
  Sparkles,
  ChevronLeft
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, RADII } from '../../context/ThemeContext';

const PRINCIPLES = [
  {
    icon: HeartHandshake,
    title: 'Tactical Empathy',
    description: 'Demonstrating an accurate understanding of your counterpart’s unspoken motivations, anxieties, and hidden constraints before attempting to persuade.'
  },
  {
    icon: Target,
    title: 'Negotiation Frameworks',
    description: 'Separating the person from the problem. Focusing on underlying interests rather than rigid positional demands to expand mutual value.'
  },
  {
    icon: Shield,
    title: 'Boundary Setting',
    description: 'Maintaining firm professional limits under intense organizational pressure without resorting to defensiveness or emotional escalation.'
  },
  {
    icon: MessageSquare,
    title: 'Difficult Feedback',
    description: 'Delivering clear, unvarnished performance assessments grounded in specific behavioral observations and actionable turnaround expectations.'
  },
  {
    icon: Sparkles,
    title: 'Executive Presence',
    description: 'Developing vocal composure, deliberate pacing, and high emotional regulation during unpredictable high-stakes conversational turns.'
  }
];

export const MethodologyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.surfaceBorder, paddingTop: topPadding }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Methodology</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Banner */}
        <View style={[styles.introCard, elevation.md, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: themeColors.primarySubtle }]}>
            <BookOpen size={20} color={themeColors.primary} />
          </View>
          <Text style={[styles.introTitle, { color: themeColors.textPrimary }]}>Deliberate Behavioral Practice</Text>
          <Text style={[styles.introText, { color: themeColors.textSecondary }]}>
            High-stakes communication cannot be mastered through passive study. Rehearse provides realistic simulation loops that build instinctive muscle memory.
          </Text>
        </View>

        {/* Section: Core Frameworks */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>CORE PRINCIPLES</Text>

          <View style={styles.principleList}>
            {PRINCIPLES.map((p, index) => {
              const IconComp = p.icon;
              return (
                <View
                  key={index}
                  style={[styles.principleCard, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}
                >
                  <View style={styles.principleHeader}>
                    <View style={[styles.miniIconCircle, { backgroundColor: themeColors.primarySubtle }]}>
                      <IconComp size={16} color={themeColors.primary} />
                    </View>
                    <Text style={[styles.principleTitle, { color: themeColors.textPrimary }]}>{p.title}</Text>
                  </View>
                  <Text style={[styles.principleDesc, { color: themeColors.textSecondary }]}>
                    {p.description}
                  </Text>
                </View>
              );
            })}
          </View>
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
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitleContainer: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  introCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center'
  },
  introText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center'
  },
  section: {
    marginBottom: 24
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase'
  },
  principleList: {
    gap: 10
  },
  principleCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 14
  },
  principleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  miniIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  principleTitle: {
    fontSize: 14.5,
    fontWeight: '600'
  },
  principleDesc: {
    fontSize: 12.5,
    lineHeight: 18
  }
});

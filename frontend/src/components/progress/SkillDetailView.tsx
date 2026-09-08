import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G
} from 'react-native-svg';
import {
  ChevronLeft,
  Check,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  Quote,
  Target
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { T } from './core/type';
import { CommunicationSkill } from '../../types/progress';

interface SkillDetailViewProps {
  skill: CommunicationSkill | null;
  visible: boolean;
  onClose: () => void;
  onPractice: (scenarioId?: string) => void;
}

export const SkillDetailView: React.FC<SkillDetailViewProps> = ({
  skill,
  visible,
  onClose,
  onPractice
}) => {
  const { colors: themeColors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'strengths' | 'to_improve' | 'history'>('overview');

  if (!skill) return null;

  const milestones = [
    { label: 'Found my voice', x: 50, y: 110, completed: true },
    { label: 'Handled pushback well', x: 170, y: 65, completed: true },
    { label: 'Stronger closing statements', x: 285, y: 25, completed: true }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: themeColors.surfaceBorder }]}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: themeColors.surfaceElevated }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.categoryOverline, { color: themeColors.primary }]}>COMMUNICATION SKILL</Text>
            <Text style={[styles.skillName, { color: themeColors.textPrimary }]}>{skill.name}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Subtitle */}
          <Text style={[styles.skillTagline, { color: themeColors.textSecondary }]}>
            Make confident asks and create mutually beneficial outcomes.
          </Text>

          {/* Hero Gauge & Stats Row */}
          <View style={[styles.heroCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            {/* Left Gauge */}
            <View style={styles.gaugeContainer}>
              <Svg width={110} height={110}>
                <Defs>
                  <LinearGradient id="heroGold" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#E5CD82" />
                    <Stop offset="100%" stopColor="#C8AA6A" />
                  </LinearGradient>
                </Defs>
                <Circle cx={55} cy={55} r={46} stroke={isDark ? '#14291F' : '#E2DEC9'} strokeWidth={8} fill="none" />
                <Circle
                  cx={55}
                  cy={55}
                  r={46}
                  stroke="url(#heroGold)"
                  strokeWidth={8}
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  strokeDashoffset={2 * Math.PI * 46 * (1 - skill.score / 100)}
                  strokeLinecap="round"
                  fill="none"
                  transform="rotate(-90 55 55)"
                />
              </Svg>
              <View style={styles.gaugeCenter}>
                <Text style={[styles.gaugeNum, { color: themeColors.textPrimary }]}>{skill.score}</Text>
                <Text style={[styles.gaugeLabel, { color: themeColors.textSecondary }]}>Confidence</Text>
              </View>
            </View>

            {/* Right Metric Badges */}
            <View style={styles.metricBadgesCol}>
              <View style={styles.badgeRow}>
                <TrendingUp size={15} color={themeColors.primary} />
                <Text style={[styles.badgeValue, { color: themeColors.textPrimary }]}>+12 <Text style={{ color: themeColors.textSecondary, ...T.micro }}>since last month</Text></Text>
              </View>
              <View style={styles.badgeRow}>
                <Target size={15} color={themeColors.primary} />
                <Text style={[styles.badgeValue, { color: themeColors.textPrimary }]}>{skill.rehearsalsCount} <Text style={{ color: themeColors.textSecondary, ...T.micro }}>Rehearsals</Text></Text>
              </View>
              <View style={styles.badgeRow}>
                <Award size={15} color={themeColors.primary} />
                <Text style={[styles.badgeValue, { color: themeColors.textPrimary }]}>Top 20% <Text style={{ color: themeColors.textSecondary, ...T.micro }}>of Rehearse users</Text></Text>
              </View>
            </View>
          </View>

          {/* Sub-Tabs Pills */}
          <View style={styles.subTabsRow}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'strengths', label: 'Strengths' },
              { id: 'to_improve', label: 'To Improve' },
              { id: 'history', label: 'History' }
            ].map((t) => {
              const isSelected = activeTab === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.subTabPill,
                    { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder },
                    isSelected && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                  ]}
                  onPress={() => setActiveTab(t.id as any)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.subTabLabel,
                      { color: isSelected ? themeColors.textInverse : themeColors.textSecondary }
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tab Content: Overview Journey */}
          {activeTab === 'overview' && (
            <View style={styles.tabContentBlock}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Your Journey</Text>

              {/* Journey Path Canvas */}
              <View style={[styles.journeyCard, { backgroundColor: isDark ? '#0F2119' : '#EAE6D8', borderColor: themeColors.surfaceBorder }]}>
                <Svg width="100%" height={150} viewBox="0 0 340 150">
                  <Defs>
                    <LinearGradient id="journeyTrail" x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0%" stopColor="#C8AA6A" />
                      <Stop offset="100%" stopColor="#E2CA90" />
                    </LinearGradient>
                  </Defs>

                  {/* Hill silhouette */}
                  <Path d="M 0 150 Q 170 80 340 150 Z" fill={isDark ? '#142B20' : '#8A9988'} opacity="0.6" />

                  {/* Winding Trail */}
                  <Path
                    d="M 20 130 Q 110 90 170 80 Q 230 70 310 30"
                    stroke="url(#journeyTrail)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Flag at the end */}
                  <G transform="translate(305, 12)">
                    <Path d="M 0 0 L 0 20" stroke="#C8AA6A" strokeWidth="2" />
                    <Path d="M 0 0 L 12 5 L 0 10 Z" fill="#C8AA6A" />
                  </G>

                  {/* Checkpoint nodes */}
                  {milestones.map((m, idx) => (
                    <G key={idx}>
                      <Circle cx={m.x} cy={m.y} r={7} fill="#C8AA6A" stroke="#FFFFFF" strokeWidth={1.5} />
                      <G transform={`translate(${m.x - 3.5}, ${m.y - 3.5})`}>
                        <Path d="M 1 3.5 L 3 5.5 L 6 1" stroke="#0B1712" strokeWidth="1.2" strokeLinecap="round" />
                      </G>
                    </G>
                  ))}
                </Svg>

                {/* Milestone callout tags */}
                {milestones.map((m, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.milestoneTag,
                      {
                        left: Math.max(10, m.x - 45),
                        top: m.y + 12,
                        backgroundColor: isDark ? '#12261D' : '#FFFFFF',
                        borderColor: themeColors.surfaceBorder
                      }
                    ]}
                  >
                    <Text style={[styles.milestoneTagText, { color: themeColors.textPrimary }]}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tab Content: Strengths */}
          {activeTab === 'strengths' && (
            <View style={styles.tabContentBlock}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Demonstrated Strengths</Text>
              <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
                {skill.strengths.map((s, idx) => (
                  <View key={idx} style={[styles.bulletRow, idx < skill.strengths.length - 1 && { borderBottomColor: themeColors.surfaceBorder, borderBottomWidth: 1 }]}>
                    <Check size={16} color={themeColors.primary} style={{ marginTop: 2, marginRight: 8 }} />
                    <Text style={[styles.bulletText, { color: themeColors.textPrimary }]}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tab Content: To Improve */}
          {activeTab === 'to_improve' && (
            <View style={styles.tabContentBlock}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Areas to Focus Next</Text>
              <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
                {skill.growthAreas.map((g, idx) => (
                  <View key={idx} style={[styles.bulletRow, idx < skill.growthAreas.length - 1 && { borderBottomColor: themeColors.surfaceBorder, borderBottomWidth: 1 }]}>
                    <Target size={16} color={themeColors.primary} style={{ marginTop: 2, marginRight: 8 }} />
                    <Text style={[styles.bulletText, { color: themeColors.textPrimary }]}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tab Content: History */}
          {activeTab === 'history' && (
            <View style={styles.tabContentBlock}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Rehearsal Score History</Text>
              <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
                {skill.recentScores.map((scoreVal, idx) => (
                  <View key={idx} style={[styles.historyRow, idx < skill.recentScores.length - 1 && { borderBottomColor: themeColors.surfaceBorder, borderBottomWidth: 1 }]}>
                    <Text style={[styles.historyLabel, { color: themeColors.textPrimary }]}>Session #{idx + 1}</Text>
                    <Text style={[styles.historyScore, { color: themeColors.primary }]}>{scoreVal} pts</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Quote Card */}
          <View style={[styles.quoteCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <Quote size={16} color={themeColors.primary} style={{ marginBottom: 6 }} />
            <Text style={[styles.quoteText, { color: themeColors.textPrimary }]}>
              "Great negotiators don't just ask. They create value for everyone."
            </Text>
          </View>

          {/* Practice Action CTA */}
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: themeColors.primary }]}
            onPress={() => {
              onClose();
              onPractice(skill.recommendedScenarioId);
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.ctaButtonText, { color: themeColors.textInverse }]}>Practice This Skill</Text>
            <ArrowRight size={18} color={themeColors.textInverse} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryOverline: {
    ...T.eyebrow
  },
  skillName: {
    ...T.title,
    fontSize: 20,
    lineHeight: 25
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  skillTagline: {
    ...T.body,
    marginBottom: 16
  },
  heroCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16
  },
  gaugeContainer: {
    width: 110,
    height: 110,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  gaugeCenter: {
    position: 'absolute',
    alignItems: 'center'
  },
  gaugeNum: {
    ...T.figure
  },
  gaugeLabel: {
    ...T.micro
  },
  metricBadgesCol: {
    flex: 1,
    marginLeft: 16,
    gap: 8
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  badgeValue: {
    ...T.label,
    fontWeight: '600'
  },
  subTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  subTabPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center'
  },
  subTabLabel: {
    ...T.label
  },
  tabContentBlock: {
    marginBottom: 16
  },
  sectionTitle: {
    ...T.heading,
    marginBottom: 10
  },
  journeyCard: {
    borderRadius: 14,
    borderWidth: 1,
    position: 'relative',
    paddingBottom: 24,
    overflow: 'hidden'
  },
  milestoneTag: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2
  },
  milestoneTagText: {
    ...T.micro,
    fontSize: 10
  },
  cardGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden'
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12
  },
  bulletText: {
    ...T.body,
    flex: 1
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12
  },
  historyLabel: {
    ...T.label
  },
  historyScore: {
    ...T.labelStrong,
    fontSize: 14
  },
  quoteCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16
  },
  quoteText: {
    ...T.body,
    fontStyle: 'italic',
    textAlign: 'center'
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12
  },
  ctaButtonText: {
    ...T.heading
  }
});

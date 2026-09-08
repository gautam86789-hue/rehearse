import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import {
  ChevronLeft,
  Share2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Shield,
  Activity,
  Award,
  Zap,
  Play
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export const ConversationAutopsyScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route
}) => {
  const { colors: themeColors, isDark } = useTheme();

  const title = route?.params?.title || 'Compensation Discussion';
  const duration = route?.params?.duration || '03:42';

  const overallScore = 82;
  const radius = 48;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const pillars = [
    {
      title: 'Strategic Clarity',
      score: 86,
      change: '+8%',
      isPositive: true,
      desc: 'Clear anchor on deliverable outcomes'
    },
    {
      title: 'Composure',
      score: 79,
      change: '-3%',
      isPositive: false,
      desc: 'Held frame during budget pushback'
    },
    {
      title: 'Substance & Data',
      score: 84,
      change: '+12%',
      isPositive: true,
      desc: 'Strong proof of Q2 22% over-performance'
    },
    {
      title: 'Influence & Closure',
      score: 78,
      change: '+5%',
      isPositive: true,
      desc: 'Secured scheduled milestone review'
    }
  ];

  const keyMoments = [
    {
      timestamp: '01:05',
      type: 'win',
      delta: '+14 Leverage',
      headline: 'Reframed constraint into milestone structure',
      detail: 'You validated their budget issue without conceding your baseline value.'
    },
    {
      timestamp: '02:18',
      type: 'warning',
      delta: '-6 Leverage',
      headline: 'Vulnerable to headcount trade-off',
      detail: 'A slight hesitation allowed Alex to pit your raise against an engineering hire.'
    },
    {
      timestamp: '03:10',
      type: 'win',
      delta: '+18 Leverage',
      headline: 'Turned leadership into direct cost savings',
      detail: 'Quantified your architectural lead role as saving 3 months of senior onboarding.'
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.surfaceBorder }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: themeColors.surfaceElevated }]}
          onPress={() => navigation.navigate('CoachHome')}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Conversation Autopsy</Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
            {title} • {duration}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: themeColors.surfaceElevated }]}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <Share2 size={18} color={themeColors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Ring Hero Card */}
        <View
          style={[
            styles.scoreHeroCard,
            {
              backgroundColor: isDark ? '#14201A' : '#F4F7F5',
              borderColor: themeColors.surfaceBorder
            }
          ]}
        >
          <View style={styles.scoreRow}>
            {/* SVG Ring Gauge */}
            <View style={styles.gaugeBox}>
              <Svg width={120} height={120} viewBox="0 0 120 120">
                <G rotation="-90" origin="60, 60">
                  <Circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke={isDark ? '#23382D' : '#E0E8E3'}
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                  <Circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke={isDark ? '#C8AA6A' : '#173D2C'}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                  />
                </G>
              </Svg>
              <View style={styles.scoreNumberOverlay}>
                <Text style={[styles.scoreNumber, { color: isDark ? '#C8AA6A' : '#173D2C' }]}>
                  {overallScore}
                </Text>
                <Text style={[styles.scoreOutOf, { color: themeColors.textSecondary }]}>/ 100</Text>
              </View>
            </View>

            {/* Score Text Description */}
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={[styles.gradePill, { backgroundColor: themeColors.primarySubtle }]}>
                <Sparkles size={11} color={themeColors.primary} />
                <Text style={[styles.gradePillText, { color: themeColors.primary }]}>
                  EXECUTIVE GRADE
                </Text>
              </View>
              <Text style={[styles.gradeTitle, { color: themeColors.textPrimary }]}>
                Strong Tactical Position
              </Text>
              <Text style={[styles.gradeDesc, { color: themeColors.textSecondary }]}>
                You maintained leverage throughout the negotiation and successfully moved from a flat 'No' to a structured Q3 commitment.
              </Text>
            </View>
          </View>
        </View>

        {/* 4 Pillars Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>
            PERFORMANCE PILLARS
          </Text>
          <View style={styles.pillarsGrid}>
            {pillars.map((p, idx) => (
              <View
                key={idx}
                style={[
                  styles.pillarCard,
                  {
                    backgroundColor: themeColors.surfaceCard,
                    borderColor: themeColors.surfaceBorder
                  }
                ]}
              >
                <View style={styles.pillarTop}>
                  <Text style={[styles.pillarTitle, { color: themeColors.textSecondary }]}>
                    {p.title}
                  </Text>
                  <View style={styles.changeBadge}>
                    <Text
                      style={[
                        styles.changeText,
                        { color: p.isPositive ? '#2ECC71' : '#E74C3C' }
                      ]}
                    >
                      {p.change}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.pillarScore, { color: themeColors.textPrimary }]}>
                  {p.score}%
                </Text>
                <Text style={[styles.pillarDesc, { color: themeColors.textSecondary }]}>
                  {p.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Key Moments Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>
            CRITICAL MOMENTS & LEVERAGE SHIFTS
          </Text>
          <View
            style={[
              styles.timelineCard,
              {
                backgroundColor: themeColors.surfaceCard,
                borderColor: themeColors.surfaceBorder
              }
            ]}
          >
            {keyMoments.map((m, idx) => {
              const isWin = m.type === 'win';
              return (
                <View
                  key={idx}
                  style={[
                    styles.momentRow,
                    idx < keyMoments.length - 1 && {
                      borderBottomColor: themeColors.surfaceBorder,
                      borderBottomWidth: 1
                    }
                  ]}
                >
                  <View style={styles.momentTimestampBox}>
                    <Text style={[styles.momentTime, { color: themeColors.textSecondary }]}>
                      {m.timestamp}
                    </Text>
                    <View
                      style={[
                        styles.momentDeltaBadge,
                        { backgroundColor: isWin ? 'rgba(46,204,113,0.12)' : 'rgba(231,76,60,0.12)' }
                      ]}
                    >
                      <Text
                        style={[
                          styles.momentDeltaText,
                          { color: isWin ? '#2ECC71' : '#E74C3C' }
                        ]}
                      >
                        {m.delta}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.momentHeadline, { color: themeColors.textPrimary }]}>
                      {m.headline}
                    </Text>
                    <Text style={[styles.momentDetail, { color: themeColors.textSecondary }]}>
                      {m.detail}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Actions CTA Group */}
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: isDark ? '#C8AA6A' : '#173D2C' }]}
            onPress={() => navigation.navigate('ConversationReplay', { title })}
            activeOpacity={0.85}
          >
            <Play size={16} color={isDark ? '#0B1712' : '#FFFFFF'} style={{ marginRight: 8 }} />
            <Text style={[styles.primaryBtnText, { color: isDark ? '#0B1712' : '#FFFFFF' }]}>
              Watch Turn-by-Turn Replay
            </Text>
            <ArrowRight size={16} color={isDark ? '#0B1712' : '#FFFFFF'} style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}
            onPress={() => navigation.navigate('CoachingNextSteps', { title, score: overallScore })}
            activeOpacity={0.7}
          >
            <Sparkles size={16} color={isDark ? '#C8AA6A' : '#173D2C'} style={{ marginRight: 6 }} />
            <Text style={[styles.secondaryBtnText, { color: themeColors.textPrimary }]}>
              View Recommended Next Steps
            </Text>
            <ArrowRight size={16} color={themeColors.textSecondary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tertiaryBtn, { backgroundColor: 'transparent' }]}
            onPress={() => navigation.navigate('RehearsalSettings', { title })}
            activeOpacity={0.7}
          >
            <RotateCcw size={15} color={themeColors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.tertiaryBtnText, { color: themeColors.textSecondary }]}>
              Rehearse Again with Higher Rigor
            </Text>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40
  },
  scoreHeroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  gaugeBox: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  scoreNumberOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1
  },
  scoreOutOf: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: -2
  },
  gradePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 6
  },
  gradePillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  gradeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  gradeDesc: {
    fontSize: 12,
    lineHeight: 16
  },
  section: {
    marginBottom: 20
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  pillarCard: {
    width: '48.5%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12
  },
  pillarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  pillarTitle: {
    fontSize: 11,
    fontWeight: '600'
  },
  changeBadge: {},
  changeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  pillarScore: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4
  },
  pillarDesc: {
    fontSize: 11,
    lineHeight: 14
  },
  timelineCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden'
  },
  momentRow: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'flex-start'
  },
  momentTimestampBox: {
    width: 80,
    alignItems: 'flex-start'
  },
  momentTime: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: 4
  },
  momentDeltaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  momentDeltaText: {
    fontSize: 9,
    fontWeight: '800'
  },
  momentHeadline: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2
  },
  momentDetail: {
    fontSize: 12,
    lineHeight: 16
  },
  actionGroup: {
    marginTop: 6,
    gap: 10
  },
  primaryBtn: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700'
  },
  secondaryBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600'
  },
  tertiaryBtn: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tertiaryBtnText: {
    fontSize: 13,
    fontWeight: '600'
  }
});

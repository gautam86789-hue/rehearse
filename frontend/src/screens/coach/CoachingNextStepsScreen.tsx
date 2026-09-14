import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
  ChevronLeft,
  CheckCircle2,
  Circle as CircleIcon,
  Calendar,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Bookmark,
  Share2,
  Home
} from 'lucide-react-native';
import { useTheme, RADII } from '../../context/ThemeContext';

interface ActionStep {
  id: string;
  title: string;
  detail: string;
  timing: string;
  icon: any;
  completed: boolean;
}

export const CoachingNextStepsScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route
}) => {
  const { colors: themeColors, isDark, elevation } = useTheme();
  // Header had paddingTop: Platform.OS === 'ios' ? 56 : 20 — the Android
  // branch had no safe-area handling, so on edge-to-edge Android the
  // back button and title sat under the status bar / camera cutout.
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const title = route?.params?.title || 'Compensation Discussion';
  const score = route?.params?.score || 82;

  const [actions, setActions] = useState<ActionStep[]>([
    {
      id: '1',
      title: 'Send Calendar Follow-up to Counterpart',
      detail: 'Send the 2-sentence note anchoring on the agreed Q3 milestone review framework.',
      timing: 'Within 2 hours',
      icon: Calendar,
      completed: false
    },
    {
      id: '2',
      title: 'Document Leadership Cost-Savings 1-Pager',
      detail: 'Summarize the 3-month onboarding acceleration in bullet points for executive visibility.',
      timing: 'Before Friday',
      icon: FileText,
      completed: false
    },
    {
      id: '3',
      title: 'Run Adversarial Sparring Simulation',
      detail: 'Practice holding composure against aggressive deadline interruptions.',
      timing: 'Tomorrow morning',
      icon: RotateCcw,
      completed: false
    }
  ]);

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.surfaceBorder, paddingTop: topPadding }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: themeColors.surfaceElevated }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <ChevronLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Action Plan</Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
            Post-rehearsal tactical momentum
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: themeColors.surfaceElevated }]}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <Bookmark size={18} color={themeColors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Growth Hero Card with Botanical Leaf Art */}
        <View
          style={[
            styles.growthHeroCard,
            elevation.md,
            {
              backgroundColor: themeColors.surfaceHighlight,
              borderColor: themeColors.surfaceBorder
            }
          ]}
        >
          <View style={styles.growthHeroRow}>
            {/* Botanical SVG */}
            <View style={styles.botanicalBox}>
              <Svg width={64} height={64} viewBox="0 0 64 64">
                <Defs>
                  <LinearGradient id="botanicalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={themeColors.primaryLight} />
                    <Stop offset="100%" stopColor={themeColors.primary} />
                  </LinearGradient>
                </Defs>
                {/* Stem */}
                <Path
                  d="M32 58 C32 40, 32 24, 32 10"
                  stroke="url(#botanicalGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Left Leaf */}
                <Path
                  d="M32 42 C20 40, 16 30, 22 24 C28 20, 32 32, 32 42 Z"
                  fill="url(#botanicalGrad)"
                  opacity={0.85}
                />
                {/* Right Leaf */}
                <Path
                  d="M32 30 C44 28, 48 18, 42 12 C36 8, 32 20, 32 30 Z"
                  fill="url(#botanicalGrad)"
                  opacity={0.95}
                />
                {/* Bud Top */}
                <Circle cx="32" cy="10" r="3.5" fill={themeColors.primary} />
              </Svg>
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={[styles.statusBadge, { backgroundColor: themeColors.primarySubtle }]}>
                <Sparkles size={11} color={themeColors.primary} />
                <Text style={[styles.statusBadgeText, { color: themeColors.primary }]}>
                  SIMULATION COMPLETE
                </Text>
              </View>
              <Text style={[styles.growthTitle, { color: themeColors.textPrimary }]}>
                Leverage Solidified
              </Text>
              <Text style={[styles.growthDesc, { color: themeColors.textSecondary }]}>
                You scored {score}/100. Follow through with the high-conviction steps below to seal the outcome.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Steps Checklist */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>
            RECOMMENDED HIGH-LEVERAGE STEPS
          </Text>
          <View style={styles.actionsList}>
            {actions.map((act) => {
              const IconComp = act.icon;
              return (
                <TouchableOpacity
                  key={act.id}
                  style={[
                    styles.actionCard,
                    elevation.sm,
                    {
                      backgroundColor: themeColors.surfaceCard,
                      borderColor: act.completed
                        ? themeColors.success
                        : themeColors.surfaceBorder
                    }
                  ]}
                  onPress={() => toggleAction(act.id)}
                  activeOpacity={0.8}
                >
                  <TouchableOpacity
                    style={styles.checkTouch}
                    onPress={() => toggleAction(act.id)}
                  >
                    {act.completed ? (
                      <CheckCircle2 size={22} color="#2ECC71" />
                    ) : (
                      <CircleIcon size={22} color={themeColors.surfaceBorder} />
                    )}
                  </TouchableOpacity>

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={styles.actionCardHeader}>
                      <Text
                        style={[
                          styles.actionCardTitle,
                          {
                            color: act.completed
                              ? themeColors.textSecondary
                              : themeColors.textPrimary,
                            textDecorationLine: act.completed ? 'line-through' : 'none'
                          }
                        ]}
                      >
                        {act.title}
                      </Text>
                      <View style={[styles.timingPill, { backgroundColor: themeColors.surfaceElevated }]}>
                        <Text style={[styles.timingText, { color: themeColors.textSecondary }]}>
                          {act.timing}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.actionCardDetail,
                        { color: themeColors.textSecondary }
                      ]}
                    >
                      {act.detail}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Executive Principle Quote Card */}
        <View
          style={[
            styles.quoteCard,
            elevation.sm,
            {
              backgroundColor: themeColors.primarySubtle,
              borderColor: themeColors.primaryLight
            }
          ]}
        >
          <Text style={[styles.quoteSymbol, { color: themeColors.primary }]}>
            “
          </Text>
          <Text style={[styles.quoteText, { color: themeColors.textPrimary }]}>
            The quality of your leadership is determined by the difficult conversations you are willing to execute with grace and conviction.
          </Text>
          <Text style={[styles.quoteAuthor, { color: themeColors.primary }]}>
            — Rehearse Executive Methodology
          </Text>
        </View>

        {/* Return to Coach / Complete CTA */}
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={[styles.finishBtn, { backgroundColor: themeColors.primary }]}
            onPress={() => navigation.navigate('CoachHome')}
            activeOpacity={0.85}
          >
            <Home size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={[styles.finishBtnText, { color: '#FFFFFF' }]}>
              Return to Coach Suite
            </Text>
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
  growthHeroCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20
  },
  growthHeroRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  botanicalBox: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 4
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  growthTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2
  },
  growthDesc: {
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
  actionsList: {
    gap: 10
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: RADII.md,
    borderWidth: 1.5,
    padding: 14
  },
  checkTouch: {
    marginTop: 2
  },
  actionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8
  },
  timingPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  timingText: {
    fontSize: 10,
    fontWeight: '600'
  },
  actionCardDetail: {
    fontSize: 12,
    lineHeight: 16
  },
  quoteCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    position: 'relative'
  },
  quoteSymbol: {
    fontSize: 36,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 36,
    position: 'absolute',
    top: 10,
    left: 14,
    opacity: 0.3
  },
  quoteText: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    paddingLeft: 16,
    marginBottom: 8
  },
  quoteAuthor: {
    fontSize: 11,
    fontWeight: '700',
    paddingLeft: 16,
    letterSpacing: 0.3
  },
  actionGroup: {
    marginTop: 6
  },
  finishBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  finishBtnText: {
    fontSize: 15,
    fontWeight: '700'
  }
});

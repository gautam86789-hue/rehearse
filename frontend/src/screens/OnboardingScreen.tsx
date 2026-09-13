import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  Users,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  Briefcase,
  AlertCircle,
  DollarSign,
  CloudRain,
  UserX,
  Scale,
  Handshake,
  UserMinus,
  MessageCircleWarning,
  Award,
  Frown,
  UserPlus
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { useTheme, RADII } from '../context/ThemeContext';
import { Audience } from '../types';

interface DreadScenario {
  id: string;
  title: string;
  desc: string;
  icon: any;
}

// Step 2's options are entirely driven by Step 1's audience selection — each
// persona dreads a structurally different conversation, so reusing one
// generic list (the old behavior) meant most users saw options irrelevant to
// their actual situation.
const DREAD_SCENARIOS_BY_AUDIENCE: Record<Audience, DreadScenario[]> = {
  founders_investors: [
    {
      id: 'down-round',
      title: 'Pitch a down round or valuation cut to investors',
      desc: 'Deliver hard financial news while keeping investor confidence intact.',
      icon: TrendingDown
    },
    {
      id: 'cofounder-alignment',
      title: 'Align with a co-founder on a strategy disagreement',
      desc: 'Resolve a fundamental disagreement without fracturing the partnership.',
      icon: Handshake
    },
    {
      id: 'team-layoff',
      title: 'Deliver a layoff or restructuring update to the team',
      desc: 'Communicate hard changes with transparency and composure.',
      icon: UserMinus
    },
    {
      id: 'term-sheet-pushback',
      title: "Push back on an investor's unreasonable term sheet demand",
      desc: 'Hold your position on terms without souring the relationship.',
      icon: Scale
    },
    {
      id: 'runway',
      title: "Have the 'we're almost out of runway' conversation",
      desc: 'Level with your team or board about a hard financial reality.',
      icon: AlertCircle
    },
    {
      id: 'board-pushback',
      title: 'Defend a decision the board is skeptical of',
      desc: 'Anchor your reasoning with conviction under pointed scrutiny.',
      icon: Shield
    }
  ],
  new_managers: [
    {
      id: 'feedback',
      title: 'Give difficult performance feedback',
      desc: 'Address underperformance directly without damaging morale or trust.',
      icon: AlertCircle
    },
    {
      id: 'promotion-denial',
      title: "Tell a report they didn't get the promotion",
      desc: 'Deliver disappointing news while keeping them motivated and engaged.',
      icon: Frown
    },
    {
      id: 'manage-up',
      title: "Push back on your own manager's unrealistic deadline",
      desc: 'Set a boundary upward without seeming like you\'re not a team player.',
      icon: Scale
    },
    {
      id: 'team-conflict',
      title: 'Mediate a conflict between two direct reports',
      desc: 'De-escalate tension and rebuild working trust between them.',
      icon: MessageCircleWarning
    },
    {
      id: 'report-layoff',
      title: 'Deliver a layoff or role elimination to someone on your team',
      desc: 'Communicate the hardest news a manager has to give, with empathy.',
      icon: UserMinus
    },
    {
      id: 'boundary-report',
      title: 'Set a boundary with a report who is overstepping',
      desc: 'Reassert scope and expectations without damaging the relationship.',
      icon: Shield
    }
  ],
  mba_students: [
    {
      id: 'case-pushback',
      title: 'Push back in a case interview when you disagree with feedback',
      desc: 'Defend your reasoning to an interviewer without sounding defensive.',
      icon: Scale
    },
    {
      id: 'offer-negotiation',
      title: 'Negotiate a job offer or signing bonus',
      desc: 'Anchor your ask with market data and calm conviction.',
      icon: DollarSign
    },
    {
      id: 'networking-stall',
      title: 'Navigate a networking chat that is going nowhere',
      desc: 'Redirect a stalled conversation toward a concrete next step.',
      icon: Users
    },
    {
      id: 'group-project-conflict',
      title: 'Handle a heated disagreement during a group project',
      desc: 'Disarm tension and get the team realigned on a shared deliverable.',
      icon: MessageCircleWarning
    },
    {
      id: 'rejection-feedback',
      title: 'Ask a recruiter for honest feedback after a rejection',
      desc: 'Get candid, useful input without sounding bitter or defensive.',
      icon: Frown
    },
    {
      id: 'decline-offer',
      title: 'Decline a competing offer gracefully after committing elsewhere',
      desc: 'Preserve the relationship while closing the door firmly.',
      icon: Handshake
    }
  ],
  professionals: [
    {
      id: 'boundary',
      title: 'Set a firm boundary on scope or hours',
      desc: 'Say no clearly without sounding defensive or disengaged from outcomes.',
      icon: Shield
    },
    {
      id: 'compensation',
      title: 'Ask for a compensation increase',
      desc: 'Anchor your market value with calm, evidence-backed conviction.',
      icon: DollarSign
    },
    {
      id: 'peer-friction',
      title: 'Handle an escalating disagreement with a peer',
      desc: 'Disarm tension and establish collaborative alignment on shared deliverables.',
      icon: Users
    },
    {
      id: 'bad-news',
      title: 'Deliver disappointing or bad news',
      desc: 'Communicate changes with deep empathy and poised accountability.',
      icon: CloudRain
    },
    {
      id: 'client-pushback',
      title: 'Push back against an unreasonable client or leader',
      desc: 'De-escalate unrealistic deadlines while holding your ground gracefully.',
      icon: UserX
    },
    {
      id: 'peer-underperformance',
      title: 'Address underperformance from a peer without authority over them',
      desc: 'Raise the issue directly without formal leverage or overstepping.',
      icon: Award
    }
  ],
  new_hires: [
    {
      id: 'clarify-expectations',
      title: "Ask your new manager what 'good' actually looks like",
      desc: 'Get concrete expectations early instead of guessing for months.',
      icon: Scale
    },
    {
      id: 'salary-negotiation',
      title: 'Negotiate a starting salary or signing bonus',
      desc: 'Anchor your ask with market data without risking the offer.',
      icon: DollarSign
    },
    {
      id: 'admit-not-knowing',
      title: "Admit you don't understand something without sounding incompetent",
      desc: 'Ask a clarifying question in a way that builds credibility, not doubt.',
      icon: MessageCircleWarning
    },
    {
      id: 'overwhelmed-workload',
      title: 'Tell your manager you\'re overwhelmed in your first month',
      desc: 'Raise a capacity concern early without looking like you can\'t handle the job.',
      icon: AlertCircle
    },
    {
      id: 'rough-first-review',
      title: 'Respond to critical feedback in your first performance review',
      desc: 'Stay composed and turn early criticism into a concrete improvement plan.',
      icon: Frown
    },
    {
      id: 'team-clique',
      title: "Navigate a team that hasn't quite let you in yet",
      desc: 'Build trust with a tenured team without forcing it or going quiet.',
      icon: Users
    }
  ]
};

export const OnboardingScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route
}) => {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  const { colors: themeColors, elevation } = useTheme();

  // Exactly 2 Onboarding Steps:
  // Step 1: What do you do? (Select Role)
  // Step 2: What conversation are you dreading? (Select Friction Scenario)
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAudience, setSelectedAudience] = useState<Audience>('founders_investors');
  const [selectedDreadId, setSelectedDreadId] = useState(
    DREAD_SCENARIOS_BY_AUDIENCE.founders_investors[0].id
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Softer step transition — a brief fade+rise instead of the flat instant
  // swap, so picking a role and moving on feels like one continuous
  // conversation rather than two separate screens.
  const stepAnim = useRef(new Animated.Value(1)).current;
  const animateStepIn = () => {
    stepAnim.setValue(0);
    Animated.timing(stepAnim, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };
  const goToStep = (next: 1 | 2) => {
    setStep(next);
    animateStepIn();
  };

  // The 4 audience segments Rehearse targets — this selection drives which
  // scenarios, Learn articles, and challenges get surfaced everywhere else
  // in the app (see Audience in types/index.ts).
  const roles: { id: Audience; title: string; desc: string; icon: any }[] = [
    {
      id: 'founders_investors',
      title: 'Founder / Investor',
      desc: 'Fundraising, board updates, co-founder alignment',
      icon: TrendingUp
    },
    {
      id: 'new_managers',
      title: 'New Manager',
      desc: 'Feedback, delegation, managing up and down',
      icon: Users
    },
    {
      id: 'mba_students',
      title: 'MBA Student',
      desc: 'Case interviews, networking, negotiation fundamentals',
      icon: GraduationCap
    },
    {
      id: 'professionals',
      title: 'Working Professional',
      desc: 'Workplace conflict, boundaries, career conversations',
      icon: Briefcase
    },
    {
      id: 'new_hires',
      title: 'New Hire / Job Seeker',
      desc: 'Interview prep, first 90 days, negotiating an offer',
      icon: UserPlus
    }
  ];

  // Step 2's options are entirely derived from Step 1's audience selection.
  const dreadScenarios = DREAD_SCENARIOS_BY_AUDIENCE[selectedAudience];

  const handleSelectAudience = (audience: Audience) => {
    setSelectedAudience(audience);
    // Reset to that persona's first option so Step 2 never shows a stale
    // selection highlighted from a previously-chosen persona's list.
    setSelectedDreadId(DREAD_SCENARIOS_BY_AUDIENCE[audience][0].id);
  };

  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const roleTitle = roles.find((r) => r.id === selectedAudience)?.title || 'Working Professional';
      const dreadTitle =
        dreadScenarios.find((d) => d.id === selectedDreadId)?.title || dreadScenarios[0].title;
      await completeOnboarding(roleTitle, 'Executive', dreadTitle, selectedAudience);
      // No explicit navigation here: completing onboarding flips isOnboarded/
      // isAuthenticated in context, which causes AppNavigator's top-level branch
      // to swap to the main app screen set (see AppNavigator.tsx).
    } catch (e) {
      console.warn('Onboarding error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      goToStep(1);
    } else {
      // Step 1: Navigates cleanly back to the Welcome Screen
      if (navigation?.goBack) {
        navigation.goBack();
      } else if (navigation?.navigate) {
        navigation.navigate('Welcome');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        // The actual root cause of the CTA button's [0,0][0,0] layout,
        // finally found via the full uiautomator tree dump rather than the
        // single node: with no `style` here, only `contentContainerStyle`,
        // the ScrollView's own box wasn't reliably filling/exceeding its
        // parent's height on this device — its content wrapper measured at
        // exactly the viewport height (1456px) instead of the larger height
        // its actual content (cards + button) needs, so the last child
        // (the button) had zero space left once everything above it had
        // claimed the full budget. `style={{flex:1}}` on the ScrollView
        // itself (not just contentContainerStyle, which only styles the
        // inner scrollable content) is what lets it size independently of
        // its content and actually scroll past the viewport.
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20) + 8,
            // The CTA footer below is a fixed sibling, not scrollable
            // content, so this only needs to clear it visually — the
            // footer itself handles nav-bar clearance.
            paddingBottom: 12
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================ */}
        {/* STEP 1: WHAT DO YOU DO? (Step 1 of 2) */}
        {/* ============================================================ */}
        {step === 1 && (
          <Animated.View
            style={[
              styles.stepBody,
              // opacity intentionally left alone (not driven by stepAnim) —
              // an interrupted/misbehaving animation on a value gating
              // opacity can leave a whole step invisible; translateY alone
              // still reads as a soft rise-in without that failure mode.
              { transform: [{ translateY: stepAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }
            ]}
          >
            {/* Step Tracker Header — chevron left, dots center, fraction right */}
            <View style={styles.trackerHeaderV2}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={handleBack}
                activeOpacity={0.7}
                hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
              >
                <ArrowLeft size={20} color={themeColors.textPrimary} />
              </TouchableOpacity>

              <View style={styles.dotsRow}>
                <View style={[styles.progressDot, { backgroundColor: themeColors.primary }]} />
                <View style={[styles.progressDot, { backgroundColor: themeColors.surfaceBorder }]} />
              </View>

              <Text style={[styles.fractionText, { color: themeColors.textMuted }]}>1/2</Text>
            </View>

            <View style={styles.narrativeHeader}>
              <Text style={[styles.stepTitleV2, { color: themeColors.textPrimary }]}>
                What brings you here?
              </Text>
              <Text style={[styles.stepSubtitle, { color: themeColors.textSecondary }]}>
                Choose your primary goal to get personalized scenarios.
              </Text>
            </View>

            {/* Role Options */}
            <View style={styles.optionsList}>
              {roles.map((item) => {
                const isSelected = selectedAudience === item.id;
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.rowCard,
                      elevation.sm,
                      {
                        backgroundColor: isSelected
                          ? themeColors.primarySubtle
                          : themeColors.surfaceCard,
                        borderColor: isSelected
                          ? themeColors.primary
                          : themeColors.surfaceBorder
                      }
                    ]}
                    onPress={() => handleSelectAudience(item.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.rowIconSquare, { backgroundColor: themeColors.primarySubtle }]}>
                      <Icon size={18} color={themeColors.primary} />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.roleTitle, { color: themeColors.textPrimary }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.roleDesc, { color: themeColors.textSecondary }]}>
                        {item.desc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Live acknowledgment — reflects the pick back before moving on,
                so choosing a role reads as being heard, not just a form field. */}
            <Text style={[styles.connectionLine, { color: themeColors.textSecondary }]}>
              Got it — we'll build around <Text style={{ color: themeColors.primary, fontWeight: '700' }}>{roles.find((r) => r.id === selectedAudience)?.desc.toLowerCase()}</Text>.
            </Text>
          </Animated.View>
        )}

        {/* ============================================================ */}
        {/* STEP 2: CONVERSATION DREADED (Step 2 of 2) */}
        {/* ============================================================ */}
        {step === 2 && (
          <Animated.View
            style={[
              styles.stepBody,
              // opacity intentionally left alone (not driven by stepAnim) —
              // an interrupted/misbehaving animation on a value gating
              // opacity can leave a whole step invisible; translateY alone
              // still reads as a soft rise-in without that failure mode.
              { transform: [{ translateY: stepAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }
            ]}
          >
            {/* Step Tracker Header — chevron left, dots center, fraction right */}
            <View style={styles.trackerHeaderV2}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={handleBack}
                activeOpacity={0.7}
                hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
              >
                <ArrowLeft size={20} color={themeColors.textPrimary} />
              </TouchableOpacity>

              <View style={styles.dotsRow}>
                <View style={[styles.progressDot, { backgroundColor: themeColors.primary }]} />
                <View style={[styles.progressDot, { backgroundColor: themeColors.primary }]} />
              </View>

              <Text style={[styles.fractionText, { color: themeColors.textMuted }]}>2/2</Text>
            </View>

            <View style={styles.narrativeHeader}>
              <Text style={[styles.stepTitleV2, { color: themeColors.textPrimary }]}>
                What conversation are you dreading?
              </Text>
              <Text style={[styles.personaTag, { color: themeColors.primary }]}>
                Tailored to {roles.find((r) => r.id === selectedAudience)?.title}
              </Text>
              <Text style={[styles.stepSubtitle, { color: themeColors.textSecondary }]}>
                Choose the situation creating the most friction right now.
              </Text>
            </View>

            {/* Scenario Friction Cards — same rowCard pattern as Step 1, but the
                options themselves are drawn from the persona chosen in Step 1 */}
            <View style={styles.optionsList}>
              {dreadScenarios.map((item) => {
                const isSelected = selectedDreadId === item.id;
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.rowCard,
                      elevation.sm,
                      {
                        backgroundColor: isSelected
                          ? themeColors.primarySubtle
                          : themeColors.surfaceCard,
                        borderColor: isSelected
                          ? themeColors.primary
                          : themeColors.surfaceBorder
                      }
                    ]}
                    onPress={() => setSelectedDreadId(item.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.rowIconSquare, { backgroundColor: themeColors.primarySubtle }]}>
                      <Icon size={18} color={themeColors.primary} />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.roleTitle, { color: themeColors.textPrimary }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.roleDesc, { color: themeColors.textSecondary }]}>
                        {item.desc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Live acknowledgment for step 2, same pattern as step 1. */}
            <Text style={[styles.connectionLine, { color: themeColors.textSecondary }]}>
              We'll start there — <Text style={{ color: themeColors.primary, fontWeight: '700' }}>{dreadScenarios.find((d) => d.id === selectedDreadId)?.desc.toLowerCase()}</Text>
            </Text>
          </Animated.View>
        )}

      </ScrollView>

      {/* CTA — pinned outside the ScrollView as a fixed footer, not the
          last scrollable item. It used to sit inside the ScrollView's
          content, which on a real Android 10 device meant its screen
          position was purely a function of how much content came before it
          — extra bottom padding on the scroll content never moved it,
          since the content didn't overflow the viewport, so it landed
          wherever the preceding cards happened to end. That spot fell
          entirely inside the device's on-screen nav bar's touch-intercept
          zone (confirmed via uiautomator + a real tap there triggering the
          OS home gesture instead of the button, at a device where
          safe-area-insets.bottom under-reported the bar's true height). As
          a fixed footer with its own insets-aware padding, the button's
          position is independent of content length and always clears the
          system bar, on this device and any other. Always mounted (not
          conditionally per step) — an earlier per-step-mounted version
          nested inside the animated step body reliably produced a
          degenerate [0,0][0,0] layout frame for this element specifically,
          surviving several unrelated flex/style rewrites; switching only
          onPress/label by `step` sidesteps whatever mount-timing/Yoga
          interaction caused that. */}
      <View
        style={[
          styles.ctaFooter,
          {
            backgroundColor: themeColors.background,
            paddingBottom: Math.max(insets.bottom, 16) + 16
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: themeColors.primary }
          ]}
          onPress={step === 1 ? () => goToStep(2) : handleFinish}
          disabled={step === 2 && isSubmitting}
          activeOpacity={0.88}
        >
          {step === 2 && isSubmitting ? (
            <ActivityIndicator color={themeColors.textInverse} />
          ) : (
            <>
              <Text
                style={[
                  styles.primaryButtonText,
                  { color: themeColors.textInverse }
                ]}
              >
                {step === 1 ? 'Continue' : 'Continue to Rehearsal Setup'}
              </Text>
              <ArrowRight size={18} color={themeColors.textInverse} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 20
  },
  stepBody: {},
  trackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  trackerHeaderV2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6
  },
  progressDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  fractionText: {
    fontSize: 12,
    fontWeight: '600'
  },
  stepTitleV2: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: RADII.lg,
    borderWidth: 1.5
  },
  rowIconSquare: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  backBtn: {
    padding: 6,
    marginLeft: -6
  },
  trackerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  trackerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2
  },
  trackerDot: {
    fontSize: 12
  },
  trackerStep: {
    fontSize: 12,
    fontWeight: '500'
  },
  stepPills: {
    flexDirection: 'row',
    gap: 4
  },
  stepPill: {
    width: 20,
    height: 3,
    borderRadius: 2
  },
  narrativeHeader: {
    marginBottom: 20
  },
  stepTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8
  },
  stepSubtitle: {
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: '400'
  },
  personaTag: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 6
  },
  crucibleBanner: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20
  },
  crucibleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  crucibleTag: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1
  },
  crucibleTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4
  },
  crucibleDesc: {
    fontSize: 13,
    lineHeight: 18
  },
  optionsList: {
    gap: 10,
    marginBottom: 16
  },
  connectionLine: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1
  },
  cardSelectedShadow: {
    shadowColor: '#5B5FEF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 0
  },
  cardContent: {
    flex: 1,
    paddingRight: 12
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  roleTitle: {
    fontSize: 14.5,
    fontWeight: '500',
    letterSpacing: -0.1,
    marginBottom: 3
  },
  roleDesc: {
    fontSize: 12,
    lineHeight: 16
  },
  dreadTitle: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.1,
    flex: 1,
    marginRight: 6
  },
  frictionTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4
  },
  frictionTagText: {
    fontSize: 9.5,
    fontWeight: '600'
  },
  radioIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  checkPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ambientPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20
  },
  ambientPromptText: {
    fontSize: 11.5,
    lineHeight: 16,
    flex: 1
  },
  ctaFooter: {
    paddingHorizontal: 20,
    paddingTop: 16
  },
  primaryButton: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#5B5FEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 0
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2
  },
  timeEstimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  timeEstimateText: {
    fontSize: 11.5
  }
});

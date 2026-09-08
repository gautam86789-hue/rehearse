import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
  Sliders,
  Sparkles,
  Shield,
  Clock,
  Brain
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export const OnboardingScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route
}) => {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  const { colors: themeColors, isDark } = useTheme();

  // Exactly 2 Onboarding Steps:
  // Step 1: What do you do? (Select Role)
  // Step 2: What conversation are you dreading? (Select Friction Scenario)
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState('Executive & Founder');
  const [selectedDread, setSelectedDread] = useState('Give difficult performance feedback');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 5 Executive Role options directly matching Stitch Screen 'Onboarding — Select Role'
  const roles = [
    {
      id: 'exec_founder',
      title: 'Executive & Founder',
      desc: 'Board meetings, investor negotiations, strategic alignment'
    },
    {
      id: 'manager_director',
      title: 'People Manager / Director',
      desc: 'Performance reviews, difficult feedback, conflict mediation'
    },
    {
      id: 'senior_ic_lead',
      title: 'Senior Individual Contributor / Lead',
      desc: 'Scope boundaries, peer disputes, advocating for promotion'
    },
    {
      id: 'mba_graduate',
      title: 'MBA Candidate / Graduate',
      desc: 'High-stakes interviews, case pitches, salary negotiation'
    },
    {
      id: 'client_partner',
      title: 'Client Partner / Consultant',
      desc: 'Managing scope creep, fee defense, pushback on deadlines'
    }
  ];

  // 6 Friction Scenarios directly matching Stitch Screen 'Onboarding — Conversation Dreaded'
  const dreadScenarios = [
    {
      id: 'feedback',
      title: 'Give difficult performance feedback',
      tag: 'High Leverage',
      tagBg: isDark ? '#1C3128' : '#EDEEEC',
      tagColor: isDark ? '#A2C9B8' : '#424845',
      desc: 'Address underperformance directly without damaging morale or team trust.'
    },
    {
      id: 'compensation',
      title: 'Ask for a compensation increase',
      tag: 'Market Power',
      tagBg: isDark ? '#3D1C08' : '#FFDBCA',
      tagColor: isDark ? '#FFB690' : '#783200',
      desc: 'Anchor your market value with calm, evidence-backed conviction.'
    },
    {
      id: 'boundary',
      title: 'Set a firm boundary on scope or hours',
      tag: 'Self-Command',
      tagBg: isDark ? '#1C3128' : '#EDEEEC',
      tagColor: isDark ? '#A2C9B8' : '#424845',
      desc: 'Say no clearly without sounding defensive or disengaged from outcomes.'
    },
    {
      id: 'peer-friction',
      title: 'Handle an escalating disagreement with a peer',
      tag: 'Alignment',
      tagBg: isDark ? '#1F2E2B' : '#D7E6DE',
      tagColor: isDark ? '#A2C9B8' : '#3C4A44',
      desc: 'Disarm tension and establish collaborative alignment on shared deliverables.'
    },
    {
      id: 'bad-news',
      title: 'Deliver disappointing or bad news',
      tag: 'Leadership',
      tagBg: isDark ? '#1C3128' : '#EDEEEC',
      tagColor: isDark ? '#A2C9B8' : '#424845',
      desc: 'Communicate organizational changes with deep empathy and poised accountability.'
    },
    {
      id: 'client-pushback',
      title: 'Push back against an unreasonable client or leader',
      tag: 'Equanimity',
      tagBg: isDark ? '#1C3128' : '#EDEEEC',
      tagColor: isDark ? '#A2C9B8' : '#424845',
      desc: 'De-escalate unrealistic deadlines while holding your ground gracefully.'
    }
  ];

  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await completeOnboarding(selectedRole, 'Executive', selectedDread);
    } catch (e) {
      console.warn('Onboarding error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
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
    <View style={[styles.container, { backgroundColor: isDark ? '#08130E' : '#FAF7F0' }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20) + 8,
            paddingBottom: Math.max(insets.bottom, 20) + 20
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================ */}
        {/* STEP 1: WHAT DO YOU DO? (Step 1 of 2) */}
        {/* ============================================================ */}
        {step === 1 && (
          <View style={styles.stepBody}>
            {/* Step Tracker Header */}
            <View style={styles.trackerHeader}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <ArrowLeft size={18} color={themeColors.textPrimary} />
              </TouchableOpacity>

              <View style={styles.trackerCenter}>
                <Text style={[styles.trackerLabel, { color: themeColors.textSecondary }]}>
                  ONBOARDING
                </Text>
                <Text style={[styles.trackerDot, { color: themeColors.surfaceBorder }]}>
                  •
                </Text>
                <Text style={[styles.trackerStep, { color: themeColors.textPrimary }]}>
                  Step 1 of 2
                </Text>
              </View>

              {/* Segmented Step Pills */}
              <View style={styles.stepPills}>
                <View
                  style={[
                    styles.stepPill,
                    { backgroundColor: isDark ? '#D0E8DE' : '#162A24' }
                  ]}
                />
                <View
                  style={[
                    styles.stepPill,
                    { backgroundColor: isDark ? '#2A3631' : '#E1E3E1' }
                  ]}
                />
              </View>
            </View>

            <View style={styles.narrativeHeader}>
              <Text style={[styles.stepTitle, { color: themeColors.textPrimary }]}>
                What do you do?
              </Text>
              <Text style={[styles.stepSubtitle, { color: themeColors.textSecondary }]}>
                We tailor scenario tension, counterpart vocabulary, and stakes to your day-to-day context.
              </Text>
            </View>

            {/* Role Options */}
            <View style={styles.optionsList}>
              {roles.map((item) => {
                const isSelected = selectedRole === item.title;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.card,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? '#1A2924'
                            : '#FFFFFF'
                          : isDark
                          ? '#101B17'
                          : '#F9FAF8',
                        borderColor: isSelected
                          ? isDark
                            ? '#4E635B'
                            : '#162A24'
                          : themeColors.surfaceBorder
                      },
                      isSelected && styles.cardSelectedShadow
                    ]}
                    onPress={() => setSelectedRole(item.title)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardContent}>
                      <Text
                        style={[
                          styles.roleTitle,
                          { color: themeColors.textPrimary },
                          isSelected && { fontWeight: '600' }
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={[styles.roleDesc, { color: themeColors.textSecondary }]}>
                        {item.desc}
                      </Text>
                    </View>

                    {/* Radio Indicator */}
                    <View
                      style={[
                        styles.radioIndicator,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? '#D0E8DE'
                              : '#162A24'
                            : isDark
                            ? '#24342E'
                            : '#E1E3E1'
                        }
                      ]}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.radioInnerDot,
                            { backgroundColor: isDark ? '#021510' : '#FFFFFF' }
                          ]}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Ambient Micro-Feedback Prompt */}
            <View
              style={[
                styles.ambientPrompt,
                {
                  backgroundColor: isDark ? '#14211D' : '#F3F4F2',
                  borderColor: themeColors.surfaceBorder
                }
              ]}
            >
              <Sliders size={16} color={isDark ? '#A2C9B8' : '#5A6862'} />
              <Text style={[styles.ambientPromptText, { color: themeColors.textSecondary }]}>
                Counterpart resistance dials automatically adjust after selection.
              </Text>
            </View>

            {/* CTA */}
            <View style={styles.ctaWrapper}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: isDark ? '#D0E8DE' : '#162A24' }
                ]}
                onPress={() => setStep(2)}
                activeOpacity={0.88}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: isDark ? '#021510' : '#FFFFFF' }
                  ]}
                >
                  Continue
                </Text>
                <ArrowRight size={18} color={isDark ? '#021510' : '#FFFFFF'} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ============================================================ */}
        {/* STEP 2: CONVERSATION DREADED (Step 2 of 2) */}
        {/* ============================================================ */}
        {step === 2 && (
          <View style={styles.stepBody}>
            {/* Step Tracker Header */}
            <View style={styles.trackerHeader}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <ArrowLeft size={18} color={themeColors.textPrimary} />
              </TouchableOpacity>

              <View style={styles.trackerCenter}>
                <Text style={[styles.trackerLabel, { color: themeColors.textSecondary }]}>
                  ONBOARDING
                </Text>
                <Text style={[styles.trackerDot, { color: themeColors.surfaceBorder }]}>
                  •
                </Text>
                <Text style={[styles.trackerStep, { color: themeColors.textPrimary }]}>
                  Step 2 of 2
                </Text>
              </View>

              {/* Segmented Step Pills */}
              <View style={styles.stepPills}>
                <View
                  style={[
                    styles.stepPill,
                    { backgroundColor: isDark ? '#D0E8DE' : '#162A24' }
                  ]}
                />
                <View
                  style={[
                    styles.stepPill,
                    { backgroundColor: isDark ? '#D0E8DE' : '#162A24' }
                  ]}
                />
              </View>
            </View>

            {/* Executive Crucible Card Banner */}
            <View
              style={[
                styles.crucibleBanner,
                {
                  backgroundColor: isDark ? '#14231E' : '#F3F4F2',
                  borderColor: themeColors.surfaceBorder
                }
              ]}
            >
              <View style={styles.crucibleHeaderRow}>
                <Brain size={16} color="#C96A32" />
                <Text style={styles.crucibleTag}>EXECUTIVE CRUCIBLE</Text>
              </View>
              <Text style={[styles.crucibleTitle, { color: themeColors.textPrimary }]}>
                What conversation are you dreading?
              </Text>
              <Text style={[styles.crucibleDesc, { color: themeColors.textSecondary }]}>
                Choose the situation creating the most friction right now.
              </Text>
            </View>

            {/* Scenario Friction Cards */}
            <View style={styles.optionsList}>
              {dreadScenarios.map((item) => {
                const isSelected = selectedDread === item.title;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.card,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? '#1A2924'
                            : '#FFFFFF'
                          : isDark
                          ? '#101B17'
                          : '#F9FAF8',
                        borderColor: isSelected
                          ? isDark
                            ? '#4E635B'
                            : '#162A24'
                          : themeColors.surfaceBorder
                      },
                      isSelected && styles.cardSelectedShadow
                    ]}
                    onPress={() => setSelectedDread(item.title)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeaderRow}>
                        <Text
                          style={[
                            styles.dreadTitle,
                            { color: themeColors.textPrimary },
                            isSelected && { fontWeight: '600' }
                          ]}
                        >
                          {item.title}
                        </Text>
                        <View style={[styles.frictionTag, { backgroundColor: item.tagBg }]}>
                          <Text style={[styles.frictionTagText, { color: item.tagColor }]}>
                            {item.tag}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.roleDesc, { color: themeColors.textSecondary }]}>
                        {item.desc}
                      </Text>
                    </View>

                    {/* Check Pill */}
                    <View
                      style={[
                        styles.checkPill,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? '#D0E8DE'
                              : '#162A24'
                            : isDark
                            ? '#24342E'
                            : '#E1E3E1'
                        }
                      ]}
                    >
                      {isSelected && (
                        <Check
                          size={13}
                          color={isDark ? '#021510' : '#FFFFFF'}
                          strokeWidth={2.5}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Security Note */}
            <View
              style={[
                styles.ambientPrompt,
                {
                  backgroundColor: isDark ? '#14211D' : '#F3F4F2',
                  borderColor: themeColors.surfaceBorder
                }
              ]}
            >
              <Lock size={15} color={isDark ? '#A2C9B8' : '#5A6862'} />
              <Text style={[styles.ambientPromptText, { color: themeColors.textSecondary }]}>
                Your rehearsals are end-to-end encrypted and evaluated in real-time on-device.
              </Text>
            </View>

            {/* CTA */}
            <View style={styles.ctaWrapper}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: isDark ? '#D0E8DE' : '#162A24' }
                ]}
                onPress={handleFinish}
                disabled={isSubmitting}
                activeOpacity={0.88}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={isDark ? '#021510' : '#FFFFFF'} />
                ) : (
                  <>
                    <Text
                      style={[
                        styles.primaryButtonText,
                        { color: isDark ? '#021510' : '#FFFFFF' }
                      ]}
                    >
                      Continue to Rehearsal Setup
                    </Text>
                    <ArrowRight size={18} color={isDark ? '#021510' : '#FFFFFF'} />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.timeEstimateRow}>
                <Clock size={12} color={themeColors.textMuted} />
                <Text style={[styles.timeEstimateText, { color: themeColors.textMuted }]}>
                  Estimated setup: 90 seconds
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
    justifyContent: 'space-between'
  },
  stepBody: {
    flex: 1,
    justifyContent: 'space-between'
  },
  trackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
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
    letterSpacing: 1,
    color: '#C96A32'
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1
  },
  cardSelectedShadow: {
    shadowColor: '#162A24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2
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
  ctaWrapper: {
    marginTop: 'auto',
    gap: 10
  },
  primaryButton: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#162A24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3
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

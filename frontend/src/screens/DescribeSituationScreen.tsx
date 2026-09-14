import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native';
import {
  Sparkles,
  ArrowLeft,
  Check,
  RefreshCw,
  Play,
  ArrowRight,
  Shield,
  Target,
  AlertTriangle,
  User,
  Zap,
  Flame,
  HelpCircle
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PersonaAvatar } from '../components/common/PersonaAvatar';
import { useTheme, RADII } from '../context/ThemeContext';
import { apiService } from '../services/api';
import { Scenario, ArchetypeId } from '../types';

export const DescribeSituationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors, isDark, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;
  const [step, setStep] = useState<'input' | 'confirmation'>('input');
  const [situationText, setSituationText] = useState('');
  const [counterpartRole, setCounterpartRole] = useState('Direct Manager');
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId>('defensive_boss');
  const [targetGoal, setTargetGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenario, setGeneratedScenario] = useState<Scenario | null>(null);

  const quickPromptChips = [
    'Overworked and need to push back on weekend asks',
    'Exceeded OKRs and asking for a 20% salary adjustment',
    'Peer took credit for my model in executive review',
    'Manager micromanages with 3 daily check-in meetings',
    'Saying No to VP’s unvetted keynote pet project'
  ];

  const roleOptions = [
    'Direct Manager',
    'Department VP / Exec',
    'Defensive Senior Peer',
    'Direct Report / IC',
    'High-Value Client'
  ];

  const archetypes: { id: ArchetypeId; title: string; desc: string; icon: any }[] = [
    {
      id: 'defensive_boss',
      title: 'The Defensive Boss',
      desc: 'Raises shields, deflects critique, questions loyalty.',
      icon: Shield
    },
    {
      id: 'guilt_tripper',
      title: 'The Guilt-Tripper',
      desc: 'Uses collective sacrifice, sighing, and emotional guilt.',
      icon: HelpCircle
    },
    {
      id: 'hard_negotiator',
      title: 'The Hard Negotiator',
      desc: 'Anchors low, cites budget freezes, delays decisions.',
      icon: Flame
    },
    {
      id: 'passive_aggressive_peer',
      title: 'The Passive-Aggressive Peer',
      desc: 'Backhanded remarks, credit theft, subtle undermining.',
      icon: Zap
    },
    {
      id: 'micromanager',
      title: 'The Micromanager',
      desc: 'Demands endless check-ins, mistrusts autonomy.',
      icon: User
    }
  ];

  const handleGenerateBrief = async () => {
    if (!situationText.trim()) return;
    setIsGenerating(true);

    try {
      const res = await apiService.generateCustomScenario({
        situation: situationText,
        counterpartRole,
        counterpartArchetype: selectedArchetype,
        targetGoal: targetGoal.trim() || undefined
      });

      if (res?.scenario) {
        setGeneratedScenario(res.scenario);
        setStep('confirmation');
      } else {
        // Fallback custom scenario
        const fallback: Scenario = {
          id: `custom-${Date.now()}`,
          title: `Custom: ${counterpartRole} Dilemma`,
          category: 'difficult_decisions',
          counterpartName: 'Jordan Taylor',
          counterpartRole,
          counterpartArchetype: selectedArchetype,
          difficulty: 'High Stakes',
          estimatedMinutes: 6,
          situation: situationText,
          userGoal: targetGoal || 'De-escalate conflict and protect core deliverables.',
          brief: {
            counterpartPosition: `Counterpart is prioritizing their immediate agenda and defending current authority as ${counterpartRole}.`,
            probablePushbackPatterns: [
              'Tests your conviction and tries to shift blame',
              'Cites departmental constraints and urgency',
              'Attempts to defer resolution to an indefinite date'
            ],
            whatGoodLooksLike:
              'Staying grounded in objective facts, keeping composure, and structuring a mutually beneficial path forward.',
            keyPhrasesToAvoid: [
              '“This is completely unfair to me”',
              '“You never listen to our side”',
              '“I can’t deal with this anymore”'
            ],
            recommendedOpeningFormula:
              '“I want to make sure we are aligned on our highest priorities. Given the current demands, let’s agree on a structured roadmap that protects our deliverables without compromising quality.”'
          },
          isCurated: false,
          createdAt: new Date().toISOString()
        };
        setGeneratedScenario(fallback);
        setStep('confirmation');
      }
    } catch (err) {
      console.warn('Fallback scenario generator triggered');
      const fallback: Scenario = {
        id: `custom-${Date.now()}`,
        title: `Custom: ${counterpartRole} Discussion`,
        category: 'difficult_decisions',
        counterpartName: 'Alex Chen',
        counterpartRole,
        counterpartArchetype: selectedArchetype,
        difficulty: 'High Stakes',
        estimatedMinutes: 6,
        situation: situationText,
        userGoal: targetGoal || 'De-escalate conflict and reach milestone agreement.',
        brief: {
          counterpartPosition: `Counterpart is defending their stance as ${counterpartRole}.`,
          probablePushbackPatterns: [
            'Cites budget constraints and organizational timing',
            'Challenges your scope of ownership'
          ],
          whatGoodLooksLike:
            'Staying grounded in business outcomes and maintaining executive composure.',
          keyPhrasesToAvoid: ['“You are being unreasonable”'],
          recommendedOpeningFormula:
            '“I appreciate the candid conversation. Let’s look at the concrete milestones we can establish today to move forward together.”'
        },
        isCurated: false,
        createdAt: new Date().toISOString()
      };
      setGeneratedScenario(fallback);
      setStep('confirmation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartRoleplay = () => {
    if (generatedScenario) {
      navigation.navigate('Roleplay', { scenario: generatedScenario });
    }
  };

  const handleHeaderBack = () => {
    if (step === 'confirmation') setStep('input');
    else if (navigation?.canGoBack && navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('HomeTab');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header — same pattern as Feedback / Detailed Feedback / Scenario Detail */}
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={handleHeaderBack} style={styles.headerBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <ArrowLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
          {step === 'input' ? 'Custom Scenario' : 'Scenario Brief'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {step === 'input' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.tagPill, { backgroundColor: themeColors.primarySubtle }]}>
            <Sparkles size={12} color={themeColors.primary} />
            <Text style={[styles.tagText, { color: themeColors.primary }]}>
              CUSTOM SCENARIO ENGINE
            </Text>
          </View>

          <Text style={[styles.pageHeading, { color: themeColors.textPrimary }]}>
            Describe Your High-Stakes Situation
          </Text>
          <Text style={[styles.pageSub, { color: themeColors.textSecondary }]}>
            Explain the conflict in plain language. Our AI will craft a tactical briefing and counterpart persona for you to rehearse against.
          </Text>

          {/* Quick Situation Chips */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
              QUICK SITUATION EXAMPLES
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.chipsRow}
            >
              {quickPromptChips.map((chip, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: themeColors.surfaceCard,
                      borderColor: themeColors.surfaceBorder
                    }
                  ]}
                  onPress={() => setSituationText(chip)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetChipText, { color: themeColors.textPrimary }]}>
                    {chip}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Situation Text Input */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
                WHAT IS THE SITUATION & DILEMMA? *
              </Text>
              <Text style={[styles.counterText, { color: themeColors.textSecondary }]}>
                {situationText.length}/500
              </Text>
            </View>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: themeColors.surfaceCard,
                  borderColor: themeColors.surfaceBorder,
                  color: themeColors.textPrimary
                }
              ]}
              multiline
              numberOfLines={4}
              maxLength={500}
              placeholder="e.g. My VP scheduled an urgent Friday 5 PM sync demanding 3 unvetted features for the keynote next week, which risks our Q3 release stability..."
              placeholderTextColor={themeColors.textSecondary}
              value={situationText}
              onChangeText={setSituationText}
            />
          </View>

          {/* Counterpart Role Selector */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
              WHO ARE YOU TALKING TO?
            </Text>
            <View style={styles.roleGrid}>
              {roleOptions.map((role) => {
                const isSelected = counterpartRole === role;
                return (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleChip,
                      {
                        backgroundColor: isSelected
                          ? themeColors.primarySubtle
                          : themeColors.surfaceCard,
                        borderColor: isSelected
                          ? themeColors.primary
                          : themeColors.surfaceBorder
                      }
                    ]}
                    onPress={() => setCounterpartRole(role)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        {
                          color: isSelected
                            ? themeColors.primary
                            : themeColors.textPrimary,
                          fontWeight: isSelected ? '700' : '500'
                        }
                      ]}
                    >
                      {role}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Counterpart Archetype Selector */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
              COUNTERPART PERSONALITY ARCHETYPE
            </Text>
            <View style={styles.archetypeList}>
              {archetypes.map((arch) => {
                const isSelected = selectedArchetype === arch.id;
                const IconComp = arch.icon;
                return (
                  <TouchableOpacity
                    key={arch.id}
                    style={[
                      styles.archCard,
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
                    onPress={() => setSelectedArchetype(arch.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.archIconWrap,
                        {
                          backgroundColor: isSelected
                            ? themeColors.primary
                            : themeColors.surfaceElevated
                        }
                      ]}
                    >
                      <IconComp
                        size={18}
                        color={isSelected ? '#FFFFFF' : themeColors.textSecondary}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text
                        style={[
                          styles.archTitle,
                          {
                            color: isSelected
                              ? themeColors.primary
                              : themeColors.textPrimary
                          }
                        ]}
                      >
                        {arch.title}
                      </Text>
                      <Text style={[styles.archDesc, { color: themeColors.textSecondary }]}>
                        {arch.desc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Target Goal Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
              DESIRED OUTCOME / WIN CONDITION (OPTIONAL)
            </Text>
            <TextInput
              style={[
                styles.goalInput,
                {
                  backgroundColor: themeColors.surfaceCard,
                  borderColor: themeColors.surfaceBorder,
                  color: themeColors.textPrimary
                }
              ]}
              placeholder="e.g. Protect release stability without damaging executive rapport."
              placeholderTextColor={themeColors.textSecondary}
              value={targetGoal}
              onChangeText={setTargetGoal}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.generateBtn,
              {
                backgroundColor: !situationText.trim() || isGenerating
                  ? themeColors.surfaceElevated
                  : themeColors.primary
              }
            ]}
            onPress={handleGenerateBrief}
            disabled={!situationText.trim() || isGenerating}
            activeOpacity={0.85}
          >
            {isGenerating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Sparkles
                  size={16}
                  color={!situationText.trim() ? themeColors.textSecondary : '#FFFFFF'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.generateBtnText,
                    { color: !situationText.trim() ? themeColors.textSecondary : '#FFFFFF' }
                  ]}
                >
                  Generate AI Scenario Brief
                </Text>
                <ArrowRight
                  size={16}
                  color={!situationText.trim() ? themeColors.textSecondary : '#FFFFFF'}
                  style={{ marginLeft: 6 }}
                />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* Step 2: Confirmation Brief */
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {generatedScenario && (
            <>
              <View style={[styles.tagPill, { backgroundColor: themeColors.primarySubtle }]}>
                <Check size={12} color={themeColors.primary} />
                <Text style={[styles.tagText, { color: themeColors.primary }]}>
                  BRIEF COMPILED SUCCESSFULLY
                </Text>
              </View>

              <Text style={[styles.pageHeading, { color: themeColors.textPrimary }]}>
                {generatedScenario.title}
              </Text>
              <Text style={[styles.pageSub, { color: themeColors.textSecondary }]}>
                Review your tactical briefing before entering the simulation.
              </Text>

              {/* Counterpart Card */}
              <View
                style={[
                  styles.briefCounterpartCard,
                  elevation.md,
                  {
                    backgroundColor: themeColors.surfaceCard,
                    borderColor: themeColors.surfaceBorder
                  }
                ]}
              >
                <PersonaAvatar
                  archetypeId={generatedScenario.counterpartArchetype}
                  size={46}
                  showBadge={false}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.briefCounterpartName, { color: themeColors.textPrimary }]}>
                    {generatedScenario.counterpartName}
                  </Text>
                  <Text style={[styles.briefCounterpartRole, { color: themeColors.textSecondary }]}>
                    {generatedScenario.counterpartRole}
                  </Text>
                </View>
              </View>

              {/* Win Condition Box */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
                  YOUR WIN CONDITION
                </Text>
                <View
                  style={[
                    styles.goalBox,
                    elevation.sm,
                    {
                      backgroundColor: themeColors.primarySubtle,
                      borderColor: themeColors.primary
                    }
                  ]}
                >
                  <Target
                    size={16}
                    color={themeColors.primary}
                    style={{ marginTop: 2, marginRight: 8, flexShrink: 0 }}
                  />
                  <Text style={[styles.goalBoxText, { color: themeColors.textPrimary }]}>
                    {generatedScenario.userGoal}
                  </Text>
                </View>
              </View>

              {/* Probable Pushbacks — visual chips, not a bordered sentence list */}
              {generatedScenario.brief?.probablePushbackPatterns && (
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
                    WHAT TO EXPECT FROM COUNTERPART
                  </Text>
                  <View style={styles.pushbackChipWrap}>
                    {generatedScenario.brief.probablePushbackPatterns.map((p, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.pushbackChip,
                          { backgroundColor: themeColors.warning + '14', borderColor: themeColors.warning + '40' }
                        ]}
                      >
                        <AlertTriangle size={12} color={themeColors.warning} />
                        <Text style={[styles.pushbackChipText, { color: themeColors.textPrimary }]}>{p}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Recommended Opening Formula */}
              {generatedScenario.brief?.recommendedOpeningFormula && (
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
                    RECOMMENDED OPENING SCRIPT
                  </Text>
                  <View
                    style={[
                      styles.scriptCard,
                      elevation.sm,
                      {
                        backgroundColor: themeColors.sageSubtle,
                        borderColor: themeColors.sageLight
                      }
                    ]}
                  >
                    <Text style={[styles.scriptText, { color: themeColors.textPrimary }]}>
                      {generatedScenario.brief.recommendedOpeningFormula}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionGroup}>
                <TouchableOpacity
                  style={[styles.primaryLaunchBtn, { backgroundColor: themeColors.primary }]}
                  onPress={handleStartRoleplay}
                  activeOpacity={0.85}
                >
                  <Play size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={[styles.primaryLaunchText, { color: '#FFFFFF' }]}>
                    Start Roleplay Simulation
                  </Text>
                  <ArrowRight size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.secondaryEditBtn,
                    {
                      backgroundColor: themeColors.surfaceElevated,
                      borderColor: themeColors.surfaceBorder
                    }
                  ]}
                  onPress={() => setStep('input')}
                  activeOpacity={0.7}
                >
                  <RefreshCw
                    size={14}
                    color={themeColors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.secondaryEditText, { color: themeColors.textSecondary }]}>
                    Modify Situation Inputs
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      )}
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
    marginBottom: 8
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  pageHeading: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4
  },
  pageSub: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18
  },
  section: {
    marginBottom: 18
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  chipsRow: {
    gap: 8
  },
  presetChip: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 260
  },
  presetChipText: {
    fontSize: 12
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  counterText: {
    fontSize: 11
  },
  textArea: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  roleChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  roleChipText: {
    fontSize: 12
  },
  archetypeList: {
    gap: 8
  },
  archCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADII.lg,
    borderWidth: 1.5,
    padding: 14
  },
  archIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  archTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2
  },
  archDesc: {
    fontSize: 11.5,
    lineHeight: 15
  },
  goalInput: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13
  },
  generateBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  generateBtnText: {
    fontSize: 14,
    fontWeight: '700'
  },
  briefCounterpartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16
  },
  briefCounterpartName: {
    fontSize: 14,
    fontWeight: '700'
  },
  briefCounterpartRole: {
    fontSize: 12,
    marginTop: 2
  },
  goalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: RADII.lg,
    borderWidth: 1.5,
    padding: 14
  },
  goalBoxText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600'
  },
  pushbackChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  pushbackChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    maxWidth: '100%'
  },
  pushbackChipText: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1
  },
  scriptCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16
  },
  scriptText: {
    fontSize: 13.5,
    lineHeight: 20,
    fontStyle: 'italic'
  },
  actionGroup: {
    marginTop: 10,
    gap: 10
  },
  primaryLaunchBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryLaunchText: {
    fontSize: 14,
    fontWeight: '700'
  },
  secondaryEditBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryEditText: {
    fontSize: 13,
    fontWeight: '600'
  }
});

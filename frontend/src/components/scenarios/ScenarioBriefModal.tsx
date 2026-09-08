import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
  Clipboard
} from 'react-native';
import {
  X,
  Sparkles,
  Target,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Play,
  ArrowRight,
  Clock,
  Flame,
  Zap,
  BookOpen
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { Scenario } from '../../types';
import { PersonaAvatar } from '../common/PersonaAvatar';

interface ScenarioBriefModalProps {
  visible: boolean;
  scenario: Scenario | null;
  onClose: () => void;
  onStartRehearsal: (scenario: Scenario) => void;
  onOpenInCoach?: (scenario: Scenario) => void;
}

export const ScenarioBriefModal: React.FC<ScenarioBriefModalProps> = ({
  visible,
  scenario,
  onClose,
  onStartRehearsal,
  onOpenInCoach
}) => {
  const { colors: themeColors, isDark } = useTheme();
  const [copiedFormula, setCopiedFormula] = useState(false);

  if (!scenario) return null;

  const handleCopyFormula = () => {
    if (scenario.brief?.recommendedOpeningFormula) {
      Clipboard.setString(scenario.brief.recommendedOpeningFormula);
      setCopiedFormula(true);
      setTimeout(() => setCopiedFormula(false), 2000);
    }
  };

  const isHighStakes = scenario.difficulty === 'High Stakes';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: themeColors.background,
              borderColor: themeColors.surfaceBorder
            }
          ]}
        >
          {/* Modal Header */}
          <View style={[styles.header, { borderBottomColor: themeColors.surfaceBorder }]}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.categoryPill,
                  { backgroundColor: themeColors.primarySubtle }
                ]}
              >
                <Text style={[styles.categoryText, { color: themeColors.primary }]}>
                  {scenario.category.toUpperCase()}
                </Text>
              </View>
              <View
                style={[
                  styles.difficultyPill,
                  {
                    backgroundColor: isHighStakes
                      ? 'rgba(231,76,60,0.12)'
                      : themeColors.surfaceElevated
                  }
                ]}
              >
                {isHighStakes && (
                  <Flame size={11} color="#E74C3C" style={{ marginRight: 3 }} />
                )}
                <Text
                  style={[
                    styles.difficultyText,
                    { color: isHighStakes ? '#E74C3C' : themeColors.textSecondary }
                  ]}
                >
                  {scenario.difficulty}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: themeColors.surfaceElevated }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={18} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title & Counterpart Hero */}
            <View style={styles.heroSection}>
              <Text style={[styles.title, { color: themeColors.textPrimary }]}>
                {scenario.title}
              </Text>

              {/* Counterpart Box */}
              <View
                style={[
                  styles.counterpartCard,
                  {
                    backgroundColor: themeColors.surfaceCard,
                    borderColor: themeColors.surfaceBorder
                  }
                ]}
              >
                <PersonaAvatar
                  archetypeId={scenario.counterpartArchetype}
                  size={46}
                  showBadge={false}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.counterpartName, { color: themeColors.textPrimary }]}>
                    {scenario.counterpartName}
                  </Text>
                  <Text style={[styles.counterpartRole, { color: themeColors.textSecondary }]}>
                    {scenario.counterpartRole}
                  </Text>
                </View>
                <View style={styles.timeTag}>
                  <Clock size={12} color={themeColors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.timeText, { color: themeColors.textSecondary }]}>
                    {scenario.estimatedMinutes} min
                  </Text>
                </View>
              </View>
            </View>

            {/* Situation Context */}
            <View style={styles.section}>
              <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>
                THE SITUATION & DILEMMA
              </Text>
              <View
                style={[
                  styles.infoBox,
                  {
                    backgroundColor: isDark ? '#14201A' : '#F4F7F5',
                    borderColor: themeColors.surfaceBorder
                  }
                ]}
              >
                <Text style={[styles.situationText, { color: themeColors.textPrimary }]}>
                  {scenario.situation}
                </Text>
              </View>
            </View>

            {/* Target Objective */}
            <View style={styles.section}>
              <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>
                YOUR WIN CONDITION
              </Text>
              <View
                style={[
                  styles.goalBox,
                  {
                    backgroundColor: themeColors.surfaceCard,
                    borderColor: isDark ? '#C8AA6A' : '#173D2C'
                  }
                ]}
              >
                <Target
                  size={18}
                  color={isDark ? '#C8AA6A' : '#173D2C'}
                  style={{ marginTop: 2, marginRight: 10, flexShrink: 0 }}
                />
                <Text style={[styles.goalText, { color: themeColors.textPrimary }]}>
                  {scenario.userGoal}
                </Text>
              </View>
            </View>

            {/* Probable Pushback Patterns */}
            {scenario.brief?.probablePushbackPatterns && (
              <View style={styles.section}>
                <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>
                  PROBABLE PUSHBACK PATTERNS
                </Text>
                <View
                  style={[
                    styles.infoGroup,
                    {
                      backgroundColor: themeColors.surfaceCard,
                      borderColor: themeColors.surfaceBorder
                    }
                  ]}
                >
                  {scenario.brief.probablePushbackPatterns.map((push, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.pushRow,
                        idx < scenario.brief.probablePushbackPatterns.length - 1 && {
                          borderBottomColor: themeColors.surfaceBorder,
                          borderBottomWidth: 1
                        }
                      ]}
                    >
                      <AlertTriangle
                        size={15}
                        color="#E67E22"
                        style={{ marginTop: 2, marginRight: 8, flexShrink: 0 }}
                      />
                      <Text style={[styles.pushText, { color: themeColors.textPrimary }]}>
                        {push}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Recommended Opening Formula */}
            {scenario.brief?.recommendedOpeningFormula && (
              <View style={styles.section}>
                <View style={styles.formulaHeaderRow}>
                  <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>
                    RECOMMENDED OPENING FORMULA
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.copyFormulaBtn,
                      {
                        backgroundColor: copiedFormula
                          ? '#2ECC71'
                          : themeColors.surfaceElevated
                      }
                    ]}
                    onPress={handleCopyFormula}
                    activeOpacity={0.7}
                  >
                    {copiedFormula ? (
                      <>
                        <Check size={12} color="#FFFFFF" />
                        <Text style={[styles.copyFormulaText, { color: '#FFFFFF' }]}>Copied</Text>
                      </>
                    ) : (
                      <>
                        <Copy size={12} color={themeColors.textPrimary} />
                        <Text style={[styles.copyFormulaText, { color: themeColors.textPrimary }]}>
                          Copy
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.formulaCard,
                    {
                      backgroundColor: isDark ? '#1C2B22' : '#EAF4EE',
                      borderColor: isDark ? '#2B5740' : '#C2E0CC'
                    }
                  ]}
                >
                  <Text style={[styles.formulaText, { color: themeColors.textPrimary }]}>
                    {scenario.brief.recommendedOpeningFormula}
                  </Text>
                </View>
              </View>
            )}

            {/* What to Avoid */}
            {scenario.brief?.keyPhrasesToAvoid && (
              <View style={styles.section}>
                <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>
                  CRITICAL PHRASES TO AVOID
                </Text>
                <View
                  style={[
                    styles.infoGroup,
                    {
                      backgroundColor: themeColors.surfaceCard,
                      borderColor: themeColors.surfaceBorder
                    }
                  ]}
                >
                  {scenario.brief.keyPhrasesToAvoid.map((phrase, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.avoidRow,
                        idx < scenario.brief.keyPhrasesToAvoid.length - 1 && {
                          borderBottomColor: themeColors.surfaceBorder,
                          borderBottomWidth: 1
                        }
                      ]}
                    >
                      <X
                        size={14}
                        color="#E74C3C"
                        style={{ marginTop: 2, marginRight: 8, flexShrink: 0 }}
                      />
                      <Text style={[styles.avoidText, { color: themeColors.textPrimary }]}>
                        {phrase}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Modal Footer CTAs */}
          <View style={[styles.footer, { borderTopColor: themeColors.surfaceBorder, backgroundColor: themeColors.surfaceCard }]}>
            <TouchableOpacity
              style={[
                styles.primaryRehearseBtn,
                { backgroundColor: isDark ? '#C8AA6A' : '#173D2C' }
              ]}
              onPress={() => {
                onClose();
                onStartRehearsal(scenario);
              }}
              activeOpacity={0.85}
            >
              <Play
                size={16}
                color={isDark ? '#0B1712' : '#FFFFFF'}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.primaryRehearseText,
                  { color: isDark ? '#0B1712' : '#FFFFFF' }
                ]}
              >
                Launch High-Stakes Rehearsal
              </Text>
              <ArrowRight
                size={16}
                color={isDark ? '#0B1712' : '#FFFFFF'}
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    height: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  difficultyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700'
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30
  },
  heroSection: {
    marginBottom: 18
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 12
  },
  counterpartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12
  },
  counterpartName: {
    fontSize: 14,
    fontWeight: '700'
  },
  counterpartRole: {
    fontSize: 12,
    marginTop: 2
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600'
  },
  section: {
    marginBottom: 18
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  infoBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14
  },
  situationText: {
    fontSize: 13.5,
    lineHeight: 20
  },
  goalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14
  },
  goalText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '600'
  },
  infoGroup: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden'
  },
  pushRow: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-start'
  },
  pushText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 17
  },
  formulaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  copyFormulaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4
  },
  copyFormulaText: {
    fontSize: 11,
    fontWeight: '700'
  },
  formulaCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14
  },
  formulaText: {
    fontSize: 13.5,
    lineHeight: 20,
    fontStyle: 'italic'
  },
  avoidRow: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-start'
  },
  avoidText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 17
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 18,
    borderTopWidth: 1
  },
  primaryRehearseBtn: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryRehearseText: {
    fontSize: 14,
    fontWeight: '700'
  }
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Clipboard
} from 'react-native';
import {
  ChevronLeft,
  Sparkles,
  Copy,
  Check,
  Play,
  Sliders,
  ShieldAlert,
  Send,
  CheckCircle2,
  Share2,
  RefreshCw,
  Zap,
  Flame,
  ArrowRight,
  MessageSquare
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface StrategyOption {
  id: 'diplomatic' | 'direct' | 'boundary';
  title: string;
  subtitle: string;
  badge: string;
  efficacy: string;
  icon: any;
  replyText: string;
  rationale: string[];
}

export const StrategicReplyScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route
}) => {
  const { colors: themeColors, isDark } = useTheme();
  const [selectedStrategy, setSelectedStrategy] = useState<'diplomatic' | 'direct' | 'boundary'>('diplomatic');
  const [copied, setCopied] = useState(false);
  const [toneAdjustment, setToneAdjustment] = useState<'default' | 'firmer' | 'shorter' | 'data'>('default');

  const contextTitle = route?.params?.title || 'Compensation Discussion';
  const theirMessage = route?.params?.theirMessage || 
    "I understand your expectations, but given the current macro climate and budget tightening, we simply don't have the headcount or compensation bands to adjust base salary this cycle.";

  const strategies: Record<string, StrategyOption> = {
    diplomatic: {
      id: 'diplomatic',
      title: 'Diplomatic',
      subtitle: 'Collaborative inquiry & timeline framing',
      badge: 'RECOMMENDED',
      efficacy: '94% Efficacy',
      icon: Sparkles,
      replyText:
        "I appreciate you being candid about the current budget constraints. Given the measurable impact the team delivered this past quarter—exceeding our launch targets by 22%—I'd like to explore how we can align on a structured timeline or performance milestone review at Q3, alongside non-cash equity adjustments today.",
      rationale: [
        'Validates their constraint without conceding your value or walking away empty-handed.',
        'Shifts the debate from a static "No" to a future-anchored milestone agreement.',
        'Proposes alternative currency (equity/milestones) preserving budget compliance for them.'
      ]
    },
    direct: {
      id: 'direct',
      title: 'Direct',
      subtitle: 'Firm anchor & high conviction',
      badge: 'HIGH LEVERAGE',
      efficacy: '88% Efficacy',
      icon: Zap,
      replyText:
        "I hear you on the broader climate. However, my market benchmark and scope have expanded significantly beyond my initial tier. Let's look at what specific criteria we need to formalize now so this adjustment is locked in the moment the next review cycle opens.",
      rationale: [
        'Draws a clear boundary around market reality and expanded responsibility.',
        'Demands objective criteria rather than subjective executive discretion.',
        'Signals quiet confidence and that your market mobility is real.'
      ]
    },
    boundary: {
      id: 'boundary',
      title: 'Boundary',
      subtitle: 'Protective frame & counter-proposal',
      badge: 'DEFENSIVE',
      efficacy: '82% Efficacy',
      icon: Flame,
      replyText:
        "Understood. If compensation is locked, I want to ensure my current output and project ownership remain sustainable. Let's review my Q3 roadmap to deprioritize secondary workstreams so my focus stays purely on the core revenue drivers.",
      rationale: [
        'Links compensation directly to scope: if pay is frozen, scope cannot continue to balloon.',
        'Forces the manager to confront the trade-offs of under-compensating top talent.',
        'Protects against burnout while holding professional high ground.'
      ]
    }
  };

  const currentStrategy = strategies[selectedStrategy];

  const handleCopy = () => {
    Clipboard.setString(currentStrategy.replyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.surfaceBorder }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: themeColors.surfaceElevated }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Strategic Responses</Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
            Tailored options with tactical reasoning
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Context / Counterpart statement bubble */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>THEIR POSITION / MESSAGE</Text>
          <View style={[styles.theirCard, { backgroundColor: isDark ? '#14201A' : '#F4F7F5', borderColor: themeColors.surfaceBorder }]}>
            <View style={styles.theirCardHeader}>
              <View style={[styles.counterpartDot, { backgroundColor: '#C8AA6A' }]} />
              <Text style={[styles.counterpartName, { color: themeColors.textSecondary }]}>
                Alex Chen (VP of Product)
              </Text>
            </View>
            <Text style={[styles.theirMessageText, { color: themeColors.textPrimary }]}>
              "{theirMessage}"
            </Text>
          </View>
        </View>

        {/* Strategy Selector (3 Tabs) */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>CHOOSE YOUR POSTURE</Text>
          <View style={styles.strategyRow}>
            {(['diplomatic', 'direct', 'boundary'] as const).map((stratKey) => {
              const strat = strategies[stratKey];
              const isSelected = selectedStrategy === stratKey;
              const IconComp = strat.icon;
              return (
                <TouchableOpacity
                  key={stratKey}
                  style={[
                    styles.strategyCard,
                    {
                      backgroundColor: isSelected
                        ? (isDark ? '#173D2C' : '#EAF2EC')
                        : themeColors.surfaceCard,
                      borderColor: isSelected
                        ? (isDark ? '#C8AA6A' : '#173D2C')
                        : themeColors.surfaceBorder
                    }
                  ]}
                  onPress={() => setSelectedStrategy(stratKey)}
                  activeOpacity={0.8}
                >
                  <View style={styles.stratCardTop}>
                    <IconComp
                      size={16}
                      color={isSelected ? (isDark ? '#C8AA6A' : '#173D2C') : themeColors.textSecondary}
                    />
                    {isSelected && (
                      <View style={[styles.activePill, { backgroundColor: isDark ? '#C8AA6A' : '#173D2C' }]}>
                        <Check size={10} color={isDark ? '#0B1712' : '#FFFFFF'} />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stratCardTitle,
                      { color: isSelected ? (isDark ? '#C8AA6A' : '#173D2C') : themeColors.textPrimary }
                    ]}
                  >
                    {strat.title}
                  </Text>
                  <Text
                    style={[styles.stratCardSub, { color: themeColors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {strat.subtitle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Suggested Response Script Card */}
        <View style={styles.section}>
          <View style={styles.scriptHeaderRow}>
            <View style={[styles.efficacyBadge, { backgroundColor: themeColors.primarySubtle }]}>
              <Sparkles size={12} color={themeColors.primary} />
              <Text style={[styles.efficacyText, { color: themeColors.primary }]}>
                {currentStrategy.efficacy}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.copyBtn,
                {
                  backgroundColor: copied ? '#2ECC71' : themeColors.surfaceElevated,
                  borderColor: themeColors.surfaceBorder
                }
              ]}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              {copied ? (
                <>
                  <Check size={14} color="#FFFFFF" />
                  <Text style={[styles.copyBtnText, { color: '#FFFFFF' }]}>Copied</Text>
                </>
              ) : (
                <>
                  <Copy size={14} color={themeColors.textPrimary} />
                  <Text style={[styles.copyBtnText, { color: themeColors.textPrimary }]}>Copy Script</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.replyCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <Text style={[styles.replyScriptText, { color: themeColors.textPrimary }]}>
              {currentStrategy.replyText}
            </Text>
          </View>
        </View>

        {/* Why this works (Tactical Breakdown) */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>WHY THIS WORKS</Text>
          <View style={[styles.rationaleCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            {currentStrategy.rationale.map((point, idx) => (
              <View
                key={idx}
                style={[
                  styles.rationaleRow,
                  idx < currentStrategy.rationale.length - 1 && {
                    borderBottomColor: themeColors.surfaceBorder,
                    borderBottomWidth: 1
                  }
                ]}
              >
                <CheckCircle2
                  size={16}
                  color={isDark ? '#C8AA6A' : '#173D2C'}
                  style={{ marginTop: 2, marginRight: 10, flexShrink: 0 }}
                />
                <Text style={[styles.rationaleText, { color: themeColors.textPrimary }]}>
                  {point}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: isDark ? '#C8AA6A' : '#173D2C' }]}
            onPress={() => navigation.navigate('RehearsalSettings', {
              title: contextTitle,
              strategy: selectedStrategy,
              initialReply: currentStrategy.replyText
            })}
            activeOpacity={0.85}
          >
            <Play size={16} color={isDark ? '#0B1712' : '#FFFFFF'} style={{ marginRight: 8 }} />
            <Text style={[styles.primaryActionText, { color: isDark ? '#0B1712' : '#FFFFFF' }]}>
              Practice Live in Rehearsal
            </Text>
            <ArrowRight size={16} color={isDark ? '#0B1712' : '#FFFFFF'} style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryActionBtn, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}
            onPress={() => navigation.navigate('SituationCoach', { editMode: true })}
            activeOpacity={0.7}
          >
            <RefreshCw size={15} color={themeColors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.secondaryActionText, { color: themeColors.textSecondary }]}>
              Refine Situation Context
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
  section: {
    marginBottom: 20
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  theirCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14
  },
  theirCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  counterpartDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6
  },
  counterpartName: {
    fontSize: 12,
    fontWeight: '600'
  },
  theirMessageText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic'
  },
  strategyRow: {
    flexDirection: 'row',
    gap: 8
  },
  strategyCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    minHeight: 90
  },
  stratCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  activePill: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stratCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2
  },
  stratCardSub: {
    fontSize: 10,
    lineHeight: 13
  },
  scriptHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  efficacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5
  },
  efficacyText: {
    fontSize: 11,
    fontWeight: '700'
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '600'
  },
  replyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16
  },
  replyScriptText: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500'
  },
  rationaleCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden'
  },
  rationaleRow: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'flex-start'
  },
  rationaleText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18
  },
  actionGroup: {
    marginTop: 4,
    gap: 10
  },
  primaryActionBtn: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '700'
  },
  secondaryActionBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '600'
  }
});

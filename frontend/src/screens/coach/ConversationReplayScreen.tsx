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
import {
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Volume2,
  TrendingUp,
  MessageSquare,
  Repeat
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface ReplayTurn {
  id: string;
  turnNumber: number;
  timestamp: string;
  speaker: string;
  isUser: boolean;
  actualSpoken: string;
  evaluation: {
    status: 'optimal' | 'improvable' | 'flawless';
    critique: string;
    betterApproach?: string;
    leverageShift: string;
  };
}

export const ConversationReplayScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route
}) => {
  const { colors: themeColors } = useTheme();
  // Header had paddingTop: Platform.OS === 'ios' ? 56 : 20 — the Android
  // branch had no safe-area handling, so on edge-to-edge Android the
  // back button and title sat under the status bar / camera cutout.
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const title = route?.params?.title || 'Compensation Discussion';
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTurnId, setActiveTurnId] = useState<string>('2');
  const [expandedApproach, setExpandedApproach] = useState<Record<string, boolean>>({
    '2': true
  });

  const replayTurns: ReplayTurn[] = [
    {
      id: '1',
      turnNumber: 1,
      timestamp: '00:15',
      speaker: 'Alex Chen (VP of Product)',
      isUser: false,
      actualSpoken:
        "I understand your expectations, but given the current macro climate and budget tightening, we simply don't have the headcount or compensation bands to adjust base salary this cycle.",
      evaluation: {
        status: 'improvable',
        critique: 'Standard budget defense anchor. Counterpart tested if you would fold immediately.',
        leverageShift: '0'
      }
    },
    {
      id: '2',
      turnNumber: 2,
      timestamp: '01:05',
      speaker: 'You',
      isUser: true,
      actualSpoken:
        "I appreciate you being candid about the budget constraints. Given that our team delivered 22% over launch targets this quarter, I'd like to explore a structured milestone review at Q3 paired with non-cash equity adjustments today.",
      evaluation: {
        status: 'flawless',
        critique:
          'Excellent reframing. You acknowledged their constraint without conceding baseline value, and anchored on a concrete timeline.',
        betterApproach:
          '“I appreciate the candid visibility into budget caps. Given we delivered 22% above launch target, let’s lock in a formal Q3 milestone criteria today and pair it with an immediate equity grant.”',
        leverageShift: '+14 Leverage'
      }
    },
    {
      id: '3',
      turnNumber: 3,
      timestamp: '02:18',
      speaker: 'Alex Chen (VP of Product)',
      isUser: false,
      actualSpoken:
        "Look, I value your contributions, but if I approve your band jump now, the entire department's Q3 budget breaks. Why should we prioritize this over hiring an extra engineer?",
      evaluation: {
        status: 'improvable',
        critique: 'Alex attempted a zero-sum wedge, forcing you to defend against departmental headcount.',
        leverageShift: '-6 Leverage'
      }
    },
    {
      id: '4',
      turnNumber: 4,
      timestamp: '03:10',
      speaker: 'You',
      isUser: true,
      actualSpoken:
        "By formalizing this role now, I will take on the lead architectural duties which saves us 3 months of senior onboarding, creating higher net efficiency than a junior hire.",
      evaluation: {
        status: 'flawless',
        critique:
          'Decisive counter-measure. You quantified your leadership as a direct cost-savings mechanism, neutralizing the headcount argument.',
        betterApproach:
          '“My expanded architecture role saves 3+ months of senior onboarding ramp. In net terms, retaining and leveling me is more capital efficient than new headcount.”',
        leverageShift: '+18 Leverage'
      }
    }
  ];

  const toggleExpandApproach = (id: string) => {
    setExpandedApproach((prev) => ({ ...prev, [id]: !prev[id] }));
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
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Conversation Replay</Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
            Turn-by-turn analysis with actionable rewrites
          </Text>
        </View>
      </View>

      {/* Mini Audio Playback Bar */}
      <View style={[styles.playerBar, { backgroundColor: themeColors.surfaceCard, borderBottomColor: themeColors.surfaceBorder }]}>
        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: themeColors.primary }]}
          onPress={() => setIsPlaying(!isPlaying)}
          activeOpacity={0.8}
        >
          {isPlaying ? (
            <Pause size={16} color={themeColors.textInverse} />
          ) : (
            <Play size={16} color={themeColors.textInverse} style={{ marginLeft: 2 }} />
          )}
        </TouchableOpacity>

        {/* Scrubber track */}
        <View style={styles.scrubberContainer}>
          <View style={[styles.scrubberTrack, { backgroundColor: themeColors.surfaceBorder }]}>
            <View style={[styles.scrubberFill, { width: '65%', backgroundColor: themeColors.primary }]} />
            {/* Markers */}
            <View style={[styles.markerPip, { left: '15%', backgroundColor: themeColors.success }]} />
            <View style={[styles.markerPip, { left: '42%', backgroundColor: themeColors.success }]} />
            <View style={[styles.markerPip, { left: '65%', backgroundColor: themeColors.error }]} />
            <View style={[styles.markerPip, { left: '88%', backgroundColor: themeColors.success }]} />
          </View>
          <View style={styles.scrubberTimeRow}>
            <Text style={[styles.timeLabel, { color: themeColors.textSecondary }]}>02:18</Text>
            <Text style={[styles.timeLabel, { color: themeColors.textSecondary }]}>03:42</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Turns List */}
        {replayTurns.map((t) => {
          const isActive = activeTurnId === t.id;
          const isUser = t.isUser;
          const showBetter = !!t.evaluation.betterApproach && expandedApproach[t.id];

          return (
            <View
              key={t.id}
              style={[
                styles.turnCard,
                {
                  backgroundColor: themeColors.surfaceCard,
                  borderColor: isActive
                    ? themeColors.primary
                    : themeColors.surfaceBorder
                }
              ]}
            >
              {/* Turn Header */}
              <View style={styles.turnHeader}>
                <View style={styles.speakerRow}>
                  <View
                    style={[
                      styles.turnAvatarDot,
                      { backgroundColor: isUser ? themeColors.primary : themeColors.textMuted }
                    ]}
                  />
                  <Text style={[styles.speakerName, { color: themeColors.textPrimary }]}>
                    {t.speaker}
                  </Text>
                  <Text style={[styles.turnTimestamp, { color: themeColors.textSecondary }]}>
                    • {t.timestamp}
                  </Text>
                </View>

                {t.evaluation.leverageShift !== '0' && (
                  <View
                    style={[
                      styles.leverageBadge,
                      {
                        backgroundColor: t.evaluation.leverageShift.startsWith('+')
                          ? themeColors.sageSubtle
                          : themeColors.rubySubtle
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.leverageText,
                        {
                          color: t.evaluation.leverageShift.startsWith('+')
                            ? themeColors.sage
                            : themeColors.ruby
                        }
                      ]}
                    >
                      {t.evaluation.leverageShift}
                    </Text>
                  </View>
                )}
              </View>

              {/* Spoken Text */}
              <Text style={[styles.spokenText, { color: themeColors.textPrimary }]}>
                "{t.actualSpoken}"
              </Text>

              {/* Coach Evaluation Box */}
              <View
                style={[
                  styles.critiqueBox,
                  {
                    backgroundColor: themeColors.surfaceElevated,
                    borderLeftColor: themeColors.primary
                  }
                ]}
              >
                <View style={styles.critiqueHeader}>
                  <Sparkles size={12} color={themeColors.primary} />
                  <Text
                    style={[
                      styles.critiqueLabel,
                      { color: themeColors.primary }
                    ]}
                  >
                    TACTICAL ASSESSMENT
                  </Text>
                </View>
                <Text style={[styles.critiqueBody, { color: themeColors.textSecondary }]}>
                  {t.evaluation.critique}
                </Text>
              </View>

              {/* Better Approach Accordion */}
              {t.evaluation.betterApproach && (
                <View style={styles.betterSection}>
                  <TouchableOpacity
                    style={[
                      styles.betterToggleBtn,
                      { backgroundColor: themeColors.surfaceElevated }
                    ]}
                    onPress={() => toggleExpandApproach(t.id)}
                    activeOpacity={0.7}
                  >
                    <Repeat size={13} color={themeColors.primary} />
                    <Text
                      style={[
                        styles.betterToggleText,
                        { color: themeColors.primary }
                      ]}
                    >
                      {showBetter ? 'Hide Optimal Rewrite' : 'View High-Leverage Rewrite'}
                    </Text>
                  </TouchableOpacity>

                  {showBetter && (
                    <View
                      style={[
                        styles.betterContentCard,
                        {
                          backgroundColor: themeColors.sageSubtle,
                          borderColor: themeColors.sage
                        }
                      ]}
                    >
                      <Text style={[styles.betterText, { color: themeColors.textPrimary }]}>
                        {t.evaluation.betterApproach}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: themeColors.primary }]}
          onPress={() => navigation.navigate('CoachingNextSteps', { title })}
          activeOpacity={0.85}
        >
          <Text style={[styles.actionBtnText, { color: themeColors.textInverse }]}>
            Proceed to Action Plan
          </Text>
          <ArrowRight size={18} color={themeColors.textInverse} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
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
  playerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrubberContainer: {
    flex: 1,
    marginLeft: 12
  },
  scrubberTrack: {
    height: 6,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden'
  },
  scrubberFill: {
    height: '100%',
    borderRadius: 3
  },
  markerPip: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: 6,
    borderRadius: 1
  },
  scrubberTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  timeLabel: {
    fontSize: 10,
    fontVariant: ['tabular-nums']
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14
  },
  turnCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14
  },
  turnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  turnAvatarDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  speakerName: {
    fontSize: 13,
    fontWeight: '700'
  },
  turnTimestamp: {
    fontSize: 11
  },
  leverageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  leverageText: {
    fontSize: 9,
    fontWeight: '800'
  },
  spokenText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10
  },
  critiqueBox: {
    borderLeftWidth: 3,
    padding: 10,
    borderRadius: 6,
    marginBottom: 8
  },
  critiqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4
  },
  critiqueLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  critiqueBody: {
    fontSize: 12,
    lineHeight: 16
  },
  betterSection: {
    marginTop: 4
  },
  betterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 5
  },
  betterToggleText: {
    fontSize: 11,
    fontWeight: '700'
  },
  betterContentCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginTop: 6
  },
  betterText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic'
  },
  actionBtn: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700'
  }
});

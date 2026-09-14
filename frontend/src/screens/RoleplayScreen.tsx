import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Send,
  ArrowLeft,
  Sparkles,
  Volume2,
  VolumeX,
  Shield,
  Award,
  AlertCircle,
  Mic,
  Lock
} from 'lucide-react-native';
import { PersonaAvatar } from '../components/common/PersonaAvatar';
import { Button } from '../components/common/Button';
import { getArchetypeAvatarImage } from '../data/generatedImages';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { apiService } from '../services/api';
import { Scenario, MessageTurn, RoleplaySession, Scorecard } from '../types';
import { useFabClearance } from '../context/FabClearanceContext';

export const RoleplayScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { scenario } = route.params as { scenario: Scenario };
  const { user, isPro, setActiveSession, setLastScorecard, setUnlockedBadge, setIsPaywallVisible, addHistoryEntry, addNotification, refreshProfile, unlockMilestone } = useApp();
  const { colors, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;
  // Tells the floating AI Assistant button to clear this screen's own fixed
  // input dock (mic/text/send row + its bottom padding) instead of tucking
  // flush to the corner and landing beside/overlapping it — see
  // FabClearanceContext for how any screen can opt into this.
  useFabClearance(64 + Math.max(insets.bottom, 16) + 12);

  const [session, setSession] = useState<RoleplaySession | null>(null);
  const [turns, setTurns] = useState<MessageTurn[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [coachingHint, setCoachingHint] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    initSession();
    unlockMilestone('badge_first_session_started', 'Stepped Up', 'Started your very first rehearsal.', 'flame');
  }, []);

  const initSession = async () => {
    try {
      const res = await apiService.startSession(user.id, scenario.id);
      if (res?.session) {
        setSession(res.session);
        setTurns(res.session.turns);
        setActiveSession(res.session);
      }
    } catch (err: any) {
      const isTrialLimitError =
        err.code === 'PAYWALL_TRIGGERED' ||
        err.message?.includes('Free trial limit reached') ||
        err.message?.includes('PAYWALL');
      // isPro comes straight from the RevenueCat SDK's live CustomerInfo, so
      // it's already true immediately after a real purchase — even if the
      // backend's own subscription record hasn't caught up yet (RevenueCat's
      // webhook to our server can lag a purchase completing on-device by a
      // second or two). Don't block a just-paying user behind that gap.
      if (isTrialLimitError && !isPro) {
        setIsPaywallVisible(true);
        navigation.goBack();
      } else {
        // Fallback local session initialization
        const localSession: RoleplaySession = {
          id: `local-session-${Date.now()}`,
          userId: user.id,
          scenario,
          turns: [
            {
              id: 'init-1',
              speaker: 'counterpart',
              message: `Thanks for meeting with me. What did you want to discuss regarding ${scenario.title}?`,
              timestamp: new Date().toISOString()
            }
          ],
          status: 'in_progress',
          startedAt: new Date().toISOString()
        };
        setSession(localSession);
        setTurns(localSession.turns);
      }
    }
  };

  const handleSendTurn = async () => {
    if (!inputText.trim() || !session || isSending) return;

    const userMsg = inputText.trim();
    setInputText('');
    setIsSending(true);

    const optimisticUserTurn: MessageTurn = {
      id: `turn-user-${Date.now()}`,
      speaker: 'user',
      message: userMsg,
      timestamp: new Date().toISOString()
    };

    setTurns((prev) => [...prev, optimisticUserTurn]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const res = await apiService.sendTurn(session.id, userMsg);
      if (res?.counterpartTurn) {
        setTurns((prev) => [...prev, res.counterpartTurn]);
      }
    } catch (err) {
      // Intelligent local simulation fallback
      setTimeout(() => {
        const simulatedTurn: MessageTurn = {
          id: `sim-${Date.now()}`,
          speaker: 'counterpart',
          message: `I hear what you are saying, but our leadership constraints are tight right now. How do you propose we address the team capacity trade-offs?`,
          timestamp: new Date().toISOString()
        };
        setTurns((prev) => [...prev, simulatedTurn]);
      }, 700);
    } finally {
      setIsSending(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleEndAndScore = async () => {
    if (!session || isEnding) return;
    setIsEnding(true);

    try {
      const res = await apiService.scoreSession(session.id);
      if (res?.scorecard) {
        setLastScorecard(res.scorecard);
        addHistoryEntry(scenario, res.scorecard);
        if (res.scorecard.badgeUnlocked) {
          setUnlockedBadge(res.scorecard.badgeUnlocked);
          addNotification({
            title: 'Milestone unlocked',
            body: `${res.scorecard.badgeUnlocked.title} — ${res.scorecard.badgeUnlocked.description}`,
            icon: (res.scorecard.badgeUnlocked.icon as any) || 'award'
          });
        }

        // Pick up the post-session rehearsal count and nudge toward Pro once
        // it's running low, mirroring the "Go Pro" footnote already on Home.
        const refreshed = await refreshProfile();
        const remaining = refreshed?.subscription?.rehearsalsRemaining;
        const isFree = refreshed?.subscription?.status === 'free_trial';
        if (isFree && remaining === 1) {
          addNotification({
            title: 'One free rehearsal left',
            body: "You're almost through your free rehearsals — go Pro for unlimited practice.",
            icon: 'sparkles'
          });
        } else if (isFree && remaining === 0) {
          addNotification({
            title: 'Free rehearsals used up',
            body: 'Go Pro to keep rehearsing without limits.',
            icon: 'sparkles'
          });
        }

        navigation.replace('Score', { scorecard: res.scorecard, scenario });
      }
    } catch (err) {
      // Local fallback scorecard — matches the real Scorecard shape exactly
      // so ScoreScreen/FeedbackScreen render correctly even if the network
      // call to /roleplay/score fails.
      const weakestLine = turns.find((t) => t.speaker === 'user')?.message || 'I think we need to rethink this timeline.';
      const fallbackScorecard: Scorecard = {
        id: `score-${Date.now()}`,
        sessionId: session.id,
        clarity: 85,
        empathy: 74,
        assertiveness: 82,
        listening: 78,
        overallScore: 80,
        strengths: [
          'Stayed composed under counterpart resistance',
          'Clearly established the objective early in the conversation',
          'Did not concede key ground when challenged'
        ],
        growthAreas: [
          'Acknowledge the counterpart\'s perspective before pressing your point',
          'Use more calibrated "How/What" open questions before giving direct responses'
        ],
        weakestLineRewrite: {
          originalLine: weakestLine,
          suggestedRewrite: 'Help me understand the key priority: if we push for Friday, which deliverables should we de-scope to maintain quality?',
          coachingRationale: 'Forces the counterpart to solve the resource constraint with you instead of pushing back.',
          techniqueApplied: 'Calibrated "How" Anchor'
        },
        keyTakeaways: ['Strong presence and boundary holding throughout the rehearsal dialogue.'],
        newStreak: user.currentStreak || 1,
        streakExtended: false,
        xpEarned: 50,
        generatedAt: new Date().toISOString()
      };
      setLastScorecard(fallbackScorecard);
      addHistoryEntry(scenario, fallbackScorecard);
      navigation.replace('Score', { scorecard: fallbackScorecard, scenario });
    } finally {
      setIsEnding(false);
    }
  };

  const requestCoachingHint = () => {
    const hints = [
      'Tactical Empathy: Label their underlying emotion ("It seems like budget constraints are top of mind for you...")',
      'The "No" Orienting Question: "Would it be unreasonable to explore a phased milestone plan?"',
      'Calibrated Question: "What happens if we maintain this pace without additional headcount?"'
    ];
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    setCoachingHint(randomHint);
  };

  return (
    <KeyboardAvoidingView
      // 'padding' does nothing meaningful on Android; leaving it `undefined`
      // there meant the keyboard just covered the bottom of the screen with
      // no adjustment at all — the input dock and latest messages sat behind
      // it instead of resizing above it. 'height' is the standard Android
      // fix (paired with the default adjustResize windowSoftInputMode).
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Top Rehearsal Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.surfaceBorder, paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.counterpartInfo}>
          {getArchetypeAvatarImage(scenario.counterpartArchetype) ? (
            <Image
              source={getArchetypeAvatarImage(scenario.counterpartArchetype)!}
              style={styles.counterpartPhoto}
            />
          ) : (
            <PersonaAvatar archetypeId={scenario.counterpartArchetype} size={36} showBadge={false} />
          )}
          <View>
            <Text style={[typography.h4, { color: colors.textPrimary }]}>{scenario.counterpartName}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{scenario.counterpartRole}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleEndAndScore}
          disabled={isEnding || turns.length < 2}
          style={[
            styles.endRehearsalBtn,
            { backgroundColor: colors.primarySubtle, borderColor: colors.primary },
            turns.length < 2 && { opacity: 0.5 }
          ]}
        >
          {isEnding ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[typography.buttonSmall, { color: colors.primary }]}>End & Score</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Target Goal Reminder Bar */}
      <View style={[styles.goalBar, elevation.sm, { backgroundColor: colors.surfaceElevated, borderBottomColor: colors.surfaceBorder }]}>
        <Text style={[typography.overline, { color: colors.gold }]}>YOUR GOAL:</Text>
        <Text style={[typography.caption, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
          {scenario.userGoal}
        </Text>
        <TouchableOpacity onPress={requestCoachingHint} style={[styles.hintBtn, { backgroundColor: colors.goldSubtle }]}>
          <Sparkles size={12} color={colors.gold} />
          <Text style={[typography.buttonSmall, { color: colors.gold }]}>Coach Hint</Text>
        </TouchableOpacity>
      </View>

      {/* Coaching Hint Banner */}
      {coachingHint && (
        <View style={[styles.hintBanner, elevation.sm, { backgroundColor: colors.goldSubtle, borderBottomColor: colors.gold }]}>
          <AlertCircle size={16} color={colors.gold} />
          <Text style={[typography.bodySmall, { color: colors.gold, flex: 1 }]}>{coachingHint}</Text>
          <TouchableOpacity onPress={() => setCoachingHint(null)}>
            <Text style={[typography.buttonSmall, { color: colors.gold }]}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Message Stream */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {turns.map((turn, index) => {
          const isUser = turn.speaker === 'user';
          return (
            <View
              key={turn.id || index}
              style={[
                styles.messageBubbleContainer,
                isUser ? styles.userContainer : styles.counterpartContainer
              ]}
            >
              {!isUser && (
                <View style={styles.counterpartAvatarWrap}>
                  <PersonaAvatar archetypeId={scenario.counterpartArchetype} size={28} />
                </View>
              )}

              <View
                style={[
                  styles.messageBubble,
                  isUser
                    ? [styles.userBubble, { backgroundColor: colors.primary }]
                    : [styles.counterpartBubble, { backgroundColor: colors.surfaceElevated, borderColor: colors.surfaceBorder }]
                ]}
              >
                <Text
                  style={[
                    typography.body,
                    isUser
                      ? { color: colors.textInverse }
                      : { color: colors.textPrimary }
                  ]}
                >
                  {turn.message}
                </Text>

                {/* Tactical indicator if available */}
                {turn.tacticalAnalysis && (
                  <View style={[styles.metricsRow, { borderTopColor: isUser ? 'rgba(0,0,0,0.15)' : colors.surfaceBorder }]}>
                    <Text style={[typography.caption, { color: isUser ? colors.textInverse : colors.textSecondary }]}>
                      Clarity: {turn.tacticalAnalysis.clarityScore}%
                    </Text>
                    <Text style={[typography.caption, { color: isUser ? colors.textInverse : colors.textSecondary }]}>
                      Boundary: {turn.tacticalAnalysis.boundaryScore}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {isSending && (
          <View style={[styles.messageBubbleContainer, styles.counterpartContainer]}>
            <View style={styles.counterpartAvatarWrap}>
              <PersonaAvatar archetypeId={scenario.counterpartArchetype} size={28} />
            </View>
            <View style={[styles.messageBubble, styles.counterpartBubble, styles.typingBubble, { backgroundColor: colors.surfaceElevated, borderColor: colors.surfaceBorder }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Responding...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Dock — some Android devices paint content underneath their
          on-screen nav bar without safe-area-insets reporting its true
          height (confirmed on a real Android 10 unit: the dock rendered
          visually fine but a real tap on it hit the OS home gesture
          instead, same failure mode found and fixed on the onboarding CTA).
          The floor below is independent of insets.bottom so the dock clears
          that zone even when the inset value can't be trusted. */}
      <View
        style={[
          styles.inputDock,
          { backgroundColor: colors.surfaceCard, borderTopColor: colors.surfaceBorder, paddingBottom: Math.max(insets.bottom, 16) }
        ]}
      >
        <TouchableOpacity
          style={[styles.micButton, { backgroundColor: colors.surfaceHighlight }]}
          onPress={() => setIsPaywallVisible(true)}
          activeOpacity={0.75}
        >
          <Mic size={17} color={colors.textMuted} />
          <View style={[styles.micLockBadge, { backgroundColor: colors.champagne }]}>
            <Lock size={8} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TextInput
          style={[styles.chatInput, { backgroundColor: colors.surfaceElevated, borderColor: colors.surfaceBorder, color: colors.textPrimary }]}
          placeholder="Type your response..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }, !inputText.trim() && styles.disabledSend]}
          onPress={handleSendTurn}
          disabled={!inputText.trim() || isSending}
        >
          <Send size={18} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  headerBtn: {
    padding: 6
  },
  counterpartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  counterpartPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18
  },
  endRehearsalBtn: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  goalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1
  },
  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginVertical: 2
  },
  userContainer: {
    justifyContent: 'flex-end'
  },
  counterpartContainer: {
    justifyContent: 'flex-start',
    gap: 8
  },
  counterpartAvatarWrap: {
    marginTop: 2
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  userBubble: {
    borderBottomRightRadius: 4
  },
  counterpartBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  inputDock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabledSend: {
    opacity: 0.4
  },
  micButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  micLockBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  }
});

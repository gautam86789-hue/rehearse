import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Ellipse, Circle } from 'react-native-svg';
import { ArrowLeft, Send, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { localDateKey } from '../utils/dates';

// A distinct mark for the Coach instead of a generic sparkle icon — two
// rings rotating independently around a solid core, evoking "thinking"
// rather than decoration. Pure SVG + Animated, no image asset.
const OrbitalMark: React.FC<{ size: number; ringColor: string; ringColor2: string; coreColor: string }> = ({
  size,
  ringColor,
  ringColor2,
  coreColor
}) => {
  const spinA = useRef(new Animated.Value(0)).current;
  const spinB = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loopA = Animated.loop(Animated.timing(spinA, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true }));
    const loopB = Animated.loop(Animated.timing(spinB, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: true }));
    loopA.start();
    loopB.start();
    return () => {
      loopA.stop();
      loopB.stop();
    };
  }, []);
  const rotateA = spinA.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateB = spinB.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const c = size / 2;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotateA }] }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Ellipse cx={c} cy={c} rx={size * 0.38} ry={size * 0.17} stroke={ringColor} strokeWidth={size * 0.055} fill="none" opacity={0.95} />
        </Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotateB }] }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Ellipse cx={c} cy={c} rx={size * 0.17} ry={size * 0.38} stroke={ringColor2} strokeWidth={size * 0.055} fill="none" opacity={0.85} />
        </Svg>
      </Animated.View>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={c} cy={c} r={size * 0.12} fill={coreColor} />
      </Svg>
    </View>
  );
};

interface ChatAction {
  id: string;
  label: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  actions?: ChatAction[];
}

// Where each assistant button goes. Ids come from the backend's catalog
// (assistantService.ts) — anything unknown is simply not shown.
const ACTION_ROUTES: Record<string, { route: string; params?: any }> = {
  start_practice: { route: 'Scenarios' },
  practice_negotiation: { route: 'Scenarios', params: { category: 'negotiation' } },
  practice_feedback: { route: 'Scenarios', params: { category: 'feedback' } },
  practice_boundaries: { route: 'Scenarios', params: { category: 'boundaries' } },
  practice_managing_up: { route: 'Scenarios', params: { category: 'managing_up' } },
  practice_difficult_decisions: { route: 'Scenarios', params: { category: 'difficult_decisions' } },
  practice_crisis: { route: 'Scenarios', params: { category: 'crisis' } },
  daily_challenge: { route: 'DailyPuzzle' },
  learn: { route: 'Learn' },
  progress: { route: 'HomeTabs', params: { screen: 'ProgressTab' } },
  history: { route: 'ConversationHistory' },
  reply_coach: { route: 'ReplyCoach' },
  custom_scenario: { route: 'DescribeSituation' },
  tutorial: { route: 'Tutorial' }
};

const SUGGESTIONS = [
  'What should I practice next?',
  'What are my recent setbacks?',
  'Help me reply to a message'
];

// A real pushed screen, not a floating overlay/Modal — moved here after the
// floating widget's keyboard handling reliably failed on a real Android 10
// device across four different fix attempts (automatic KeyboardAvoidingView,
// a restructure of the same, a manual Keyboard-event listener, and a
// Modal-free absolutely-positioned overlay — the input dock stayed hidden
// behind the keyboard every time). RoleplayScreen, a real screen using the
// exact same KeyboardAvoidingView pattern, has always handled the keyboard
// correctly — being a genuine part of the navigator's resized window rather
// than a hand-built overlay layered on top of it is what actually matters.
export const AICoachScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;
  const { user, history } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: messageText }];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

    try {
      const res = await apiService.chatWithAssistant({
        message: messageText,
        conversationHistory: nextMessages,
        userContext: {
          name: user.name,
          audience: user.audience,
          role: user.role,
          totalRehearsals: user.totalRehearsals || 0,
          currentStreak: user.currentStreak || 0,
          longestStreak: user.longestStreak || 0,
          dailyChallengeDone: (user.completedPuzzleDates || []).includes(localDateKey())
        },
        recentSessions: history.slice(0, 10).map((h) => ({
          scenarioTitle: h.scenarioTitle,
          category: h.category,
          overallScore: h.overallScore,
          clarity: h.clarity,
          empathy: h.empathy,
          assertiveness: h.assertiveness,
          listening: h.listening,
          growthAreas: h.growthAreas,
          completedAt: h.completedAt
        }))
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply, actions: res.actions }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I couldn't reach the server just now — try again in a moment." }
      ]);
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.surfaceBorder, paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 16, right: 16, bottom: 16, left: 16 }}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.headerIcon, { backgroundColor: colors.primarySubtle }]}>
            <OrbitalMark size={18} ringColor={colors.primary} ringColor2={colors.primaryLight} coreColor={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Rehearse Coach</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Ask me anything about the app, your progress, or a reply you need to write.
            </Text>
            <View style={styles.suggestionsList}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.suggestionChip, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}
                  onPress={() => send(s)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.suggestionText, { color: colors.textPrimary }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          messages.map((m, i) => (
            <React.Fragment key={i}>
              <View
                style={[
                  styles.bubble,
                  m.role === 'user'
                    ? [styles.bubbleUser, { backgroundColor: colors.primary }]
                    : [styles.bubbleAssistant, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]
                ]}
              >
                <Text style={[styles.bubbleText, { color: m.role === 'user' ? '#FFFFFF' : colors.textPrimary }]}>
                  {m.content}
                </Text>
              </View>
              {m.role === 'assistant' && m.actions && m.actions.length > 0 && (
                <View style={styles.actionsRow}>
                  {m.actions
                    .filter((a) => ACTION_ROUTES[a.id])
                    .map((a) => (
                      <TouchableOpacity
                        key={a.id}
                        style={[styles.actionBtn, { backgroundColor: colors.primarySubtle, borderColor: colors.primary }]}
                        activeOpacity={0.8}
                        onPress={() => {
                          const target = ACTION_ROUTES[a.id];
                          navigation.navigate(target.route, target.params);
                        }}
                      >
                        <Text style={[styles.actionBtnText, { color: colors.primary }]}>{a.label}</Text>
                        <ArrowRight size={14} color={colors.primary} />
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </React.Fragment>
          ))
        )}
        {isSending && (
          <View style={[styles.bubble, styles.bubbleAssistant, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.inputDock,
          { backgroundColor: colors.background, borderTopColor: colors.surfaceBorder, paddingBottom: Math.max(insets.bottom, 16) }
        ]}
      >
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceCard, color: colors.textPrimary, borderColor: colors.surfaceBorder }]}
          placeholder="Ask the coach..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send()}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.surfaceBorder }]}
          onPress={() => send()}
          disabled={!input.trim() || isSending}
          activeOpacity={0.8}
        >
          <Send size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  actionsRow: {
    alignSelf: 'flex-start',
    maxWidth: '92%',
    gap: 8,
    marginBottom: 12,
    marginTop: -2
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11
  },
  actionBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    flexShrink: 1
  },
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 15.5,
    fontWeight: '800'
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10
  },
  emptyState: {
    paddingTop: 20
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    marginBottom: 16
  },
  suggestionsList: {
    gap: 8
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1
  },
  suggestionText: {
    fontSize: 13.5,
    fontWeight: '600'
  },
  bubble: {
    maxWidth: '84%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderBottomLeftRadius: 4
  },
  bubbleText: {
    fontSize: 13.5,
    lineHeight: 19
  },
  inputDock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1
  },
  input: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    maxHeight: 100
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

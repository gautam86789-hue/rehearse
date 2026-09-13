import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
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
import { X, Send } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { navigationRef } from '../../navigation/navigationRef';

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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'What should I practice next?',
  'What are my recent setbacks?',
  'Help me reply to a message'
];

export const AIAssistantWidget: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, history } = useApp();

  // This widget is mounted once, globally (see AppNavigator.tsx) as a sibling
  // of Stack.Navigator rather than a screen inside it — so useNavigationState
  // isn't available here (it throws "Couldn't get the navigation state. Is
  // your component inside a navigator?" since there's no enclosing
  // navigator/screen context). navigationRef's imperative API works from
  // anywhere, which is exactly why it exists. The floating tab bar only
  // exists while the root stack's active route is 'HomeTabs' — every other
  // screen (Roleplay, ScenarioDetail, Score, Settings, etc.) is a plain stack
  // push with no tab bar at all, so clearing space for a tab bar that isn't
  // there just left the FAB floating with a dead gap below it and covering
  // more of the screen than it needed to. Tucking it flush to the true
  // bottom-right on those screens keeps it out of the way of whatever
  // content/buttons are actually down there.
  const [onTabsRoot, setOnTabsRoot] = useState(true);
  // Roleplay has its own fixed input dock flush to the bottom (the chat
  // text box + send button) — tucking the FAB flush to the corner there
  // (the plain "no tab bar" case) puts it right beside/overlapping that
  // dock instead of clear of it. Track that one screen specifically so it
  // can get dock-height clearance instead of 0.
  const [onRoleplayScreen, setOnRoleplayScreen] = useState(false);
  useEffect(() => {
    const computeRoute = () => {
      const state = navigationRef.isReady() ? navigationRef.getRootState() : undefined;
      const routeName = state?.routes[state.index]?.name;
      setOnTabsRoot(!state || routeName === 'HomeTabs');
      setOnRoleplayScreen(routeName === 'Roleplay');
    };
    computeRoute();
    return navigationRef.addListener('state', computeRoute);
  }, []);
  // 68 is the original hand-tuned clearance for sitting just above the
  // floating tab bar; ~76 clears Roleplay's input dock (its mic/send
  // buttons are ~44px plus their own padding); 0 on any other screen tucks
  // the FAB flush to the corner since there's nothing there to clear. The
  // floor on insets.bottom matters most on the flush case — on a real
  // Android 10 device insets.bottom under-reported the on-screen nav bar's
  // true height, leaving the FAB sitting inside it.
  const fabBottom = Math.max(insets.bottom, 16) + (onTabsRoot ? 68 : onRoleplayScreen ? 76 : 0);

  const [isOpen, setIsOpen] = useState(false);
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
          longestStreak: user.longestStreak || 0
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
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
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
    <>
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom: fabBottom
          }
        ]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.85}
      >
        <OrbitalMark size={26} ringColor="#FFFFFF" ringColor2="rgba(255,255,255,0.7)" coreColor="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide" transparent onRequestClose={() => setIsOpen(false)}>
        <View style={styles.overlay}>
          {/* The 82% height used to live directly on the KeyboardAvoidingView
              along with behavior="height" — on Android those two fought each
              other under a real keyboard (the resize the keyboard triggers
              and the percentage height it was also trying to hold both apply
              at once), collapsing the whole sheet to invisible rather than
              just shrinking it. Giving the fixed height to this plain outer
              wrapper instead, and letting KeyboardAvoidingView only
              redistribute space *within* that already-fixed box, is what
              keeps it stable — confirmed by reproducing the vanishing sheet
              on a real device with the old structure. */}
          <View style={[styles.sheet, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
              // 'padding' is iOS-only in practice; Android needs 'height' or
              // the keyboard just covers the input/latest messages with no
              // adjustment (reported: "output stays at the bottom, rigid").
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1, paddingBottom: Math.max(insets.bottom, 16) }}
            >
            <View style={[styles.header, { borderBottomColor: colors.surfaceBorder }]}>
              <View style={styles.headerLeft}>
                <View style={[styles.headerIcon, { backgroundColor: colors.primarySubtle }]}>
                  <OrbitalMark size={18} ringColor={colors.primary} ringColor2={colors.primaryLight} coreColor={colors.primary} />
                </View>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Rehearse Coach</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
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
                  <View
                    key={i}
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
                ))
              )}
              {isSending && (
                <View style={[styles.bubble, styles.bubbleAssistant, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}
            </ScrollView>

            <View style={[styles.inputDock, { borderTopColor: colors.surfaceBorder }]}>
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
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 0,
    zIndex: 500
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  sheet: {
    height: '82%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  headerLeft: {
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
  closeBtn: {
    padding: 4
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

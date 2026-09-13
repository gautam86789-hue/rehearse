import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
  Alert
} from 'react-native';
import {
  ChevronLeft,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  Lightbulb,
  X,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle,
  HelpCircle,
  Award
} from 'lucide-react-native';
import { useTheme, RADII } from '../../context/ThemeContext';

interface DialogueTurn {
  id: string;
  sender: 'counterpart' | 'user' | 'coach_hint';
  text: string;
  timestamp: string;
  sentiment?: 'challenging' | 'firm' | 'neutral' | 'conciliatory';
}

export const LiveRehearsalScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route
}) => {
  const { colors: themeColors, elevation } = useTheme();

  const title = route?.params?.title || 'Compensation Discussion';
  const persona = route?.params?.persona || 'realistic';
  const initialReply = route?.params?.initialReply || '';

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCounterpartSpeaking, setIsCounterpartSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHintDrawer, setShowHintDrawer] = useState(false);
  const [activeHint, setActiveHint] = useState<string>(
    'Acknowledge the headcount tradeoff first, then demonstrate that your leadership directly reduces the need for external hires.'
  );
  const [secondsElapsed, setSecondsElapsed] = useState(222); // 03:42 start
  const [turnIndex, setTurnIndex] = useState(2);

  const [dialogue, setDialogue] = useState<DialogueTurn[]>([
    {
      id: '1',
      sender: 'counterpart',
      text: "I understand your expectations, but given the current macro climate and budget tightening, we simply don't have the headcount or compensation bands to adjust base salary this cycle.",
      timestamp: '00:15',
      sentiment: 'firm'
    },
    {
      id: '2',
      sender: 'user',
      text: "I appreciate you being candid about the budget constraints. Given that our team delivered 22% over launch targets this quarter, I'd like to explore a structured milestone review at Q3 paired with non-cash equity adjustments today.",
      timestamp: '01:05'
    },
    {
      id: '3',
      sender: 'counterpart',
      text: "Look, I value your contributions, but if I approve your band jump now, the entire department's Q3 budget breaks. Why should we prioritize this over hiring an extra engineer?",
      timestamp: '02:18',
      sentiment: 'challenging'
    }
  ]);

  // Waveform animations
  const waveAnim1 = useRef(new Animated.Value(0.4)).current;
  const waveAnim2 = useRef(new Animated.Value(0.8)).current;
  const waveAnim3 = useRef(new Animated.Value(0.3)).current;
  const waveAnim4 = useRef(new Animated.Value(0.9)).current;
  const waveAnim5 = useRef(new Animated.Value(0.5)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Waveform loop
  useEffect(() => {
    const createWaveLoop = (anim: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      );
    };

    const anims = [
      createWaveLoop(waveAnim1, 400),
      createWaveLoop(waveAnim2, 600),
      createWaveLoop(waveAnim3, 350),
      createWaveLoop(waveAnim4, 550),
      createWaveLoop(waveAnim5, 450)
    ];

    anims.forEach((a) => a.start());

    return () => anims.forEach((a) => a.stop());
  }, []);

  // Format seconds to mm:ss
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleHoldToSpeak = () => {
    setIsSpeaking(true);
    Animated.spring(pulseAnim, {
      toValue: 1.15,
      friction: 4,
      useNativeDriver: true
    }).start();
  };

  const handleReleaseSpeak = () => {
    setIsSpeaking(false);
    Animated.spring(pulseAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true
    }).start();

    // Add user response simulation
    const newTurn: DialogueTurn = {
      id: Date.now().toString(),
      sender: 'user',
      text: "By formalizing this role now, I will take on the lead architectural duties which saves us 3 months of senior onboarding, creating higher net efficiency than a junior hire.",
      timestamp: formatTimer(secondsElapsed)
    };
    setDialogue((prev) => [...prev, newTurn]);

    // Trigger counterpart response after short delay
    setTimeout(() => {
      setIsCounterpartSpeaking(true);
      setTimeout(() => {
        setIsCounterpartSpeaking(false);
        setDialogue((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'counterpart',
            text: "That is a fair calculation. If we tie this to the Q3 delivery deadline and keep base pay flat until the milestone is signed off, would you accept that structure?",
            timestamp: formatTimer(secondsElapsed + 15),
            sentiment: 'conciliatory'
          }
        ]);
        setTurnIndex(3);
      }, 2500);
    }, 1200);
  };

  const handleEndSimulation = () => {
    navigation.navigate('ConversationAutopsy', {
      title,
      turns: dialogue.length,
      duration: formatTimer(secondsElapsed)
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Simulation Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.surfaceBorder }]}>
        <TouchableOpacity
          style={[styles.exitBtn, { backgroundColor: themeColors.surfaceElevated }]}
          onPress={() => {
            Alert.alert(
              'End Simulation?',
              'Would you like to finish and view your conversation autopsy score?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Finish & View Score', onPress: handleEndSimulation }
              ]
            );
          }}
          activeOpacity={0.7}
        >
          <X size={18} color={themeColors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.timerBadge}>
            <View style={[styles.pulsingDot, { backgroundColor: themeColors.error }]} />
            <Text style={[styles.timerText, { color: themeColors.textPrimary }]}>
              {formatTimer(secondsElapsed)}
            </Text>
          </View>
          <Text style={[styles.roundLabel, { color: themeColors.textSecondary }]}>
            Round {turnIndex} of 4 • {title}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.exitBtn, { backgroundColor: themeColors.surfaceElevated }]}
          onPress={() => setIsMuted(!isMuted)}
          activeOpacity={0.7}
        >
          {isMuted ? (
            <VolumeX size={18} color={themeColors.textSecondary} />
          ) : (
            <Volume2 size={18} color={themeColors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Counterpart Card / Status Bar */}
      <View style={[styles.counterpartHero, { backgroundColor: themeColors.surfaceCard, borderBottomColor: themeColors.surfaceBorder }]}>
        <View style={styles.heroRow}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarRing, { borderColor: isCounterpartSpeaking ? themeColors.primary : themeColors.surfaceBorder }]}>
              <View style={[styles.avatarInner, { backgroundColor: themeColors.primarySubtle }]}>
                <Text style={[styles.avatarInitial, { color: themeColors.primary }]}>
                  AC
                </Text>
              </View>
            </View>
            {isCounterpartSpeaking && (
              <View style={[styles.speakingIndicator, { backgroundColor: themeColors.success }]}>
                <Activity size={10} color={themeColors.textInverse} />
              </View>
            )}
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.nameRow}>
              <Text style={[styles.heroName, { color: themeColors.textPrimary }]}>Alex Chen</Text>
              <View style={[styles.personaPill, { backgroundColor: themeColors.primarySubtle }]}>
                <Text style={[styles.personaPillText, { color: themeColors.primary }]}>
                  VP OF PRODUCT
                </Text>
              </View>
            </View>
            <Text style={[styles.heroStatus, { color: themeColors.textSecondary }]}>
              {isCounterpartSpeaking
                ? 'Speaking...'
                : isSpeaking
                ? 'Listening closely to you...'
                : 'Evaluating your leverage & framing'}
            </Text>
          </View>

          {/* Composure Bar */}
          <View style={styles.pressureBox}>
            <Text style={[styles.pressureLabel, { color: themeColors.textSecondary }]}>PRESSURE</Text>
            <View style={[styles.pressureBarTrack, { backgroundColor: themeColors.surfaceBorder }]}>
              <View style={[styles.pressureBarFill, { width: '70%', backgroundColor: themeColors.flame }]} />
            </View>
            <Text style={[styles.pressureValue, { color: themeColors.textPrimary }]}>Med-High</Text>
          </View>
        </View>
      </View>

      {/* Live Dialogue Stream */}
      <ScrollView
        contentContainerStyle={styles.dialogueList}
        showsVerticalScrollIndicator={false}
      >
        {dialogue.map((item) => {
          const isUser = item.sender === 'user';
          return (
            <View
              key={item.id}
              style={[
                styles.bubbleWrapper,
                isUser ? styles.userBubbleWrapper : styles.counterpartBubbleWrapper
              ]}
            >
              <View
                style={[
                  styles.dialogueBubble,
                  isUser
                    ? [styles.userBubble, { backgroundColor: themeColors.sageSubtle, borderColor: themeColors.sage }]
                    : [styles.counterpartBubble, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]
                ]}
              >
                {!isUser && (
                  <View style={styles.bubbleHeader}>
                    <Text style={[styles.bubbleSender, { color: themeColors.primary }]}>
                      Alex Chen
                    </Text>
                    {item.sentiment && (
                      <View style={[styles.sentimentTag, { backgroundColor: themeColors.surfaceElevated }]}>
                        <Text style={[styles.sentimentText, { color: themeColors.textSecondary }]}>
                          {item.sentiment}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                <Text style={[styles.bubbleBody, { color: themeColors.textPrimary }]}>
                  {item.text}
                </Text>
                <Text style={[styles.bubbleTime, { color: themeColors.textSecondary }]}>
                  {item.timestamp}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Real-Time Coach Whisper Card */}
        <View style={[styles.coachWhisperCard, elevation.sm, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.primary }]}>
          <View style={styles.whisperTop}>
            <Sparkles size={14} color={themeColors.primary} />
            <Text style={[styles.whisperTitle, { color: themeColors.primary }]}>
              REAL-TIME COACH WHISPER
            </Text>
          </View>
          <Text style={[styles.whisperBody, { color: themeColors.textPrimary }]}>
            {activeHint}
          </Text>
        </View>
      </ScrollView>

      {/* Waveform Visualizer & Audio Interaction Controls */}
      <View style={[styles.bottomControls, { backgroundColor: themeColors.surfaceCard, borderTopColor: themeColors.surfaceBorder }]}>
        {/* Waveform Bar */}
        <View style={styles.waveformContainer}>
          {[waveAnim1, waveAnim2, waveAnim3, waveAnim4, waveAnim5, waveAnim2, waveAnim4].map((anim, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.waveformBar,
                {
                  backgroundColor: isSpeaking || isCounterpartSpeaking
                    ? themeColors.primary
                    : themeColors.surfaceBorder,
                  transform: [{ scaleY: isSpeaking || isCounterpartSpeaking ? anim : 0.2 }]
                }
              ]}
            />
          ))}
        </View>

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          {/* Tactical Hint Button */}
          <TouchableOpacity
            style={[styles.secondaryControlBtn, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}
            onPress={() => setShowHintDrawer(!showHintDrawer)}
            activeOpacity={0.7}
          >
            <Lightbulb size={18} color={themeColors.primary} />
            <Text style={[styles.secondaryControlText, { color: themeColors.textPrimary }]}>
              Hint
            </Text>
          </TouchableOpacity>

          {/* Hold To Speak Primary Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.micButton,
                {
                  backgroundColor: isSpeaking
                    ? themeColors.error
                    : themeColors.primary
                }
              ]}
              onPressIn={handleHoldToSpeak}
              onPressOut={handleReleaseSpeak}
              activeOpacity={0.85}
            >
              <Mic size={24} color={themeColors.textInverse} />
            </TouchableOpacity>
          </Animated.View>

          {/* Finish / Score Button */}
          <TouchableOpacity
            style={[styles.secondaryControlBtn, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}
            onPress={handleEndSimulation}
            activeOpacity={0.7}
          >
            <Award size={18} color={themeColors.primary} />
            <Text style={[styles.secondaryControlText, { color: themeColors.textPrimary }]}>
              Autopsy
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.micHintText, { color: themeColors.textSecondary }]}>
          {isSpeaking ? 'Listening... release to send response' : 'Press and hold to speak your response'}
        </Text>
      </View>
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
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  exitBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerCenter: {
    alignItems: 'center'
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  roundLabel: {
    fontSize: 11,
    marginTop: 2
  },
  counterpartHero: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarContainer: {
    position: 'relative'
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '800'
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  heroName: {
    fontSize: 15,
    fontWeight: '700'
  },
  personaPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  personaPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  heroStatus: {
    fontSize: 12,
    marginTop: 2
  },
  pressureBox: {
    alignItems: 'flex-end'
  },
  pressureLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  pressureBarTrack: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginVertical: 3,
    overflow: 'hidden'
  },
  pressureBarFill: {
    height: '100%',
    borderRadius: 2
  },
  pressureValue: {
    fontSize: 10,
    fontWeight: '700'
  },
  dialogueList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14
  },
  bubbleWrapper: {
    flexDirection: 'row'
  },
  userBubbleWrapper: {
    justifyContent: 'flex-end'
  },
  counterpartBubbleWrapper: {
    justifyContent: 'flex-start'
  },
  dialogueBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14
  },
  userBubble: {
    borderBottomRightRadius: 4
  },
  counterpartBubble: {
    borderBottomLeftRadius: 4
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  bubbleSender: {
    fontSize: 12,
    fontWeight: '700'
  },
  sentimentTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  sentimentText: {
    fontSize: 10,
    textTransform: 'capitalize'
  },
  bubbleBody: {
    fontSize: 14,
    lineHeight: 20
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'right'
  },
  coachWhisperCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 12,
    marginTop: 4
  },
  whisperTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  whisperTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  whisperBody: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic'
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: 1,
    alignItems: 'center'
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    gap: 4,
    marginBottom: 10
  },
  waveformBar: {
    width: 3,
    height: 20,
    borderRadius: 2
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20
  },
  secondaryControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5
  },
  secondaryControlText: {
    fontSize: 12,
    fontWeight: '600'
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 0
  },
  micHintText: {
    fontSize: 11,
    marginTop: 10
  }
});

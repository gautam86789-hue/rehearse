import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Platform,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MessageSquareQuote,
  CornerDownRight,
  Send,
  CheckCircle2,
  Lock
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { AcousticLoopLogo } from '../components/brand/AcousticLoopLogo';

interface WelcomeScreenProps {
  navigation: any;
}

interface ConversationTeaser {
  id: string;
  category: string;
  counterpartRole: string;
  counterpartAvatar: string;
  userStatement: string;
  counterpartReply: string;
  promptQuestion: string;
  starterResponses: string[];
}

const CONVERSATION_TEASERS: ConversationTeaser[] = [
  {
    id: 'timeline-vp',
    category: 'Managing Up',
    counterpartRole: 'Alex · VP of Product',
    counterpartAvatar: 'VP',
    userStatement: 'I need to push back on the Q3 launch date.',
    counterpartReply: 'We committed to the board. We really can’t move this deadline.',
    promptQuestion: 'How would you hold your ground without damaging trust?',
    starterResponses: [
      'If we ship on the 15th without QA, we risk a Sev-1 outage on day one.',
      'What if we phase the release: core features in Q3, advanced analytics in Q4?'
    ]
  },
  {
    id: 'salary-comp',
    category: 'Compensation',
    counterpartRole: 'Sarah · Department Head',
    counterpartAvatar: 'SH',
    userStatement: 'Based on my expanded scope, I’d like to revisit my compensation.',
    counterpartReply: 'Budgets are locked until next fiscal year. There’s really no room.',
    promptQuestion: 'How would you counter without backing down or getting defensive?',
    starterResponses: [
      'I understand budget cycles, but my contributions generated $1.2M in unexpected retention.',
      'Could we agree on specific milestones today that trigger an off-cycle adjustment in 90 days?'
    ]
  },
  {
    id: 'peer-credit',
    category: 'Peer Friction',
    counterpartRole: 'Marcus · Senior Lead',
    counterpartAvatar: 'ML',
    userStatement: 'I noticed my architecture was presented yesterday without attribution.',
    counterpartReply: 'I was just synthesizing the deck for leadership. Don’t take it personally.',
    promptQuestion: 'How would you establish credit firmly while preserving collaboration?',
    starterResponses: [
      'I want our team to shine, but accurate authorship is vital for leadership visibility.',
      'Moving forward, let’s co-present technical proposals so contributions are clear.'
    ]
  }
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors: themeColors, isDark } = useTheme();

  // Active conversational teaser index
  const [activeTeaserIndex, setActiveTeaserIndex] = useState(0);
  const activeTeaser = CONVERSATION_TEASERS[activeTeaserIndex];

  // User selected starter or typed draft
  const [userDraft, setUserDraft] = useState('');
  const [selectedStarter, setSelectedStarter] = useState<string | null>(null);

  // Entrance animations sequence
  const fadeAnimWordmark = useRef(new Animated.Value(0)).current;
  const fadeAnimHeadline = useRef(new Animated.Value(0)).current;
  const fadeAnimHero = useRef(new Animated.Value(0)).current;
  const fadeAnimPrompt = useRef(new Animated.Value(0)).current;
  const fadeAnimCta = useRef(new Animated.Value(0)).current;
  const translateYHero = useRef(new Animated.Value(14)).current;

  // Pulse animation for active conversation connector
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.stagger(130, [
      Animated.timing(fadeAnimWordmark, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnimHeadline, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.parallel([
        Animated.timing(fadeAnimHero, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true
        }),
        Animated.timing(translateYHero, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true
        })
      ]),
      Animated.timing(fadeAnimPrompt, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnimCta, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true
      })
    ]).start();

    // Ambient pulse on connector badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1800,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  const handleStartRehearsing = (prefillPrompt?: string) => {
    const draftToPass = prefillPrompt || selectedStarter || userDraft.trim() || activeTeaser.userStatement;
    if (navigation?.navigate) {
      navigation.navigate('Onboarding', {
        initialPrompt: draftToPass
      });
    }
  };

  const handleSignIn = () => {
    if (navigation?.navigate) {
      navigation.navigate('SignIn');
    }
  };

  const handleSelectStarter = (response: string) => {
    if (selectedStarter === response) {
      setSelectedStarter(null);
      setUserDraft('');
    } else {
      setSelectedStarter(response);
      setUserDraft(response);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#08130E' : '#FAF7F0' }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20) + 6,
            paddingBottom: Math.max(insets.bottom, 20) + 12
          }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ============================================================ */}
        {/* 1. COMPACT EDITORIAL BRAND HEADER */}
        {/* ============================================================ */}
        <Animated.View style={[styles.headerRow, { opacity: fadeAnimWordmark }]}>
          <View style={styles.brandContainer}>
            <AcousticLoopLogo
              size={28}
              backgroundColor="#162A24"
              loopColor="#F9FAF8"
              waveColor="#D97736"
              style={{ marginRight: 9 }}
            />
            <Text style={[styles.brandWordmark, { color: isDark ? '#F5F2E9' : '#162A24' }]}>
              REHEARSE<Text style={{ color: '#C8AA6A' }}>.</Text>
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSignIn}
            activeOpacity={0.7}
            style={styles.signInPill}
          >
            <Text style={[styles.signInText, { color: isDark ? '#A2C9B8' : '#5A6862' }]}>
              Already have an account?{' '}
              <Text style={[styles.signInLink, { color: isDark ? '#DFCA99' : '#162A24' }]}>
                Sign in
              </Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ============================================================ */}
        {/* 2. PRIMARY EDITORIAL HEADLINE */}
        {/* ============================================================ */}
        <Animated.View style={[styles.heroIntro, { opacity: fadeAnimHeadline }]}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text style={[styles.eyebrowText, { color: isDark ? '#C8AA6A' : '#8A7B62' }]}>
              DIFFICULT CONVERSATIONS
            </Text>
          </View>

          <Text style={[styles.primaryHeadline, { color: isDark ? '#FAF7F2' : '#162A24' }]}>
            Some conversations{'\n'}are worth rehearsing.
          </Text>

          <Text style={[styles.supportingText, { color: isDark ? '#9EB3A8' : '#55635C' }]}>
            Practice difficult professional conversations before the stakes are real.
          </Text>
        </Animated.View>

        {/* ============================================================ */}
        {/* 3. INTERACTIVE SIMULATION TEASER CARD */}
        {/* ============================================================ */}
        <Animated.View
          style={[
            styles.simulatorCard,
            {
              opacity: fadeAnimHero,
              transform: [{ translateY: translateYHero }],
              backgroundColor: isDark ? '#11221B' : '#FFFFFF',
              borderColor: isDark ? '#233B2F' : '#EAE4D8'
            }
          ]}
        >
          {/* Teaser Category Tabs */}
          <View style={styles.teaserTabsRow}>
            {CONVERSATION_TEASERS.map((t, idx) => {
              const isActive = idx === activeTeaserIndex;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => {
                    setActiveTeaserIndex(idx);
                    setUserDraft('');
                    setSelectedStarter(null);
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.teaserTabPill,
                    {
                      backgroundColor: isActive
                        ? isDark
                          ? '#1A3328'
                          : '#162A24'
                        : isDark
                        ? '#0D1B15'
                        : '#F4F0E8',
                      borderColor: isActive
                        ? isDark
                          ? '#355B49'
                          : '#162A24'
                        : isDark
                        ? '#1C3127'
                        : '#E5DFD4'
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.teaserTabText,
                      {
                        color: isActive
                          ? '#FFFFFF'
                          : isDark
                          ? '#8EAA9C'
                          : '#6A7670'
                      }
                    ]}
                  >
                    {t.category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Opposing Conversation Exchange */}
          <View style={styles.exchangeContainer}>
            {/* NODE 1: YOU */}
            <View style={styles.participantRow}>
              <View
                style={[
                  styles.avatarNode,
                  {
                    backgroundColor: isDark ? '#1F3D30' : '#E8F2EC',
                    borderColor: isDark ? '#3C6450' : '#BDD6CA'
                  }
                ]}
              >
                <Text style={[styles.avatarNodeText, { color: isDark ? '#D0E8DE' : '#162A24' }]}>
                  YOU
                </Text>
              </View>
              <View
                style={[
                  styles.bubbleUser,
                  {
                    backgroundColor: isDark ? '#192F25' : '#F3F8F5',
                    borderColor: isDark ? '#2C4A3C' : '#DDE8E2'
                  }
                ]}
              >
                <Text style={[styles.bubbleUserText, { color: isDark ? '#EBF5F0' : '#172E23' }]}>
                  "{activeTeaser.userStatement}"
                </Text>
              </View>
            </View>

            {/* Vertical Dynamic Conversation Axis */}
            <View style={styles.axisContainer}>
              <View style={[styles.axisLine, { backgroundColor: isDark ? '#284737' : '#E0D8CC' }]} />
              <Animated.View
                style={[
                  styles.axisPulseBadge,
                  {
                    opacity: pulseAnim,
                    backgroundColor: isDark ? '#162A24' : '#FAF7F0',
                    borderColor: isDark ? '#46725C' : '#C8AA6A'
                  }
                ]}
              >
                <MessageSquareQuote size={11} color={isDark ? '#DFCA99' : '#162A24'} />
              </Animated.View>
              <View style={[styles.axisLine, { backgroundColor: isDark ? '#284737' : '#E0D8CC' }]} />
            </View>

            {/* NODE 2: COUNTERPART */}
            <View style={styles.participantRow}>
              <View
                style={[
                  styles.avatarNodeCounterpart,
                  {
                    backgroundColor: isDark ? '#2A2016' : '#FAF1E8',
                    borderColor: isDark ? '#4C3B29' : '#E8D2BD'
                  }
                ]}
              >
                <Text
                  style={[
                    styles.avatarNodeCounterpartText,
                    { color: isDark ? '#E5A56D' : '#945327' }
                  ]}
                >
                  {activeTeaser.counterpartAvatar}
                </Text>
              </View>
              <View
                style={[
                  styles.bubbleCounterpart,
                  {
                    backgroundColor: isDark ? '#211E1A' : '#FCF9F4',
                    borderColor: isDark ? '#3D3328' : '#ECE2D4'
                  }
                ]}
              >
                <View style={styles.counterpartHeaderRow}>
                  <Text style={[styles.counterpartLabel, { color: isDark ? '#C99365' : '#9C582B' }]}>
                    {activeTeaser.counterpartRole}
                  </Text>
                  <View style={styles.pushbackBadge}>
                    <Text style={styles.pushbackBadgeText}>PUSHBACK</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.bubbleCounterpartText,
                    { color: isDark ? '#F5EDE4' : '#2A2018' }
                  ]}
                >
                  "{activeTeaser.counterpartReply}"
                </Text>
              </View>
            </View>
          </View>

          {/* Interactive Decision & Response Choices */}
          <View
            style={[
              styles.promptInteractiveBox,
              {
                backgroundColor: isDark ? '#0D1A14' : '#F9F7F2',
                borderColor: isDark ? '#1F382B' : '#EAE3D7'
              }
            ]}
          >
            <View style={styles.promptQuestionRow}>
              <CornerDownRight size={13} color={isDark ? '#DFCA99' : '#162A24'} />
              <Text style={[styles.promptQuestionTitle, { color: isDark ? '#EFECE6' : '#19201C' }]}>
                {activeTeaser.promptQuestion}
              </Text>
            </View>

            {/* Quick Starter Option Cards */}
            <View style={styles.starterChipsList}>
              {activeTeaser.starterResponses.map((res, i) => {
                const isSelected = selectedStarter === res || userDraft === res;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.starterChip,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? '#1F3D30'
                            : '#F0F6F2'
                          : isDark
                          ? '#14271F'
                          : '#FFFFFF',
                        borderColor: isSelected
                          ? isDark
                            ? '#C8AA6A'
                            : '#162A24'
                          : isDark
                          ? '#233D30'
                          : '#E2DBD0',
                        borderWidth: isSelected ? 1.5 : 1
                      }
                    ]}
                    onPress={() => handleSelectStarter(res)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.starterContentRow}>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.starterChipText,
                          {
                            color: isSelected
                              ? isDark
                                ? '#FFFFFF'
                                : '#162A24'
                              : isDark
                              ? '#C2D5CC'
                              : '#3C4A44',
                            fontWeight: isSelected ? '600' : '400'
                          }
                        ]}
                      >
                        {res}
                      </Text>
                      {isSelected && (
                        <CheckCircle2
                          size={15}
                          color={isDark ? '#DFCA99' : '#162A24'}
                          style={{ marginLeft: 6, marginTop: 1 }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Freeform Typing Affordance */}
            <View
              style={[
                styles.composerInputRow,
                {
                  backgroundColor: isDark ? '#14271F' : '#FFFFFF',
                  borderColor: isDark ? '#264435' : '#DED6C9'
                }
              ]}
            >
              <TextInput
                style={[
                  styles.composerInput,
                  { color: isDark ? '#FFFFFF' : '#162A24' }
                ]}
                placeholder="Or type your own tactical counter..."
                placeholderTextColor={isDark ? '#6B8578' : '#8C9790'}
                value={userDraft}
                onChangeText={(text) => {
                  setUserDraft(text);
                  setSelectedStarter(null);
                }}
                returnKeyType="done"
              />
              {userDraft.trim().length > 0 && (
                <TouchableOpacity
                  style={[styles.miniSendBtn, { backgroundColor: isDark ? '#DFCA99' : '#162A24' }]}
                  onPress={() => handleStartRehearsing(userDraft)}
                  activeOpacity={0.8}
                >
                  <Send size={12} color={isDark ? '#021510' : '#FFFFFF'} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        {/* ============================================================ */}
        {/* 4. MICRO VALUE PROPOSITIONS (3 CRISP EDITORIAL PILLARS) */}
        {/* ============================================================ */}
        <Animated.View style={[styles.microPropsRow, { opacity: fadeAnimPrompt }]}>
          <View style={styles.propColumn}>
            <Text style={[styles.propHeadline, { color: isDark ? '#FAF7F2' : '#162A24' }]}>
              PRACTICE
            </Text>
            <Text style={[styles.propDetail, { color: isDark ? '#8DA297' : '#6A7670' }]}>
              Before the stakes are real.
            </Text>
          </View>

          <View style={[styles.propDivider, { backgroundColor: isDark ? '#1D3529' : '#E5DDD1' }]} />

          <View style={styles.propColumn}>
            <Text style={[styles.propHeadline, { color: isDark ? '#FAF7F2' : '#162A24' }]}>
              PUSHBACK
            </Text>
            <Text style={[styles.propDetail, { color: isDark ? '#8DA297' : '#6A7670' }]}>
              Against realistic counterparts.
            </Text>
          </View>

          <View style={[styles.propDivider, { backgroundColor: isDark ? '#1D3529' : '#E5DDD1' }]} />

          <View style={styles.propColumn}>
            <Text style={[styles.propHeadline, { color: isDark ? '#FAF7F2' : '#162A24' }]}>
              IMPROVE
            </Text>
            <Text style={[styles.propDetail, { color: isDark ? '#8DA297' : '#6A7670' }]}>
              With specific tactical coaching.
            </Text>
          </View>
        </Animated.View>

        {/* ============================================================ */}
        {/* 5. PRIMARY STRATEGIC CTA */}
        {/* ============================================================ */}
        <Animated.View style={[styles.ctaContainer, { opacity: fadeAnimCta }]}>
          <TouchableOpacity
            style={[
              styles.primaryStartButton,
              {
                backgroundColor: isDark ? '#DFCA99' : '#162A24',
                shadowColor: isDark ? '#000000' : '#162A24'
              }
            ]}
            onPress={() => handleStartRehearsing()}
            activeOpacity={0.88}
          >
            <Text
              style={[
                styles.primaryStartButtonText,
                { color: isDark ? '#021510' : '#FFFFFF' }
              ]}
            >
              Start Rehearsing
            </Text>
            <ArrowRight size={18} color={isDark ? '#021510' : '#FFFFFF'} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.footnoteRow}>
            <Lock size={10} color={isDark ? '#6E8579' : '#8A968F'} style={{ marginRight: 4 }} />
            <Text style={[styles.footnoteText, { color: isDark ? '#6E8579' : '#8A968F' }]}>
              No credit card required · Private & confidential
            </Text>
          </View>
        </Animated.View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandWordmark: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 1.1
  },
  signInPill: {
    paddingVertical: 4,
    paddingHorizontal: 2
  },
  signInText: {
    fontSize: 11.5,
    fontWeight: '400'
  },
  signInLink: {
    fontWeight: '700',
    textDecorationLine: 'underline'
  },
  heroIntro: {
    marginBottom: 16
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  eyebrowDot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 3,
    backgroundColor: '#C8AA6A'
  },
  eyebrowText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.1
  },
  primaryHeadline: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginBottom: 6
  },
  supportingText: {
    fontSize: 14.5,
    lineHeight: 21,
    fontWeight: '400',
    letterSpacing: -0.1
  },
  simulatorCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#162A24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2
  },
  teaserTabsRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 14
  },
  teaserTabPill: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 7,
    borderWidth: 1
  },
  teaserTabText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2
  },
  exchangeContainer: {
    gap: 2,
    marginBottom: 12
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9
  },
  avatarNode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 2
  },
  avatarNodeText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  bubbleUser: {
    flex: 1,
    padding: 10,
    borderRadius: 11,
    borderWidth: 1
  },
  bubbleUserText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500'
  },
  axisContainer: {
    alignItems: 'center',
    marginVertical: 3,
    height: 24,
    justifyContent: 'center'
  },
  axisLine: {
    width: 1,
    flex: 1
  },
  axisPulseBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginVertical: 1
  },
  avatarNodeCounterpart: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 2
  },
  avatarNodeCounterpartText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  bubbleCounterpart: {
    flex: 1,
    padding: 10,
    borderRadius: 11,
    borderWidth: 1
  },
  counterpartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  counterpartLabel: {
    fontSize: 11,
    fontWeight: '600'
  },
  pushbackBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    backgroundColor: '#F7E7DC'
  },
  pushbackBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#9C582B',
    letterSpacing: 0.5
  },
  bubbleCounterpartText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '400'
  },
  promptInteractiveBox: {
    borderRadius: 11,
    borderWidth: 1,
    padding: 10
  },
  promptQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8
  },
  promptQuestionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.1
  },
  starterChipsList: {
    gap: 6,
    marginBottom: 8
  },
  starterChip: {
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 8
  },
  starterContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  starterChipText: {
    fontSize: 11.5,
    lineHeight: 16.5,
    flex: 1
  },
  composerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 8,
    height: 36
  },
  composerInput: {
    flex: 1,
    fontSize: 11.5,
    paddingVertical: 0
  },
  miniSendBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6
  },
  microPropsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4
  },
  propColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4
  },
  propHeadline: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
    textAlign: 'center'
  },
  propDetail: {
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
    fontWeight: '400'
  },
  propDivider: {
    width: 1,
    height: 24,
    marginTop: 2
  },
  ctaContainer: {
    gap: 8,
    alignItems: 'center'
  },
  primaryStartButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3
  },
  primaryStartButtonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2
  },
  footnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footnoteText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.1
  }
});

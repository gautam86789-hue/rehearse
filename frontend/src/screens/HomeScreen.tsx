import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Platform
} from 'react-native';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Play,
  RotateCcw,
  Target,
  Clock,
  Compass,
  ChevronRight,
  Shield,
  Zap,
  MessageSquare
} from 'lucide-react-native';
import { PersonaAvatar } from '../components/common/PersonaAvatar';
import { AcousticLoopLogo } from '../components/brand/AcousticLoopLogo';
import { Header } from '../components/common/Header';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { CURATED_SCENARIOS } from '../data/scenariosData';
import { apiService } from '../services/api';
import { Scenario } from '../types';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, refreshProfile, setIsPaywallVisible } = useApp();
  const { colors: themeColors, isDark } = useTheme();

  const [promptText, setPromptText] = useState('');
  const [scenarios, setScenarios] = useState<Scenario[]>(CURATED_SCENARIOS);
  const [refreshing, setRefreshing] = useState(false);

  // Quick suggestion chips for conversational input
  const quickPrompts = [
    'Asking my VP for a budget increase',
    'Pushing back on Friday night requests',
    'Confronting a peer who took credit',
    'Delivering critical feedback to a senior engineer'
  ];

  // Simulated active in-progress rehearsal for returning state
  const activeRehearsal = {
    id: 'active-session-1',
    title: 'Zero-Sum Budget Negotiation with VP',
    counterpart: 'Alex Chen (VP of Product)',
    lastPracticed: '18 min ago',
    progressRounds: 'Round 2 of 4',
    progressPercent: '65%'
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const res = await apiService.getScenarios();
      if (res?.scenarios && res.scenarios.length > 0) {
        setScenarios(res.scenarios);
      }
    } catch (e) {
      setScenarios(CURATED_SCENARIOS);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadHomeData(), refreshProfile()]);
    setRefreshing(false);
  };

  const handleBuildRehearsal = () => {
    navigation.navigate('DescribeSituation', {
      initialSituation: promptText.trim() || undefined
    });
  };

  const isFreeTrial = user.subscription?.status === 'free_trial';
  const remainingRehearsals = user.subscription?.rehearsalsRemaining ?? 2;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* 1. TOP APP HEADER (Acoustic Loop Logo on left, Quiet Streak & XP Badges on right) */}
      <Header type="home" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 2. PRIMARY HERO: "WHAT CONVERSATION ARE YOU PREPARING FOR?" */}
        <View
          style={[
            styles.heroSection,
            {
              backgroundColor: themeColors.surfaceCard,
              borderColor: isDark ? 'rgba(200, 170, 106, 0.25)' : themeColors.surfaceBorder
            }
          ]}
        >
          <View style={styles.heroHeaderRow}>
            <View style={[styles.heroPill, { backgroundColor: themeColors.primarySubtle }]}>
              <Sparkles size={11} color={themeColors.primary} />
              <Text style={[styles.heroPillText, { color: themeColors.primary }]}>
                COMMAND CENTER
              </Text>
            </View>
          </View>

          <Text style={[styles.heroHeading, { color: themeColors.textPrimary }]}>
            What conversation are you preparing for?
          </Text>
          <Text style={[styles.heroSubtitle, { color: themeColors.textSecondary }]}>
            Tell Rehearse what's happening. We'll build the other side of the conversation.
          </Text>

          {/* Conversational Composer Area */}
          <View
            style={[
              styles.composerBox,
              {
                backgroundColor: isDark ? '#122019' : '#F7F5F0',
                borderColor: themeColors.surfaceBorder
              }
            ]}
          >
            <TextInput
              style={[styles.composerInput, { color: themeColors.textPrimary }]}
              placeholder="e.g. I need to ask my VP for a larger budget and headcount for Q3..."
              placeholderTextColor={themeColors.textSecondary}
              multiline
              numberOfLines={3}
              value={promptText}
              onChangeText={setPromptText}
            />

            {/* Quick Starter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {quickPrompts.map((chip, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.promptChip,
                    {
                      backgroundColor: themeColors.surfaceCard,
                      borderColor: themeColors.surfaceBorder
                    }
                  ]}
                  onPress={() => setPromptText(chip)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.promptChipText, { color: themeColors.textSecondary }]}>
                    {chip}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[
              styles.primaryHeroBtn,
              { backgroundColor: isDark ? '#C8AA6A' : '#173D2C' }
            ]}
            onPress={handleBuildRehearsal}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.primaryHeroBtnText,
                { color: isDark ? '#0B1712' : '#FFFFFF' }
              ]}
            >
              Build My Rehearsal
            </Text>
            <ArrowRight
              size={16}
              color={isDark ? '#0B1712' : '#FFFFFF'}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>

          {/* Secondary Text Link */}
          <TouchableOpacity
            style={styles.secondaryHeroLink}
            onPress={() => navigation.navigate('Scenarios')}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryHeroLinkText, { color: themeColors.textSecondary }]}>
              or <Text style={{ color: isDark ? '#C8AA6A' : '#173D2C', fontWeight: '700' }}>Choose from curated scenarios →</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. DISTINCTIVE REHEARSE VISUAL: CONVERSATION THREAD PIPELINE */}
        <View
          style={[
            styles.pipelineCard,
            {
              backgroundColor: isDark ? '#0F1C15' : '#F6F4EE',
              borderColor: themeColors.surfaceBorder
            }
          ]}
        >
          <View style={styles.pipelineHeader}>
            <Text style={[styles.pipelineTitle, { color: themeColors.textSecondary }]}>
              THE REHEARSE METHODOLOGY
            </Text>
          </View>

          <View style={styles.threadRow}>
            {/* Step 1 */}
            <View style={styles.threadStep}>
              <View style={[styles.threadNode, { backgroundColor: isDark ? '#C8AA6A' : '#173D2C' }]}>
                <Text style={styles.threadNodeNumber}>1</Text>
              </View>
              <Text style={[styles.threadStepLabel, { color: themeColors.textPrimary }]}>Situation</Text>
            </View>

            <View style={[styles.threadLine, { backgroundColor: isDark ? '#23382D' : '#D9E2DC' }]} />

            {/* Step 2 */}
            <View style={styles.threadStep}>
              <View style={[styles.threadNode, { backgroundColor: themeColors.surfaceElevated, borderColor: isDark ? '#C8AA6A' : '#173D2C', borderWidth: 1 }]}>
                <Text style={[styles.threadNodeNumber, { color: themeColors.textPrimary }]}>2</Text>
              </View>
              <Text style={[styles.threadStepLabel, { color: themeColors.textPrimary }]}>Counterpart</Text>
            </View>

            <View style={[styles.threadLine, { backgroundColor: isDark ? '#23382D' : '#D9E2DC' }]} />

            {/* Step 3 */}
            <View style={styles.threadStep}>
              <View style={[styles.threadNode, { backgroundColor: themeColors.surfaceElevated, borderColor: isDark ? '#C8AA6A' : '#173D2C', borderWidth: 1 }]}>
                <Text style={[styles.threadNodeNumber, { color: themeColors.textPrimary }]}>3</Text>
              </View>
              <Text style={[styles.threadStepLabel, { color: themeColors.textPrimary }]}>Rehearsal</Text>
            </View>

            <View style={[styles.threadLine, { backgroundColor: isDark ? '#23382D' : '#D9E2DC' }]} />

            {/* Step 4 */}
            <View style={styles.threadStep}>
              <View style={[styles.threadNode, { backgroundColor: themeColors.surfaceElevated, borderColor: isDark ? '#C8AA6A' : '#173D2C', borderWidth: 1 }]}>
                <Text style={[styles.threadNodeNumber, { color: themeColors.textPrimary }]}>4</Text>
              </View>
              <Text style={[styles.threadStepLabel, { color: themeColors.textPrimary }]}>Feedback</Text>
            </View>
          </View>
        </View>

        {/* 4. CONTEXTUAL "NEXT BEST ACTION" */}
        <View
          style={[
            styles.nextMoveCard,
            {
              backgroundColor: themeColors.surfaceCard,
              borderColor: themeColors.surfaceBorder
            }
          ]}
        >
          <View style={styles.nextMoveTop}>
            <View style={[styles.nextMoveTag, { backgroundColor: themeColors.primarySubtle }]}>
              <Target size={11} color={themeColors.primary} />
              <Text style={[styles.nextMoveTagText, { color: themeColors.primary }]}>
                YOUR NEXT MOVE
              </Text>
            </View>
            <Text style={[styles.nextMoveContext, { color: themeColors.textSecondary }]}>
              Based on recent rehearsals
            </Text>
          </View>

          <Text style={[styles.nextMoveHeadline, { color: themeColors.textPrimary }]}>
            Practice holding your boundary under pushback.
          </Text>

          <TouchableOpacity
            style={[styles.nextMoveBtn, { backgroundColor: themeColors.surfaceElevated }]}
            onPress={() => navigation.navigate('Scenarios')}
            activeOpacity={0.8}
          >
            <Text style={[styles.nextMoveBtnText, { color: themeColors.textPrimary }]}>
              Practice Drill
            </Text>
            <ArrowRight size={13} color={themeColors.textPrimary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* 5. CONTINUE IN-PROGRESS REHEARSAL (Conditional Module) */}
        {activeRehearsal && (
          <View
            style={[
              styles.continueCard,
              {
                backgroundColor: themeColors.surfaceCard,
                borderColor: themeColors.surfaceBorder
              }
            ]}
          >
            <View style={styles.continueHeader}>
              <View style={styles.continueLeft}>
                <Clock size={13} color={isDark ? '#C8AA6A' : '#173D2C'} style={{ marginRight: 6 }} />
                <Text style={[styles.continuePretitle, { color: themeColors.textSecondary }]}>
                  CONTINUE REHEARSAL • {activeRehearsal.lastPracticed}
                </Text>
              </View>
            </View>

            <View style={styles.continueBodyRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.continueTitle, { color: themeColors.textPrimary }]}>
                  {activeRehearsal.title}
                </Text>
                <Text style={[styles.continueSub, { color: themeColors.textSecondary }]}>
                  Facing {activeRehearsal.counterpart}
                </Text>

                {/* Progress Mini Bar */}
                <View style={styles.progressRow}>
                  <View style={[styles.progressTrack, { backgroundColor: themeColors.surfaceElevated }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: '65%', backgroundColor: isDark ? '#C8AA6A' : '#173D2C' }
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>
                    {activeRehearsal.progressRounds}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.resumeBtn, { backgroundColor: isDark ? '#C8AA6A' : '#173D2C' }]}
                onPress={() => navigation.navigate('Roleplay', { scenario: scenarios[0] })}
                activeOpacity={0.85}
              >
                <Play size={13} color={isDark ? '#0B1712' : '#FFFFFF'} style={{ marginRight: 4 }} />
                <Text style={[styles.resumeBtnText, { color: isDark ? '#0B1712' : '#FFFFFF' }]}>
                  Resume
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 6. CURATED SCENARIOS (Horizontal Discovery Tiles) */}
        <View style={styles.scenariosSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              Practice a High-Stakes Situation
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Scenarios')}>
              <Text style={[styles.seeAllLink, { color: isDark ? '#C8AA6A' : '#173D2C' }]}>
                See all →
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scenarioTilesRow}
          >
            {scenarios.slice(0, 5).map((scen) => (
              <TouchableOpacity
                key={scen.id}
                style={[
                  styles.scenarioTile,
                  {
                    backgroundColor: themeColors.surfaceCard,
                    borderColor: themeColors.surfaceBorder
                  }
                ]}
                onPress={() => navigation.navigate('Roleplay', { scenario: scen })}
                activeOpacity={0.8}
              >
                <View style={styles.tileHeader}>
                  <View style={[styles.categoryTag, { backgroundColor: themeColors.primarySubtle }]}>
                    <Text style={[styles.categoryTagText, { color: themeColors.primary }]}>
                      {scen.category.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.difficultyTag, { color: themeColors.textSecondary }]}>
                    {scen.difficulty}
                  </Text>
                </View>

                <Text
                  style={[styles.tileTitle, { color: themeColors.textPrimary }]}
                  numberOfLines={2}
                >
                  {scen.title}
                </Text>

                <Text
                  style={[styles.tileCounterpart, { color: themeColors.textSecondary }]}
                  numberOfLines={1}
                >
                  Facing: {scen.counterpartName}
                </Text>

                <View style={styles.tileFooter}>
                  <Text style={[styles.tileTime, { color: themeColors.textSecondary }]}>
                    {scen.estimatedMinutes} min drill
                  </Text>
                  <View style={[styles.tileActionArrow, { backgroundColor: themeColors.surfaceElevated }]}>
                    <ChevronRight size={13} color={themeColors.textPrimary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 7. DAILY PRACTICE (Micro-Habit 1-Minute Challenge) */}
        <View
          style={[
            styles.dailyPracticeCard,
            {
              backgroundColor: themeColors.surfaceCard,
              borderColor: themeColors.surfaceBorder
            }
          ]}
        >
          <View style={[styles.dailyIconSquare, { backgroundColor: themeColors.primarySubtle }]}>
            <Zap size={16} color={themeColors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.dailyPretitle, { color: themeColors.textSecondary }]}>
              TODAY'S 1-MINUTE DRILL
            </Text>
            <Text style={[styles.dailyHeadline, { color: themeColors.textPrimary }]}>
              Hold your position when challenged with budget caps.
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.dailyStartBtn, { backgroundColor: isDark ? '#C8AA6A' : '#173D2C' }]}
            onPress={() => navigation.navigate('Roleplay', { scenario: scenarios[0] })}
            activeOpacity={0.8}
          >
            <Text style={[styles.dailyStartBtnText, { color: isDark ? '#0B1712' : '#FFFFFF' }]}>
              Start →
            </Text>
          </TouchableOpacity>
        </View>

        {/* 8. SUBTLE TRIAL STATUS FOOTNOTE */}
        {isFreeTrial && (
          <TouchableOpacity
            style={styles.trialFootnote}
            onPress={() => setIsPaywallVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.trialFootnoteText, { color: themeColors.textSecondary }]}>
              {remainingRehearsals} free rehearsals remaining ·{' '}
              <Text style={{ color: isDark ? '#C8AA6A' : '#173D2C', fontWeight: '700' }}>
                Explore Rehearse Plus →
              </Text>
            </Text>
          </TouchableOpacity>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.5
  },
  headerRightIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700'
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  xpText: {
    fontSize: 11,
    fontWeight: '700'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110
  },
  heroSection: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 18,
    marginBottom: 16
  },
  heroHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4
  },
  heroPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  heroHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 28,
    marginBottom: 6
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14
  },
  composerBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14
  },
  composerInput: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 56,
    textAlignVertical: 'top',
    marginBottom: 10
  },
  chipsScroll: {
    gap: 6
  },
  promptChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  promptChipText: {
    fontSize: 11.5
  },
  primaryHeroBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryHeroBtnText: {
    fontSize: 14.5,
    fontWeight: '700'
  },
  secondaryHeroLink: {
    alignItems: 'center',
    marginTop: 12
  },
  secondaryHeroLinkText: {
    fontSize: 12
  },
  pipelineCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16
  },
  pipelineHeader: {
    marginBottom: 10
  },
  pipelineTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  threadStep: {
    alignItems: 'center'
  },
  threadNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  threadNodeNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  threadStepLabel: {
    fontSize: 11,
    fontWeight: '600'
  },
  threadLine: {
    flex: 1,
    height: 1.5,
    marginHorizontal: 6,
    marginTop: -16
  },
  nextMoveCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16
  },
  nextMoveTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  nextMoveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    gap: 4
  },
  nextMoveTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  nextMoveContext: {
    fontSize: 11
  },
  nextMoveHeadline: {
    fontSize: 14.5,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 10
  },
  nextMoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  nextMoveBtnText: {
    fontSize: 11.5,
    fontWeight: '700'
  },
  continueCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16
  },
  continueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  continueLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  continuePretitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  continueBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  continueTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2
  },
  continueSub: {
    fontSize: 11.5,
    marginBottom: 6
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  progressTrack: {
    width: 90,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 2
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '600'
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12
  },
  resumeBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  scenariosSection: {
    marginBottom: 16
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  seeAllLink: {
    fontSize: 12,
    fontWeight: '700'
  },
  scenarioTilesRow: {
    gap: 10
  },
  scenarioTile: {
    width: 220,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  categoryTagText: {
    fontSize: 9,
    fontWeight: '800'
  },
  difficultyTag: {
    fontSize: 10,
    fontWeight: '600'
  },
  tileTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 4,
    minHeight: 36
  },
  tileCounterpart: {
    fontSize: 11.5,
    marginBottom: 10
  },
  tileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8
  },
  tileTime: {
    fontSize: 11
  },
  tileActionArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dailyPracticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16
  },
  dailyIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dailyPretitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2
  },
  dailyHeadline: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 16
  },
  dailyStartBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8
  },
  dailyStartBtnText: {
    fontSize: 11.5,
    fontWeight: '700'
  },
  trialFootnote: {
    alignItems: 'center',
    paddingVertical: 8
  },
  trialFootnoteText: {
    fontSize: 11
  }
});

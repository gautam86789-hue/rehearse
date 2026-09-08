import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Polygon,
  G
} from 'react-native-svg';
import {
  Search,
  Sparkles,
  Play,
  Flame,
  Shield,
  Clock,
  Target,
  ArrowRight,
  BookOpen,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react-native';
import { PersonaAvatar } from '../components/common/PersonaAvatar';
import { ScenarioBriefModal } from '../components/scenarios/ScenarioBriefModal';
import { Header } from '../components/common/Header';
import { useTheme } from '../context/ThemeContext';
import { CURATED_SCENARIOS } from '../data/scenariosData';
import { apiService } from '../services/api';
import { Scenario } from '../types';

export const ScenariosScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors, isDark } = useTheme();
  const [scenarios, setScenarios] = useState<Scenario[]>(CURATED_SCENARIOS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScenarioForBrief, setSelectedScenarioForBrief] = useState<Scenario | null>(null);
  const [briefModalVisible, setBriefModalVisible] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, [selectedCategory]);

  const loadScenarios = async () => {
    try {
      const res = await apiService.getScenarios(
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      if (res?.scenarios && res.scenarios.length > 0) {
        setScenarios(res.scenarios);
      } else {
        setScenarios(CURATED_SCENARIOS);
      }
    } catch (e) {
      setScenarios(CURATED_SCENARIOS);
    }
  };

  const categories = [
    { id: 'all', label: 'All Scenarios' },
    { id: 'negotiation', label: 'Negotiation' },
    { id: 'managing_up', label: 'Managing Up' },
    { id: 'feedback', label: 'Critical Feedback' },
    { id: 'boundaries', label: 'Boundaries' },
    { id: 'crisis', label: 'Crisis & Layoffs' },
    { id: 'difficult_decisions', label: 'Difficult Decisions' }
  ];

  const filteredScenarios = useMemo(() => {
    return scenarios.filter((s) => {
      // Category filter
      if (selectedCategory !== 'all' && s.category !== selectedCategory) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'all' && s.difficulty !== selectedDifficulty) {
        return false;
      }
      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.counterpartName.toLowerCase().includes(q) ||
        s.counterpartRole.toLowerCase().includes(q) ||
        s.situation.toLowerCase().includes(q) ||
        s.userGoal.toLowerCase().includes(q)
      );
    });
  }, [scenarios, selectedCategory, selectedDifficulty, searchQuery]);

  const featuredScenario = CURATED_SCENARIOS[0]; // Zero-sum budget freeze

  const handleOpenBrief = (scenario: Scenario) => {
    setSelectedScenarioForBrief(scenario);
    setBriefModalVisible(true);
  };

  const handleStartRehearsal = (scenario: Scenario) => {
    navigation.navigate('Roleplay', { scenario });
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Standard Executive Header */}
      <Header
        title="Scenarios"
        rightAction="search"
        navigation={navigation}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mountain Vector Banner */}
        <View
          style={[
            styles.bannerCard,
            {
              backgroundColor: isDark ? '#0B1712' : '#F0F5F2',
              borderColor: themeColors.surfaceBorder
            }
          ]}
        >
          <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 130">
            <Defs>
              <LinearGradient id="scenSky" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={isDark ? '#07100C' : '#DDECE3'} />
                <Stop offset="100%" stopColor={isDark ? '#12231B' : '#F4F9F6'} />
              </LinearGradient>
              <RadialGradient id="scenSun" cx="50%" cy="40%" r="50%">
                <Stop offset="0%" stopColor={isDark ? '#C8AA6A' : '#C8AA6A'} stopOpacity={isDark ? 0.35 : 0.45} />
                <Stop offset="100%" stopColor={isDark ? '#C8AA6A' : '#C8AA6A'} stopOpacity="0" />
              </RadialGradient>
            </Defs>

            <Path d="M0 0 H400 V130 H0 Z" fill="url(#scenSky)" />
            <Circle cx="200" cy="45" r="70" fill="url(#scenSun)" />

            {/* Mountains */}
            <Polygon
              points="-20,130 80,45 190,130"
              fill={isDark ? '#152C22' : '#BDD7C8'}
              opacity={0.7}
            />
            <Polygon
              points="130,130 250,30 370,130"
              fill={isDark ? '#1A392C' : '#9DC2AE'}
              opacity={0.85}
            />
            <Polygon
              points="280,130 350,60 420,130"
              fill={isDark ? '#10241B' : '#CBE0D5'}
              opacity={0.6}
            />
          </Svg>

          <View style={styles.bannerContent}>
            <View style={[styles.bannerTag, { backgroundColor: isDark ? '#1C3328' : '#D5E6DC' }]}>
              <Flame size={11} color={isDark ? '#C8AA6A' : '#173D2C'} />
              <Text style={[styles.bannerTagText, { color: isDark ? '#C8AA6A' : '#173D2C' }]}>
                EXECUTIVE MASTERY
              </Text>
            </View>

            <Text style={[styles.bannerQuote, { color: isDark ? '#F5F2E9' : '#173D2C' }]}>
              “The standard you walk past is the standard you accept.”
            </Text>
            <Text style={[styles.bannerMeta, { color: isDark ? '#C8AA6A' : '#2A6F50' }]}>
              {scenarios.length} High-Stakes Simulations Available
            </Text>
          </View>
        </View>

        {/* Featured Scenario of the Day */}
        {featuredScenario && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderLeft}>
                <Sparkles size={14} color={isDark ? '#C8AA6A' : '#173D2C'} />
                <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
                  FEATURED HIGH-STAKES DRILL
                </Text>
              </View>
              <View style={[styles.featuredTag, { backgroundColor: isDark ? '#C8AA6A' : '#173D2C' }]}>
                <Text style={[styles.featuredTagText, { color: isDark ? '#0B1712' : '#FFFFFF' }]}>
                  SPOTLIGHT
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.featuredCard,
                {
                  backgroundColor: themeColors.surfaceCard,
                  borderColor: isDark ? '#C8AA6A' : '#173D2C'
                }
              ]}
              onPress={() => handleOpenBrief(featuredScenario)}
              activeOpacity={0.85}
            >
              <View style={styles.featuredTopRow}>
                <PersonaAvatar
                  archetypeId={featuredScenario.counterpartArchetype}
                  size={46}
                  showBadge={false}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.featuredMetaRow}>
                    <Text style={[styles.featuredCategory, { color: isDark ? '#C8AA6A' : '#173D2C' }]}>
                      {featuredScenario.category.toUpperCase()}
                    </Text>
                    <Text style={[styles.metaDot, { color: themeColors.textSecondary }]}>•</Text>
                    <View style={styles.timeInline}>
                      <Clock size={11} color={themeColors.textSecondary} style={{ marginRight: 3 }} />
                      <Text style={[styles.timeInlineText, { color: themeColors.textSecondary }]}>
                        {featuredScenario.estimatedMinutes} min
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.featuredTitle, { color: themeColors.textPrimary }]}>
                    {featuredScenario.title}
                  </Text>
                </View>
              </View>

              <Text style={[styles.featuredDesc, { color: themeColors.textSecondary }]} numberOfLines={2}>
                {featuredScenario.situation}
              </Text>

              <View style={[styles.featuredFooter, { borderTopColor: themeColors.surfaceBorder }]}>
                <View style={styles.featuredGoalBox}>
                  <Text style={[styles.goalLabel, { color: isDark ? '#C8AA6A' : '#173D2C' }]}>Goal: </Text>
                  <Text style={[styles.goalSnippet, { color: themeColors.textPrimary }]} numberOfLines={1}>
                    {featuredScenario.userGoal}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.featuredActionBtn, { backgroundColor: isDark ? '#C8AA6A' : '#173D2C' }]}
                  onPress={() => handleStartRehearsal(featuredScenario)}
                  activeOpacity={0.8}
                >
                  <Play size={12} color={isDark ? '#0B1712' : '#FFFFFF'} style={{ marginRight: 4 }} />
                  <Text style={[styles.featuredActionText, { color: isDark ? '#0B1712' : '#FFFFFF' }]}>
                    Rehearse
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: themeColors.surfaceCard,
                borderColor: themeColors.surfaceBorder
              }
            ]}
          >
            <Search size={16} color={themeColors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: themeColors.textPrimary }]}
              placeholder="Search scenarios, roles, dilemmas..."
              placeholderTextColor={themeColors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Category Filter Pills */}
        <View style={styles.categoriesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPillsList}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: isSelected
                        ? (isDark ? '#173D2C' : '#EAF2EC')
                        : themeColors.surfaceCard,
                      borderColor: isSelected
                        ? (isDark ? '#C8AA6A' : '#173D2C')
                        : themeColors.surfaceBorder
                    }
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      {
                        color: isSelected
                          ? (isDark ? '#C8AA6A' : '#173D2C')
                          : themeColors.textSecondary,
                        fontWeight: isSelected ? '700' : '500'
                      }
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Difficulty Filter Tabs */}
        <View style={styles.difficultyRow}>
          {[
            { id: 'all', label: 'All Stakes' },
            { id: 'Intermediate', label: 'Intermediate' },
            { id: 'High Stakes', label: 'High Stakes' }
          ].map((d) => {
            const isSelected = selectedDifficulty === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                style={[
                  styles.difficultyTab,
                  {
                    backgroundColor: isSelected
                      ? themeColors.surfaceElevated
                      : 'transparent',
                    borderColor: isSelected
                      ? (isDark ? '#C8AA6A' : '#173D2C')
                      : 'transparent'
                  }
                ]}
                onPress={() => setSelectedDifficulty(d.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.difficultyTabText,
                    {
                      color: isSelected
                        ? themeColors.textPrimary
                        : themeColors.textSecondary,
                      fontWeight: isSelected ? '700' : '500'
                    }
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Scenarios List */}
        <View style={styles.scenariosList}>
          {filteredScenarios.map((item) => {
            const isHigh = item.difficulty === 'High Stakes';
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.scenarioCard,
                  {
                    backgroundColor: themeColors.surfaceCard,
                    borderColor: themeColors.surfaceBorder
                  }
                ]}
                onPress={() => handleOpenBrief(item)}
                activeOpacity={0.8}
              >
                <View style={styles.scenarioCardHeader}>
                  <PersonaAvatar
                    archetypeId={item.counterpartArchetype}
                    size={42}
                    showBadge={false}
                  />

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.scenarioMetaRow}>
                      <Text style={[styles.scenarioCategoryTag, { color: isDark ? '#C8AA6A' : '#173D2C' }]}>
                        {item.category.toUpperCase()}
                      </Text>
                      <Text style={[styles.metaDot, { color: themeColors.textSecondary }]}>•</Text>
                      <View
                        style={[
                          styles.difficultyMiniBadge,
                          {
                            backgroundColor: isHigh
                              ? 'rgba(231,76,60,0.1)'
                              : themeColors.surfaceElevated
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.difficultyMiniText,
                            { color: isHigh ? '#E74C3C' : themeColors.textSecondary }
                          ]}
                        >
                          {item.difficulty}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.scenarioTitle, { color: themeColors.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.counterpartSub, { color: themeColors.textSecondary }]}>
                      Facing: {item.counterpartName} • {item.counterpartRole}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.scenarioSnippet, { color: themeColors.textSecondary }]} numberOfLines={2}>
                  {item.situation}
                </Text>

                {/* Card Footer Actions */}
                <View style={[styles.scenarioCardFooter, { borderTopColor: themeColors.surfaceBorder }]}>
                  <View style={styles.goalLine}>
                    <Target size={13} color={isDark ? '#C8AA6A' : '#173D2C'} style={{ marginRight: 5 }} />
                    <Text style={[styles.goalLineText, { color: themeColors.textPrimary }]} numberOfLines={1}>
                      {item.userGoal}
                    </Text>
                  </View>

                  <View style={styles.cardActionsGroup}>
                    <TouchableOpacity
                      style={[styles.briefBtn, { backgroundColor: themeColors.surfaceElevated }]}
                      onPress={() => handleOpenBrief(item)}
                      activeOpacity={0.7}
                    >
                      <Info size={12} color={themeColors.textPrimary} style={{ marginRight: 4 }} />
                      <Text style={[styles.briefBtnText, { color: themeColors.textPrimary }]}>
                        Brief
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.rehearseActionBtn, { backgroundColor: isDark ? '#C8AA6A' : '#173D2C' }]}
                      onPress={() => handleStartRehearsal(item)}
                      activeOpacity={0.8}
                    >
                      <Play size={12} color={isDark ? '#0B1712' : '#FFFFFF'} style={{ marginRight: 4 }} />
                      <Text style={[styles.rehearseActionText, { color: isDark ? '#0B1712' : '#FFFFFF' }]}>
                        Rehearse
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Scenario Brief Modal */}
      <ScenarioBriefModal
        visible={briefModalVisible}
        scenario={selectedScenarioForBrief}
        onClose={() => setBriefModalVisible(false)}
        onStartRehearsal={handleStartRehearsal}
      />
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
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  customStudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4
  },
  customStudioBtnText: {
    fontSize: 11,
    fontWeight: '700'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110
  },
  bannerCard: {
    borderRadius: 16,
    borderWidth: 1,
    height: 120,
    overflow: 'hidden',
    marginBottom: 18,
    justifyContent: 'flex-end',
    padding: 14
  },
  bannerContent: {
    zIndex: 2
  },
  bannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 4
  },
  bannerTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  bannerQuote: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 2
  },
  bannerMeta: {
    fontSize: 11,
    fontWeight: '600'
  },
  featuredSection: {
    marginBottom: 18
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  },
  featuredTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  featuredTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  featuredCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14
  },
  featuredTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  featuredMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3
  },
  featuredCategory: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  metaDot: {
    fontSize: 10
  },
  timeInline: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeInlineText: {
    fontSize: 10,
    fontWeight: '600'
  },
  featuredTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  featuredDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 10
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1
  },
  featuredGoalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  goalLabel: {
    fontSize: 11,
    fontWeight: '700'
  },
  goalSnippet: {
    fontSize: 12,
    flex: 1
  },
  featuredActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8
  },
  featuredActionText: {
    fontSize: 12,
    fontWeight: '700'
  },
  searchSection: {
    marginBottom: 12
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13
  },
  categoriesWrapper: {
    marginBottom: 10
  },
  categoryPillsList: {
    gap: 8
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1
  },
  categoryPillText: {
    fontSize: 12
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },
  difficultyTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1
  },
  difficultyTabText: {
    fontSize: 11
  },
  scenariosList: {
    gap: 12
  },
  scenarioCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14
  },
  scenarioCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  scenarioMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3
  },
  scenarioCategoryTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  difficultyMiniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  difficultyMiniText: {
    fontSize: 9,
    fontWeight: '700'
  },
  scenarioTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 2
  },
  counterpartSub: {
    fontSize: 11.5
  },
  scenarioSnippet: {
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 8,
    marginBottom: 10
  },
  scenarioCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1
  },
  goalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  goalLineText: {
    fontSize: 11.5,
    flex: 1
  },
  cardActionsGroup: {
    flexDirection: 'row',
    gap: 6
  },
  briefBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8
  },
  briefBtnText: {
    fontSize: 11,
    fontWeight: '600'
  },
  rehearseActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8
  },
  rehearseActionText: {
    fontSize: 11,
    fontWeight: '700'
  }
});

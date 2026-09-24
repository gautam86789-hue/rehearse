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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  Sparkles,
  Play,
  ArrowLeft,
  Clock,
  Target,
  ChevronRight,
  Info,
  Bookmark
} from 'lucide-react-native';
import { PersonaAvatar } from '../components/common/PersonaAvatar';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { CURATED_SCENARIOS } from '../data/scenariosData';
import { categoryColorFor } from '../data/categoryColors';
import { apiService } from '../services/api';
import { Scenario } from '../types';

export const ScenariosScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { colors: themeColors, elevation } = useTheme();
  const { user, history } = useApp();
  // Custom header had a flat paddingTop:20 with no safe-area handling — on
  // edge-to-edge Android that put the title/back-button under the status bar.
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;
  const audience = user.audience;
  const [scenarios, setScenarios] = useState<Scenario[]>(CURATED_SCENARIOS);
  // Full library for this user's persona — decoupled from the category-filtered
  // browsing list above, so the page-level count and the featured card stay
  // stable (and sourced from the live backend list) regardless of which
  // category filter the user currently has selected.
  const [allScenarios, setAllScenarios] = useState<Scenario[]>(CURATED_SCENARIOS);
  const [selectedCategory, setSelectedCategory] = useState<string>(route?.params?.category || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // If this screen instance is already mounted (e.g. reached once via "See
  // all"), navigating back into it with a different category param — like
  // "Practice This Skill" from a skill detail view — only changes
  // route.params; useState's initial value won't re-run on its own, so the
  // filter would silently stay on whatever category was selected before.
  useEffect(() => {
    if (route?.params?.category && route.params.category !== selectedCategory) {
      setSelectedCategory(route.params.category);
    }
  }, [route?.params?.category]);

  useEffect(() => {
    loadScenarios();
  }, [selectedCategory, audience]);

  useEffect(() => {
    apiService
      .getScenarios(undefined, undefined, audience)
      .then((res) => {
        if (res?.scenarios && res.scenarios.length > 0) setAllScenarios(res.scenarios);
      })
      .catch(() => {});
  }, [audience]);

  const loadScenarios = async () => {
    try {
      // 'saved' is a client-only pseudo-category (bookmarks), not a real
      // scenario category, so fetch the unfiltered list and filter locally.
      const res = await apiService.getScenarios(
        selectedCategory === 'all' || selectedCategory === 'saved' ? undefined : selectedCategory,
        undefined,
        audience
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
    { id: 'saved', label: 'Saved' },
    { id: 'negotiation', label: 'Negotiation' },
    { id: 'managing_up', label: 'Managing Up' },
    { id: 'feedback', label: 'Critical Feedback' },
    { id: 'boundaries', label: 'Boundaries' },
    { id: 'crisis', label: 'Crisis & Layoffs' },
    { id: 'difficult_decisions', label: 'Difficult Decisions' }
  ];

  // Beginner-first: someone new sees the gentle scenarios at the top, and the
  // list drifts toward Intermediate and High Stakes as they complete more
  // rehearsals. Scenarios closest to the user's current level come first.
  const levelTarget = history.length < 3 ? 0 : history.length < 8 ? 1 : 2;
  const rankOf = (d: string) => (d === 'Beginner' ? 0 : d === 'Intermediate' ? 1 : 2);
  const byLevel = (list: Scenario[]) =>
    list
      .map((sc, i) => ({ sc, i }))
      .sort((a, b) => Math.abs(rankOf(a.sc.difficulty) - levelTarget) - Math.abs(rankOf(b.sc.difficulty) - levelTarget) || a.i - b.i)
      .map((x) => x.sc);

  const filteredScenarios = useMemo(() => {
    return byLevel(scenarios).filter((s) => {
      // "Saved" pseudo-category: bookmarked scenarios, regardless of category
      if (selectedCategory === 'saved') {
        return !!user.savedScenarioIds?.includes(s.id);
      }
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
  }, [scenarios, selectedCategory, selectedDifficulty, searchQuery, user.savedScenarioIds, levelTarget]);

  const featuredScenario = byLevel(allScenarios)[0];

  const handleOpenBrief = (scenario: Scenario) => {
    navigation.navigate('ScenarioDetail', { scenario });
  };

  const handleStartRehearsal = (scenario: Scenario) => {
    navigation.navigate('Roleplay', { scenario });
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header — same pattern as Feedback / Detailed Feedback / Scenario Detail */}
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeTabs'))}
          style={styles.headerBtn}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <ArrowLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Scenarios</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
                        ? themeColors.primarySubtle
                        : themeColors.surfaceCard,
                      borderColor: isSelected
                        ? themeColors.primary
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
                          ? themeColors.primary
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
            { id: 'all', label: 'All' },
            { id: 'Beginner', label: 'Beginner' },
            { id: 'Intermediate', label: 'Medium' },
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
                      ? themeColors.primary
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

        {/* List header — reflects whatever category/search is active right now */}
        <View style={styles.listHeaderRow}>
          <Text style={[styles.listHeaderTitle, { color: themeColors.textPrimary }]}>
            {categories.find((c) => c.id === selectedCategory)?.label || 'All Scenarios'}
          </Text>
          <Text style={[styles.listHeaderCount, { color: themeColors.textSecondary }]}>
            {filteredScenarios.length} {filteredScenarios.length === 1 ? 'result' : 'results'}
          </Text>
        </View>

        {/* Scenarios List */}
        <View style={styles.scenariosList}>
          {filteredScenarios.map((item) => {
            const isHigh = item.difficulty === 'High Stakes';
            const palette = themeColors.cardCategories[categoryColorFor(item.category)];
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.scenarioCard,
                  elevation.sm,
                  {
                    backgroundColor: palette.subtle,
                    borderColor: palette.border
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
                      <Text style={[styles.scenarioCategoryTag, { color: palette.solid }]}>
                        {item.category.toUpperCase()}
                      </Text>
                      <Text style={[styles.metaDot, { color: themeColors.textSecondary }]}>•</Text>
                      <View
                        style={[
                          styles.difficultyMiniBadge,
                          {
                            backgroundColor: isHigh
                              ? themeColors.rubySubtle
                              : themeColors.surfaceElevated
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.difficultyMiniText,
                            { color: isHigh ? themeColors.ruby : themeColors.textSecondary }
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
                <View style={[styles.scenarioCardFooter, { borderTopColor: palette.border }]}>
                  <View style={styles.goalLine}>
                    <Target size={13} color={palette.solid} style={{ marginRight: 5 }} />
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
                      style={[styles.rehearseActionBtn, { backgroundColor: palette.solid }]}
                      onPress={() => handleStartRehearsal(item)}
                      activeOpacity={0.8}
                    >
                      <Play size={12} color={themeColors.textInverse} style={{ marginRight: 4 }} />
                      <Text style={[styles.rehearseActionText, { color: themeColors.textInverse }]}>
                        Rehearse
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredScenarios.length === 0 && (
            <View style={styles.emptyState}>
              {selectedCategory === 'saved' ? (
                <Bookmark size={28} color={themeColors.textSecondary} />
              ) : (
                <Search size={28} color={themeColors.textSecondary} />
              )}
              <Text style={[styles.emptyStateTitle, { color: themeColors.textPrimary }]}>
                {selectedCategory === 'saved' ? 'No saved scenarios yet' : 'No scenarios found'}
              </Text>
              <Text style={[styles.emptyStateBody, { color: themeColors.textSecondary }]}>
                {selectedCategory === 'saved'
                  ? 'Tap the bookmark icon on any scenario to save it here for later.'
                  : 'Try a different category or search term.'}
              </Text>
            </View>
          )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12
  },
  headerBtn: {
    padding: 6
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 110
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  listHeaderCount: {
    fontSize: 12.5
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 8
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  emptyStateBody: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  },
  pageHeaderBlock: {
    marginTop: 28,
    marginBottom: 18,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  pageHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4
  },
  pageSub: {
    fontSize: 13,
    lineHeight: 18
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
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16
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
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
    borderRadius: 18,
    borderWidth: 1,
    padding: 16
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

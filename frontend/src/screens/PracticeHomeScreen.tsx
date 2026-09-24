import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MessageCircle, BookOpen, Zap, FileEdit } from 'lucide-react-native';
import { PersonaAvatar } from '../components/common/PersonaAvatar';
import { getArchetypeAvatarImage, getFeatureIllustration } from '../data/generatedImages';
import { useTheme, CardCategoryKey } from '../context/ThemeContext';
import { CURATED_SCENARIOS } from '../data/scenariosData';
import { useFitScreenScroll } from '../hooks/useFitScreenScroll';
import { ThemedFeatureCard } from '../components/common/ThemedFeatureCard';

// Flagship, audience-matched personas — one-tap fast path straight into a
// Roleplay session, skipping the multi-step Describe-Your-Situation form.
const TALK_TO_AVATARS: { archetypeId: string; scenarioId: string; label: string; sub: string }[] = [
  { archetypeId: 'defensive_boss', scenarioId: 'scenario-talk-to-manager', label: 'Your Manager', sub: 'Pushing back on scope' },
  { archetypeId: 'startup_cofounder', scenarioId: 'scenario-talk-to-cofounder', label: 'Your Co-Founder', sub: 'Resolving a disagreement' },
  { archetypeId: 'skeptical_investor', scenarioId: 'scenario-talk-to-investor', label: 'An Investor', sub: 'Defending your valuation' }
];

interface PracticeMode {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  categoryColor: CardCategoryKey;
}

const PRACTICE_MODES: PracticeMode[] = [
  {
    id: 'free',
    title: 'Free Practice',
    subtitle: 'Standard feedback after the conversation.',
    icon: MessageCircle,
    categoryColor: 'teal'
  },
  {
    id: 'guided',
    title: 'Guided Practice',
    subtitle: 'Get pre-conversation coaching.',
    icon: BookOpen,
    categoryColor: 'info'
  },
  {
    id: 'quick_drill',
    title: 'Quick Drill',
    subtitle: '2-minute scenario with multiple choice responses.',
    icon: Zap,
    categoryColor: 'purple'
  },
  {
    id: 'custom',
    title: 'Custom Scenario',
    subtitle: 'Create a scenario based on your own situation.',
    icon: FileEdit,
    categoryColor: 'sage'
  }
];

export const PracticeHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const fitScroll = useFitScreenScroll();



  const handleSelectMode = (mode: PracticeMode) => {
    switch (mode.id) {
      case 'free':
        navigation.navigate('Scenarios');
        break;
      case 'guided':
        navigation.navigate('GuidedPractice');
        break;
      case 'quick_drill':
        navigation.navigate('DailyPuzzle');
        break;
      case 'custom':
        navigation.navigate('DescribeSituation');
        break;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) + 8 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={fitScroll.scrollEnabled}
        onLayout={fitScroll.onLayout}
        onContentSizeChange={fitScroll.onContentSizeChange}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Practice</Text>
        </View>

        <View style={styles.list}>
          {PRACTICE_MODES.map((mode) => (
            <ThemedFeatureCard
              key={mode.id}
              size="tile"
              title={mode.title}
              icon={mode.icon}
              categoryColor={mode.categoryColor}
              illustration={getFeatureIllustration(mode.id)}
              onPress={() => handleSelectMode(mode)}
            />
          ))}
        </View>

        <Text style={[styles.title, { color: colors.textPrimary, fontSize: 17, marginTop: 28, marginBottom: 14 }]}>
          Talk to
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarRow}>
          {TALK_TO_AVATARS.map((avatar) => (
            <TouchableOpacity
              key={avatar.scenarioId}
              style={[styles.avatarCard, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}
              onPress={() => {
                const scenario = CURATED_SCENARIOS.find((s) => s.id === avatar.scenarioId);
                if (scenario) navigation.navigate('Roleplay', { scenario });
              }}
              activeOpacity={0.85}
            >
              {getArchetypeAvatarImage(avatar.archetypeId) ? (
                <Image
                  source={getArchetypeAvatarImage(avatar.archetypeId)!}
                  style={styles.avatarPhoto}
                />
              ) : (
                <PersonaAvatar archetypeId={avatar.archetypeId} size={52} />
              )}
              <Text style={[styles.avatarCardLabel, { color: colors.textPrimary }]}>{avatar.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    paddingHorizontal: 20,
    // The floating AI Assistant button always rests in the same bottom-
    // right spot above the tab bar (that consistency is the point of a
    // FAB) — on shorter content the "Talk to..." row was the last thing on
    // screen and landed right in that spot, so it needs enough trailing
    // space to end above it instead. Fixed here, on the content side, so
    // the button itself never has to move to make room for a card.
    paddingBottom: 170
  },
  headerRow: {
    marginBottom: 22
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  avatarRow: {
    gap: 12,
    paddingBottom: 8
  },
  avatarCard: {
    width: 132,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center'
  },
  avatarPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26
  },
  avatarCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center'
  },
  avatarCardSub: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center'
  }
});

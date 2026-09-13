import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator
} from 'react-native';
import {
  ChevronLeft,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, RADII } from '../../context/ThemeContext';

const OBJECTIVES = [
  'Get agreement',
  'Push back',
  'Set a boundary',
  'Deliver difficult feedback',
  'Explore options'
];

export const SituationCoachScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route
}) => {
  const { colors: themeColors, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const [situationText, setSituationText] = useState(
    "My manager keeps pushing back on my request for a higher salary. They say the budget is tight, but I've taken on a lot more responsibility this year..."
  );
  const [selectedObjective, setSelectedObjective] = useState('Get agreement');
  const [optionalContext, setOptionalContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      navigation.navigate('ConversationBrief', {
        situation: situationText,
        objective: selectedObjective,
        context: optionalContext
      });
    }, 600);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.surfaceBorder, paddingTop: topPadding }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: themeColors.surfaceElevated }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Situation Coach</Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
            Let's understand what you're dealing with.
          </Text>
        </View>
      </View>

      {/* Step Progress Bar */}
      <View style={styles.stepProgressRow}>
        <View style={[styles.progressBarTrack, { backgroundColor: themeColors.surfaceElevated }]}>
          <View style={[styles.progressBarFill, { width: '33.3%', backgroundColor: themeColors.primary }]} />
        </View>
        <Text style={[styles.stepText, { color: themeColors.textSecondary }]}>1 of 3</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question 1: What's really happening? */}
        <View style={styles.questionSection}>
          <Text style={[styles.questionTitle, { color: themeColors.textPrimary }]}>What's really happening?</Text>
          <View style={[styles.textInputWrapper, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <TextInput
              style={[styles.textArea, { color: themeColors.textPrimary }]}
              multiline
              numberOfLines={4}
              maxLength={500}
              value={situationText}
              onChangeText={setSituationText}
              placeholder="Describe the situation in your own words..."
              placeholderTextColor={themeColors.textMuted}
            />
            <Text style={[styles.charCounter, { color: themeColors.textMuted }]}>
              {situationText.length}/500
            </Text>
          </View>
        </View>

        {/* Question 2: What do you want to achieve? */}
        <View style={styles.questionSection}>
          <Text style={[styles.questionTitle, { color: themeColors.textPrimary }]}>What do you want to achieve?</Text>
          <View style={[styles.cardGroup, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            {OBJECTIVES.map((obj, idx) => {
              const isSelected = selectedObjective === obj;
              return (
                <TouchableOpacity
                  key={obj}
                  style={[
                    styles.objectiveRow,
                    idx < OBJECTIVES.length - 1 && { borderBottomColor: themeColors.surfaceBorder, borderBottomWidth: 1 },
                    isSelected && { backgroundColor: themeColors.surfaceHighlight }
                  ]}
                  onPress={() => setSelectedObjective(obj)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.objectiveText, { color: themeColors.textPrimary, fontWeight: isSelected ? '700' : '500' }]}>
                    {obj}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkPill, { backgroundColor: themeColors.primary }]}>
                      <Check size={12} color={themeColors.textInverse} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Question 3: Optional context */}
        <View style={styles.questionSection}>
          <Text style={[styles.questionTitle, { color: themeColors.textPrimary }]}>
            Anything else we should know? <Text style={{ color: themeColors.textMuted, fontSize: 13, fontWeight: '400' }}>(Optional)</Text>
          </Text>
          <View style={[styles.textInputWrapper, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <TextInput
              style={[styles.singleInput, { color: themeColors.textPrimary }]}
              value={optionalContext}
              onChangeText={setOptionalContext}
              placeholder="e.g. context, history, key stakeholders..."
              placeholderTextColor={themeColors.textMuted}
            />
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: themeColors.primary }]}
          onPress={handleAnalyze}
          disabled={isAnalyzing}
          activeOpacity={0.85}
        >
          {isAnalyzing ? (
            <ActivityIndicator size="small" color={themeColors.textInverse} />
          ) : (
            <>
              <Text style={[styles.actionBtnText, { color: themeColors.textInverse }]}>Analyze Situation</Text>
              <ArrowRight size={18} color={themeColors.textInverse} style={{ marginLeft: 6 }} />
            </>
          )}
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
  stepProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12
  },
  progressBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2
  },
  stepText: {
    fontSize: 11.5,
    fontWeight: '700'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40
  },
  questionSection: {
    marginBottom: 20
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 2
  },
  textInputWrapper: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 14
  },
  textArea: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  charCounter: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 6
  },
  cardGroup: {
    borderRadius: RADII.md,
    borderWidth: 1,
    overflow: 'hidden'
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 48
  },
  objectiveText: {
    fontSize: 14
  },
  checkPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  singleInput: {
    fontSize: 13.5,
    paddingVertical: 4
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 0
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '800'
  }
});

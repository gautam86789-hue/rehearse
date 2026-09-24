import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native';
import {
  Sparkles,
  ArrowLeft,
  Check,
  RefreshCw,
  Play,
  ArrowRight,
  Shield,
  Target,
  AlertTriangle,
  User,
  Zap,
  Flame,
  HelpCircle,
  Briefcase,
  Building2,
  Users,
  Handshake,
  MessageCircle,
  Pencil
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PersonaAvatar } from '../components/common/PersonaAvatar';
import { useTheme, RADII } from '../context/ThemeContext';
import { apiService } from '../services/api';
import { Scenario, ArchetypeId } from '../types';

export const DescribeSituationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors, isDark, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;
  const [step, setStep] = useState<'input' | 'confirmation'>('input');
  const [situationText, setSituationText] = useState('');
  const [counterpartRole, setCounterpartRole] = useState('Direct Manager');
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId>('defensive_boss');
  const [targetGoal, setTargetGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenario, setGeneratedScenario] = useState<Scenario | null>(null);

  // Short label on the chip, full sentence dropped into the box on tap.
  const quickPromptChips = [
    { label: 'Weekend asks', text: 'Overworked and need to push back on weekend asks' },
    { label: 'Ask for a raise', text: 'Exceeded OKRs and asking for a 20% salary adjustment' },
    { label: 'Credit stolen', text: 'Peer took credit for my model in executive review' },
    { label: 'Micromanaged', text: 'Manager micromanages with 3 daily check-in meetings' },
    { label: 'Say no to VP', text: 'Saying No to VP’s unvetted keynote pet project' }
  ];

  // `value` is what the AI receives; `label` + icon are what people see.
  const roleOptions: { value: string; label: string; icon: any }[] = [
    { value: 'Direct Manager', label: 'Manager', icon: Briefcase },
    { value: 'Department VP / Exec', label: 'Exec', icon: Building2 },
    { value: 'Defensive Senior Peer', label: 'Peer', icon: Users },
    { value: 'Direct Report / IC', label: 'Report', icon: User },
    { value: 'High-Value Client', label: 'Client', icon: Handshake }
  ];

  const archetypes: { id: ArchetypeId; title: string; icon: any }[] = [
    { id: 'defensive_boss', title: 'Defensive', icon: Shield },
    { id: 'guilt_tripper', title: 'Guilt-tripper', icon: HelpCircle },
    { id: 'hard_negotiator', title: 'Hard-nosed', icon: Flame },
    { id: 'passive_aggressive_peer', title: 'Passive-aggressive', icon: Zap },
    { id: 'micromanager', title: 'Micromanager', icon: User }
  ];

  const handleGenerateBrief = async () => {
    if (!situationText.trim()) return;
    setIsGenerating(true);

    try {
      const res = await apiService.generateCustomScenario({
        situation: situationText,
        counterpartRole,
        counterpartArchetype: selectedArchetype,
        targetGoal: targetGoal.trim() || undefined
      });

      if (res?.scenario) {
        setGeneratedScenario(res.scenario);
        setStep('confirmation');
      } else {
        // Fallback custom scenario
        const fallback: Scenario = {
          id: `custom-${Date.now()}`,
          title: `Custom: ${counterpartRole} Dilemma`,
          category: 'difficult_decisions',
          counterpartName: 'Jordan Taylor',
          counterpartRole,
          counterpartArchetype: selectedArchetype,
          difficulty: 'High Stakes',
          estimatedMinutes: 6,
          situation: situationText,
          userGoal: targetGoal || 'De-escalate conflict and protect core deliverables.',
          brief: {
            counterpartPosition: `Counterpart is prioritizing their immediate agenda and defending current authority as ${counterpartRole}.`,
            probablePushbackPatterns: [
              'Tests your conviction and tries to shift blame',
              'Cites departmental constraints and urgency',
              'Attempts to defer resolution to an indefinite date'
            ],
            whatGoodLooksLike:
              'Staying grounded in objective facts, keeping composure, and structuring a mutually beneficial path forward.',
            keyPhrasesToAvoid: [
              '“This is completely unfair to me”',
              '“You never listen to our side”',
              '“I can’t deal with this anymore”'
            ],
            recommendedOpeningFormula:
              '“I want to make sure we are aligned on our highest priorities. Given the current demands, let’s agree on a structured roadmap that protects our deliverables without compromising quality.”'
          },
          isCurated: false,
          createdAt: new Date().toISOString()
        };
        setGeneratedScenario(fallback);
        setStep('confirmation');
      }
    } catch (err) {
      console.warn('Fallback scenario generator triggered');
      const fallback: Scenario = {
        id: `custom-${Date.now()}`,
        title: `Custom: ${counterpartRole} Discussion`,
        category: 'difficult_decisions',
        counterpartName: 'Alex Chen',
        counterpartRole,
        counterpartArchetype: selectedArchetype,
        difficulty: 'High Stakes',
        estimatedMinutes: 6,
        situation: situationText,
        userGoal: targetGoal || 'De-escalate conflict and reach milestone agreement.',
        brief: {
          counterpartPosition: `Counterpart is defending their stance as ${counterpartRole}.`,
          probablePushbackPatterns: [
            'Cites budget constraints and organizational timing',
            'Challenges your scope of ownership'
          ],
          whatGoodLooksLike:
            'Staying grounded in business outcomes and maintaining executive composure.',
          keyPhrasesToAvoid: ['“You are being unreasonable”'],
          recommendedOpeningFormula:
            '“I appreciate the candid conversation. Let’s look at the concrete milestones we can establish today to move forward together.”'
        },
        isCurated: false,
        createdAt: new Date().toISOString()
      };
      setGeneratedScenario(fallback);
      setStep('confirmation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartRoleplay = () => {
    if (generatedScenario) {
      navigation.navigate('Roleplay', { scenario: generatedScenario });
    }
  };

  const handleHeaderBack = () => {
    if (step === 'confirmation') setStep('input');
    else if (navigation?.canGoBack && navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('HomeTab');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={handleHeaderBack} style={styles.headerBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <ArrowLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
          {step === 'input' ? 'Custom Scenario' : 'Ready?'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {step === 'input' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. The situation — the only thing that really needs typing */}
          <View style={[styles.inputCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <TextInput
              style={[styles.textArea, { color: themeColors.textPrimary }]}
              multiline
              maxLength={500}
              placeholder="What's the situation?"
              placeholderTextColor={themeColors.textMuted}
              value={situationText}
              onChangeText={setSituationText}
            />
            <View style={styles.inputFooter}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.chipsRow}
              >
                {quickPromptChips.map((chip) => (
                  <TouchableOpacity
                    key={chip.label}
                    style={[styles.presetChip, { backgroundColor: themeColors.primarySubtle }]}
                    onPress={() => setSituationText(chip.text)}
                    activeOpacity={0.7}
                  >
                    <Sparkles size={11} color={themeColors.primary} />
                    <Text style={[styles.presetChipText, { color: themeColors.primary }]}>{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* 2. Who — icon tiles */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Users size={14} color={themeColors.textMuted} />
              <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>Talking to</Text>
            </View>
            <View style={styles.tileRow}>
              {roleOptions.map((role) => {
                const isSelected = counterpartRole === role.value;
                const Icon = role.icon;
                return (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.tile,
                      {
                        backgroundColor: isSelected ? themeColors.primarySubtle : themeColors.surfaceCard,
                        borderColor: isSelected ? themeColors.primary : themeColors.surfaceBorder
                      }
                    ]}
                    onPress={() => setCounterpartRole(role.value)}
                    activeOpacity={0.75}
                  >
                    <Icon size={20} color={isSelected ? themeColors.primary : themeColors.textSecondary} />
                    <Text
                      style={[styles.tileText, { color: isSelected ? themeColors.primary : themeColors.textSecondary, fontWeight: isSelected ? '700' : '500' }]}
                      numberOfLines={1}
                    >
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 3. Their style — icon tiles */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Flame size={14} color={themeColors.textMuted} />
              <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>Their style</Text>
            </View>
            <View style={styles.tileRow}>
              {archetypes.map((arch) => {
                const isSelected = selectedArchetype === arch.id;
                const Icon = arch.icon;
                return (
                  <TouchableOpacity
                    key={arch.id}
                    style={[
                      styles.tile,
                      {
                        backgroundColor: isSelected ? themeColors.primarySubtle : themeColors.surfaceCard,
                        borderColor: isSelected ? themeColors.primary : themeColors.surfaceBorder
                      }
                    ]}
                    onPress={() => setSelectedArchetype(arch.id)}
                    activeOpacity={0.75}
                  >
                    <Icon size={20} color={isSelected ? themeColors.primary : themeColors.textSecondary} />
                    <Text
                      style={[styles.tileText, { color: isSelected ? themeColors.primary : themeColors.textSecondary, fontWeight: isSelected ? '700' : '500' }]}
                      numberOfLines={1}
                    >
                      {arch.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. Goal — one optional line */}
          <View style={[styles.goalRow, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <Target size={16} color={themeColors.textMuted} />
            <TextInput
              style={[styles.goalInput, { color: themeColors.textPrimary }]}
              placeholder="Your goal (optional)"
              placeholderTextColor={themeColors.textMuted}
              value={targetGoal}
              onChangeText={setTargetGoal}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.generateBtn,
              { backgroundColor: !situationText.trim() || isGenerating ? themeColors.surfaceElevated : themeColors.primary }
            ]}
            onPress={handleGenerateBrief}
            disabled={!situationText.trim() || isGenerating}
            activeOpacity={0.85}
          >
            {isGenerating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Sparkles size={16} color={!situationText.trim() ? themeColors.textMuted : '#FFFFFF'} style={{ marginRight: 8 }} />
                <Text style={[styles.generateBtnText, { color: !situationText.trim() ? themeColors.textMuted : '#FFFFFF' }]}>
                  Create scenario
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {generatedScenario && (
            <>
              {/* Who you're facing */}
              <View style={[styles.briefCounterpartCard, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
                <PersonaAvatar archetypeId={generatedScenario.counterpartArchetype} size={54} showBadge={false} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[styles.briefCounterpartName, { color: themeColors.textPrimary }]}>
                    {generatedScenario.counterpartName}
                  </Text>
                  <Text style={[styles.briefCounterpartRole, { color: themeColors.textSecondary }]}>
                    {generatedScenario.counterpartRole}
                  </Text>
                </View>
              </View>

              {/* Your goal — one line */}
              <View style={[styles.cueRow, { backgroundColor: themeColors.primarySubtle }]}>
                <Target size={18} color={themeColors.primary} />
                <Text style={[styles.cueText, { color: themeColors.textPrimary }]} numberOfLines={2}>
                  {generatedScenario.userGoal}
                </Text>
              </View>

              {/* What to expect — up to 3 short chips */}
              {!!generatedScenario.brief?.probablePushbackPatterns?.length && (
                <View style={styles.section}>
                  <View style={styles.sectionHead}>
                    <AlertTriangle size={14} color={themeColors.warning} />
                    <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>Expect</Text>
                  </View>
                  <View style={styles.pushbackChipWrap}>
                    {generatedScenario.brief.probablePushbackPatterns.slice(0, 3).map((pb, idx) => (
                      <View
                        key={idx}
                        style={[styles.pushbackChip, { backgroundColor: themeColors.warning + '14', borderColor: themeColors.warning + '40' }]}
                      >
                        <Text style={[styles.pushbackChipText, { color: themeColors.textPrimary }]} numberOfLines={2}>
                          {pb}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* A way to open — short quote */}
              {!!generatedScenario.brief?.recommendedOpeningFormula && (
                <View style={[styles.scriptCard, { backgroundColor: themeColors.sageSubtle, borderColor: themeColors.sageLight }]}>
                  <MessageCircle size={16} color={themeColors.success} style={{ marginTop: 2 }} />
                  <Text style={[styles.scriptText, { color: themeColors.textPrimary }]} numberOfLines={4}>
                    {generatedScenario.brief.recommendedOpeningFormula}
                  </Text>
                </View>
              )}

              <View style={styles.actionGroup}>
                <TouchableOpacity
                  style={[styles.primaryLaunchBtn, { backgroundColor: themeColors.primary }]}
                  onPress={handleStartRoleplay}
                  activeOpacity={0.85}
                >
                  <Play size={16} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryLaunchText}>Start</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryEditBtn} onPress={() => setStep('input')} activeOpacity={0.7}>
                  <Pencil size={14} color={themeColors.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={[styles.secondaryEditText, { color: themeColors.textSecondary }]}>Edit</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12
  },
  headerBtn: { padding: 6 },
  headerTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  section: { marginBottom: 20 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '700' },
  inputCard: { borderRadius: 20, borderWidth: 1, marginBottom: 22, overflow: 'hidden' },
  textArea: {
    fontSize: 16,
    lineHeight: 23,
    minHeight: 110,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textAlignVertical: 'top'
  },
  inputFooter: { paddingBottom: 12, paddingLeft: 12 },
  chipsRow: { gap: 8, paddingRight: 12 },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 7
  },
  presetChipText: { fontSize: 12, fontWeight: '600' },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    width: '31.5%',
    flexGrow: 1,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: RADII.lg,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 6
  },
  tileText: { fontSize: 12 },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 18
  },
  goalInput: { flex: 1, fontSize: 14 },
  generateBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  generateBtnText: { fontSize: 15, fontWeight: '700' },
  briefCounterpartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14
  },
  briefCounterpartName: { fontSize: 17, fontWeight: '800' },
  briefCounterpartRole: { fontSize: 13, marginTop: 2 },
  cueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: RADII.lg,
    padding: 14,
    marginBottom: 20
  },
  cueText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  pushbackChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pushbackChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    maxWidth: '100%'
  },
  pushbackChipText: { fontSize: 12.5, fontWeight: '600' },
  scriptCard: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 14,
    marginBottom: 6
  },
  scriptText: { flex: 1, fontSize: 13.5, lineHeight: 20, fontStyle: 'italic' },
  actionGroup: { marginTop: 14, gap: 6 },
  primaryLaunchBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryLaunchText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  secondaryEditBtn: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryEditText: { fontSize: 13.5, fontWeight: '600' }
});

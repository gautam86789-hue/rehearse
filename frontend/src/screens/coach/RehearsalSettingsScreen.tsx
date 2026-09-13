import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Sliders,
  Shield,
  Zap,
  Target,
  Clock,
  Mic,
  Volume2,
  Check,
  Flame,
  UserCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react-native';
import { useTheme, RADII } from '../../context/ThemeContext';

interface PersonaStyle {
  id: string;
  name: string;
  label: string;
  desc: string;
  icon: any;
  difficulty: string;
  recommended?: boolean;
}

export const RehearsalSettingsScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route
}) => {
  const { colors: themeColors, elevation } = useTheme();
  // Header had paddingTop: Platform.OS === 'ios' ? 56 : 20 — the Android
  // branch had no safe-area handling, so on edge-to-edge Android the
  // back button and title sat under the status bar / camera cutout.
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const title = route?.params?.title || 'Compensation Discussion';
  const strategy = route?.params?.strategy || 'diplomatic';
  const initialReply = route?.params?.initialReply || '';

  const [selectedPersona, setSelectedPersona] = useState<string>('realistic');
  const [selectedDuration, setSelectedDuration] = useState<number>(10);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([
    'Holding Ground',
    'Composure Under Pushback'
  ]);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  const personas: PersonaStyle[] = [
    {
      id: 'supportive',
      name: 'Supportive',
      label: 'Constructive & Open',
      desc: 'Listens well, acknowledges merit, but bounded by budget.',
      icon: UserCheck,
      difficulty: 'Moderate'
    },
    {
      id: 'realistic',
      name: 'Realistic',
      label: 'Standard Executive',
      desc: 'Pragmatic, demands concrete business impact & ROI data.',
      icon: Target,
      difficulty: 'Recommended',
      recommended: true
    },
    {
      id: 'challenging',
      name: 'Challenging',
      label: 'High Pressure',
      desc: 'Pushes back firmly, questions timelines, defends status quo.',
      icon: Zap,
      difficulty: 'Hard'
    },
    {
      id: 'adversarial',
      name: 'Adversarial',
      label: 'Tough Negotiator',
      desc: 'Uncompromising, tests your emotional composure and resolve.',
      icon: Flame,
      difficulty: 'Expert'
    }
  ];

  const focusOptions = [
    'Holding Ground',
    'Composure Under Pushback',
    'Creative Win-Wins',
    'Preventing Scope Creep',
    'Reframing Objections',
    'Concise Framing'
  ];

  const durations = [
    { mins: 5, label: '5 min', desc: 'Quick Spar' },
    { mins: 10, label: '10 min', desc: 'Full Session', recommended: true },
    { mins: 15, label: '15 min', desc: 'Deep Negotiation' }
  ];

  const toggleFocus = (item: string) => {
    if (selectedFocusAreas.includes(item)) {
      if (selectedFocusAreas.length > 1) {
        setSelectedFocusAreas(selectedFocusAreas.filter((f) => f !== item));
      }
    } else {
      setSelectedFocusAreas([...selectedFocusAreas, item]);
    }
  };

  const handleStart = () => {
    navigation.navigate('LiveRehearsal', {
      title,
      strategy,
      initialReply,
      persona: selectedPersona,
      duration: selectedDuration,
      focusAreas: selectedFocusAreas,
      voiceEnabled
    });
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
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Rehearsal Setup</Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
            Configure simulation difficulty & parameters
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Counterpart Demeanor */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>
            COUNTERPART DEMEANOR & RIGOR
          </Text>
          <View style={styles.personaGrid}>
            {personas.map((p) => {
              const isSelected = selectedPersona === p.id;
              const IconComp = p.icon;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.personaCard,
                    elevation.sm,
                    {
                      backgroundColor: isSelected
                        ? themeColors.primarySubtle
                        : themeColors.surfaceCard,
                      borderColor: isSelected
                        ? themeColors.primary
                        : themeColors.surfaceBorder
                    }
                  ]}
                  onPress={() => setSelectedPersona(p.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.personaTop}>
                    <View
                      style={[
                        styles.personaIconWrap,
                        {
                          backgroundColor: isSelected
                            ? themeColors.primary
                            : themeColors.surfaceElevated
                        }
                      ]}
                    >
                      <IconComp
                        size={16}
                        color={isSelected ? themeColors.textInverse : themeColors.textSecondary}
                      />
                    </View>
                    {p.recommended && (
                      <View style={[styles.recBadge, { backgroundColor: themeColors.primary }]}>
                        <Text style={[styles.recBadgeText, { color: themeColors.textInverse }]}>
                          RECOMMENDED
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.personaName,
                      { color: isSelected ? themeColors.primary : themeColors.textPrimary }
                    ]}
                  >
                    {p.name}
                  </Text>
                  <Text style={[styles.personaLabel, { color: themeColors.textSecondary }]}>
                    {p.label}
                  </Text>
                  <Text style={[styles.personaDesc, { color: themeColors.textSecondary }]}>
                    {p.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section: Focus Areas */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>
            TARGET DRILL FOCUS AREAS
          </Text>
          <View style={styles.chipsWrap}>
            {focusOptions.map((item) => {
              const isSelected = selectedFocusAreas.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.focusChip,
                    {
                      backgroundColor: isSelected
                        ? themeColors.primarySubtle
                        : themeColors.surfaceCard,
                      borderColor: isSelected
                        ? themeColors.primary
                        : themeColors.surfaceBorder
                    }
                  ]}
                  onPress={() => toggleFocus(item)}
                  activeOpacity={0.7}
                >
                  {isSelected && (
                    <Check
                      size={13}
                      color={themeColors.primary}
                      style={{ marginRight: 5 }}
                    />
                  )}
                  <Text
                    style={[
                      styles.focusChipText,
                      {
                        color: isSelected
                          ? themeColors.primary
                          : themeColors.textPrimary,
                        fontWeight: isSelected ? '700' : '500'
                      }
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section: Session Duration */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>
            SESSION DURATION
          </Text>
          <View style={styles.durationRow}>
            {durations.map((d) => {
              const isSelected = selectedDuration === d.mins;
              return (
                <TouchableOpacity
                  key={d.mins}
                  style={[
                    styles.durationCard,
                    elevation.sm,
                    {
                      backgroundColor: isSelected
                        ? themeColors.primarySubtle
                        : themeColors.surfaceCard,
                      borderColor: isSelected
                        ? themeColors.primary
                        : themeColors.surfaceBorder
                    }
                  ]}
                  onPress={() => setSelectedDuration(d.mins)}
                  activeOpacity={0.8}
                >
                  <Clock
                    size={16}
                    color={isSelected ? themeColors.primary : themeColors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.durationTime,
                      { color: isSelected ? themeColors.primary : themeColors.textPrimary }
                    ]}
                  >
                    {d.label}
                  </Text>
                  <Text style={[styles.durationDesc, { color: themeColors.textSecondary }]}>
                    {d.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section: Audio Interaction Mode */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>
            AUDIO SIMULATION MODE
          </Text>
          <TouchableOpacity
            style={[
              styles.audioToggleCard,
              elevation.sm,
              {
                backgroundColor: themeColors.surfaceCard,
                borderColor: themeColors.surfaceBorder
              }
            ]}
            onPress={() => setVoiceEnabled(!voiceEnabled)}
            activeOpacity={0.8}
          >
            <View style={[styles.audioIconBox, { backgroundColor: themeColors.primarySubtle }]}>
              <Mic size={18} color={themeColors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.audioTitle, { color: themeColors.textPrimary }]}>
                Voice-Enabled Realistic Spoken Audio
              </Text>
              <Text style={[styles.audioSubtitle, { color: themeColors.textSecondary }]}>
                Live waveform with adaptive speech responses
              </Text>
            </View>
            <View
              style={[
                styles.toggleTrack,
                {
                  backgroundColor: voiceEnabled
                    ? themeColors.primary
                    : themeColors.surfaceElevated
                }
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  {
                    backgroundColor: '#FFFFFF',
                    transform: [{ translateX: voiceEnabled ? 16 : 2 }]
                  }
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: themeColors.primary }]}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Text style={[styles.startBtnText, { color: themeColors.textInverse }]}>
            Enter Rehearsal Simulation
          </Text>
          <ArrowRight size={18} color={themeColors.textInverse} style={{ marginLeft: 8 }} />
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40
  },
  section: {
    marginBottom: 22
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  personaGrid: {
    gap: 10
  },
  personaCard: {
    borderRadius: RADII.md,
    borderWidth: 1.5,
    padding: 14
  },
  personaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  personaIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  recBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  recBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  personaName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2
  },
  personaLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4
  },
  personaDesc: {
    fontSize: 12,
    lineHeight: 16
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1
  },
  focusChipText: {
    fontSize: 13
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10
  },
  durationCard: {
    flex: 1,
    borderRadius: RADII.sm,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center'
  },
  durationTime: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2
  },
  durationDesc: {
    fontSize: 11,
    textAlign: 'center'
  },
  audioToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 14
  },
  audioIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  audioTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2
  },
  audioSubtitle: {
    fontSize: 11
  },
  toggleTrack: {
    width: 40,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    marginLeft: 10
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10
  },
  startBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: '700'
  }
});

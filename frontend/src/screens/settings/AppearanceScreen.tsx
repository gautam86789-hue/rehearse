import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform
} from 'react-native';
import {
  Moon,
  Sun,
  Smartphone,
  Check,
  ChevronLeft
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, ThemeMode, ACCENT_PALETTES, RADII } from '../../context/ThemeContext';
import { InAppNotification, NotificationType } from '../../components/common/InAppNotification';
import { setHapticsEnabled as persistHapticsEnabled, getHapticsEnabled, hapticImpact } from '../../services/haptics';

export const AppearanceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    themeMode,
    setThemeMode,
    accentColor,
    setAccentColor,
    colors: themeColors,
    isDark,
    availableAccents,
    elevation
  } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const PRIMARY_ACCENTS = availableAccents.map((hex) => ({
    id: hex,
    name: ACCENT_PALETTES[hex].name,
    hex
  }));

  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  useEffect(() => {
    getHapticsEnabled().then(setHapticsEnabled);
  }, []);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: NotificationType;
  }>({ visible: false, message: '', type: 'info' });

  const handleSelectTheme = async (mode: ThemeMode) => {
    await setThemeMode(mode);
    setToast({
      visible: true,
      message: `Switched to ${mode === 'system' ? 'System Default' : mode.charAt(0).toUpperCase() + mode.slice(1)} theme.`,
      type: 'info'
    });
  };

  const handleSelectAccent = async (hex: string, name: string) => {
    await setAccentColor(hex);
    setToast({
      visible: true,
      message: `${name} accent selected.`,
      type: 'success'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.surfaceBorder, paddingTop: topPadding }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Appearance</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Theme */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>THEME</Text>
          
          {/* Visual Cards: Light & Dark Side-by-Side */}
          <View style={styles.themeCardsRow}>
            {/* Light Card */}
            <TouchableOpacity
              style={[
                styles.previewCard,
                elevation.sm,
                { backgroundColor: '#F7F7FC', borderColor: themeColors.surfaceBorder },
                themeMode === 'light' && { borderColor: themeColors.primary, borderWidth: 2 }
              ]}
              onPress={() => handleSelectTheme('light')}
              activeOpacity={0.85}
            >
              <View style={styles.previewCardBody} pointerEvents="none">
                <View style={[styles.miniBar, { backgroundColor: '#ECEBF7' }]}>
                  <View style={[styles.miniDot, { backgroundColor: '#5B5FEF' }]} />
                </View>
                <View style={[styles.miniBubble, { backgroundColor: '#FFFFFF' }]} />
                <View style={[styles.miniBubble, { backgroundColor: '#ECEBF7', alignSelf: 'flex-end', width: '60%' }]} />
              </View>

              <View style={styles.previewCardFooter} pointerEvents="none">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Sun size={14} color="#1A1B25" />
                  <Text style={[styles.previewCardLabel, { color: '#1A1B25' }]}>Light</Text>
                </View>
                {themeMode === 'light' && (
                  <View style={[styles.checkPill, { backgroundColor: themeColors.primary }]}>
                    <Check size={11} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Dark Card */}
            <TouchableOpacity
              style={[
                styles.previewCard,
                elevation.sm,
                { backgroundColor: '#12121F', borderColor: themeColors.surfaceBorder },
                themeMode === 'dark' && { borderColor: themeColors.primary, borderWidth: 2 }
              ]}
              onPress={() => handleSelectTheme('dark')}
              activeOpacity={0.85}
            >
              <View style={styles.previewCardBody} pointerEvents="none">
                <View style={[styles.miniBar, { backgroundColor: '#242438' }]}>
                  <View style={[styles.miniDot, { backgroundColor: '#8B8FF5' }]} />
                </View>
                <View style={[styles.miniBubble, { backgroundColor: '#1E1E32' }]} />
                <View style={[styles.miniBubble, { backgroundColor: '#242438', alignSelf: 'flex-end', width: '60%' }]} />
              </View>

              <View style={styles.previewCardFooter} pointerEvents="none">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Moon size={14} color="#F1F1F7" />
                  <Text style={[styles.previewCardLabel, { color: '#F1F1F7' }]}>Dark</Text>
                </View>
                {themeMode === 'dark' && (
                  <View style={[styles.checkPill, { backgroundColor: themeColors.primary }]}>
                    <Check size={11} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* System Default Option Row */}
          <TouchableOpacity
            style={[
              styles.systemRow,
              elevation.sm,
              { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder },
              themeMode === 'system' && { borderColor: themeColors.primary, borderWidth: 1.5 }
            ]}
            onPress={() => handleSelectTheme('system')}
            activeOpacity={0.75}
          >
            <View style={styles.systemLeft}>
              <View style={[styles.systemIconCircle, { backgroundColor: themeColors.primarySubtle }]}>
                <Smartphone size={16} color={themeColors.primary} />
              </View>
              <View>
                <Text style={[styles.systemTitle, { color: themeColors.textPrimary }]}>System Default</Text>
                <Text style={[styles.systemSub, { color: themeColors.textSecondary }]}>Follow your device appearance</Text>
              </View>
            </View>
            {themeMode === 'system' && (
              <View style={[styles.checkPill, { backgroundColor: themeColors.primary }]}>
                <Check size={11} color={themeColors.textInverse} strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Section: Accent Color */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>ACCENT</Text>

          <View style={[styles.cardGroup, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            {PRIMARY_ACCENTS.map((accent, index) => {
              const isSelected = accentColor === accent.hex;
              return (
                <TouchableOpacity
                  key={accent.id}
                  style={[
                    styles.accentItemRow,
                    index < PRIMARY_ACCENTS.length - 1 && { borderBottomColor: themeColors.surfaceBorder, borderBottomWidth: 1 }
                  ]}
                  onPress={() => handleSelectAccent(accent.hex, accent.name)}
                  activeOpacity={0.75}
                >
                  <View style={styles.accentLeft}>
                    <View style={[styles.swatchCircle, { backgroundColor: accent.hex }]}>
                      {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                    <Text style={[styles.accentName, { color: themeColors.textPrimary }]}>{accent.name}</Text>
                  </View>
                  {isSelected && (
                    <Text style={[styles.activeAccentLabel, { color: themeColors.primary }]}>Active</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section: Haptics */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>TACTILE</Text>

          <View style={[styles.cardGroup, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleTitle, { color: themeColors.textPrimary }]}>Haptic Feedback</Text>
                <Text style={[styles.toggleSub, { color: themeColors.textSecondary }]}>Vibration pulses on turn transitions</Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={(val) => {
                  setHapticsEnabled(val);
                  persistHapticsEnabled(val);
                  // Give an immediate felt difference when turning it on —
                  // otherwise "enabled" is just a label with nothing to
                  // confirm it actually did something.
                  if (val) hapticImpact();
                  setToast({
                    visible: true,
                    message: `Haptic feedback ${val ? 'enabled' : 'disabled'}.`,
                    type: 'info'
                  });
                }}
                trackColor={{ false: themeColors.surfaceElevated, true: themeColors.primary }}
                thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* In-App Toast */}
      <InAppNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
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
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitleContainer: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  section: {
    marginBottom: 24
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase'
  },
  themeCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  previewCard: {
    flex: 1,
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 12,
    height: 140,
    justifyContent: 'space-between'
  },
  previewCardBody: {
    height: 76,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'space-between'
  },
  miniBar: {
    height: 10,
    borderRadius: 3,
    paddingHorizontal: 4,
    justifyContent: 'center',
    width: '40%'
  },
  miniDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5
  },
  miniBubble: {
    height: 16,
    borderRadius: 5,
    width: '75%'
  },
  previewCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6
  },
  previewCardLabel: {
    fontSize: 14,
    fontWeight: '600'
  },
  checkPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: RADII.md,
    borderWidth: 1
  },
  systemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  systemIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  systemTitle: {
    fontSize: 14.5,
    fontWeight: '600'
  },
  systemSub: {
    fontSize: 12,
    marginTop: 2
  },
  cardGroup: {
    borderRadius: RADII.md,
    borderWidth: 1,
    overflow: 'hidden'
  },
  accentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  accentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  swatchCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center'
  },
  accentName: {
    fontSize: 14.5,
    fontWeight: '600'
  },
  activeAccentLabel: {
    fontSize: 12,
    fontWeight: '700'
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  toggleTitle: {
    fontSize: 14.5,
    fontWeight: '600'
  },
  toggleSub: {
    fontSize: 12,
    marginTop: 2
  }
});

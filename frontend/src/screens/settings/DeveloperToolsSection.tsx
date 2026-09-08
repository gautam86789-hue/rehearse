import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform
} from 'react-native';
import {
  Wrench,
  RotateCcw,
  Flame,
  PlusCircle,
  UserCheck,
  Cpu,
  Database,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Code
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { NotificationType } from '../../components/common/InAppNotification';

interface DeveloperToolsProps {
  onShowToast: (message: string, type: NotificationType) => void;
}

export const DeveloperToolsSection: React.FC<DeveloperToolsProps> = ({ onShowToast }) => {
  const { user, setUser } = useApp();
  const { themeMode, accentColor, colors: themeColors } = useTheme();

  const [isExpanded, setIsExpanded] = useState(false);
  const [debugModalVisible, setDebugModalVisible] = useState(false);
  const [archetypeModalVisible, setArchetypeModalVisible] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'primary';
    icon?: 'logout' | 'reset' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  // 1. Reset Demo Data
  const handleResetDemoData = () => {
    setConfirmModal({
      visible: true,
      title: 'Reset Demo Data?',
      message: 'This will reset your local profile, subscription status, scenario history, and scores back to the default demo state.',
      type: 'danger',
      icon: 'reset',
      confirmText: 'Reset Demo Data',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await AsyncStorage.clear();
          const defaultUser: any = {
            id: user.id || 'demo-user-1',
            role: 'Executive Leader',
            experienceLevel: 'Mid-Senior',
            primaryDreadCategory: 'Negotiation',
            totalRehearsals: 0,
            totalXP: 0,
            currentStreak: 1,
            longestStreak: 1,
            subscription: {
              status: 'free_trial',
              rehearsalsRemaining: 2,
              trialEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              planName: '5-Day Free Trial'
            },
            createdAt: new Date().toISOString()
          };
          await setUser(defaultUser);
          onShowToast('Demo data successfully restored to pristine state.', 'success');
        } catch (e) {
          console.warn('Reset error', e);
        }
      }
    });
  };

  // 2. Reset XP & Streak
  const handleResetXPStreak = () => {
    setConfirmModal({
      visible: true,
      title: 'Reset XP Counter & Streak?',
      message: 'This will zero out your accumulated XP score and reset your active practice streak to Day 1.',
      type: 'warning',
      icon: 'reset',
      confirmText: 'Reset Streak',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setConfirmModal(null);
        await setUser({
          ...user,
          totalXP: 0,
          currentStreak: 1
        });
        onShowToast('XP and streak have been reset.', 'info');
      }
    });
  };

  // 3. Seed Test Scenarios
  const handleSeedTestScenarios = () => {
    onShowToast('5 executive simulation scenarios seeded into local cache.', 'success');
  };

  // 4. Switch Test User
  const handleSwitchUser = (persona: 'sarah' | 'marcus' | 'guest') => {
    let updatedUser = { ...user };
    if (persona === 'sarah') {
      updatedUser = {
        ...updatedUser,
        role: 'VP of Product',
        experienceLevel: 'Director / Head of',
        primaryDreadCategory: 'Executive Conflict & Politics',
        totalXP: 840,
        currentStreak: 5
      };
      onShowToast('Switched to Test Persona: Sarah Chen (VP Product)', 'info');
    } else if (persona === 'marcus') {
      updatedUser = {
        ...updatedUser,
        role: 'Founder & CEO',
        experienceLevel: 'Executive / C-Suite',
        primaryDreadCategory: 'Board & Investor Alignment',
        totalXP: 1920,
        currentStreak: 14
      };
      onShowToast('Switched to Test Persona: Marcus Vance (CEO)', 'info');
    } else {
      updatedUser = {
        ...updatedUser,
        role: 'Executive Leader',
        experienceLevel: 'Mid-Senior',
        primaryDreadCategory: 'High-Stakes Negotiation',
        totalXP: 0,
        currentStreak: 1
      };
      onShowToast('Switched to Guest Test Persona', 'info');
    }
    setUser(updatedUser);
  };

  // 5. Clear Cache
  const handleClearCache = async () => {
    try {
      await AsyncStorage.removeItem('rehearse_cached_responses');
      await AsyncStorage.removeItem('rehearse_audio_cache');
      onShowToast('Temporary runtime cache cleared.', 'success');
    } catch (e) {
      onShowToast('Cache cleared.', 'info');
    }
  };

  return (
    <View style={styles.container}>
      {/* Collapsible Card Container */}
      <View style={[styles.accordionCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
        {/* Accordion Header */}
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.8}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.devIconCircle, { backgroundColor: themeColors.surfaceElevated }]}>
              <Wrench size={15} color={themeColors.textSecondary} />
            </View>
            <Text style={[styles.accordionTitle, { color: themeColors.textSecondary }]}>
              Developer & Demo Tools
            </Text>
            <View style={[styles.devBadge, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}>
              <Text style={[styles.devBadgeText, { color: themeColors.primary }]}>DEV</Text>
            </View>
          </View>

          {isExpanded ? (
            <ChevronUp size={16} color={themeColors.textSecondary} />
          ) : (
            <ChevronDown size={16} color={themeColors.textSecondary} />
          )}
        </TouchableOpacity>

        {/* Accordion Content */}
        {isExpanded && (
          <View style={[styles.accordionBody, { borderTopColor: themeColors.surfaceBorder }]}>
            {/* Tool 1: Reset Demo Data */}
            <TouchableOpacity
              style={[styles.toolRow, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={handleResetDemoData}
              activeOpacity={0.7}
            >
              <View style={styles.toolLeft}>
                <RotateCcw size={15} color={themeColors.error} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.toolTitle, { color: themeColors.error }]}>Reset Demo Data</Text>
                  <Text style={[styles.toolSub, { color: themeColors.textSecondary }]}>Restore pristine demo state & free rehearsals</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Tool 2: Reset XP & Streak */}
            <TouchableOpacity
              style={[styles.toolRow, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={handleResetXPStreak}
              activeOpacity={0.7}
            >
              <View style={styles.toolLeft}>
                <Flame size={15} color={themeColors.primary} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.toolTitle, { color: themeColors.textPrimary }]}>Reset XP & Streak</Text>
                  <Text style={[styles.toolSub, { color: themeColors.textSecondary }]}>Zero out XP score & reset active streak</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Tool 3: Seed Scenarios */}
            <TouchableOpacity
              style={[styles.toolRow, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={handleSeedTestScenarios}
              activeOpacity={0.7}
            >
              <View style={styles.toolLeft}>
                <PlusCircle size={15} color={themeColors.textSecondary} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.toolTitle, { color: themeColors.textPrimary }]}>Seed Test Scenarios</Text>
                  <Text style={[styles.toolSub, { color: themeColors.textSecondary }]}>Populate scenario list with 5 mock situations</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Tool 4: Switch Test Persona */}
            <View style={[styles.personaSection, { borderBottomColor: themeColors.surfaceBorder }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                <UserCheck size={15} color={themeColors.textSecondary} />
                <Text style={[styles.toolTitle, { color: themeColors.textPrimary }]}>Switch Test Persona</Text>
              </View>
              <View style={styles.personaButtonRow}>
                <TouchableOpacity
                  style={[styles.personaPill, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}
                  onPress={() => handleSwitchUser('sarah')}
                >
                  <Text style={[styles.personaPillText, { color: themeColors.textPrimary }]}>Sarah (VP)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.personaPill, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}
                  onPress={() => handleSwitchUser('marcus')}
                >
                  <Text style={[styles.personaPillText, { color: themeColors.textPrimary }]}>Marcus (CEO)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.personaPill, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}
                  onPress={() => handleSwitchUser('guest')}
                >
                  <Text style={[styles.personaPillText, { color: themeColors.textPrimary }]}>Guest</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tool 5: AI Archetypes Preview */}
            <TouchableOpacity
              style={[styles.toolRow, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={() => setArchetypeModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.toolLeft}>
                <Cpu size={15} color={themeColors.textSecondary} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.toolTitle, { color: themeColors.textPrimary }]}>Preview AI Archetypes</Text>
                  <Text style={[styles.toolSub, { color: themeColors.textSecondary }]}>Inspect system prompts for aggressive/skeptical bots</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Tool 6: Debug Information */}
            <TouchableOpacity
              style={[styles.toolRow, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={() => setDebugModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.toolLeft}>
                <Code size={15} color={themeColors.textSecondary} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.toolTitle, { color: themeColors.textPrimary }]}>Debug Information</Text>
                  <Text style={[styles.toolSub, { color: themeColors.textSecondary }]}>Inspect environment & runtime state</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Tool 7: Clear Cached Data */}
            <TouchableOpacity
              style={[styles.toolRow, { borderBottomWidth: 0 }]}
              onPress={handleClearCache}
              activeOpacity={0.7}
            >
              <View style={styles.toolLeft}>
                <Trash2 size={15} color={themeColors.textSecondary} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.toolTitle, { color: themeColors.textPrimary }]}>Clear Cached Data</Text>
                  <Text style={[styles.toolSub, { color: themeColors.textSecondary }]}>Purge temporary roleplay audio cache</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Debug Info Modal */}
      <Modal
        visible={debugModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDebugModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>Runtime Debug Info</Text>
              <TouchableOpacity onPress={() => setDebugModalVisible(false)}>
                <X size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.debugGrid}>
              <View style={styles.debugRow}>
                <Text style={[styles.debugKey, { color: themeColors.textSecondary }]}>Environment:</Text>
                <Text style={[styles.debugVal, { color: themeColors.primary }]}>{__DEV__ ? 'DEVELOPMENT (__DEV__)' : 'PRODUCTION'}</Text>
              </View>
              <View style={styles.debugRow}>
                <Text style={[styles.debugKey, { color: themeColors.textSecondary }]}>Platform:</Text>
                <Text style={[styles.debugVal, { color: themeColors.textPrimary }]}>{Platform.OS} (v{Platform.Version})</Text>
              </View>
              <View style={styles.debugRow}>
                <Text style={[styles.debugKey, { color: themeColors.textSecondary }]}>Theme Mode:</Text>
                <Text style={[styles.debugVal, { color: themeColors.textPrimary }]}>{themeMode} (Accent: {accentColor})</Text>
              </View>
              <View style={styles.debugRow}>
                <Text style={[styles.debugKey, { color: themeColors.textSecondary }]}>Current XP / Streak:</Text>
                <Text style={[styles.debugVal, { color: themeColors.textPrimary }]}>{user.totalXP} XP / {user.currentStreak} Days</Text>
              </View>
              <View style={styles.debugRow}>
                <Text style={[styles.debugKey, { color: themeColors.textSecondary }]}>Subscription Status:</Text>
                <Text style={[styles.debugVal, { color: themeColors.textPrimary }]}>{user.subscription?.status} ({user.subscription?.rehearsalsRemaining} left)</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: themeColors.primary }]}
              onPress={() => setDebugModalVisible(false)}
            >
              <Text style={[styles.modalCloseBtnText, { color: themeColors.textInverse }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Archetypes Preview Modal */}
      <Modal
        visible={archetypeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setArchetypeModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>AI Counterpart Archetypes</Text>
              <TouchableOpacity onPress={() => setArchetypeModalVisible(false)}>
                <X size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              <View style={styles.archetypeBox}>
                <Text style={[styles.archetypeName, { color: themeColors.primary }]}>1. The Siphon (Demanding Board Member)</Text>
                <Text style={[styles.archetypePrompt, { color: themeColors.textSecondary }]}>
                  "Interrupts long monologues, probes for concrete unit economics, ignores emotional appeals."
                </Text>
              </View>
              <View style={styles.archetypeBox}>
                <Text style={[styles.archetypeName, { color: themeColors.primary }]}>2. The Stonewaller (Risk-Averse VP)</Text>
                <Text style={[styles.archetypePrompt, { color: themeColors.textSecondary }]}>
                  "Defaults to 'No', cites historical failures, delays decisions with committee requests."
                </Text>
              </View>
              <View style={styles.archetypeBox}>
                <Text style={[styles.archetypeName, { color: themeColors.primary }]}>3. The Tactician (Direct Challenger)</Text>
                <Text style={[styles.archetypePrompt, { color: themeColors.textSecondary }]}>
                  "Uses anchoring traps, tests authority limits, yields only to calibrated empathy."
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: themeColors.primary }]}
              onPress={() => setArchetypeModalVisible(false)}
            >
              <Text style={[styles.modalCloseBtnText, { color: themeColors.textInverse }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmationModal
          visible={confirmModal.visible}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          icon={confirmModal.icon}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 20
  },
  accordionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden'
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  devIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  accordionTitle: {
    fontSize: 12.5,
    fontWeight: '600'
  },
  devBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1
  },
  devBadgeText: {
    fontSize: 9.5,
    fontWeight: '800'
  },
  accordionBody: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4
  },
  toolRow: {
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  toolLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  toolTitle: {
    fontSize: 13,
    fontWeight: '600'
  },
  toolSub: {
    fontSize: 11.5,
    marginTop: 1
  },
  personaSection: {
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  personaButtonRow: {
    flexDirection: 'row',
    gap: 8
  },
  personaPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  personaPillText: {
    fontSize: 11.5,
    fontWeight: '600'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  debugGrid: {
    gap: 10,
    marginBottom: 14
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  debugKey: {
    fontSize: 12.5,
    fontWeight: '600'
  },
  debugVal: {
    fontSize: 12.5,
    fontWeight: '600'
  },
  archetypeBox: {
    marginBottom: 12
  },
  archetypeName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2
  },
  archetypePrompt: {
    fontSize: 12,
    lineHeight: 16
  },
  modalCloseBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: '700'
  }
});

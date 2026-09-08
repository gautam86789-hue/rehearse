import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {
  Palette,
  Shield,
  User,
  CreditCard,
  Lock,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight
} from 'lucide-react-native';

import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components/common/Header';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { InAppNotification, NotificationType } from '../components/common/InAppNotification';
import { DeveloperToolsSection } from './settings/DeveloperToolsSection';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useApp();
  const { signOut } = useAuth();
  const { themeMode, colors: themeColors } = useTheme();

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

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: NotificationType;
  }>({ visible: false, message: '', type: 'info' });

  const showToast = (message: string, type: NotificationType) => {
    setToast({ visible: true, message, type });
  };

  const handleSignOut = () => {
    setConfirmModal({
      visible: true,
      title: 'Sign Out?',
      message: 'Are you sure you want to sign out of your Rehearse account?',
      type: 'danger',
      icon: 'logout',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setConfirmModal(null);
        await signOut();
      }
    });
  };

  const formatThemeName = (mode: string) => {
    if (mode === 'dark') return 'Dark';
    if (mode === 'light') return 'Light';
    return 'System';
  };

  const formatPlanName = () => {
    if (user.subscription?.status === 'free_trial') return 'Free Trial';
    if (user.subscription?.status === 'active_annual' || user.subscription?.status === 'active_monthly') return 'Plus';
    return user.subscription?.planName || 'Free';
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header
        title="Settings"
        rightAction="more"
        navigation={navigation}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <View style={styles.titleHeader}>
          <Text style={[styles.mainTitle, { color: themeColors.textPrimary }]}>Settings</Text>
          <Text style={[styles.mainSubtitle, { color: themeColors.textSecondary }]}>
            Manage your Rehearse experience.
          </Text>
        </View>

        {/* 1. PREFERENCES */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>PREFERENCES</Text>
          <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => navigation.navigate('Appearance')}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Appearance</Text>
              <View style={styles.rowRight}>
                <Text style={[styles.rowValueText, { color: themeColors.textSecondary }]}>
                  {formatThemeName(themeMode)}
                </Text>
                <ChevronRight size={16} color={themeColors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. ACCOUNT */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>ACCOUNT</Text>
          <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={() => navigation.navigate('AccountSecurity')}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Account & Security</Text>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => navigation.navigate('ExecutiveProfile')}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Executive Profile</Text>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. PLAN */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>PLAN</Text>
          <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => navigation.navigate('MembershipBilling')}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Membership & Billing</Text>
              <View style={styles.rowRight}>
                <Text style={[styles.rowValueText, { color: themeColors.textSecondary }]}>
                  {formatPlanName()}
                </Text>
                <ChevronRight size={16} color={themeColors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. PRIVACY */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>PRIVACY</Text>
          <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => navigation.navigate('PrivacyData')}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Privacy & Data</Text>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. SUPPORT */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>SUPPORT</Text>
          <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={() => showToast('Support is available at rehearse.ai/help', 'info')}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Help & Support</Text>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => navigation.navigate('AboutRehearse')}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>About Rehearse</Text>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. ACCOUNT ACTIONS */}
        <View style={styles.section}>
          <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowLabel, { color: themeColors.error }]}>Sign Out</Text>
              <LogOut size={16} color={themeColors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 7. DEVELOPER & DEMO TOOLS (Development/Demo builds only) */}
        {__DEV__ && <DeveloperToolsSection onShowToast={showToast} />}
      </ScrollView>

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

      {/* In-App Notification Banner */}
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110
  },
  titleHeader: {
    marginBottom: 20
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  mainSubtitle: {
    fontSize: 14,
    marginTop: 4
  },
  section: {
    marginBottom: 20
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase'
  },
  cardGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    minHeight: 50
  },
  rowLabel: {
    fontSize: 14.5,
    fontWeight: '500'
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  rowValueText: {
    fontSize: 13.5,
    fontWeight: '500'
  }
});

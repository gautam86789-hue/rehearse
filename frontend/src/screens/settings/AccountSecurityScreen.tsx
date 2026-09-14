import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import {
  Mail,
  Key,
  Smartphone,
  Lock,
  Shield,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme, RADII } from '../../context/ThemeContext';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { InAppNotification, NotificationType } from '../../components/common/InAppNotification';

export const AccountSecurityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user: authUser, signOut } = useAuth();
  const { colors: themeColors, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

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

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setToast({
        visible: true,
        message: 'Password must be at least 6 characters.',
        type: 'error'
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({
        visible: true,
        message: 'Passwords do not match.',
        type: 'error'
      });
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordModalVisible(false);
      setNewPassword('');
      setConfirmPassword('');
      setToast({
        visible: true,
        message: 'Password updated successfully.',
        type: 'success'
      });
    }, 700);
  };

  const handleToggle2FA = () => {
    const nextState = !twoFactorEnabled;
    setTwoFactorEnabled(nextState);
    setToast({
      visible: true,
      message: `Two-Factor Authentication turned ${nextState ? 'On' : 'Off'}.`,
      type: 'info'
    });
  };

  const handleExportData = () => {
    setToast({
      visible: true,
      message: 'Preparing your data archive. Download link sent to your registered email.',
      type: 'info'
    });
  };

  const handleDeleteAccount = () => {
    setConfirmModal({
      visible: true,
      title: 'Delete Account Permanently?',
      message: 'This will permanently remove your account, rehearsal history, scores, and active subscriptions. This cannot be undone.',
      type: 'danger',
      icon: 'warning',
      confirmText: 'Delete Account',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setConfirmModal(null);
        await signOut();
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.surfaceBorder, paddingTop: topPadding }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <ChevronLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Account & Security</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>ACCOUNT</Text>

          <View style={[styles.cardGroup, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            {/* Primary Email */}
            <View style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}>
              <View style={styles.rowLeft}>
                <Mail size={16} color={themeColors.textSecondary} />
                <View>
                  <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Primary Email</Text>
                  <Text style={[styles.rowValue, { color: themeColors.textSecondary }]}>
                    {authUser?.email || 'example@rehearse.ai'}
                  </Text>
                </View>
              </View>
              <View style={[styles.badgePill, { backgroundColor: themeColors.primarySubtle }]}>
                <CheckCircle2 size={11} color={themeColors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { color: themeColors.primary }]}>Verified</Text>
              </View>
            </View>

            {/* Authentication Provider */}
            <View style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}>
              <View style={styles.rowLeft}>
                <Shield size={16} color={themeColors.textSecondary} />
                <View>
                  <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Authentication</Text>
                  <Text style={[styles.rowValue, { color: themeColors.textSecondary }]}>
                    Google / Microsoft / Email
                  </Text>
                </View>
              </View>
            </View>

            {/* Password */}
            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => setPasswordModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Key size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Change Password</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Security */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>SECURITY</Text>

          <View style={[styles.cardGroup, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            {/* 2FA */}
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={handleToggle2FA}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Lock size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Two-Factor Authentication</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={[styles.rowSubValue, { color: twoFactorEnabled ? themeColors.primary : themeColors.textSecondary }]}>
                  {twoFactorEnabled ? 'On' : 'Off'}
                </Text>
                <ChevronRight size={16} color={themeColors.textMuted} />
              </View>
            </TouchableOpacity>

            {/* Active Sessions */}
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <View style={styles.rowLeft}>
                <Smartphone size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Active Sessions</Text>
              </View>
              <Text style={[styles.rowSubValue, { color: themeColors.textSecondary }]}>1 active device</Text>
            </View>
          </View>
        </View>

        {/* Section 3: Privacy & Data */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>PRIVACY & DATA</Text>

          <View style={[styles.cardGroup, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            {/* Privacy & Data Link */}
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={() => navigation.navigate('PrivacyData')}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Shield size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Privacy & Data</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>

            {/* Export My Data */}
            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={handleExportData}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Download size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Export My Data</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 4: Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.error }]}>DANGER ZONE</Text>

          <View style={[styles.cardGroup, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: 'rgba(224, 109, 83, 0.25)' }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Trash2 size={16} color={themeColors.error} />
                <Text style={[styles.rowLabel, { color: themeColors.error }]}>Delete Account</Text>
              </View>
              <ChevronRight size={16} color={themeColors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <X size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>New Password</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder, color: themeColors.textPrimary }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter at least 6 characters"
              placeholderTextColor={themeColors.textMuted}
              secureTextEntry
            />

            <Text style={[styles.inputLabel, { color: themeColors.textSecondary, marginTop: 12 }]}>Confirm Password</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder, color: themeColors.textPrimary }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              placeholderTextColor={themeColors.textMuted}
              secureTextEntry
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPasswordModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: themeColors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: themeColors.primary }]}
                onPress={handleUpdatePassword}
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <ActivityIndicator size="small" color={themeColors.textInverse} />
                ) : (
                  <Text style={[styles.modalSaveText, { color: themeColors.textInverse }]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
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
  cardGroup: {
    borderRadius: RADII.md,
    borderWidth: 1,
    overflow: 'hidden'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    minHeight: 50
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  rowLabel: {
    fontSize: 14.5,
    fontWeight: '500'
  },
  rowValue: {
    fontSize: 12.5,
    marginTop: 2
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  rowSubValue: {
    fontSize: 13.5,
    fontWeight: '500'
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700'
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
    maxWidth: 380,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700'
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6
  },
  modalInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600'
  },
  modalSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '700'
  }
});

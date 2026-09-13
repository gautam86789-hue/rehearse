import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal
} from 'react-native';
import {
  History,
  Mic,
  MessageSquare,
  BarChart2,
  ShieldCheck,
  Download,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, RADII } from '../../context/ThemeContext';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { InAppNotification, NotificationType } from '../../components/common/InAppNotification';

export const PrivacyDataScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const [infoModal, setInfoModal] = useState<{
    title: string;
    description: string;
  } | null>(null);

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

  const handleExportData = () => {
    setToast({
      visible: true,
      message: 'Export archive generated. Download link sent to your registered email.',
      type: 'info'
    });
  };

  const handleDeleteData = () => {
    setConfirmModal({
      visible: true,
      title: 'Delete All Rehearsal Data?',
      message: 'This will permanently remove all scenario recordings, conversation transcripts, and scorecard metrics from your account.',
      type: 'danger',
      icon: 'reset',
      confirmText: 'Delete Data',
      cancelText: 'Cancel',
      onConfirm: () => {
        setConfirmModal(null);
        setToast({
          visible: true,
          message: 'All rehearsal data has been permanently cleared.',
          type: 'success'
        });
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
        >
          <ChevronLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Privacy & Data</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Your Data */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>YOUR DATA</Text>

          <View style={[styles.cardGroup, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            {/* Rehearsal History */}
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={() => setInfoModal({
                title: 'Rehearsal History',
                description: 'Stores metadata for your completed sessions, including scenario dates, completion durations, and aggregate competency scores.'
              })}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <History size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Rehearsal History</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>

            {/* Audio Recordings */}
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={() => setInfoModal({
                title: 'Audio Recordings',
                description: 'Temporary voice files generated during active speech sessions. Voice audio is processed in real time and can be purged at any time.'
              })}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Mic size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Audio Recordings</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>

            {/* Conversation Transcripts */}
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={() => setInfoModal({
                title: 'Conversation Transcripts',
                description: 'Turn-by-turn dialogue records used exclusively to calculate tactical feedback and generate coaching recommendations.'
              })}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <MessageSquare size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Conversation Transcripts</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>

            {/* AI Analysis Data */}
            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => setInfoModal({
                title: 'AI Analysis Data',
                description: 'Rubric scores, tactical empathy breakdown, and growth takeaway metrics associated with your executive profile.'
              })}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <BarChart2 size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>AI Analysis Data</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: AI Privacy */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>AI PRIVACY</Text>

          <View style={[styles.trainingCard, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <View style={styles.trainingHeader}>
              <View style={[styles.shieldCircle, { backgroundColor: themeColors.primarySubtle }]}>
                <ShieldCheck size={18} color={themeColors.primary} />
              </View>
              <Text style={[styles.trainingTitle, { color: themeColors.textPrimary }]}>Model Training</Text>
            </View>
            <Text style={[styles.trainingBody, { color: themeColors.textSecondary }]}>
              Your Rehearse conversations are not used to train public AI models.
            </Text>
          </View>
        </View>

        {/* Section 3: Data Controls */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>DATA CONTROLS</Text>

          <View style={[styles.cardGroup, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            {/* Export Data */}
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={handleExportData}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Download size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Export My Data</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>

            {/* Delete Data */}
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={handleDeleteData}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Trash2 size={16} color={themeColors.error} />
                <Text style={[styles.rowLabel, { color: themeColors.error }]}>Delete My Data</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => setInfoModal({
                title: 'Privacy Policy',
                description: 'Rehearse protects executive privacy by employing secure enterprise data boundaries and honoring explicit data erasure requests.'
              })}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <FileText size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Privacy Policy</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Info Modal */}
      <Modal
        visible={infoModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>{infoModal?.title}</Text>
              <TouchableOpacity onPress={() => setInfoModal(null)}>
                <X size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDesc, { color: themeColors.textSecondary }]}>
              {infoModal?.description}
            </Text>

            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: themeColors.primary }]}
              onPress={() => setInfoModal(null)}
            >
              <Text style={[styles.modalCloseText, { color: themeColors.textInverse }]}>Done</Text>
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
    minHeight: 48
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  rowLabel: {
    fontSize: 14.5,
    fontWeight: '500'
  },
  trainingCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 16
  },
  trainingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  shieldCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  trainingTitle: {
    fontSize: 14.5,
    fontWeight: '600'
  },
  trainingBody: {
    fontSize: 13,
    lineHeight: 18
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
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16
  },
  modalCloseBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700'
  }
});

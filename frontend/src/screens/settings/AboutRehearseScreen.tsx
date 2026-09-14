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
  BookOpen,
  HelpCircle,
  Mail,
  FileText,
  Shield,
  Code,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, RADII } from '../../context/ThemeContext';
import { InAppNotification, NotificationType } from '../../components/common/InAppNotification';

export const AboutRehearseScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const [activeModal, setActiveModal] = useState<{
    title: string;
    content: string[];
  } | null>(null);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: NotificationType;
  }>({ visible: false, message: '', type: 'info' });

  const handleOpenTerms = () => {
    setActiveModal({
      title: 'Terms of Service',
      content: [
        'Welcome to Rehearse. By using the app, you agree to these terms:',
        '• Simulation Usage: Rehearse is designed for educational and professional rehearsal purposes.',
        '• Subscriptions: In-app subscriptions are managed via your Apple ID or Google Play account.',
        '• Intellectual Property: Proprietary scenario rubrics and evaluation systems are owned by Rehearse.'
      ]
    });
  };

  const handleOpenPrivacy = () => {
    setActiveModal({
      title: 'Privacy Policy',
      content: [
        'Rehearse is committed to confidentiality:',
        '• Zero Model Training: Your rehearsal conversations and transcripts are never used to train public AI models.',
        '• Data Ownership: You retain full rights to export or delete your rehearsal data at any time.'
      ]
    });
  };

  const handleOpenLicenses = () => {
    setActiveModal({
      title: 'Open Source Licenses',
      content: [
        'Rehearse incorporates open-source software:',
        '• React Native & React (MIT License)',
        '• Expo (MIT License)',
        '• Lucide Icons (ISC License)',
        '• Supabase JS (MIT License)'
      ]
    });
  };

  const handleOpenHelp = () => {
    setToast({
      visible: true,
      message: 'Support documentation and guides are available at rehearse.ai/help',
      type: 'info'
    });
  };

  const handleContactSupport = () => {
    setToast({
      visible: true,
      message: 'Email us directly at support@rehearse.ai',
      type: 'info'
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
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>About Rehearse</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Card */}
        <View style={[styles.brandCard, elevation.md, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
          <Text style={[styles.brandWordmark, { color: themeColors.textPrimary }]}>REHEARSE</Text>
          <Text style={[styles.brandTagline, { color: themeColors.textSecondary }]}>
            AI Difficult Conversation Simulator
          </Text>
          <View style={[styles.versionPill, { backgroundColor: themeColors.surfaceElevated }]}>
            <Text style={[styles.versionText, { color: themeColors.textSecondary }]}>Version 1.2.0 (Build 428)</Text>
          </View>
        </View>

        {/* Section: What is Rehearse */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>WHAT IS REHEARSE?</Text>
          <View style={[styles.summaryCard, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <Text style={[styles.summaryText, { color: themeColors.textSecondary }]}>
              Rehearse helps leaders, managers, and executives practice high-stakes conversations before having them in real life. Build lasting conversational muscle memory through realistic AI simulation loops.
            </Text>
          </View>
        </View>

        {/* Section: Methodology */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>LEARN</Text>
          <View style={[styles.cardGroup, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => navigation.navigate('Methodology')}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <BookOpen size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Methodology & Principles</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>SUPPORT</Text>
          <View style={[styles.cardGroup, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={handleOpenHelp}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <HelpCircle size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Help & Support</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={handleContactSupport}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Mail size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Contact Support</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Legal */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>LEGAL</Text>
          <View style={[styles.cardGroup, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={handleOpenPrivacy}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Shield size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Privacy Policy</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={handleOpenTerms}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <FileText size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Terms of Service</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={handleOpenLicenses}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Code size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Open Source Licenses</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: themeColors.textMuted }]}>
            © 2026 Rehearse Technologies Inc.
          </Text>
        </View>
      </ScrollView>

      {/* Legal Modal */}
      <Modal
        visible={activeModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>{activeModal?.title}</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 280 }}>
              {activeModal?.content.map((p, idx) => (
                <Text key={idx} style={[styles.modalParagraph, { color: themeColors.textSecondary }]}>
                  {p}
                </Text>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: themeColors.primary }]}
              onPress={() => setActiveModal(null)}
            >
              <Text style={[styles.modalCloseText, { color: themeColors.textInverse }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  brandCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24
  },
  brandWordmark: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2
  },
  brandTagline: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10
  },
  versionPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500'
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
  summaryCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 14
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 19
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
  footer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20
  },
  footerText: {
    fontSize: 11.5
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
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  modalParagraph: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8
  },
  modalCloseBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700'
  }
});

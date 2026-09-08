import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import {
  Briefcase,
  TrendingUp,
  Target,
  Check,
  ChevronLeft
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { InAppNotification, NotificationType } from '../../components/common/InAppNotification';

const ROLES = [
  'Executive Leader',
  'Founder / CEO',
  'Product / Tech Lead',
  'Individual Contributor',
  'Consultant / Advisor'
];

const EXPERIENCE_LEVELS = [
  'Mid-Senior',
  'Director / Head of',
  'Executive / C-Suite'
];

const FOCUS_AREAS = [
  'Negotiation',
  'Difficult Feedback',
  'Conflict Management',
  'Executive Communication',
  'High-Pressure Situations'
];

export const ExecutiveProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, setUser } = useApp();
  const { colors: themeColors } = useTheme();

  const [selectedRole, setSelectedRole] = useState(user.role || 'Executive Leader');
  const [selectedSeniority, setSelectedSeniority] = useState(user.experienceLevel || 'Mid-Senior');
  const [selectedFocus, setSelectedFocus] = useState(user.primaryDreadCategory || 'Negotiation');

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: NotificationType;
  }>({ visible: false, message: '', type: 'info' });

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    setUser({ ...user, role });
    setToast({
      visible: true,
      message: `Role set to ${role}.`,
      type: 'success'
    });
  };

  const handleSelectSeniority = (level: string) => {
    setSelectedSeniority(level);
    setUser({ ...user, experienceLevel: level });
    setToast({
      visible: true,
      message: `Experience level updated to ${level}.`,
      type: 'success'
    });
  };

  const handleSelectFocus = (focus: string) => {
    setSelectedFocus(focus);
    setUser({ ...user, primaryDreadCategory: focus });
    setToast({
      visible: true,
      message: `Primary focus updated to ${focus}.`,
      type: 'success'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.surfaceBorder }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Executive Profile</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Primary Role */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>PRIMARY ROLE</Text>

          <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            {ROLES.map((role, index) => {
              const isSelected = selectedRole === role;
              return (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.row,
                    index < ROLES.length - 1 && { borderBottomColor: themeColors.surfaceBorder, borderBottomWidth: 1 }
                  ]}
                  onPress={() => handleSelectRole(role)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>{role}</Text>
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: themeColors.primary }]}>
                      <Check size={11} color={themeColors.textInverse} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 2: Experience Level */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>EXPERIENCE LEVEL</Text>

          <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            {EXPERIENCE_LEVELS.map((level, index) => {
              const isSelected = selectedSeniority === level;
              return (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.row,
                    index < EXPERIENCE_LEVELS.length - 1 && { borderBottomColor: themeColors.surfaceBorder, borderBottomWidth: 1 }
                  ]}
                  onPress={() => handleSelectSeniority(level)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>{level}</Text>
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: themeColors.primary }]}>
                      <Check size={11} color={themeColors.textInverse} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 3: Primary Focus */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>PRIMARY FOCUS</Text>

          <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            {FOCUS_AREAS.map((focus, index) => {
              const isSelected = selectedFocus === focus;
              return (
                <TouchableOpacity
                  key={focus}
                  style={[
                    styles.row,
                    index < FOCUS_AREAS.length - 1 && { borderBottomColor: themeColors.surfaceBorder, borderBottomWidth: 1 }
                  ]}
                  onPress={() => handleSelectFocus(focus)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>{focus}</Text>
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: themeColors.primary }]}>
                      <Check size={11} color={themeColors.textInverse} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
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
  cardGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 48
  },
  rowLabel: {
    fontSize: 14.5,
    fontWeight: '500'
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

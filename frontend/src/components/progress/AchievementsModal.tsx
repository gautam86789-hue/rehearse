import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { X, Award, CheckCircle2, Lock } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { T } from './core/type';
import { AchievementItem } from '../../types/progress';

interface AchievementsModalProps {
  achievements: AchievementItem[];
  visible: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  visible,
  onClose
}) => {
  const { colors: themeColors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: themeColors.textPrimary }]}>Milestones & Achievements</Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                Executive rehearsal consistency markers
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: themeColors.surfaceElevated }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <View style={styles.list}>
              {achievements.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder },
                    !item.unlocked && { opacity: 0.6 }
                  ]}
                >
                  <View style={[
                    styles.iconBox,
                    { backgroundColor: item.unlocked ? themeColors.primarySubtle : themeColors.surfaceCard }
                  ]}>
                    <Text style={styles.emojiIcon}>{item.icon}</Text>
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={[styles.itemTitle, { color: themeColors.textPrimary }]}>{item.title}</Text>
                      {item.unlocked ? (
                        <CheckCircle2 size={15} color={themeColors.primary} />
                      ) : (
                        <Lock size={14} color={themeColors.textMuted} />
                      )}
                    </View>
                    <Text style={[styles.itemDesc, { color: themeColors.textSecondary }]}>{item.description}</Text>
                    {item.unlockedDate && (
                      <Text style={[styles.unlockedDate, { color: themeColors.primary }]}>
                        Unlocked • {item.unlockedDate}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: themeColors.primary }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={[styles.doneBtnText, { color: themeColors.textInverse }]}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  title: {
    ...T.title,
    fontSize: 18,
    lineHeight: 23
  },
  subtitle: {
    ...T.micro,
    marginTop: 2
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10
  },
  scrollArea: {
    marginBottom: 14
  },
  list: {
    gap: 10
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emojiIcon: {
    fontSize: 20
  },
  itemTitle: {
    ...T.heading
  },
  itemDesc: {
    ...T.body,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2
  },
  unlockedDate: {
    ...T.micro,
    marginTop: 3
  },
  doneBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  doneBtnText: {
    ...T.heading
  }
});

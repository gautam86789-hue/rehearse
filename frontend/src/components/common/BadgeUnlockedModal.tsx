import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Award, Flame, ShieldCheck, Sparkles, X } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Button } from './Button';
import { useApp } from '../../context/AppContext';

export const BadgeUnlockedModal: React.FC = () => {
  const { unlockedBadge, setUnlockedBadge } = useApp();

  if (!unlockedBadge) return null;

  const renderIcon = () => {
    switch (unlockedBadge.icon) {
      case 'flame':
        return <Flame size={40} color={colors.flame} />;
      case 'shield-check':
        return <ShieldCheck size={40} color={colors.forestLight} />;
      default:
        return <Award size={40} color={colors.gold} />;
    }
  };

  return (
    <Modal
      visible={!!unlockedBadge}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setUnlockedBadge(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setUnlockedBadge(null)}
          >
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            {renderIcon()}
          </View>

          <Text style={styles.badgeUnlockedTag}>ACHIEVEMENT UNLOCKED</Text>
          <Text style={styles.badgeTitle}>{unlockedBadge.title}</Text>
          <Text style={styles.badgeDesc}>{unlockedBadge.description}</Text>

          <Button
            title="Continue Rehearsing"
            variant="flame"
            onPress={() => setUnlockedBadge(null)}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  modalCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.4)',
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 4
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderWidth: 2,
    borderColor: colors.flame,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  badgeUnlockedTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 1.5,
    marginBottom: 6
  },
  badgeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8
  },
  badgeDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20
  },
  button: {
    width: '100%'
  }
});

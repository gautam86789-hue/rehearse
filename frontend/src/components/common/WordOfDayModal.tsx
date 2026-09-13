import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { BookOpen, X } from 'lucide-react-native';
import { useTheme, RADII } from '../../context/ThemeContext';
import { WordOfTheDay } from '../../types';

interface WordOfDayModalProps {
  visible: boolean;
  word: WordOfTheDay | null;
  roleLabel?: string;
  onClose: () => void;
}

export const WordOfDayModal: React.FC<WordOfDayModalProps> = ({ visible, word, roleLabel, onClose }) => {
  const { colors, elevation } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, elevation.md, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {word && (
            <>
              <View style={[styles.iconCircle, { backgroundColor: colors.primarySubtle }]}>
                <BookOpen size={26} color={colors.primary} />
              </View>
              <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>TERM OF THE DAY</Text>
              <Text style={[styles.term, { color: colors.textPrimary }]}>{word.term}</Text>
              <Text style={[styles.meaning, { color: colors.textSecondary }]}>{word.meaning}</Text>

              <View style={[styles.whyBox, { backgroundColor: colors.primarySubtle, borderColor: colors.primaryLight }]}>
                <Text style={[styles.whyLabel, { color: colors.primary }]}>
                  Why it matters{roleLabel ? ` for ${roleLabel}` : ''}
                </Text>
                <Text style={[styles.whyText, { color: colors.textPrimary }]}>{word.whyItMatters}</Text>
              </View>

              <TouchableOpacity style={[styles.doneBtn, { backgroundColor: colors.primary }]} onPress={onClose} activeOpacity={0.85}>
                <Text style={styles.doneBtnText}>Got it</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: RADII.xl,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center'
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 4
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  eyebrow: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6
  },
  term: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 10
  },
  meaning: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16
  },
  whyBox: {
    width: '100%',
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20
  },
  whyLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  whyText: {
    fontSize: 13.5,
    lineHeight: 19
  },
  doneBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: RADII.lg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});

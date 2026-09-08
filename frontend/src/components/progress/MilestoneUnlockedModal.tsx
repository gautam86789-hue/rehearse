import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity
} from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  Path,
  G
} from 'react-native-svg';
import { X, Flame, Quote, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { T } from './core/type';

interface MilestoneUnlockedModalProps {
  visible: boolean;
  streakCount?: number;
  onClose: () => void;
}

export const MilestoneUnlockedModal: React.FC<MilestoneUnlockedModalProps> = ({
  visible,
  streakCount = 3,
  onClose
}) => {
  const { colors: themeColors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: isDark ? '#0F2119' : '#F5F2E9', borderColor: '#C8AA6A' }]}>
          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: isDark ? '#19382B' : '#E2DEC9' }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={18} color={themeColors.textSecondary} />
          </TouchableOpacity>

          {/* Golden Laurel Medallion */}
          <View style={styles.medallionWrapper}>
            <Svg width={180} height={180} viewBox="0 0 180 180">
              <Defs>
                <RadialGradient id="goldHalo" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#C8AA6A" stopOpacity="0.5" />
                  <Stop offset="100%" stopColor="#C8AA6A" stopOpacity="0" />
                </RadialGradient>
                <LinearGradient id="goldMedal" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#F5DF9E" />
                  <Stop offset="50%" stopColor="#C8AA6A" />
                  <Stop offset="100%" stopColor="#8C6E2E" />
                </LinearGradient>
              </Defs>

              {/* Glowing Halo */}
              <Circle cx="90" cy="90" r="85" fill="url(#goldHalo)" />

              {/* Sunburst Rays */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, idx) => (
                <G key={idx} rotation={angle} origin="90, 90">
                  <Path d="M 90 20 L 92 45 L 88 45 Z" fill="#C8AA6A" opacity="0.6" />
                </G>
              ))}

              {/* Laurel Wreath Left */}
              <Path
                d="M 45 130 C 30 100, 35 60, 65 40"
                stroke="#C8AA6A"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              {/* Laurel Wreath Right */}
              <Path
                d="M 135 130 C 150 100, 145 60, 115 40"
                stroke="#C8AA6A"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />

              {/* Center Medal Circle */}
              <Circle cx="90" cy="90" r="44" fill="url(#goldMedal)" stroke="#FFFFFF" strokeWidth="2" />
              <Circle cx="90" cy="90" r="38" fill={isDark ? '#0B1712' : '#FFFFFF'} />
            </Svg>

            {/* Flame Icon & Number */}
            <View style={styles.medallionCenter}>
              <Flame size={24} color="#E07A5F" />
              <Text style={[styles.streakNumber, { color: isDark ? '#F5F2E9' : '#17241E' }]}>{streakCount}</Text>
            </View>
          </View>

          {/* Title & Description */}
          <Text style={[styles.unlockTitle, { color: themeColors.textPrimary }]}>Milestone Unlocked!</Text>
          <Text style={[styles.streakName, { color: '#C8AA6A' }]}>{streakCount}-Day Streak</Text>
          <Text style={[styles.unlockDescription, { color: themeColors.textSecondary }]}>
            You've practiced for {streakCount} consecutive days. Consistency creates real change.
          </Text>

          {/* Motivational Quote */}
          <View style={[styles.quoteBox, { backgroundColor: isDark ? '#142B20' : '#EAE4D0', borderColor: themeColors.surfaceBorder }]}>
            <Quote size={16} color="#C8AA6A" style={{ marginBottom: 4 }} />
            <Text style={[styles.quoteText, { color: themeColors.textPrimary }]}>
              "Small steps, repeated, create extraordinary results."
            </Text>
          </View>

          {/* Keep Going Button */}
          <TouchableOpacity
            style={[styles.keepGoingBtn, { backgroundColor: '#C8AA6A' }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.keepGoingBtnText}>Keep Going</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 22,
    alignItems: 'center',
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  medallionWrapper: {
    width: 180,
    height: 180,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8
  },
  medallionCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  streakNumber: {
    ...T.figure,
    fontSize: 20,
    lineHeight: 24,
    marginTop: 2
  },
  unlockTitle: {
    ...T.title,
    textAlign: 'center'
  },
  streakName: {
    ...T.heading,
    marginTop: 3,
    marginBottom: 8,
    textAlign: 'center'
  },
  unlockDescription: {
    ...T.body,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 10
  },
  quoteBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 18
  },
  quoteText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 17
  },
  keepGoingBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  keepGoingBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1712'
  }
});

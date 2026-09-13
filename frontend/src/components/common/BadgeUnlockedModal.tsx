import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing } from 'react-native';
import { Award, Flame, ShieldCheck, Sparkles as SparklesIcon, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';
import { useApp } from '../../context/AppContext';

const SPARKLE_POSITIONS = [
  { top: -6, left: '18%', delay: 80 },
  { top: 10, left: '82%', delay: 160 },
  { top: 70, left: '4%', delay: 40 },
  { top: 85, left: '90%', delay: 220 }
];

export const BadgeUnlockedModal: React.FC = () => {
  const { unlockedBadge, setUnlockedBadge } = useApp();
  const { colors } = useTheme();

  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(SPARKLE_POSITIONS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!unlockedBadge) return;
    scale.setValue(0.6);
    opacity.setValue(0);
    iconScale.setValue(0);
    sparkleAnims.forEach((v) => v.setValue(0));

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(120),
        Animated.spring(iconScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true })
      ])
    ]).start();

    sparkleAnims.forEach((v, i) => {
      Animated.sequence([
        Animated.delay(180 + SPARKLE_POSITIONS[i].delay),
        Animated.timing(v, { toValue: 1, duration: 450, easing: Easing.out(Easing.ease), useNativeDriver: true })
      ]).start();
    });
  }, [unlockedBadge]);

  if (!unlockedBadge) return null;

  const renderIcon = () => {
    switch (unlockedBadge.icon) {
      case 'flame':
        return <Flame size={40} color={colors.flame} />;
      case 'shield-check':
        return <ShieldCheck size={40} color={colors.success} />;
      default:
        return <Award size={40} color={colors.champagne} />;
    }
  };

  return (
    <Modal
      visible={!!unlockedBadge}
      animationType="none"
      transparent={true}
      onRequestClose={() => setUnlockedBadge(null)}
    >
      <Animated.View style={[styles.modalOverlay, { opacity }]}>
        <Animated.View
          style={[
            styles.modalCard,
            { backgroundColor: colors.surfaceCard, borderColor: colors.flameGlow, transform: [{ scale }] }
          ]}
        >
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setUnlockedBadge(null)}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.iconStage}>
            {SPARKLE_POSITIONS.map((pos, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.sparkle,
                  {
                    top: pos.top,
                    left: pos.left as any,
                    opacity: sparkleAnims[i],
                    transform: [
                      { scale: sparkleAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
                      { rotate: sparkleAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }
                    ]
                  }
                ]}
              >
                <SparklesIcon size={16} color={colors.champagne} />
              </Animated.View>
            ))}
            <Animated.View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.flameGlow, borderColor: colors.flame, transform: [{ scale: iconScale }] }
              ]}
            >
              {renderIcon()}
            </Animated.View>
          </View>

          <Text style={[styles.badgeUnlockedTag, { color: colors.champagne }]}>ACHIEVEMENT UNLOCKED</Text>
          <Text style={[styles.badgeTitle, { color: colors.textPrimary }]}>{unlockedBadge.title}</Text>
          <Text style={[styles.badgeDesc, { color: colors.textSecondary }]}>{unlockedBadge.description}</Text>

          <Button
            title="Continue Rehearsing"
            variant="flame"
            onPress={() => setUnlockedBadge(null)}
            style={styles.button}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 31, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
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
  iconStage: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  sparkle: {
    position: 'absolute',
    zIndex: 2
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  badgeUnlockedTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6
  },
  badgeTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8
  },
  badgeDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20
  },
  button: {
    width: '100%'
  }
});

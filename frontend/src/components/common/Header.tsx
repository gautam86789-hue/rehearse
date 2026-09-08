import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native';
import {
  ChevronLeft,
  Search,
  MoreHorizontal,
  Flame,
  Award
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { AcousticLoopLogo } from '../brand/AcousticLoopLogo';

export interface HeaderProps {
  type?: 'home' | 'page';
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: 'search' | 'more' | 'none' | 'badges';
  onRightPress?: () => void;
  showGamification?: boolean;
  navigation?: any;
}

export const StreakBadge: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const { user } = useApp();
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.streakBadge,
        {
          backgroundColor: isDark ? '#192C23' : '#F4EFE6',
          borderColor: isDark ? '#2D4537' : '#E8DFD3'
        }
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Flame size={13} color="#D97736" style={{ marginRight: 4 }} />
      <Text style={[styles.streakText, { color: colors.textPrimary }]}>
        {user.currentStreak || 3}d
      </Text>
    </TouchableOpacity>
  );
};

export const XPBadge: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const { user } = useApp();
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.xpBadge,
        {
          backgroundColor: isDark ? '#192C23' : '#F4EFE6',
          borderColor: isDark ? '#2D4537' : '#E8DFD3'
        }
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Award size={13} color={isDark ? '#C8AA6A' : '#173D2C'} style={{ marginRight: 4 }} />
      <Text style={[styles.xpText, { color: colors.textPrimary }]}>
        {user.totalXP || 380} XP
      </Text>
    </TouchableOpacity>
  );
};

export const Header: React.FC<HeaderProps> = ({
  type = 'page',
  title,
  onBack,
  showBack = true,
  rightAction = 'more',
  onRightPress,
  navigation
}) => {
  const { colors, isDark } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('HomeTab');
    }
  };

  // 1. HOME VARIANT (Acoustic Loop Logo on left, Badges on right)
  if (type === 'home' || !title) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.surfaceBorder
          }
        ]}
      >
        {/* Left: Rehearse Acoustic Loop Logo ONLY */}
        <View style={styles.leftContainer}>
          <AcousticLoopLogo
            size={30}
            backgroundColor="#162A24"
            loopColor="#F9FAF8"
            waveColor="#D97736"
            rounded={true}
          />
        </View>

        {/* Right: Streak & XP Badges */}
        <View style={styles.rightBadgesContainer}>
          <StreakBadge />
          <XPBadge />
        </View>
      </View>
    );
  }

  // 2. PAGE / SUB-SCREEN VARIANT (< Chevron on left, Centered Title, Action on right)
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.surfaceBorder
        }
      ]}
    >
      {/* Left: Back Button */}
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      {/* Center: Title */}
      <View style={styles.centerContainer}>
        <Text
          numberOfLines={1}
          style={[styles.headerTitle, { color: colors.textPrimary }]}
        >
          {title}
        </Text>
      </View>

      {/* Right: Action (Search, More, or Placeholder) */}
      <View style={styles.rightContainer}>
        {rightAction === 'search' && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onRightPress}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Search size={19} color={colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
        )}

        {rightAction === 'more' && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onRightPress}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MoreHorizontal size={20} color={colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
        )}

        {rightAction === 'none' && <View style={{ width: 32 }} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  leftContainer: {
    width: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rightContainer: {
    width: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
    textAlign: 'center'
  },
  actionBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rightBadgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2
  }
});

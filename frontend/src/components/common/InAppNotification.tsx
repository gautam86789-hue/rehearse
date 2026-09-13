import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform
} from 'react-native';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export type NotificationType = 'success' | 'error' | 'info';

interface InAppNotificationProps {
  visible: boolean;
  message: string;
  type?: NotificationType;
  duration?: number;
  onDismiss: () => void;
}

export const InAppNotification: React.FC<InAppNotificationProps> = ({
  visible,
  message,
  type = 'info',
  duration = 4000,
  onDismiss
}) => {
  const { colors } = useTheme();
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: Platform.OS !== 'web',
          tension: 60,
          friction: 9
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start();
    }
  }, [visible, message]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web'
      })
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const typeConfig = {
    success: {
      borderColor: colors.success,
      bg: colors.surfaceCard,
      icon: <CheckCircle2 size={18} color={colors.success} />
    },
    error: {
      borderColor: colors.error,
      bg: colors.surfaceCard,
      icon: <AlertCircle size={18} color={colors.error} />
    },
    info: {
      borderColor: colors.primaryLight,
      bg: colors.surfaceCard,
      icon: <Info size={18} color={colors.primary} />
    }
  }[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: typeConfig.bg,
          borderColor: typeConfig.borderColor
        }
      ]}
    >
      <View style={styles.iconBox}>{typeConfig.icon}</View>
      <Text style={[styles.messageText, { color: colors.textPrimary }]} numberOfLines={3}>
        {message}
      </Text>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleDismiss}
        activeOpacity={0.7}
      >
        <X size={14} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 50,
    left: 20,
    right: 20,
    zIndex: 99999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 0,
    maxWidth: 500,
    alignSelf: 'center',
    width: Platform.OS === 'web' ? '90%' : undefined
  },
  iconBox: {
    marginRight: 10
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      default: 'System'
    }),
    fontWeight: '500',
    lineHeight: 18
  },
  closeButton: {
    padding: 4,
    marginLeft: 8
  }
});

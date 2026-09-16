import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform
} from 'react-native';
import { CheckCircle2, AlertCircle, Zap, Award, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export type NotificationType = 'success' | 'error' | 'info' | 'achievement' | 'warning';

// ── New queue-based interface (used by GlobalNotificationBanner) ──────────────
export interface QueuedNotification {
  id: string;
  message: string;
  type?: NotificationType;
  title?: string;
  duration?: number;
}

interface QueueProps {
  queue: QueuedNotification[];
  onDismiss: (id: string) => void;
  // old-style props not used in queue mode
  visible?: never;
  message?: never;
  onDismissSimple?: never;
}

// ── Old single-notification interface (legacy per-screen toasts) ──────────────
interface SingleProps {
  visible: boolean;
  message: string;
  type?: NotificationType;
  duration?: number;
  onDismiss: () => void;
  // queue-mode props not used
  queue?: never;
}

type InAppNotificationProps = QueueProps | SingleProps;

const TYPE_CONFIG: Record<NotificationType, { accent: string; bg: string }> = {
  success:     { accent: '#22C55E', bg: '#F0FDF4' },
  error:       { accent: '#EF4444', bg: '#FEF2F2' },
  info:        { accent: '#6366F1', bg: '#EEF2FF' },
  achievement: { accent: '#F59E0B', bg: '#FFFBEB' },
  warning:     { accent: '#F97316', bg: '#FFF7ED' }
};

function NotifIcon({ type, size = 18 }: { type: NotificationType; size?: number }) {
  const cfg = TYPE_CONFIG[type];
  switch (type) {
    case 'success':     return <CheckCircle2 size={size} color={cfg.accent} />;
    case 'error':       return <AlertCircle  size={size} color={cfg.accent} />;
    case 'achievement': return <Award        size={size} color={cfg.accent} />;
    default:            return <Zap          size={size} color={cfg.accent} />;
  }
}

// ── Shared animated pill ──────────────────────────────────────────────────────
interface PillProps {
  type: NotificationType;
  title?: string;
  message: string;
  visible: boolean;
  duration: number;
  onDismiss: () => void;
}

const NotifPill: React.FC<PillProps> = ({ type, title, message, visible, duration, onDismiss }) => {
  const { colors, isDark } = useTheme();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scaleX     = useRef(new Animated.Value(1)).current;
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isVisible = useRef(false);

  useEffect(() => {
    if (visible) {
      isVisible.current = true;
      scaleX.setValue(1);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: Platform.OS !== 'web',
          tension: 70,
          friction: 10
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start();

      Animated.timing(scaleX, {
        toValue: 0,
        duration,
        useNativeDriver: Platform.OS !== 'web'
      }).start();

      timerRef.current = setTimeout(handleDismiss, duration);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start();
    }
  }, [visible, message]);

  const handleDismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web'
      })
    ]).start(() => {
      isVisible.current = false;
      onDismiss();
    });
  }, [onDismiss]);

  if (!visible && !isVisible.current) return null;

  const cfg      = TYPE_CONFIG[type];
  const bgColor  = isDark ? colors.surfaceCard : cfg.bg;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: bgColor,
          borderLeftColor: cfg.accent,
          shadowColor: cfg.accent
        }
      ]}
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.accentBar, { backgroundColor: cfg.accent }]} />
      <View style={styles.iconBox}>
        <NotifIcon type={type} size={20} />
      </View>
      <View style={styles.textBlock}>
        {title ? (
          <>
            <Text style={[styles.titleText, { color: colors.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={[styles.bodyText, { color: colors.textSecondary }]} numberOfLines={2}>
              {message}
            </Text>
          </>
        ) : (
          <Text style={[styles.bodyText, { color: colors.textPrimary }]} numberOfLines={3}>
            {message}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={handleDismiss}
        activeOpacity={0.6}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <X size={13} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Drain bar */}
      <Animated.View
        style={[
          styles.progressBar,
          { backgroundColor: cfg.accent, transform: [{ scaleX }] }
        ]}
      />
    </Animated.View>
  );
};

// ── Public component (handles both old and new API) ───────────────────────────
export const InAppNotification: React.FC<InAppNotificationProps> = (props) => {
  // ── Queue mode ────────────────────────────────────────────────────────────
  if ('queue' in props && props.queue !== undefined) {
    const { queue, onDismiss } = props;
    const [current, setCurrent] = useState<QueuedNotification | null>(null);
    const [showing, setShowing] = useState(false);
    const queueRef = useRef<QueuedNotification[]>([]);

    useEffect(() => { queueRef.current = queue; }, [queue]);

    useEffect(() => {
      if (queue.length > 0 && !showing) showNext(queue[0]);
    }, [queue, showing]);

    function showNext(notif: QueuedNotification) {
      setCurrent(notif);
      setShowing(true);
    }

    function dismiss(id: string) {
      setShowing(false);
      setCurrent(null);
      onDismiss(id);
      setTimeout(() => {
        const remaining = queueRef.current.filter(n => n.id !== id);
        if (remaining.length > 0) showNext(remaining[0]);
      }, 380);
    }

    if (!current) return null;
    return (
      <NotifPill
        type={current.type ?? 'info'}
        title={current.title}
        message={current.message}
        visible={showing}
        duration={current.duration ?? 4500}
        onDismiss={() => dismiss(current.id)}
      />
    );
  }

  // ── Legacy single-notification mode ────────────────────────────────────────
  const { visible, message, type = 'info', duration = 4000, onDismiss } = props as SingleProps;
  return (
    <NotifPill
      type={type}
      message={message}
      visible={visible}
      duration={duration}
      onDismiss={onDismiss}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 16 : 48,
    left: 16,
    right: 16,
    zIndex: 99999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    paddingLeft: 20,
    borderRadius: 18,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
    maxWidth: 480,
    alignSelf: 'center',
    overflow: 'hidden'
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18
  },
  iconBox: {
    marginRight: 11,
    marginLeft: 2
  },
  textBlock: {
    flex: 1,
    gap: 1
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    letterSpacing: 0.1
  },
  bodyText: {
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 17
  },
  closeBtn: {
    padding: 4,
    marginLeft: 10,
    alignSelf: 'flex-start',
    marginTop: 2
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    borderRadius: 2
  }
});

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Award, Flame, ShieldCheck, Sparkles, Bell, X } from 'lucide-react-native';
import { useTheme, RADII } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const ICONS: Record<string, any> = {
  flame: Flame,
  award: Award,
  'shield-check': ShieldCheck,
  sparkles: Sparkles
};

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, elevation } = useTheme();
  const { notifications, markAllNotificationsRead, dismissNotification } = useApp();
  // Custom header had a flat paddingTop:20 with no safe-area handling — on
  // edge-to-edge Android that put the title/back-button under the status bar.
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  useEffect(() => {
    markAllNotificationsRead();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
        <View style={{ width: 32 }} />
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.primarySubtle }]}>
            <Bell size={26} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Nothing yet</Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Milestones you unlock and updates worth knowing about will show up here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {notifications.map((n) => {
            const Icon = ICONS[n.icon || 'sparkles'] || Sparkles;
            return (
              <View
                key={n.id}
                style={[styles.row, elevation.sm, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}
              >
                <View style={[styles.iconSquare, { backgroundColor: colors.champagneSubtle }]}>
                  <Icon size={18} color={colors.champagneDark} />
                </View>
                <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                  <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>{n.title}</Text>
                  <Text style={[styles.rowBody, { color: colors.textSecondary }]}>{n.body}</Text>
                  <Text style={[styles.rowTime, { color: colors.textMuted }]}>{formatRelativeDate(n.createdAt)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.dismissBtn}
                  onPress={() => dismissNotification(n.id)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
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
    paddingTop: 20,
    paddingBottom: 12
  },
  headerBtn: {
    padding: 6
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 14
  },
  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 2
  },
  rowBody: {
    fontSize: 12.5,
    lineHeight: 17,
    marginBottom: 4
  },
  rowTime: {
    fontSize: 11
  },
  dismissBtn: {
    padding: 4,
    alignSelf: 'flex-start'
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8
  },
  emptyBody: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center'
  }
});

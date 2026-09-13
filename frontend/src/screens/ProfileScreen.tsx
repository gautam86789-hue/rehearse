import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import {
  Settings as SettingsIcon,
  Pencil,
  Crown,
  History,
  Trophy,
  UserCog,
  Bell,
  ChevronRight,
  Share2
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { InAppNotification, NotificationType } from '../components/common/InAppNotification';
import { MILESTONES } from '../data/milestones';
import { useFitScreenScroll } from '../hooks/useFitScreenScroll';
import { useShareCard } from '../components/share/useShareCard';
import { StreakMilestoneCard } from '../components/share/StreakMilestoneCard';
import { syncDailyReminder, syncTrialEndingReminder, cancelAllReminders } from '../services/notificationService';
import { SPACING } from '../theme/spacing';
import { formatDate } from '../utils/formatDate';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, setUser, unlockMilestone, history } = useApp();
  const { colors, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const { viewShotRef: streakShotRef, isSharing: isSharingStreak, share: shareStreak } = useShareCard();
  const scrollRef = useRef<ScrollView>(null);
  const fitScroll = useFitScreenScroll();

  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(user.name || 'Professional');
  const [remindersOn, setRemindersOn] = useState(true);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: NotificationType }>({
    visible: false,
    message: '',
    type: 'info'
  });

  useFocusEffect(
    React.useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  useEffect(() => {
    setDraftName(user.name || 'Professional');
  }, [user.name]);

  useEffect(() => {
    AsyncStorage.getItem(`@rehearse_reminders_${user.id}`).then((v) => {
      if (v !== null) setRemindersOn(v === 'true');
    });
  }, [user.id]);

  const isPro = ['active_annual', 'active_three_month', 'active_monthly', 'active_promo'].includes(
    user.subscription?.status || ''
  );

  const showToast = (message: string, type: NotificationType = 'info') => {
    setToast({ visible: true, message, type });
  };

  const saveName = () => {
    const trimmed = draftName.trim();
    setIsEditingName(false);
    if (trimmed && trimmed !== user.name) {
      setUser((prev) => ({ ...prev, name: trimmed }));
      unlockMilestone('badge_profile_customized', 'Made It Yours', 'Personalized your profile.', 'shield-check');
    } else {
      setDraftName(user.name || 'Professional');
    }
  };

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Photo library access is needed to change your picture.', 'error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setUser((prev) => ({ ...prev, avatarUri: uri }));
      unlockMilestone('badge_profile_customized', 'Made It Yours', 'Personalized your profile.', 'shield-check');
    }
  };

  const toggleReminders = async (value: boolean) => {
    setRemindersOn(value);
    await AsyncStorage.setItem(`@rehearse_reminders_${user.id}`, String(value));
    if (value) {
      await syncDailyReminder(user, true);
      await syncTrialEndingReminder(user, true);
    } else {
      await cancelAllReminders(user.id);
    }
    showToast(value ? 'Reminders turned on' : 'Reminders turned off', 'success');
  };

  const initials = (user.name || 'Professional').trim().slice(0, 1).toUpperCase();

  const badgeCount = MILESTONES.filter((m) => m.isUnlocked(user, history)).length;
  const profileStats = [
    { value: user.totalRehearsals || 0, label: 'Scenarios' },
    { value: user.currentStreak || 0, label: 'Day Streak' },
    { value: user.totalXP || 0, label: 'XP' },
    { value: badgeCount, label: 'Badges' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 12) + 8 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={fitScroll.scrollEnabled}
        onLayout={fitScroll.onLayout}
        onContentSizeChange={fitScroll.onContentSizeChange}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Profile</Text>
          <TouchableOpacity
            style={styles.settingsGear}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <SettingsIcon size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Avatar + name */}
        <View style={styles.identityBlock}>
          <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.85} style={styles.avatarWrap}>
            {user.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarInitial}>{initials}</Text>
              </View>
            )}
            <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
              <Pencil size={11} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {isEditingName ? (
            <TextInput
              style={[styles.nameInput, { color: colors.textPrimary, borderColor: colors.primary }]}
              value={draftName}
              onChangeText={setDraftName}
              autoFocus
              onSubmitEditing={saveName}
              onBlur={saveName}
              maxLength={40}
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity
              style={styles.nameRow}
              onPress={() => setIsEditingName(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.nameText, { color: colors.textPrimary }]}>{user.name || 'Professional'}</Text>
              <Pencil size={13} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Building better conversations{'\n'}one day at a time.
          </Text>
        </View>

        {/* Stats row — real, synced data (rehearsals, streak, XP, badges) */}
        <View style={[styles.statsRow, elevation.sm, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
          {profileStats.map((stat, idx) => (
            <React.Fragment key={stat.label}>
              <View style={styles.statCell}>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
              {idx < profileStats.length - 1 && (
                <View style={[styles.statDivider, { backgroundColor: colors.surfaceBorder }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Share streak — proven Duolingo pattern: a bold, spoiler-free
            number, never any conversation content, safe for LinkedIn */}
        {(user.currentStreak || 0) > 0 && (
          <TouchableOpacity
            style={[styles.shareStreakBtn, elevation.sm, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}
            onPress={() => shareStreak('Share your streak')}
            disabled={isSharingStreak}
            activeOpacity={0.8}
          >
            <Share2 size={15} color={colors.primary} />
            <Text style={[styles.shareStreakText, { color: colors.primary }]}>
              {isSharingStreak ? 'Preparing…' : 'Share my streak'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.offscreenCard} pointerEvents="none">
          <StreakMilestoneCard
            ref={streakShotRef}
            streak={user.currentStreak || 0}
            audienceLabel={user.role}
          />
        </View>

        {/* Pro badge */}
        {isPro ? (
          <TouchableOpacity
            style={[styles.proBadgeRow, { backgroundColor: colors.champagneSubtle, borderColor: colors.champagne }]}
            onPress={() => navigation.navigate('MembershipBilling')}
            activeOpacity={0.85}
          >
            <Crown size={16} color={colors.champagneDark} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.proBadgeTitle, { color: colors.champagneDark }]}>Pro Member</Text>
              {user.subscription?.trialEndsAt ? (
                <Text style={[styles.proBadgeSub, { color: colors.textSecondary }]}>
                  Valid until {formatDate(user.subscription.trialEndsAt)}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.proBadgeRow, { backgroundColor: colors.primarySubtle, borderColor: colors.primaryLight }]}
            onPress={() => navigation.navigate('MembershipBilling')}
            activeOpacity={0.85}
          >
            <Crown size={16} color={colors.primary} />
            <Text style={[styles.proBadgeTitle, { color: colors.primary, flex: 1 }]}>Go Pro for unlimited practice</Text>
            <ChevronRight size={15} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Menu rows */}
        <View style={[styles.cardGroup, elevation.sm, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.surfaceBorder }]}
            onPress={() => navigation.navigate('Milestones')}
            activeOpacity={0.7}
          >
            <Trophy size={18} color={colors.textSecondary} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Milestones</Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.surfaceBorder }]}
            onPress={() => navigation.navigate('ConversationHistory')}
            activeOpacity={0.7}
          >
            <History size={18} color={colors.textSecondary} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Conversation History</Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.surfaceBorder }]}
            onPress={() => navigation.navigate('ExecutiveProfile')}
            activeOpacity={0.7}
          >
            <UserCog size={18} color={colors.textSecondary} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Communication Profile</Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Bell size={18} color={colors.textSecondary} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.textPrimary, flex: 1 }]}>Reminders</Text>
            <Switch
              value={remindersOn}
              onValueChange={toggleReminders}
              trackColor={{ false: colors.surfaceBorder, true: colors.primaryLight }}
              thumbColor={remindersOn ? colors.primary : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Quote card */}
        <View style={[styles.quoteCard, { backgroundColor: colors.primarySubtle }]}>
          <Text style={[styles.quoteText, { color: colors.primary }]}>
            "Confident people aren't born.{'\n'}They're rehearsed."
          </Text>
        </View>
      </ScrollView>

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
  shareStreakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 10
  },
  shareStreakText: {
    fontSize: 13.5,
    fontWeight: '700'
  },
  offscreenCard: {
    position: 'absolute',
    top: -9999,
    left: -9999
  },
  container: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4
  },
  settingsGear: {
    padding: 6
  },
  identityBlock: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20
  },
  avatarWrap: {
    marginBottom: 12
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitial: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  nameText: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  nameInput: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    borderBottomWidth: 1.5,
    minWidth: 160,
    textAlign: 'center',
    paddingVertical: 2
  },
  tagline: {
    fontSize: 12.5,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 6
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    marginBottom: 20
  },
  statCell: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500'
  },
  statDivider: {
    width: 1,
    height: 28
  },
  proBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: SPACING.md,
    marginBottom: 20
  },
  proBadgeTitle: {
    fontSize: 13.5,
    fontWeight: '700'
  },
  proBadgeSub: {
    fontSize: 11,
    marginTop: 1
  },
  cardGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    minHeight: 52
  },
  rowIcon: {
    marginRight: 12
  },
  rowLabel: {
    fontSize: 14.5,
    fontWeight: '500',
    flex: 1,
    marginRight: 8
  },
  quoteCard: {
    borderRadius: 18,
    padding: 20,
    alignItems: 'center'
  },
  quoteText: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20
  }
});

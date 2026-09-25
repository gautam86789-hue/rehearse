import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, KeyRound, RefreshCw, LogOut, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import { isAccessLocked } from '../../utils/access';
import { RehearseEmblem } from '../brand/RehearseEmblem';

// The lock only takes over on the main tabs. Finishing your last free rehearsal
// leaves you on the Score/Feedback screens first, so you can read your feedback;
// the lock appears when you go back Home.
const TAB_ROUTES = ['HomeTab', 'PracticeTab', 'ProgressTab', 'ProfileTab', 'HomeTabs'];

export const TrialEndedLockScreen: React.FC<{ activeRouteName?: string }> = ({ activeRouteName }) => {
  const insets = useSafeAreaInsets();
  const { colors, elevation, isDark } = useTheme();
  const { user, isPro, isOnboarded, refreshProfile, unlockMilestone } = useApp();
  const { isAuthenticated, signOut } = useAuth();

  const scrollRef = useRef<ScrollView>(null);
  // On edge-to-edge Android the window no longer shrinks for the keyboard, so
  // the code field ended up hidden underneath it. Track the keyboard's height
  // ourselves, pad the content by it, and scroll the field into view.
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 0);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Determine locked state
  const isLocked = useMemo(() => {
    if (!isAuthenticated || !isOnboarded) return false;
    if (activeRouteName && !TAB_ROUTES.includes(activeRouteName)) return false;
    return isAccessLocked(user, isPro);
  }, [isAuthenticated, isOnboarded, user, isPro, activeRouteName]);

  // Intercept hardware back button ONLY when locked so user cannot bypass
  useEffect(() => {
    if (!isLocked) return;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, [isLocked]);

  if (!isLocked) {
    return null;
  }

  // Handle code redemption
  const handleRedeem = async () => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMessage('Please enter an access code.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await apiService.redeemPromoCode(user.id, cleanCode);
      await refreshProfile();
      const days = res?.days || (cleanCode.includes('30D') || cleanCode.includes('VIP') ? 30 : cleanCode.includes('14D') || cleanCode.includes('TESTER') ? 14 : 7);
      setSuccessMessage(`${days}-Day Code Activated! Access restored.`);
      unlockMilestone(
        'promo_early_bird',
        `${days}-Day Pass Unlocked! 🎉`,
        `You have unlocked ${days} days of full Pro access — no card required. Make it count!`,
        'sparkles'
      );
    } catch (err: any) {
      setErrorMessage(err?.message || 'That code isn\'t valid — double check and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncStatus = async () => {
    setIsSyncing(true);
    setErrorMessage('');
    try {
      await refreshProfile();
    } catch (err: any) {
      setErrorMessage('Could not sync status. Please check your connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  const errorBg = isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)';
  const successBg = isDark ? 'rgba(22, 163, 74, 0.15)' : 'rgba(22, 163, 74, 0.08)';

  return (
    <View style={[styles.lockContainer, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 + keyboardHeight }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Icon */}
          <View style={styles.iconContainer}>
            <RehearseEmblem size={72} />
          </View>

          {/* Titles */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Access Locked
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your free rehearsals have ended. Enter an access code to keep practicing.
          </Text>

          {/* Error / Success Feedback */}
          {!!errorMessage && (
            <View style={[styles.feedbackBanner, { backgroundColor: errorBg, borderColor: colors.error }]}>
              <Text style={[styles.feedbackText, { color: colors.error }]}>{errorMessage}</Text>
            </View>
          )}
          {!!successMessage && (
            <View style={[styles.feedbackBanner, { backgroundColor: successBg, borderColor: colors.success }]}>
              <CheckCircle2 size={16} color={colors.success} style={{ marginRight: 6 }} />
              <Text style={[styles.feedbackText, { color: colors.success }]}>{successMessage}</Text>
            </View>
          )}

          {/* Input Box */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              ENTER ACCESS CODE
            </Text>
            <View style={[styles.inputRow, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
              <KeyRound size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={code}
                onChangeText={(t) => setCode(t.toUpperCase())}
                placeholder="Enter access code"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={24}
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleRedeem}
            disabled={isSubmitting || isSyncing}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
                Redeem & Unlock App
              </Text>
            )}
          </TouchableOpacity>

          {/* Secondary Actions */}
          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={[styles.syncButton, { borderColor: colors.surfaceBorder }]}
              onPress={handleSyncStatus}
              disabled={isSyncing || isSubmitting}
              activeOpacity={0.7}
            >
              {isSyncing ? (
                <ActivityIndicator color={colors.textSecondary} size="small" />
              ) : (
                <>
                  <RefreshCw size={15} color={colors.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                    Check Status
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signOutButton, { borderColor: colors.surfaceBorder }]}
              onPress={signOut}
              disabled={isSubmitting || isSyncing}
              activeOpacity={0.7}
            >
              <LogOut size={15} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  lockContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: 999999
  },
  keyboardContainer: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 12
  },
  card: {
    width: '100%',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8
  },
  cardBody: {
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 8
  },
  cardBodySub: {
    fontSize: 12.5,
    lineHeight: 18
  },
  feedbackBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1
  },
  inputSection: {
    width: '100%',
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14
  },
  inputIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700'
  },
  secondaryActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  syncButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  signOutButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600'
  },
  footerNotice: {
    fontSize: 11.5,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16
  }
});

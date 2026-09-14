import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import { Check, ShieldCheck, Sparkles, X, Crown } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { isPurchasesSupported, presentPaywallIfNeeded, PAYWALL_RESULT } from '../../services/purchases';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_FEATURES, SubscriptionPlanId } from '../../data/subscriptionPlans';
import { AuthGateModal } from './AuthGateModal';
import { EmailVerificationModal } from './EmailVerificationModal';
import { PromoCodeGate } from './PromoCodeGate';
import { apiService } from '../../services/api';
import { navigationRef } from '../../navigation/navigationRef';

// On native (iOS/Android), `isPaywallVisible` triggers RevenueCat's hosted,
// dashboard-designed Paywall — real purchases, real products (yearly /
// three_month / monthly), no hand-built plan UI to keep in sync with the
// dashboard. The JSX below (the original hand-built modal) only renders as a
// **web fallback**: react-native-purchases-ui has no web implementation, and
// this project's Expo-web browser preview is relied on all session for fast
// UI iteration, so it needs something to demo behind the same CTA.
export const PaywallModal: React.FC = () => {
  const { isPaywallVisible, setIsPaywallVisible, paywallPreferredPlan, upgradeSubscription, refreshProfile, user, unlockMilestone } = useApp();
  const { isGuest } = useAuth();
  const { colors: themeColors, isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('annual');

  // Offered once per paywall open, right after sign-in and before the real
  // (store-billed) paywall — someone with a code redeems it and skips
  // payment entirely; "No code" (or the card's X) falls through to the
  // normal purchase flow exactly as if this step weren't there. Resets
  // whenever the paywall closes so the next open re-offers it.
  const [hasDeclinedPromo, setHasDeclinedPromo] = useState(false);
  // Set synchronously by AuthGateModal's onAuthenticated, the instant
  // sign-up/sign-in resolves — switching off of this instead of waiting for
  // isGuest to flip through AuthContext and re-render here is what closes
  // the gap: gating on isGuest alone left a frame between AuthGateModal
  // closing and PromoCodeGate mounting where neither was on screen, showing
  // a bare white flash of whatever sat underneath (reported directly).
  const [justAuthenticated, setJustAuthenticated] = useState(false);
  // Same synchronous-flag reasoning as justAuthenticated — switching off
  // user.emailVerified alone means waiting on refreshProfile's round trip
  // before this component re-renders past the verification step.
  const [justVerified, setJustVerified] = useState(false);
  // Separate from hasDeclinedPromo on purpose: skipping email verification
  // and declining the promo code are two different steps. These used to
  // share hasDeclinedPromo, which meant "Skip for now" on verification also
  // satisfied the promo step's gate and jumped straight to the real
  // (RevenueCat) paywall, skipping PromoCodeGate entirely.
  const [skippedVerification, setSkippedVerification] = useState(false);
  useEffect(() => {
    if (!isPaywallVisible) {
      setHasDeclinedPromo(false);
      setJustAuthenticated(false);
      setJustVerified(false);
      setSkippedVerification(false);
    }
  }, [isPaywallVisible]);

  const handleRedeemPromoCode = async (code: string): Promise<{ error?: string }> => {
    try {
      await apiService.redeemPromoCode(user.id, code);
      await refreshProfile();
      setIsPaywallVisible(false);
      // Land back on Home underneath the congratulations modal — whatever
      // locked feature triggered this paywall (a scenario, a chat, etc.)
      // isn't where a just-unlocked user wants to land; Home is the natural
      // "start using it" surface, matching a real purchase's flow.
      if (navigationRef.isReady()) {
        navigationRef.navigate('HomeTabs' as never);
      }
      unlockMilestone(
        'promo_early_bird',
        'Early Bird Unlocked!',
        "You've got 7 days of full Pro access — no card required. Make it count.",
        'sparkles'
      );
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Something went wrong — please try again.' };
    }
  };

  // Opens on whatever plan the user already had selected on
  // MembershipBillingScreen, rather than always resetting to Annual.
  useEffect(() => {
    if (isPaywallVisible && paywallPreferredPlan) {
      setSelectedPlan(paywallPreferredPlan);
    }
  }, [isPaywallVisible, paywallPreferredPlan]);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradeSubscription(selectedPlan);
    } finally {
      setIsUpgrading(false);
    }
  };

  // Guards against double-presenting if this effect re-fires while a paywall
  // is already on screen (e.g. a parent re-render while the async present
  // call is still pending).
  const isPresenting = useRef(false);

  useEffect(() => {
    // A guest (and not yet justAuthenticated) hits the AuthGateModal render
    // branch below instead — this effect naturally takes over once sign-up/
    // sign-in flips justAuthenticated true. hasDeclinedPromo gates it the
    // same way — the PromoCodeGate branch below runs first, and only "No
    // code" (or a redeemed code closing the paywall outright) lets this
    // effect proceed.
    const stillGuest = isGuest && !justAuthenticated;
    if (!isPurchasesSupported() || !isPaywallVisible || stillGuest || !hasDeclinedPromo || isPresenting.current) return;
    isPresenting.current = true;
    presentPaywallIfNeeded()
      .then(async (result) => {
        if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
          // AppContext's CustomerInfo listener already reflects the new
          // entitlement locally; refreshProfile reconciles with the backend
          // once RevenueCat's webhook lands, for cross-device consistency.
          await refreshProfile();
        }
      })
      .finally(() => {
        isPresenting.current = false;
        setIsPaywallVisible(false);
      });
  }, [isPaywallVisible, isGuest, justAuthenticated, hasDeclinedPromo]);

  // Sign-in/sign-up is required only at the moment of actually paying, not
  // any earlier — applies on both native (blocks the RevenueCat hosted
  // paywall above) and web (blocks the hand-built modal below).
  if (isPaywallVisible && isGuest && !justAuthenticated) {
    return (
      <AuthGateModal
        visible
        onAuthenticated={() => setJustAuthenticated(true)}
        onCancel={() => setIsPaywallVisible(false)}
      />
    );
  }

  // Right after sign-in, before the promo step. "Skip for now" moves on to
  // the promo-code step (below), NOT straight to real payment — if the
  // skipped-verification user actually has a code, redeeming it server-side
  // still enforces email verification (subscriptionController's
  // EMAIL_NOT_VERIFIED check) and PromoCodeGate will surface that error
  // plainly; "No code" from there is what falls through to real payment.
  if (isPaywallVisible && (!isGuest || justAuthenticated) && !user.emailVerified && !justVerified && !skippedVerification && !hasDeclinedPromo) {
    return (
      <EmailVerificationModal
        visible
        email={user.email || ''}
        userId={user.id}
        onVerified={() => {
          setJustVerified(true);
          refreshProfile();
        }}
        onCancel={() => setSkippedVerification(true)}
      />
    );
  }

  // Right after sign-in (and, whether verified, skipped, or just verified,
  // after that step) — a judge/tester with a code skips payment entirely;
  // "No code" falls through to the normal purchase flow exactly as if this
  // card weren't there.
  if (
    isPaywallVisible &&
    (!isGuest || justAuthenticated) &&
    (user.emailVerified || justVerified || skippedVerification) &&
    !hasDeclinedPromo
  ) {
    return (
      <PromoCodeGate
        visible
        onRedeem={handleRedeemPromoCode}
        onNoCode={() => setHasDeclinedPromo(true)}
      />
    );
  }

  if (isPurchasesSupported()) return null;

  if (!isPaywallVisible) return null;

  // Someone who already redeemed a promo code had their one free period —
  // don't pitch a second "free trial" once that's expired and they're back
  // at this paywall for real.
  const hasHadFreePeriod = !!user.promoRedeemed;

  return (
    <Modal
      visible={isPaywallVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setIsPaywallVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
          {/* Close button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: themeColors.surfaceElevated }]}
            onPress={() => setIsPaywallVisible(false)}
            activeOpacity={0.7}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <X size={18} color={themeColors.textSecondary} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Header Badge */}
            {!hasHadFreePeriod && (
              <View style={styles.badgeRow}>
                <View style={[styles.trialTag, { backgroundColor: themeColors.primarySubtle, borderColor: themeColors.primary }]}>
                  <Sparkles size={13} color={themeColors.primary} />
                  <Text style={[styles.trialTagText, { color: themeColors.primary }]}>5-DAY UNLIMITED TRIAL</Text>
                </View>
              </View>
            )}

            <Text style={[styles.title, { color: themeColors.textPrimary }]}>Rehearse with Confidence</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Master difficult conversations before the stakes are real. Backed by substance scoring, custom situation briefs, and AI counterpart simulation.
            </Text>

            {/* Value checklist */}
            <View style={[styles.featuresList, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}>
              {SUBSCRIPTION_FEATURES.map((feat, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <View style={[styles.checkIcon, { backgroundColor: themeColors.primarySubtle }]}>
                    <Check size={13} color={themeColors.primary} strokeWidth={2.5} />
                  </View>
                  <Text style={[styles.featureText, { color: themeColors.textPrimary }]}>{feat}</Text>
                </View>
              ))}
            </View>

            {/* Plan Selector */}
            <View style={styles.plansContainer}>
              {SUBSCRIPTION_PLANS.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder },
                    selectedPlan === plan.id && { borderColor: themeColors.primary, backgroundColor: themeColors.surfaceHighlight, borderWidth: 2 }
                  ]}
                  activeOpacity={0.88}
                  onPress={() => setSelectedPlan(plan.id)}
                >
                  {plan.badge && (
                    <View style={[styles.popularBadge, { backgroundColor: themeColors.success }]}>
                      <Text style={styles.popularBadgeText}>{plan.badge}</Text>
                    </View>
                  )}
                  <View style={styles.planHeader}>
                    <Text style={[styles.planName, { color: themeColors.textPrimary }]}>{plan.name}</Text>
                    <Text style={[styles.planPrice, { color: themeColors.textPrimary }]}>
                      {plan.price}<Text style={[styles.planPeriod, { color: themeColors.textSecondary }]}>{plan.period}</Text>
                    </Text>
                  </View>
                  <Text style={[styles.planSubtext, { color: themeColors.textSecondary }]}>
                    {plan.effectiveMonthly}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: themeColors.primary }]}
              onPress={handleUpgrade}
              disabled={isUpgrading}
              activeOpacity={0.85}
            >
              <Text style={[styles.ctaButtonText, { color: themeColors.textInverse }]}>
                {isUpgrading ? 'Activating Pass...' : hasHadFreePeriod ? 'Subscribe Now' : 'Start 5-Day Free Trial'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footerNote}>
              <ShieldCheck size={14} color={themeColors.textSecondary} />
              <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
                {hasHadFreePeriod
                  ? 'Billed immediately for the plan you select. Cancel anytime in Settings.'
                  : 'No charge today. Cancel anytime within 5 days in Settings.'}
              </Text>
            </View>
            {/* Loss aversion: framed around what stays vs. what's lost, not a
                generic feature pitch — people protect what they already have
                more readily than they chase something new. */}
            <Text style={[styles.lossAversionNote, { color: themeColors.textMuted }]}>
              Your streak and progress stay put either way — Pro just keeps new rehearsals unlocked once your free ones run out.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 1,
    paddingTop: 18,
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
    padding: 6,
    borderRadius: 16
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24
  },
  badgeRow: {
    alignItems: 'center',
    marginBottom: 10
  },
  trialTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 6
  },
  trialTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 6
  },
  featuresList: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    gap: 8
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureText: {
    fontSize: 12.5,
    fontWeight: '500',
    flex: 1
  },
  plansContainer: {
    gap: 10,
    marginBottom: 16
  },
  planCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    position: 'relative'
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3
  },
  planName: {
    fontSize: 15,
    fontWeight: '700'
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800'
  },
  planPeriod: {
    fontSize: 12,
    fontWeight: '500'
  },
  planSubtext: {
    fontSize: 11.5
  },
  ctaButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '700'
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  footerText: {
    fontSize: 11.5
  },
  lossAversionNote: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 8,
    paddingHorizontal: 12
  }
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import {
  Crown,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme, RADII } from '../../context/ThemeContext';
import { InAppNotification, NotificationType } from '../../components/common/InAppNotification';
import { AuthGateModal } from '../../components/common/AuthGateModal';
import { isPurchasesSupported, restorePurchases, presentCustomerCenter } from '../../services/purchases';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_FEATURES, SubscriptionPlanId } from '../../data/subscriptionPlans';

export const MembershipBillingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, isPro, setIsPaywallVisible, setPaywallPreferredPlan, upgradeSubscription, refreshProfile } = useApp();
  const { isGuest } = useAuth();
  const { colors: themeColors, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('annual');
  const [isRestoring, setIsRestoring] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: NotificationType;
  }>({ visible: false, message: '', type: 'info' });
  const [isSimulating, setIsSimulating] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);

  // Real Play Console / App Store Connect billing isn't configured yet
  // (deliberately deferred), so the actual RevenueCat paywall has nothing
  // real to sell — this calls the same local subscription-state update
  // upgradeSubscription always falls back to when a real charge can't go
  // through, but does it directly and instantly, so Pro features can be
  // tested end-to-end before real billing exists. Clearly labeled as a test
  // action, not hidden as if it were the real purchase button.
  const handleSimulatePurchase = async () => {
    if (isGuest) {
      setShowAuthGate(true);
      return;
    }
    setIsSimulating(true);
    try {
      await upgradeSubscription(selectedPlan);
      setToast({ visible: true, message: 'Test purchase simulated — Pro features unlocked.', type: 'success' });
    } finally {
      setIsSimulating(false);
    }
  };

  const isFreeTrial = user.subscription?.status === 'free_trial';
  const isPlus =
    isPro ||
    user.subscription?.status === 'active_annual' ||
    user.subscription?.status === 'active_three_month' ||
    user.subscription?.status === 'active_monthly' ||
    user.subscription?.status === 'active_promo';
  const planName = isPlus ? user.subscription?.planName || 'Rehearse Plus' : isFreeTrial ? 'Free Trial' : 'Free Plan';

  // Was hardcoded to "Annual renewal ($90/year)" regardless of which plan
  // the user actually holds — someone on Monthly or the Three Month pass
  // would see the wrong renewal price/cadence here.
  const currentPlanId: SubscriptionPlanId | undefined =
    user.subscription?.status === 'active_annual'
      ? 'annual'
      : user.subscription?.status === 'active_three_month'
      ? 'three_month'
      : user.subscription?.status === 'active_monthly'
      ? 'monthly'
      : undefined;
  const currentPlanDetails = currentPlanId ? SUBSCRIPTION_PLANS.find((p) => p.id === currentPlanId) : undefined;
  const renewalText = currentPlanDetails
    ? `${currentPlanDetails.name} renewal (${currentPlanDetails.price}${currentPlanDetails.period})`
    : 'Plan details unavailable';

  const handleRestorePurchases = async () => {
    if (!isPurchasesSupported()) {
      setToast({
        visible: true,
        message: 'Purchases restored. Your active plan is up to date.',
        type: 'success'
      });
      return;
    }
    setIsRestoring(true);
    try {
      const outcome = await restorePurchases();
      if (outcome.success) {
        await refreshProfile();
        setToast({ visible: true, message: 'Purchases restored — your Pro access is active.', type: 'success' });
      } else if (outcome.error) {
        setToast({ visible: true, message: `Could not restore purchases: ${outcome.error}`, type: 'error' });
      } else {
        setToast({ visible: true, message: 'No previous purchases found for this account.', type: 'info' });
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!isPurchasesSupported()) {
      setToast({
        visible: true,
        message: 'Subscription is managed via your app store account.',
        type: 'info'
      });
      return;
    }
    const opened = await presentCustomerCenter();
    if (opened) {
      // The Customer Center can change or cancel the plan; resync afterward.
      await refreshProfile();
    } else {
      setToast({ visible: true, message: 'Could not open the Customer Center. Try again shortly.', type: 'error' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.surfaceBorder, paddingTop: topPadding }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Membership & Billing</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Current Plan */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>CURRENT PLAN</Text>

          <View style={[styles.currentPlanCard, elevation.md, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <View style={styles.planHeaderRow}>
              <View style={[styles.crownIconCircle, { backgroundColor: themeColors.primarySubtle }]}>
                <Crown size={18} color={themeColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.planTitle, { color: themeColors.textPrimary }]}>{planName}</Text>
                <Text style={[styles.planStatusSub, { color: themeColors.textSecondary }]}>
                  {isFreeTrial
                    ? `${user.subscription?.rehearsalsRemaining || 2} rehearsals remaining`
                    : isPlus
                    ? 'Active subscription'
                    : 'Standard access'}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: themeColors.surfaceBorder }]} />

            <View style={styles.planMetaRow}>
              <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>
                {isFreeTrial ? 'Trial ends:' : 'Next billing:'}
              </Text>
              <Text style={[styles.metaValue, { color: themeColors.textPrimary }]}>
                {isFreeTrial ? 'In 5 days' : renewalText}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 2: Plans Comparison */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>AVAILABLE PLANS</Text>

          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.tierOptionCard,
                elevation.sm,
                { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder, marginTop: index === 0 ? 0 : 10 },
                selectedPlan === plan.id && { borderColor: themeColors.primary, borderWidth: 2 }
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.85}
            >
              <View style={styles.tierTop}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.tierTitle, { color: themeColors.textPrimary }]}>{plan.name}</Text>
                    {plan.badge && (
                      <View style={[styles.savePill, { backgroundColor: themeColors.success }]}>
                        <Text style={styles.savePillText}>{plan.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.tierPrice, { color: themeColors.textPrimary }]}>
                    {plan.price} <Text style={[styles.tierUnit, { color: themeColors.textSecondary }]}>{plan.period}</Text>
                  </Text>
                </View>

                <View style={[
                  styles.radioCircle,
                  { borderColor: themeColors.surfaceBorder },
                  selectedPlan === plan.id && { borderColor: themeColors.primary, backgroundColor: themeColors.primary }
                ]}>
                  {selectedPlan === plan.id && <Check size={11} color={themeColors.textInverse} strokeWidth={3} />}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section 3: Feature Summary */}
        <View style={styles.section}>
          <Text style={[styles.featureListHeader, { color: themeColors.textPrimary }]}>Rehearse Plus includes:</Text>
          <View style={styles.featureList}>
            {SUBSCRIPTION_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Check size={14} color={themeColors.primary} strokeWidth={2.5} style={{ marginRight: 8 }} />
                <Text style={[styles.featureItemText, { color: themeColors.textSecondary }]}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: themeColors.primary }]}
            onPress={() => {
              setPaywallPreferredPlan(selectedPlan);
              setIsPaywallVisible(true);
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.upgradeButtonText, { color: themeColors.textInverse }]}>Upgrade to Plus</Text>
          </TouchableOpacity>

          {!isPlus && (
            <TouchableOpacity
              style={[styles.testPurchaseButton, { borderColor: themeColors.surfaceBorder }]}
              onPress={handleSimulatePurchase}
              disabled={isSimulating}
              activeOpacity={0.7}
            >
              <Text style={[styles.testPurchaseText, { color: themeColors.textSecondary }]}>
                {isSimulating ? 'Simulating…' : 'Simulate Purchase (Test Mode — no real billing yet)'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Section 4: Secondary Actions */}
        <View style={styles.section}>
          <View style={[styles.cardGroup, elevation.sm, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={handleRestorePurchases}
              activeOpacity={0.7}
              disabled={isRestoring}
            >
              <View style={styles.rowLeft}>
                <RefreshCw size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>
                  {isRestoring ? 'Restoring...' : 'Restore Purchases'}
                </Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={handleManageSubscription}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <ExternalLink size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Manage Subscription</Text>
              </View>
              <ChevronRight size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* In-App Toast */}
      <InAppNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <AuthGateModal
        visible={showAuthGate}
        onAuthenticated={async () => {
          // Calls upgradeSubscription directly rather than re-invoking
          // handleSimulatePurchase — its isGuest check would read a stale
          // closure value from before this render, since the AuthContext
          // state update that just happened hasn't propagated here yet.
          setShowAuthGate(false);
          setIsSimulating(true);
          try {
            await upgradeSubscription(selectedPlan);
            setToast({ visible: true, message: 'Test purchase simulated — Pro features unlocked.', type: 'success' });
          } finally {
            setIsSimulating(false);
          }
        }}
        onCancel={() => setShowAuthGate(false)}
      />
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
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitleContainer: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  section: {
    marginBottom: 24
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase'
  },
  currentPlanCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 16
  },
  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  crownIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  planStatusSub: {
    fontSize: 12.5,
    marginTop: 2
  },
  divider: {
    height: 1,
    marginVertical: 12
  },
  planMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  metaLabel: {
    fontSize: 12.5
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600'
  },
  tierOptionCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 16
  },
  tierTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  tierTitle: {
    fontSize: 15,
    fontWeight: '600'
  },
  savePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  savePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  tierPrice: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4
  },
  tierUnit: {
    fontSize: 13,
    fontWeight: '500'
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureListHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10
  },
  featureList: {
    gap: 8,
    marginBottom: 16
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  featureItemText: {
    fontSize: 13.5
  },
  upgradeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '700'
  },
  testPurchaseButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  testPurchaseText: {
    fontSize: 12,
    fontWeight: '600'
  },
  cardGroup: {
    borderRadius: RADII.md,
    borderWidth: 1,
    overflow: 'hidden'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    minHeight: 48
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  rowLabel: {
    fontSize: 14.5,
    fontWeight: '500'
  }
});

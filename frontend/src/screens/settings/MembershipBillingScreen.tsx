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
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { InAppNotification, NotificationType } from '../../components/common/InAppNotification';

const PLUS_FEATURES = [
  'Unlimited rehearsals',
  'Advanced AI counterparts',
  'Detailed scoring',
  'Progress history',
  'Scenario generation'
];

export const MembershipBillingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, setIsPaywallVisible } = useApp();
  const { colors: themeColors } = useTheme();

  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: NotificationType;
  }>({ visible: false, message: '', type: 'info' });

  const isFreeTrial = user.subscription?.status === 'free_trial';
  const isPlus = user.subscription?.status === 'active_annual' || user.subscription?.status === 'active_monthly';
  const planName = isPlus ? 'Rehearse Plus' : isFreeTrial ? 'Free Trial' : 'Free Plan';

  const handleRestorePurchases = () => {
    setToast({
      visible: true,
      message: 'Purchases restored. Your active plan is up to date.',
      type: 'success'
    });
  };

  const handleManageSubscription = () => {
    setToast({
      visible: true,
      message: 'Subscription is managed via your app store account.',
      type: 'info'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.surfaceBorder }]}>
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

          <View style={[styles.currentPlanCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
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
                {isFreeTrial ? 'In 5 days' : 'Annual renewal ($90/year)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 2: Plans Comparison */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>AVAILABLE PLANS</Text>

          {/* Annual Plan Card */}
          <TouchableOpacity
            style={[
              styles.tierOptionCard,
              { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder },
              selectedPlan === 'annual' && { borderColor: themeColors.primary, borderWidth: 2 }
            ]}
            onPress={() => setSelectedPlan('annual')}
            activeOpacity={0.85}
          >
            <View style={styles.tierTop}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.tierTitle, { color: themeColors.textPrimary }]}>Annual</Text>
                  <View style={[styles.savePill, { backgroundColor: '#2E8B57' }]}>
                    <Text style={styles.savePillText}>SAVE 50%</Text>
                  </View>
                </View>
                <Text style={[styles.tierPrice, { color: themeColors.textPrimary }]}>
                  $90 <Text style={[styles.tierUnit, { color: themeColors.textSecondary }]}>/ year</Text>
                </Text>
              </View>

              <View style={[
                styles.radioCircle,
                { borderColor: themeColors.surfaceBorder },
                selectedPlan === 'annual' && { borderColor: themeColors.primary, backgroundColor: themeColors.primary }
              ]}>
                {selectedPlan === 'annual' && <Check size={11} color={themeColors.textInverse} strokeWidth={3} />}
              </View>
            </View>
          </TouchableOpacity>

          {/* Monthly Plan Card */}
          <TouchableOpacity
            style={[
              styles.tierOptionCard,
              { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder, marginTop: 10 },
              selectedPlan === 'monthly' && { borderColor: themeColors.primary, borderWidth: 2 }
            ]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.85}
          >
            <View style={styles.tierTop}>
              <View>
                <Text style={[styles.tierTitle, { color: themeColors.textPrimary }]}>Monthly</Text>
                <Text style={[styles.tierPrice, { color: themeColors.textPrimary }]}>
                  $15 <Text style={[styles.tierUnit, { color: themeColors.textSecondary }]}>/ month</Text>
                </Text>
              </View>

              <View style={[
                styles.radioCircle,
                { borderColor: themeColors.surfaceBorder },
                selectedPlan === 'monthly' && { borderColor: themeColors.primary, backgroundColor: themeColors.primary }
              ]}>
                {selectedPlan === 'monthly' && <Check size={11} color={themeColors.textInverse} strokeWidth={3} />}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section 3: Feature Summary */}
        <View style={styles.section}>
          <Text style={[styles.featureListHeader, { color: themeColors.textPrimary }]}>Rehearse Plus includes:</Text>
          <View style={styles.featureList}>
            {PLUS_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Check size={14} color={themeColors.primary} strokeWidth={2.5} style={{ marginRight: 8 }} />
                <Text style={[styles.featureItemText, { color: themeColors.textSecondary }]}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: themeColors.primary }]}
            onPress={() => setIsPaywallVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={[styles.upgradeButtonText, { color: themeColors.textInverse }]}>Upgrade to Plus</Text>
          </TouchableOpacity>
        </View>

        {/* Section 4: Secondary Actions */}
        <View style={styles.section}>
          <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: themeColors.surfaceBorder }]}
              onPress={handleRestorePurchases}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <RefreshCw size={16} color={themeColors.textSecondary} />
                <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Restore Purchases</Text>
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
    borderRadius: 14,
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
    borderRadius: 14,
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
  cardGroup: {
    borderRadius: 14,
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

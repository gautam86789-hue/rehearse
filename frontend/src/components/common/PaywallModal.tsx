import React, { useState } from 'react';
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
import { useTheme } from '../../context/ThemeContext';

export const PaywallModal: React.FC = () => {
  const { isPaywallVisible, setIsPaywallVisible, upgradeSubscription } = useApp();
  const { colors: themeColors, isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradeSubscription(selectedPlan);
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!isPaywallVisible) return null;

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
          >
            <X size={18} color={themeColors.textSecondary} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Header Badge */}
            <View style={styles.badgeRow}>
              <View style={[styles.trialTag, { backgroundColor: themeColors.primarySubtle, borderColor: themeColors.primary }]}>
                <Sparkles size={13} color={themeColors.primary} />
                <Text style={[styles.trialTagText, { color: themeColors.primary }]}>5-DAY UNLIMITED TRIAL</Text>
              </View>
            </View>

            <Text style={[styles.title, { color: themeColors.textPrimary }]}>Rehearse with Confidence</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Master difficult conversations before the stakes are real. Backed by substance scoring, custom situation briefs, and AI counterpart simulation.
            </Text>

            {/* Value checklist */}
            <View style={[styles.featuresList, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}>
              {[
                'Unlimited "Describe Your Situation" Scenarios',
                '5 AI Counterpart Archetype Personalities',
                'Turn-by-Turn Substance Rubric Scoring',
                'Weakest-Line Executive Rewrites',
                'Daily Framework of the Day & 1-Turn Puzzles',
                'Strategic Reply Assistant / Message Coach'
              ].map((feat, idx) => (
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
              {/* Annual Plan (Highlighted) */}
              <TouchableOpacity
                style={[
                  styles.planCard,
                  { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder },
                  selectedPlan === 'annual' && { borderColor: themeColors.primary, backgroundColor: themeColors.surfaceHighlight, borderWidth: 2 }
                ]}
                activeOpacity={0.88}
                onPress={() => setSelectedPlan('annual')}
              >
                <View style={[styles.popularBadge, { backgroundColor: '#2E8B57' }]}>
                  <Text style={styles.popularBadgeText}>BEST VALUE • SAVE 50%</Text>
                </View>
                <View style={styles.planHeader}>
                  <Text style={[styles.planName, { color: themeColors.textPrimary }]}>Annual Masterclass</Text>
                  <Text style={[styles.planPrice, { color: themeColors.textPrimary }]}>
                    $90<Text style={[styles.planPeriod, { color: themeColors.textSecondary }]}>/year</Text>
                  </Text>
                </View>
                <Text style={[styles.planSubtext, { color: themeColors.textSecondary }]}>
                  $7.50/month • 5-day free trial included
                </Text>
              </TouchableOpacity>

              {/* Monthly Plan */}
              <TouchableOpacity
                style={[
                  styles.planCard,
                  { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder },
                  selectedPlan === 'monthly' && { borderColor: themeColors.primary, backgroundColor: themeColors.surfaceHighlight, borderWidth: 2 }
                ]}
                activeOpacity={0.88}
                onPress={() => setSelectedPlan('monthly')}
              >
                <View style={styles.planHeader}>
                  <Text style={[styles.planName, { color: themeColors.textPrimary }]}>Monthly Professional</Text>
                  <Text style={[styles.planPrice, { color: themeColors.textPrimary }]}>
                    $15<Text style={[styles.planPeriod, { color: themeColors.textSecondary }]}>/month</Text>
                  </Text>
                </View>
                <Text style={[styles.planSubtext, { color: themeColors.textSecondary }]}>
                  Billed monthly • Cancel anytime
                </Text>
              </TouchableOpacity>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: themeColors.primary }]}
              onPress={handleUpgrade}
              disabled={isUpgrading}
              activeOpacity={0.85}
            >
              <Text style={[styles.ctaButtonText, { color: themeColors.textInverse }]}>
                {isUpgrading ? 'Activating Pass...' : 'Start 5-Day Free Trial'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footerNote}>
              <ShieldCheck size={14} color={themeColors.textSecondary} />
              <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
                No charge today. Cancel anytime within 5 days in Settings.
              </Text>
            </View>
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
  }
});

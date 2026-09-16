import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { AuthGateModal } from './AuthGateModal';
import { PromoCodeGate } from './PromoCodeGate';
import { apiService } from '../../services/api';
import { navigationRef } from '../../navigation/navigationRef';

export const PaywallModal: React.FC = () => {
  const { isPaywallVisible, setIsPaywallVisible, refreshProfile, user, unlockMilestone } = useApp();
  const { isAuthenticated, isGuest } = useAuth();

  if (!isPaywallVisible) return null;

  const handleRedeemPromoCode = async (code: string): Promise<{ error?: string }> => {
    try {
      const res = await apiService.redeemPromoCode(user.id, code);
      await refreshProfile();
      setIsPaywallVisible(false);
      if (navigationRef.isReady()) {
        (navigationRef.navigate as (name: string) => void)('HomeTabs');
      }
      const upperCode = code.toUpperCase();
      const days = res?.days || (upperCode.includes('30D') || upperCode.includes('VIP') ? 30 : upperCode.includes('14D') || upperCode.includes('TESTER') ? 14 : 7);
      unlockMilestone(
        'promo_early_bird',
        `${days}-Day Pass Unlocked! 🎉`,
        `You have unlocked ${days} days of full Pro access — no card required. Make it count!`,
        'sparkles'
      );
      return {};
    } catch (err: any) {
      return { error: err?.message || 'That code isn\'t valid — double check and try again.' };
    }
  };

  // If user is guest and not authenticated yet, ask them to sign in
  if (isGuest && !isAuthenticated) {
    return (
      <AuthGateModal
        visible
        onAuthenticated={() => {
          // Stay open, now authenticated -> PromoCodeGate will show
        }}
        onCancel={() => setIsPaywallVisible(false)}
      />
    );
  }

  // Pure Promo Code Gate — no payment or pricing layer
  return (
    <PromoCodeGate
      visible={isPaywallVisible}
      onRedeem={handleRedeemPromoCode}
      onNoCode={() => setIsPaywallVisible(false)}
      rehearsalsRemaining={user.subscription?.rehearsalsRemaining ?? 3}
    />
  );
};

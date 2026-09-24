import { UserProfile } from '../types';

// True when the user has no way to use the app right now (paid plan / valid
// promo / free rehearsals all exhausted). Shared by the lock screen and by
// anything that must wait until access is open.
export function isAccessLocked(user: UserProfile | undefined | null, isPro: boolean): boolean {
  if (!user || !user.id) return false;

  const status = user.subscription?.status;
  if (isPro || status === 'active_annual' || status === 'active_three_month' || status === 'active_monthly') {
    return false;
  }

  if (status === 'active_promo') {
    const trialEndsAt = user.subscription?.trialEndsAt;
    return !(!!trialEndsAt && new Date(trialEndsAt).getTime() > Date.now());
  }

  if (status === 'free_trial' || status === 'free_rehearsals') {
    return (user.subscription?.rehearsalsRemaining ?? 0) <= 0;
  }

  return true; // expired / unknown
}

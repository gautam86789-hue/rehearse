import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

// The entitlement identifier configured in the RevenueCat dashboard
// (Entitlements > rehearse_pro) that gates every paid feature in the app.
export const PRO_ENTITLEMENT_ID = 'rehearse_pro';

// Package identifiers as configured in the RevenueCat dashboard's Offering.
// These map 1:1 to the products the user set up: Yearly, Three Month, Monthly.
export const PACKAGE_IDS = {
  yearly: 'yearly',
  threeMonth: 'three_month',
  monthly: 'monthly'
} as const;

export type RehearsePackageId = (typeof PACKAGE_IDS)[keyof typeof PACKAGE_IDS];

// RevenueCat's native SDKs have no web implementation — react-native-purchases
// is iOS/Android only. Every function below is a no-op (or throws a clear,
// catchable error) on web so the rest of the app — including this project's
// Expo-web browser preview used for day-to-day UI iteration — never crashes
// importing this module.
export const isPurchasesSupported = () => Platform.OS === 'ios' || Platform.OS === 'android';

let isConfigured = false;

// Call once, as early as possible (see App.tsx) — before any other Purchases.*
// call, per RevenueCat's setup requirements.
export function configurePurchases(): void {
  if (!isPurchasesSupported() || isConfigured) return;

  const apiKey =
    Platform.OS === 'android'
      ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;

  if (!apiKey) {
    console.warn(`RevenueCat: no API key set for platform "${Platform.OS}" — purchases are disabled.`);
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  // No appUserID here: the SDK starts with RevenueCat's own anonymous id.
  // AppContext calls loginRevenueCatUser() once it knows the app's actual
  // user id (guest-session / user-session / the authenticated Supabase id),
  // so RevenueCat's subscriber record — and the app_user_id RevenueCat sends
  // in webhooks back to our backend — line up with our own user id scheme.
  Purchases.configure({ apiKey });
  isConfigured = true;
}

// Aliases the current (anonymous, by default) RevenueCat subscriber to our
// app's own user id. Safe to call repeatedly with the same id — the SDK
// no-ops if already logged in as that user.
export async function loginRevenueCatUser(appUserId: string): Promise<CustomerInfo | undefined> {
  if (!isPurchasesSupported() || !isConfigured) return undefined;
  try {
    const { customerInfo } = await Purchases.logIn(appUserId);
    return customerInfo;
  } catch (err) {
    console.warn('RevenueCat logIn failed:', err);
    return undefined;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!isPurchasesSupported() || !isConfigured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (err) {
    console.warn('RevenueCat getOfferings failed:', err);
    return null;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isPurchasesSupported() || !isConfigured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (err) {
    console.warn('RevenueCat getCustomerInfo failed:', err);
    return null;
  }
}

export function hasProEntitlement(customerInfo: CustomerInfo | null | undefined): boolean {
  if (!customerInfo) return false;
  return typeof customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== 'undefined';
}

// Finds a package in the current offering by our own identifier convention
// (yearly / three_month / monthly) rather than hardcoding store-specific
// product ids, so this keeps working if the underlying product ids ever
// change in the dashboard.
export async function findPackage(packageId: RehearsePackageId): Promise<PurchasesPackage | null> {
  const offering = await getOfferings();
  if (!offering) return null;
  return offering.availablePackages.find((p) => p.identifier === packageId) || null;
}

export interface PurchaseOutcome {
  success: boolean;
  cancelled: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
  if (!isPurchasesSupported() || !isConfigured) {
    return { success: false, cancelled: false, error: 'Purchases are not supported on this platform.' };
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: hasProEntitlement(customerInfo), cancelled: false, customerInfo };
  } catch (err: any) {
    // RevenueCat sets `userCancelled: true` when the user backs out of the
    // native purchase sheet — that's an expected outcome, not an error to
    // surface as a failure toast.
    if (err?.userCancelled) {
      return { success: false, cancelled: true };
    }
    console.warn('RevenueCat purchasePackage failed:', err);
    return { success: false, cancelled: false, error: err?.message || 'Purchase failed.' };
  }
}

export async function restorePurchases(): Promise<PurchaseOutcome> {
  if (!isPurchasesSupported() || !isConfigured) {
    return { success: false, cancelled: false, error: 'Purchases are not supported on this platform.' };
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: hasProEntitlement(customerInfo), cancelled: false, customerInfo };
  } catch (err: any) {
    console.warn('RevenueCat restorePurchases failed:', err);
    return { success: false, cancelled: false, error: err?.message || 'Restore failed.' };
  }
}

export function addCustomerInfoListener(listener: (info: CustomerInfo) => void): () => void {
  if (!isPurchasesSupported() || !isConfigured) return () => {};
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
}

// Presents RevenueCat's dashboard-designed Paywall UI, but only if the user
// doesn't already have the entitlement — this is the modern, recommended
// entry point (vs. always presenting unconditionally).
export async function presentPaywallIfNeeded(): Promise<PAYWALL_RESULT | null> {
  if (!isPurchasesSupported()) return null;
  try {
    return await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: PRO_ENTITLEMENT_ID
    });
  } catch (err) {
    console.warn('RevenueCat presentPaywallIfNeeded failed:', err);
    return null;
  }
}

// Forces the paywall open regardless of current entitlement (e.g. from a
// "See plans" settings row, where showing it even to existing subscribers —
// so they can see/compare plans — is the desired behavior).
export async function presentPaywall(): Promise<PAYWALL_RESULT | null> {
  if (!isPurchasesSupported()) return null;
  try {
    return await RevenueCatUI.presentPaywall();
  } catch (err) {
    console.warn('RevenueCat presentPaywall failed:', err);
    return null;
  }
}

export { PAYWALL_RESULT };

// Presents RevenueCat's Customer Center — subscription management, refund
// requests (iOS), and cancellation flows configured in the dashboard.
// Makes sense wherever the app already offers "Manage Subscription"
// (MembershipBillingScreen) rather than linking out to the store manually.
export async function presentCustomerCenter(): Promise<boolean> {
  if (!isPurchasesSupported()) return false;
  try {
    await RevenueCatUI.presentCustomerCenter();
    return true;
  } catch (err) {
    console.warn('RevenueCat presentCustomerCenter failed:', err);
    return false;
  }
}

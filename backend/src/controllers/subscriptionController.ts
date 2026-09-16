import { Request, Response, NextFunction } from 'express';
import { memoryDb } from '../db/client.js';
import { z } from 'zod';
import { UserProfile } from '../types/index.js';
import {
  createCashfreeOrder,
  getCashfreeOrderStatus,
  verifyCashfreeWebhookSignature,
  CashfreePlanId
} from '../services/cashfreeService.js';

export const createCashfreeOrderSchema = z.object({
  userId: z.string().optional(),
  plan: z.enum(['monthly', 'three_month', 'annual'])
});

export const upgradeSubscriptionSchema = z.object({
  userId: z.string().optional(),
  plan: z.enum(['monthly', 'three_month', 'annual']),
  paymentMethod: z.string().optional()
});

export const redeemPromoCodeSchema = z.object({
  userId: z.string().optional(),
  code: z.string().min(1)
});

// Shipaton judging-window / tester access — single-use code-gated access
// with no payment method required. Each code works ONLY ONCE globally.
const PROMO_CODES: Record<string, { days: number; label: string }> = {
  // Master tester codes
  KGY2026: { days: 7, label: 'Early Bird — 7 Day Pass' },
  REHEARSE2026: { days: 7, label: 'Early Access — 7 Day Pass' },
  BETA7: { days: 7, label: 'Beta Tester — 7 Day Pass' },
  TESTER2026: { days: 14, label: 'Extended Tester — 14 Day Pass' },
  LAUNCHVIP: { days: 30, label: 'Launch VIP — 30 Day Pass' },

  // Individual 7-Day Single-Use Tester Passes
  'PASS-7D-01': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-02': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-03': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-04': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-05': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-06': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-07': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-08': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-09': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-10': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-11': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-12': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-13': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-14': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-15': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-16': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-17': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-18': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-19': { days: 7, label: 'Tester Pass — 7 Days' },
  'PASS-7D-20': { days: 7, label: 'Tester Pass — 7 Days' },

  // Individual 14-Day Single-Use Passes
  'PASS-14D-01': { days: 14, label: 'Tester Pass — 14 Days' },
  'PASS-14D-02': { days: 14, label: 'Tester Pass — 14 Days' },
  'PASS-14D-03': { days: 14, label: 'Tester Pass — 14 Days' },
  'PASS-14D-04': { days: 14, label: 'Tester Pass — 14 Days' },
  'PASS-14D-05': { days: 14, label: 'Tester Pass — 14 Days' },

  // VIP 30-Day Passes
  'VIP-30D-01': { days: 30, label: 'VIP Pass — 30 Days' },
  'VIP-30D-02': { days: 30, label: 'VIP Pass — 30 Days' },
  'VIP-30D-03': { days: 30, label: 'VIP Pass — 30 Days' }
};
const PROMO_DURATION_MS = (days: number) => days * 24 * 60 * 60 * 1000;

// Our RevenueCat entitlement identifier — see frontend/src/services/purchases.ts.
const PRO_ENTITLEMENT_ID = 'rehearse_pro';

function subscriptionForCashfreePlan(plan: CashfreePlanId): {
  status: UserProfile['subscription']['status'];
  planName: string;
} {
  switch (plan) {
    case 'annual':
      return { status: 'active_annual', planName: 'Annual Masterclass' };
    case 'three_month':
      return { status: 'active_three_month', planName: 'Three Month Pass' };
    case 'monthly':
    default:
      return { status: 'active_monthly', planName: 'Monthly Professional' };
  }
}

// Maps a RevenueCat product identifier (== the package identifier configured
// in the dashboard: 'yearly' | 'three_month' | 'monthly') to this app's own
// subscription status/plan-name vocabulary.
function subscriptionForProductId(productId: string | undefined): {
  status: UserProfile['subscription']['status'];
  planName: string;
} {
  switch (productId) {
    case 'yearly':
      return { status: 'active_annual', planName: 'Annual Masterclass Pass' };
    case 'three_month':
      return { status: 'active_three_month', planName: 'Three Month Pass' };
    case 'monthly':
    default:
      return { status: 'active_monthly', planName: 'Monthly Professional' };
  }
}

export class SubscriptionController {
  async getPlans(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        trialDays: 5,
        currency: 'USD',
        plans: [
          {
            id: 'rehearse_annual_90',
            name: 'Annual Masterclass Pass',
            pricePerYear: 90,
            priceMonthlyEquivalent: 7.50,
            billingPeriod: 'annual',
            isRecommended: true,
            discountText: 'Save 17% vs Monthly',
            features: [
              '5-Day Free Trial (Cancel anytime)',
              'Unlimited Describe-Your-Situation Scenarios',
              'All 5 AI Archetype Counterparts',
              'Turn-by-Turn Substance Rubric Scoring',
              'Weakest-Line Executive Rewrites',
              'Daily Frameworks & Tricky Puzzles',
              'Strategic Reply Assistant / Message Coach'
            ]
          },
          {
            id: 'rehearse_monthly_9',
            name: 'Monthly Professional',
            pricePerMonth: 9,
            billingPeriod: 'monthly',
            isRecommended: false,
            discountText: 'Billed monthly',
            features: [
              '5-Day Free Trial (Cancel anytime)',
              'Unlimited Scenarios & Roleplay Sessions',
              'Full Substance Rubric & Rewrites',
              'Daily Practice & Puzzles'
            ]
          }
        ]
      });
    } catch (err) {
      next(err);
    }
  }

  async upgradePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, plan } = req.body;
      const resolvedUserId = userId || req.userId || 'demo-user-1';
      const user = await memoryDb.getUser(resolvedUserId);

      const status: UserProfile['subscription']['status'] =
        plan === 'annual' ? 'active_annual' : plan === 'three_month' ? 'active_three_month' : 'active_monthly';
      const planName =
        plan === 'annual'
          ? 'Annual Masterclass Pass ($69/yr)'
          : plan === 'three_month'
          ? 'Three Month Pass ($19/3mo)'
          : 'Monthly Professional ($9/mo)';

      const updated = await memoryDb.updateUser(user.id, {
        subscription: {
          status,
          rehearsalsRemaining: 999999,
          planName,
          trialEndsAt: undefined
        }
      });

      res.json({
        message: 'Subscription successfully activated',
        subscription: updated.subscription
      });
    } catch (err) {
      next(err);
    }
  }

  async redeemPromoCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, code } = req.body;
      const resolvedUserId = userId || req.userId || 'demo-user-1';
      const normalizedCode = String(code).trim().toUpperCase();
      const promo = PROMO_CODES[normalizedCode];

      if (!promo) {
        res.status(400).json({ error: 'That code isn\'t valid — double check and try again.' });
        return;
      }

      const user = await memoryDb.getUser(resolvedUserId);

      // Check if this specific access code has ALREADY been redeemed (single-use code rule)
      const isAlreadyUsed = await memoryDb.isPromoCodeRedeemed(normalizedCode);
      if (isAlreadyUsed) {
        res.status(400).json({ error: 'This access code has already been used. Please request a new code.' });
        return;
      }

      // Compute new expiration: extend if active, or calculate from now
      const existingEndsAt = user.subscription?.trialEndsAt ? new Date(user.subscription.trialEndsAt).getTime() : 0;
      const baseTime = Math.max(Date.now(), existingEndsAt);
      const trialEndsAt = new Date(baseTime + PROMO_DURATION_MS(promo.days)).toISOString();

      const updated = await memoryDb.updateUser(user.id, {
        subscription: {
          status: 'active_promo',
          rehearsalsRemaining: 999999,
          planName: promo.label,
          trialEndsAt
        },
        promoRedeemed: true,
        emailVerified: true
      });

      // Mark code as consumed globally so it cannot be reused
      await memoryDb.markPromoCodeRedeemed(normalizedCode, user.id, trialEndsAt);

      res.json({
        message: 'Promo code redeemed',
        days: promo.days,
        subscription: updated.subscription
      });
    } catch (err) {
      next(err);
    }
  }

  // RevenueCat calls this on every entitlement-affecting event (purchase,
  // renewal, cancellation, expiration, etc). The app_user_id in each event is
  // whatever id the client passed to Purchases.logIn() — which the frontend
  // keeps aligned with our own user.id scheme (see AppContext's login effect)
  // — so this is the one place subscription state becomes durable server-side,
  // independent of whether the client that made the purchase is still open.
  async handleRevenueCatWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expectedSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
      if (!expectedSecret) {
        // Fail closed: an unconfigured secret must reject every request, not
        // skip verification — the previous `if (expectedSecret)` guard meant
        // a missing env var silently accepted ANY caller as a legitimate
        // RevenueCat webhook, letting them grant themselves free Pro access.
        console.error('REVENUECAT_WEBHOOK_SECRET is not configured — rejecting webhook request');
        res.status(401).json({ error: 'Webhook not configured' });
        return;
      }
      const authHeader = req.headers['authorization'];
      const provided = Array.isArray(authHeader) ? authHeader[0] : authHeader;
      const isValid = provided === expectedSecret || provided === `Bearer ${expectedSecret}`;
      if (!isValid) {
        res.status(401).json({ error: 'Invalid webhook authorization' });
        return;
      }

      const event = req.body?.event;
      const eventType: string | undefined = event?.type;
      const appUserId: string | undefined = event?.app_user_id;
      const productId: string | undefined = event?.product_id;
      const entitlementIds: string[] = event?.entitlement_ids || [];

      console.log('RevenueCat webhook:', eventType, appUserId, productId);

      // Not every RevenueCat event carries a resolvable app user or touches
      // our entitlement — ack and no-op rather than erroring, since RevenueCat
      // retries on non-2xx responses.
      if (!appUserId || !entitlementIds.includes(PRO_ENTITLEMENT_ID)) {
        res.status(200).json({ received: true });
        return;
      }

      switch (eventType) {
        case 'INITIAL_PURCHASE':
        case 'RENEWAL':
        case 'UNCANCELLATION':
        case 'PRODUCT_CHANGE': {
          const { status, planName } = subscriptionForProductId(productId);
          await memoryDb.updateUser(appUserId, {
            subscription: {
              status,
              rehearsalsRemaining: 999999,
              planName,
              trialEndsAt: undefined
            }
          });
          break;
        }
        // CANCELLATION means auto-renew was turned off, not that access ended
        // — the entitlement stays active until EXPIRATION actually fires.
        case 'CANCELLATION':
          break;
        case 'EXPIRATION': {
          const user = await memoryDb.getUser(appUserId);
          await memoryDb.updateUser(appUserId, {
            subscription: {
              status: 'expired',
              rehearsalsRemaining: 0,
              planName: undefined,
              trialEndsAt: user.subscription.trialEndsAt
            }
          });
          break;
        }
        default:
          break;
      }

      res.status(200).json({ received: true });
    } catch (err) {
      next(err);
    }
  }

  // Creates a Cashfree order and hands back the payment_session_id the
  // frontend's WebView checkout screen needs to render Cashfree's hosted
  // checkout (see CashfreeCheckoutScreen.tsx). The actual entitlement grant
  // happens in handleCashfreeWebhook once Cashfree confirms payment, not
  // here — this endpoint only opens the payment session.
  createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, plan } = req.body as { userId?: string; plan: CashfreePlanId };
      const resolvedUserId = userId || req.userId || 'demo-user-1';
      const user = await memoryDb.getUser(resolvedUserId);

      const order = await createCashfreeOrder(resolvedUserId, plan, user.email, undefined);
      res.status(201).json(order);
    } catch (err: any) {
      // Surfaces Cashfree's own error text (e.g. the pending-activation
      // message) instead of a generic 500, so the frontend can show it.
      res.status(502).json({ error: err?.message || 'Failed to create Cashfree order' });
    }
  };

  // Cashfree calls this on payment events (PAYMENT_SUCCESS, PAYMENT_FAILED,
  // etc). Verified via HMAC-SHA256 over the raw body (see
  // cashfreeService.verifyCashfreeWebhookSignature) — Cashfree's own scheme,
  // distinct from RevenueCat's shared-secret header above.
  handleCashfreeWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const signature = req.headers['x-webhook-signature'] as string | undefined;
      const timestamp = req.headers['x-webhook-timestamp'] as string | undefined;
      const rawBody = (req as any).rawBody as string | undefined;

      if (!signature || !timestamp || !rawBody || !verifyCashfreeWebhookSignature(rawBody, timestamp, signature)) {
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
      }

      const eventType: string | undefined = req.body?.type;
      const orderData = req.body?.data?.order;
      const orderId: string | undefined = orderData?.order_id;
      const plan: CashfreePlanId | undefined = orderData?.order_tags?.plan;
      const customerId: string | undefined = orderData?.customer_details?.customer_id;

      console.log('Cashfree webhook:', eventType, orderId, customerId);

      if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' && customerId && plan) {
        const { status, planName } = subscriptionForCashfreePlan(plan);
        await memoryDb.updateUser(customerId, {
          subscription: {
            status,
            rehearsalsRemaining: 999999,
            planName,
            trialEndsAt: undefined
          }
        });
      }

      res.status(200).json({ received: true });
    } catch (err) {
      next(err);
    }
  };

  // Lightweight polling endpoint the checkout WebView calls right after
  // Cashfree redirects back, in case the webhook hasn't landed yet (network
  // timing) — checks the order status directly with Cashfree rather than
  // waiting on our own webhook delivery.
  getOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = String(req.params.orderId);
      const result = await getCashfreeOrderStatus(orderId);
      res.json(result);
    } catch (err: any) {
      res.status(502).json({ error: err?.message || 'Failed to fetch Cashfree order status' });
    }
  };
}

export const subscriptionController = new SubscriptionController();

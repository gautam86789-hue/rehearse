import { Request, Response, NextFunction } from 'express';
import { memoryDb } from '../db/client.js';
import { z } from 'zod';
import { UserProfile } from '../types/index.js';

export const upgradeSubscriptionSchema = z.object({
  userId: z.string().optional(),
  plan: z.enum(['monthly', 'three_month', 'annual']),
  paymentMethod: z.string().optional()
});

// Our RevenueCat entitlement identifier — see frontend/src/services/purchases.ts.
const PRO_ENTITLEMENT_ID = 'rehearse_pro';

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
          ? 'Annual Masterclass Pass ($90/yr)'
          : plan === 'three_month'
          ? 'Three Month Pass ($21/3mo)'
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

  // RevenueCat calls this on every entitlement-affecting event (purchase,
  // renewal, cancellation, expiration, etc). The app_user_id in each event is
  // whatever id the client passed to Purchases.logIn() — which the frontend
  // keeps aligned with our own user.id scheme (see AppContext's login effect)
  // — so this is the one place subscription state becomes durable server-side,
  // independent of whether the client that made the purchase is still open.
  async handleRevenueCatWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expectedSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
      if (expectedSecret) {
        const authHeader = req.headers['authorization'];
        const provided = Array.isArray(authHeader) ? authHeader[0] : authHeader;
        const isValid = provided === expectedSecret || provided === `Bearer ${expectedSecret}`;
        if (!isValid) {
          res.status(401).json({ error: 'Invalid webhook authorization' });
          return;
        }
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
}

export const subscriptionController = new SubscriptionController();

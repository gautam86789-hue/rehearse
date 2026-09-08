import { Request, Response, NextFunction } from 'express';
import { memoryDb } from '../db/client.js';
import { z } from 'zod';

export const upgradeSubscriptionSchema = z.object({
  userId: z.string().optional().default('demo-user-1'),
  plan: z.enum(['monthly', 'annual']),
  paymentMethod: z.string().optional()
});

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
      const user = memoryDb.getUser(userId || 'demo-user-1');

      const status = plan === 'annual' ? 'active_annual' : 'active_monthly';
      const planName = plan === 'annual' ? 'Annual Masterclass Pass ($90/yr)' : 'Monthly Professional ($9/mo)';

      const updated = memoryDb.updateUser(user.id, {
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

  async handleRevenueCatWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = req.body?.event;
      console.log('Received RevenueCat Webhook Event:', event?.type);
      // Process entitlement changes...
      res.status(200).json({ received: true });
    } catch (err) {
      next(err);
    }
  }
}

export const subscriptionController = new SubscriptionController();

// Single source of truth for plan pricing/copy and the feature list, used by
// every subscription-facing surface (PaywallModal, MembershipBillingScreen).
// Before this, each screen hardcoded its own plan cards and its own feature
// list — they'd quietly drifted to show different claims about the same
// product (missing the "three_month" plan entirely, and two different
// feature lists), which is exactly the kind of thing that erodes trust right
// at the moment someone's deciding whether to pay. Update prices here once
// real Play Console / App Store Connect products are configured — these are
// placeholders consistent with the app's actual RevenueCat product ids
// ('yearly', 'three_month', 'monthly'; see services/purchases.ts).

export type SubscriptionPlanId = 'annual' | 'three_month' | 'monthly';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  price: string;
  period: string;
  effectiveMonthly: string;
  /** Colored "BEST VALUE"-style pill — reserved for the one plan meant to
   *  stand out, not every plan that happens to save money (Contrast Effect
   *  only works if it's contrasting something). */
  badge?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'annual',
    name: 'Annual Masterclass',
    price: '$40',
    period: '/year',
    effectiveMonthly: '$3.33/month',
    badge: 'BEST VALUE • SAVE 33%'
  },
  {
    id: 'three_month',
    name: 'Three Month Pass',
    price: '$13',
    period: '/3 months',
    effectiveMonthly: '$4.33/month',
    badge: 'SAVE 13%'
  },
  {
    id: 'monthly',
    name: 'Monthly Professional',
    price: '$5',
    period: '/month',
    effectiveMonthly: 'Billed monthly • Cancel anytime'
  }
];

export const SUBSCRIPTION_FEATURES: string[] = [
  'Unlimited "Describe Your Situation" Scenarios',
  '5 AI Counterpart Archetype Personalities',
  'Turn-by-Turn Substance Rubric Scoring',
  'Weakest-Line Executive Rewrites',
  'Daily Framework of the Day & 1-Turn Puzzles',
  'Strategic Reply Assistant / Message Coach',
  'Voice Mode (Upcoming)'
];

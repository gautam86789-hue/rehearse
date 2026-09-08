export const SUBSCRIPTION_PLANS = [
  {
    id: 'rehearse_annual_90',
    name: 'Annual Masterclass Pass',
    price: 90,
    billingPeriod: 'annual',
    isRecommended: true,
    discountText: 'Save 17% vs Monthly',
    features: [
      '5-Day Free Trial (Cancel anytime)',
      'Unlimited "Describe Your Situation" Scenarios',
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
    price: 9,
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
] as const;

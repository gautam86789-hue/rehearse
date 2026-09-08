export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'annual';
  isRecommended?: boolean;
  discountText?: string;
  features: string[];
}

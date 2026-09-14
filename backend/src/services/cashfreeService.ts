import crypto from 'crypto';

// Cashfree Payment Gateway — direct-APK checkout path (see subscriptionController
// for how this fits alongside the existing RevenueCat/Play Billing flow).
// Docs: https://www.cashfree.com/docs/api-reference/payments/latest/overview

const CASHFREE_API_VERSION = '2023-08-01';

function baseUrl(): string {
  return process.env.CASHFREE_ENV === 'sandbox'
    ? 'https://sandbox.cashfree.com/pg'
    : 'https://api.cashfree.com/pg';
}

function authHeaders(): Record<string, string> {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!appId || !secretKey) {
    throw new Error('CASHFREE_APP_ID / CASHFREE_SECRET_KEY not configured');
  }
  return {
    'x-client-id': appId,
    'x-client-secret': secretKey,
    'x-api-version': CASHFREE_API_VERSION,
    'Content-Type': 'application/json'
  };
}

export type CashfreePlanId = 'monthly' | 'three_month' | 'annual';

// Cashfree settles in INR — these are placeholder India price points roughly
// matching the app's $5 / $13 / $40 USD tiers (~83 INR/USD, rounded to a
// natural price ending). Adjust once real pricing is decided.
const PLAN_AMOUNT_INR: Record<CashfreePlanId, number> = {
  monthly: 399,
  three_month: 1099,
  annual: 3299
};

export interface CreateOrderResult {
  orderId: string;
  paymentSessionId: string;
  amount: number;
}

export async function createCashfreeOrder(
  userId: string,
  plan: CashfreePlanId,
  customerEmail: string | undefined,
  customerPhone: string | undefined
): Promise<CreateOrderResult> {
  const amount = PLAN_AMOUNT_INR[plan];
  if (!amount) throw new Error(`Unknown plan: ${plan}`);

  const orderId = `rehearse_${plan}_${userId}_${Date.now()}`;

  const res = await fetch(`${baseUrl()}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: userId,
        customer_email: customerEmail || undefined,
        // Cashfree requires a phone number; a placeholder keeps the order
        // creation working for accounts that haven't collected one yet —
        // real checkout still asks the payer for their actual number.
        customer_phone: customerPhone || '9999999999'
      },
      order_meta: {
        // return_url is where Cashfree redirects the WebView after checkout
        // completes — the frontend's checkout screen watches for this exact
        // path to know the flow finished (see CashfreeCheckoutScreen.tsx).
        return_url: 'https://rehearse-backend-fu90.onrender.com/api/v1/subscriptions/cashfree/return?order_id={order_id}'
      },
      order_tags: { plan }
    })
  });

  const data = (await res.json()) as any;
  if (!res.ok) {
    throw new Error(data?.message || `Cashfree order creation failed (${res.status})`);
  }

  return {
    orderId: data.order_id,
    paymentSessionId: data.payment_session_id,
    amount
  };
}

export async function getCashfreeOrderStatus(orderId: string): Promise<{ status: string; plan?: CashfreePlanId }> {
  const res = await fetch(`${baseUrl()}/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = (await res.json()) as any;
  if (!res.ok) {
    throw new Error(data?.message || `Cashfree order lookup failed (${res.status})`);
  }
  return { status: data.order_status, plan: data.order_tags?.plan };
}

// Cashfree signs webhooks with HMAC-SHA256 over `timestamp + rawBody`, keyed
// by the client secret — see https://www.cashfree.com/docs/payments/online/webhooks/webhook-signature
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!secretKey) return false;
  const expected = crypto
    .createHmac('sha256', secretKey)
    .update(timestamp + rawBody)
    .digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

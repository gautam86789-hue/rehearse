import { Router } from 'express';
import {
  subscriptionController,
  upgradeSubscriptionSchema,
  redeemPromoCodeSchema,
  createCashfreeOrderSchema
} from '../controllers/subscriptionController.js';
import { validateBody } from '../middleware/errorHandler.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

router.get('/plans', subscriptionController.getPlans);
router.post('/upgrade', validateBody(upgradeSubscriptionSchema), subscriptionController.upgradePlan);
// Access codes are short and guessable — cap attempts.
router.post('/redeem-code', rateLimit({ windowMs: 60_000, max: 8 }), validateBody(redeemPromoCodeSchema), subscriptionController.redeemPromoCode);
router.post('/webhook', subscriptionController.handleRevenueCatWebhook);

router.post('/cashfree/create-order', validateBody(createCashfreeOrderSchema), subscriptionController.createOrder);
router.post('/cashfree/webhook', subscriptionController.handleCashfreeWebhook);
router.get('/cashfree/order/:orderId', subscriptionController.getOrderStatus);
// Fallback landing page if the checkout WebView doesn't intercept the
// redirect itself (see CashfreeCheckoutScreen.tsx) — Cashfree requires a
// real https return_url, and this keeps it from dead-ending on a 404.
router.get('/cashfree/return', (_req, res) => {
  res.send('<html><body style="font-family:sans-serif;text-align:center;padding-top:60px"><h2>Payment complete</h2><p>You can close this window and return to the app.</p></body></html>');
});

export default router;

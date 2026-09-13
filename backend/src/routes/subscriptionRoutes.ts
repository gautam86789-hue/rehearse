import { Router } from 'express';
import { subscriptionController, upgradeSubscriptionSchema, redeemPromoCodeSchema } from '../controllers/subscriptionController.js';
import { validateBody } from '../middleware/errorHandler.js';

const router = Router();

router.get('/plans', subscriptionController.getPlans);
router.post('/upgrade', validateBody(upgradeSubscriptionSchema), subscriptionController.upgradePlan);
router.post('/redeem-code', validateBody(redeemPromoCodeSchema), subscriptionController.redeemPromoCode);
router.post('/webhook', subscriptionController.handleRevenueCatWebhook);

export default router;

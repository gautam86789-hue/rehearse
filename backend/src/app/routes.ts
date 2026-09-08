import { Router } from 'express';
import { healthCheckHandler } from './health.js';
import authRoutes from '../routes/authRoutes.js';
import scenarioRoutes from '../routes/scenarioRoutes.js';
import roleplayRoutes from '../routes/roleplayRoutes.js';
import dailyRoutes from '../routes/dailyRoutes.js';
import replyCoachRoutes from '../routes/replyCoachRoutes.js';
import subscriptionRoutes from '../routes/subscriptionRoutes.js';

const router = Router();

router.get('/health', healthCheckHandler);
router.use('/auth', authRoutes);
router.use('/scenarios', scenarioRoutes);
router.use('/roleplay', roleplayRoutes);
router.use('/daily', dailyRoutes);
router.use('/reply-coach', replyCoachRoutes);
router.use('/subscriptions', subscriptionRoutes);

export default router;

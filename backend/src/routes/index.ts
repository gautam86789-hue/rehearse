import { Router } from 'express';
import authRoutes from './authRoutes.js';
import scenarioRoutes from './scenarioRoutes.js';
import roleplayRoutes from './roleplayRoutes.js';
import dailyRoutes from './dailyRoutes.js';
import replyCoachRoutes from './replyCoachRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';
import assistantRoutes from './assistantRoutes.js';
import storyRoutes from './storyRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/scenarios', scenarioRoutes);
router.use('/roleplay', roleplayRoutes);
router.use('/daily', dailyRoutes);
router.use('/reply-coach', replyCoachRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/assistant', assistantRoutes);
router.use('/story', storyRoutes);

router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'Rehearse API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;

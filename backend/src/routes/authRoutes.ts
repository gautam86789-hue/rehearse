import { Router } from 'express';
import { authController, onboardingSchema } from '../controllers/authController.js';
import { validateBody } from '../middleware/errorHandler.js';

const router = Router();

router.get('/profile', authController.getProfile);
router.post('/onboarding', validateBody(onboardingSchema), authController.completeOnboarding);
router.get('/progress', authController.getProgress);

export default router;

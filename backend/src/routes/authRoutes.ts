import { Router } from 'express';
import {
  authController,
  registerSchema,
  loginSchema,
  onboardingSchema
} from '../controllers/authController.js';
import { validateBody } from '../middleware/errorHandler.js';

const router = Router();

// Registration & Login
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/signup', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/signin', validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);

// User Profile & Onboarding
router.get('/me', authController.getMe);
router.get('/profile', authController.getProfile);
router.post('/onboarding', validateBody(onboardingSchema), authController.completeOnboarding);
router.get('/progress', authController.getProgress);

export default router;

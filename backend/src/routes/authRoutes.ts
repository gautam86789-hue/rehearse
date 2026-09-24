import { Router } from 'express';
import {
  authController,
  registerSchema,
  loginSchema,
  onboardingSchema,
  updateProfileSchema,
  sendVerificationSchema,
  verifyEmailSchema
} from '../controllers/authController.js';
import { validateBody } from '../middleware/errorHandler.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

// Slow down password / code guessing: 10 attempts a minute per client.
const authLimiter = rateLimit({ windowMs: 60_000, max: 10, keyFrom: (req) => String(req.body?.email || '').toLowerCase() });

// Registration & Login
router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/signup', authLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.post('/signin', authLimiter, validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Email Verification
router.post('/send-verification', validateBody(sendVerificationSchema), authController.sendVerificationCode);
router.post('/verify-email', validateBody(verifyEmailSchema), authController.verifyEmail);

// User Profile & Onboarding
router.get('/me', authController.getMe);
router.get('/profile', authController.getProfile);
router.put('/profile', validateBody(updateProfileSchema), authController.updateProfile);
router.post('/onboarding', validateBody(onboardingSchema), authController.completeOnboarding);
router.get('/progress', authController.getProgress);

export default router;

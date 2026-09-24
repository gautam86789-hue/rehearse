import { assertCanAccessUser } from '../middleware/ownership.js';
import { Request, Response, NextFunction } from 'express';
import { memoryDb } from '../db/client.js';
import { sendVerificationEmail } from '../services/emailService.js';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().optional(),
  role: z.string().optional(),
  experienceLevel: z.string().optional(),
  audience: z.enum(['founders_investors', 'new_managers', 'mba_students', 'professionals', 'new_hires']).optional(),
  primaryDreadCategory: z.string().optional()
});

export const sendVerificationSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email().optional()
});

export const verifyEmailSchema = z.object({
  userId: z.string().min(1),
  code: z.string().min(1)
});

const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;
// Soft per-user cooldown against "resend" spam-clicking — resets on
// server restart, which is an acceptable tradeoff for a rate limit whose
// only job is stopping a single impatient tapper, not abuse at scale.
const RESEND_COOLDOWN_MS = 60 * 1000;
const lastSentAt = new Map<string, number>();

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

export const onboardingSchema = z.object({
  userId: z.string().optional(),
  role: z.string().min(1),
  experienceLevel: z.string().min(1),
  primaryDreadCategory: z.string().min(1),
  audience: z.enum(['founders_investors', 'new_managers', 'mba_students', 'professionals', 'new_hires']).optional()
});

export const updateProfileSchema = z.object({
  userId: z.string().optional(),
  name: z.string().trim().min(1, 'Name cannot be empty').max(60, 'Name is too long')
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, fullName, role, experienceLevel, audience, primaryDreadCategory } = req.body;
      const { user, token } = await memoryDb.createUser({
        email,
        password,
        fullName,
        role,
        experienceLevel,
        audience,
        primaryDreadCategory
      });

      // Fire-and-forget: a slow or failing email provider shouldn't hold up
      // account creation, or fail it outright — verification is only ever
      // required later, at redemption time, not at signup.
      if (user.email) {
        const code = generateCode();
        const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS).toISOString();
        lastSentAt.set(user.id, Date.now());
        memoryDb
          .setEmailVerificationCode(user.id, code, expiresAt)
          .then(() => sendVerificationEmail(user.email!, code))
          .catch((err) => console.warn('Failed to send signup verification email:', err));
      }

      res.status(201).json({
        user,
        token,
        message: 'Account created successfully'
      });
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        res.status(409).json({ error: err.message });
        return;
      }
      next(err);
    }
  }

  async sendVerificationCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, email: bodyEmail } = req.body;
      const resolvedUserId = userId || req.userId;
      if (!resolvedUserId) {
        res.status(400).json({ error: 'userId is required.' });
        return;
      }

      const lastSent = lastSentAt.get(resolvedUserId);
      if (lastSent && Date.now() - lastSent < RESEND_COOLDOWN_MS) {
        res.status(429).json({ error: 'Please wait a moment before requesting another code.' });
        return;
      }

      const user = await memoryDb.getUser(resolvedUserId);

      // Prefer the real email supplied by the client (the Supabase auth email)
      // over whatever is stored in the DB — auto-vivified rows have a
      // placeholder ${userId}@rehearse.local that would send to the wrong address.
      let targetEmail = bodyEmail || user.email;
      if (!targetEmail || targetEmail.endsWith('@rehearse.local')) {
        if (bodyEmail) {
          targetEmail = bodyEmail;
        } else {
          res.status(400).json({ error: 'This account has no email address on file.' });
          return;
        }
      }

      // Persist the real email back to the user record so future calls work
      // without always needing the client to pass it.
      if (bodyEmail && bodyEmail !== user.email) {
        await memoryDb.updateUser(resolvedUserId, { email: bodyEmail } as any).catch(() => {});
      }

      const code = generateCode();
      const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS).toISOString();
      lastSentAt.set(resolvedUserId, Date.now());
      await memoryDb.setEmailVerificationCode(resolvedUserId, code, expiresAt);
      await sendVerificationEmail(targetEmail, code);

      res.json({ message: 'Verification code sent.' });
    } catch (err) {
      next(err);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, code } = req.body;
      const resolvedUserId = userId || req.userId;
      if (!resolvedUserId) {
        res.status(400).json({ error: 'userId is required.' });
        return;
      }

      const result = await memoryDb.verifyEmailCode(resolvedUserId, String(code).trim());
      if (!result.success) {
        res.status(400).json({ error: result.error || 'Verification failed.' });
        return;
      }

      const user = await memoryDb.getUser(resolvedUserId);
      res.json({ user, message: 'Email verified.' });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, token } = await memoryDb.authenticateUser(email, password);
      res.json({
        user,
        token,
        message: 'Logged in successfully'
      });
    } catch (err: any) {
      if (err.message?.includes('Invalid email or password')) {
        res.status(401).json({ error: err.message });
        return;
      }
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice('Bearer '.length).trim();
        await memoryDb.deleteSession(token);
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId || (req.query.userId as string) || 'demo-user-1';
      const user = await memoryDb.getUser(userId);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }

  // Lets a user rename themselves — the app used to keep the edited name only
  // on the device, so the next server sync brought the old one back.
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, name } = req.body;
      const resolvedUserId = userId || req.userId;
      if (!resolvedUserId) {
        res.status(400).json({ error: 'userId is required.' });
        return;
      }
      if (!(await assertCanAccessUser(req, res, resolvedUserId))) return;
      const updated = await memoryDb.updateUser(resolvedUserId, { name, fullName: name } as any);
      res.json({ user: updated });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.query.userId as string) || req.userId || 'demo-user-1';
      const user = await memoryDb.getUser(userId);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }

  async completeOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, role, experienceLevel, primaryDreadCategory, audience } = req.body;
      const resolvedUserId = userId || req.userId || 'demo-user-1';
      const updated = await memoryDb.updateUser(resolvedUserId, {
        role,
        experienceLevel,
        primaryDreadCategory,
        ...(audience ? { audience } : {})
      });
      res.json({ user: updated, message: 'Onboarding completed successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.query.userId as string) || req.userId || 'demo-user-1';
      const user = await memoryDb.getUser(userId);
      const sessions = await memoryDb.getUserSessions(userId);

      const completedSessions = sessions.filter((s) => s.status === 'completed' && s.scorecard);
      const averageScore = completedSessions.length > 0
        ? Math.round(completedSessions.reduce((acc, s) => acc + (s.scorecard?.overallScore || 0), 0) / completedSessions.length)
        : 0;

      // Category breakdown
      const categoryScores: Record<string, { totalScore: number; count: number }> = {};
      completedSessions.forEach((s) => {
        const cat = s.scenario.category;
        if (!categoryScores[cat]) {
          categoryScores[cat] = { totalScore: 0, count: 0 };
        }
        categoryScores[cat].totalScore += s.scorecard?.overallScore || 0;
        categoryScores[cat].count += 1;
      });

      const skillBreakdown = Object.entries(categoryScores).map(([category, stats]) => ({
        category,
        averageScore: Math.round(stats.totalScore / stats.count),
        completedCount: stats.count
      }));

      res.json({
        user,
        stats: {
          totalCompleted: completedSessions.length,
          averageScore,
          skillBreakdown,
          recentSessions: completedSessions.slice(0, 5)
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();

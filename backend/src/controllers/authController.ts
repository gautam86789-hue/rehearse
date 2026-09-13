import { Request, Response, NextFunction } from 'express';
import { memoryDb } from '../db/client.js';
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

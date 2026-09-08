import { Request, Response, NextFunction } from 'express';
import { memoryDb } from '../db/client.js';
import { z } from 'zod';

export const onboardingSchema = z.object({
  userId: z.string().optional().default('demo-user-1'),
  role: z.string().min(1),
  experienceLevel: z.string().min(1),
  primaryDreadCategory: z.string().min(1)
});

export class AuthController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.query.userId as string) || 'demo-user-1';
      const user = memoryDb.getUser(userId);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }

  async completeOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, role, experienceLevel, primaryDreadCategory } = req.body;
      const updated = memoryDb.updateUser(userId || 'demo-user-1', {
        role,
        experienceLevel,
        primaryDreadCategory
      });
      res.json({ user: updated, message: 'Onboarding completed successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.query.userId as string) || 'demo-user-1';
      const user = memoryDb.getUser(userId);
      const sessions = memoryDb.getUserSessions(userId);

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

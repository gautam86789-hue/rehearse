import { Request, Response, NextFunction } from 'express';
import { assistantService } from '../services/assistantService.js';
import { z } from 'zod';

export const assistantChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string()
      })
    )
    .optional(),
  userContext: z.object({
    name: z.string(),
    dailyChallengeDone: z.boolean().optional(),
    audience: z.string().optional(),
    role: z.string(),
    totalRehearsals: z.number(),
    currentStreak: z.number(),
    longestStreak: z.number()
  }),
  recentSessions: z
    .array(
      z.object({
        scenarioTitle: z.string(),
        category: z.string(),
        overallScore: z.number(),
        clarity: z.number(),
        empathy: z.number(),
        assertiveness: z.number(),
        listening: z.number(),
        growthAreas: z.array(z.string()),
        completedAt: z.string()
      })
    )
    .optional()
});

export class AssistantController {
  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message, conversationHistory, userContext, recentSessions } = req.body;

      const { reply, actions } = await assistantService.chat({
        message,
        conversationHistory: conversationHistory || [],
        userContext,
        recentSessions: recentSessions || []
      });

      res.json({ reply, actions });
    } catch (err) {
      next(err);
    }
  }
}

export const assistantController = new AssistantController();

import { Request, Response, NextFunction } from 'express';
import { replyCoachService } from '../services/replyCoachService.js';
import { memoryDb } from '../db/client.js';
import { z } from 'zod';

export const generateRepliesSchema = z.object({
  userId: z.string().optional(),
  incomingMessage: z.string().min(5, 'Please provide the incoming message or scenario to reply to'),
  contextOrRelationship: z.string().optional(),
  desiredOutcome: z.string().optional()
});

export class ReplyCoachController {
  async generateReplies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, incomingMessage, contextOrRelationship, desiredOutcome } = req.body;
      const resolvedUserId = userId || req.userId || 'demo-user-1';

      const result = await replyCoachService.generateStrategicReplies({
        incomingMessage,
        contextOrRelationship,
        desiredOutcome
      });

      await memoryDb.saveReplyResult(result, resolvedUserId);

      res.status(201).json({
        message: 'Strategic reply options generated',
        result
      });
    } catch (err) {
      next(err);
    }
  }
}

export const replyCoachController = new ReplyCoachController();

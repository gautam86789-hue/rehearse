import { Request, Response, NextFunction } from 'express';
import { replyCoachService } from '../services/replyCoachService.js';
import { memoryDb } from '../db/client.js';
import { z } from 'zod';

export const generateRepliesSchema = z.object({
  incomingMessage: z.string().min(5, 'Please provide the incoming message or scenario to reply to'),
  contextOrRelationship: z.string().optional(),
  desiredOutcome: z.string().optional()
});

export class ReplyCoachController {
  async generateReplies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { incomingMessage, contextOrRelationship, desiredOutcome } = req.body;

      const result = await replyCoachService.generateStrategicReplies({
        incomingMessage,
        contextOrRelationship,
        desiredOutcome
      });

      memoryDb.saveReplyResult(result);

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

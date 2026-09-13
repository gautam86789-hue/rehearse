import { Request, Response, NextFunction } from 'express';
import { memoryDb } from '../db/client.js';
import { z } from 'zod';

export const submitPuzzleSchema = z.object({
  userId: z.string().optional(),
  puzzleId: z.string().min(1),
  selectedOptionId: z.string().min(1)
});

export class DailyController {
  async getFrameworkOfTheDay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const audience = typeof req.query.audience === 'string' ? req.query.audience : undefined;
      const framework = await memoryDb.getTodaysFramework(audience);
      const allFrameworks = await memoryDb.getAllFrameworks();
      res.json({
        framework,
        allCount: allFrameworks.length
      });
    } catch (err) {
      next(err);
    }
  }

  async getDailyPuzzle(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const puzzle = await memoryDb.getTodaysPuzzle();
      res.json({ puzzle });
    } catch (err) {
      next(err);
    }
  }

  async getWordOfTheDay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const audience = typeof req.query.audience === 'string' ? req.query.audience : undefined;
      const word = await memoryDb.getTodaysWord(audience);
      res.json({ word });
    } catch (err) {
      next(err);
    }
  }

  async submitDailyPuzzle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, puzzleId, selectedOptionId } = req.body;
      const resolvedUserId = userId || req.userId || 'demo-user-1';
      const puzzle = await memoryDb.getTodaysPuzzle();

      const chosenOption = puzzle.options.find((o) => o.id === selectedOptionId);
      if (!chosenOption) {
        res.status(400).json({ error: `Option ID ${selectedOptionId} is invalid for this puzzle.` });
        return;
      }

      await memoryDb.savePuzzleSubmission(
        resolvedUserId,
        puzzleId,
        selectedOptionId,
        chosenOption.isOptimal,
        chosenOption.score
      );

      // Award XP for solving daily puzzle
      const user = await memoryDb.getUser(resolvedUserId);
      const xpBonus = chosenOption.isOptimal ? 25 : 10;
      const updated = await memoryDb.updateUser(user.id, {
        totalXP: user.totalXP + xpBonus
      });

      res.json({
        result: {
          isOptimal: chosenOption.isOptimal,
          score: chosenOption.score,
          explanation: chosenOption.explanation,
          strategyLabel: chosenOption.strategyLabel,
          xpAwarded: xpBonus,
          communityDistribution: puzzle.communityDistribution,
          userTotalXP: updated.totalXP
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export const dailyController = new DailyController();

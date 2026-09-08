import { Request, Response, NextFunction } from 'express';
import { memoryDb } from '../db/client.js';
import { z } from 'zod';

export const submitPuzzleSchema = z.object({
  userId: z.string().optional().default('demo-user-1'),
  puzzleId: z.string().min(1),
  selectedOptionId: z.string().min(1)
});

export class DailyController {
  async getFrameworkOfTheDay(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const framework = memoryDb.getTodaysFramework();
      const allFrameworks = memoryDb.getAllFrameworks();
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
      const puzzle = memoryDb.getTodaysPuzzle();
      res.json({ puzzle });
    } catch (err) {
      next(err);
    }
  }

  async submitDailyPuzzle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, puzzleId, selectedOptionId } = req.body;
      const puzzle = memoryDb.getTodaysPuzzle();

      const chosenOption = puzzle.options.find((o) => o.id === selectedOptionId);
      if (!chosenOption) {
        res.status(400).json({ error: `Option ID ${selectedOptionId} is invalid for this puzzle.` });
        return;
      }

      memoryDb.savePuzzleSubmission(
        userId || 'demo-user-1',
        puzzleId,
        selectedOptionId,
        chosenOption.isOptimal,
        chosenOption.score
      );

      // Award XP for solving daily puzzle
      const user = memoryDb.getUser(userId || 'demo-user-1');
      const xpBonus = chosenOption.isOptimal ? 25 : 10;
      const updated = memoryDb.updateUser(user.id, {
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

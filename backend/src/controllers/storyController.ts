import { Request, Response, NextFunction } from 'express';
import { storyService } from '../services/storyService.js';

export class StoryController {
  async getNodeStory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = typeof req.query.userId === 'string' ? req.query.userId : req.userId || 'demo-user-1';
      const nodeId = typeof req.query.nodeId === 'string' ? req.query.nodeId : undefined;
      const storySeed = typeof req.query.seed === 'string' ? req.query.seed : undefined;
      const journeyTitle = typeof req.query.journeyTitle === 'string' ? req.query.journeyTitle : undefined;
      const audience = typeof req.query.audience === 'string' ? req.query.audience : undefined;
      const name = typeof req.query.name === 'string' ? req.query.name : undefined;

      if (!nodeId || !storySeed) {
        res.status(400).json({ error: 'nodeId and seed are required' });
        return;
      }

      const story = await storyService.getNodeStory({ userId, nodeId, storySeed, journeyTitle, audience, name });
      res.json({ story });
    } catch (err) {
      next(err);
    }
  }
}

export const storyController = new StoryController();

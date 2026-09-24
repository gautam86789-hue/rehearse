import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { memoryDb } from '../db/client.js';
import { validateBody } from '../middleware/errorHandler.js';

const router = Router();

const notificationSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().max(200),
  body: z.string().max(500).optional().default(''),
  icon: z.string().max(40).optional(),
  createdAt: z.string(),
  read: z.boolean()
});

const saveSchema = z.object({
  userId: z.string().min(1),
  notifications: z.array(notificationSchema).max(50),
  dismissedIds: z.array(z.string()).max(200).default([])
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = typeof req.query.userId === 'string' ? req.query.userId : req.userId;
    if (!userId) {
      res.status(400).json({ error: 'userId is required.' });
      return;
    }
    res.json(await memoryDb.getNotificationState(userId));
  } catch (err) {
    next(err);
  }
});

router.put('/', validateBody(saveSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, notifications, dismissedIds } = req.body;
    await memoryDb.saveNotificationState(userId, { notifications, dismissedIds });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;

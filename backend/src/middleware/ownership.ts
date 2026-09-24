import { Request, Response } from 'express';
import { memoryDb } from '../db/client.js';

/**
 * Guards endpoints that read or change one user's private data.
 *  - Caller presented a valid token: it must be THEIR OWN id (else 403).
 *  - No valid token: only allowed for guest ids (no registered email). A
 *    registered account's data requires its token (401), so knowing an
 *    account's id is not enough to read or change it.
 * Sends the error response itself; returns true when the request may proceed.
 */
export async function assertCanAccessUser(req: Request, res: Response, userId: string): Promise<boolean> {
  if (req.authenticated) {
    if (req.userId !== userId) {
      res.status(403).json({ error: 'You can only access your own data.' });
      return false;
    }
    return true;
  }
  try {
    const user: any = await memoryDb.getUser(userId);
    if (user?.email && !String(user.email).endsWith('@rehearse.local')) {
      res.status(401).json({ error: 'Please sign in again to continue.' });
      return false;
    }
  } catch {
    // unknown id -> treat as a guest
  }
  return true;
}

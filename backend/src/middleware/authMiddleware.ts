import { Request, Response, NextFunction } from 'express';
import { supabase, memoryDb } from '../db/client.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const DEFAULT_USER_ID = 'demo-user-1';

/**
 * Resolves the authenticated user id for a request and attaches it as
 * req.userId. Never rejects a request:
 *  - First checks our database user_sessions for the token.
 *  - If not found and Supabase is configured, checks supabase.auth.getUser().
 *  - Otherwise falls back to the demo user id so existing tests and
 *    unauthenticated dev usage keep working unchanged.
 */
export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    if (token) {
      // 1. Check local / database session token
      try {
        const sessionUser = await memoryDb.validateSession(token);
        if (sessionUser?.id) {
          req.userId = sessionUser.id;
          next();
          return;
        }
      } catch (err) {
        // continue
      }

      // 2. Check Supabase Auth if configured
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.getUser(token);
          if (!error && data?.user?.id) {
            req.userId = data.user.id;
            next();
            return;
          }
        } catch (err) {
          console.warn('authMiddleware: failed to resolve Supabase user from token, falling back to demo user:', err);
        }
      }
    }
  }

  req.userId = DEFAULT_USER_ID;
  next();
}

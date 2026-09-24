import { Request, Response, NextFunction } from 'express';

// Small fixed-window limiter, per client IP (+ optional key). Enough to stop
// password / access-code guessing; it resets when the server restarts.
export function rateLimit(opts: { windowMs: number; max: number; keyFrom?: (req: Request) => string }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.NODE_ENV === 'test') {
      next();
      return;
    }
    const now = Date.now();
    const key = `${req.ip}|${opts.keyFrom ? opts.keyFrom(req) : ''}`;
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + opts.windowMs });
    } else {
      entry.count += 1;
      if (entry.count > opts.max) {
        res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
        res.status(429).json({ error: 'Too many attempts. Please wait a minute and try again.' });
        return;
      }
    }
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }
    next();
  };
}

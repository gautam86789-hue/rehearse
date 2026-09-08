import { Request, Response } from 'express';

export const healthCheckHandler = (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Rehearse API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};

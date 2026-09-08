import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import appRoutes from './routes.js';
import { errorHandler } from '../middleware/errorHandler.js';

dotenv.config();

export function createServer() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.use('/api/v1', appRoutes);

  app.get('/', (_req, res) => {
    res.json({
      message: 'Welcome to Rehearse API — AI Roleplay & Executive Coaching Platform',
      health: '/api/v1/health',
      version: '1.0.0'
    });
  });

  app.use(errorHandler);

  return app;
}

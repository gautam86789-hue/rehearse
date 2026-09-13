import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Resolves req.userId from a Supabase auth token (or falls back to the demo user)
app.use(authMiddleware);

// API Routes
app.use('/api/v1', routes);

// Root greeting
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Rehearse API — AI Roleplay & Executive Coaching Platform',
    documentation: '/api/v1/health',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Rehearse API Server listening on http://0.0.0.0:${PORT}`);
    console.log(`👉 Health Check: http://localhost:${PORT}/api/v1/health`);
    console.log(`👉 Curated Scenarios: http://localhost:${PORT}/api/v1/scenarios`);
  });
}

export default app;

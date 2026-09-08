import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { memoryDb } from '../db/client.js';
import { roleplayEngine } from '../services/roleplayEngine.js';
import { scoringEngine } from '../services/scoringEngine.js';
import { gamificationService } from '../services/gamificationService.js';
import { RoleplaySession, MessageTurn, Scorecard } from '../types/index.js';
import { z } from 'zod';

export const startSessionSchema = z.object({
  userId: z.string().optional().default('demo-user-1'),
  scenarioId: z.string().min(1)
});

export const turnSchema = z.object({
  sessionId: z.string().min(1),
  userMessage: z.string().min(1, 'User message cannot be empty')
});

export const scoreSessionSchema = z.object({
  sessionId: z.string().min(1)
});

export class RoleplayController {
  private getInitialGreeting(scenario: any): string {
    if (scenario.category === 'negotiation') {
      return `Thanks for stopping by. As you know, we're navigating a demanding budget cycle right now, but I wanted to hear what was on your mind.`;
    }
    if (scenario.category === 'feedback') {
      return `Hey, thanks for setting up this 1-on-1. I have back-to-back reviews today, what did you want to sync on?`;
    }
    if (scenario.category === 'boundaries') {
      return `Hey! Glad we could connect. Did you get my messages over the weekend? We really need to get that project over the line.`;
    }
    return `Hey there, good to see you. I have about 15 minutes before my next executive meeting—what's on your mind?`;
  }

  startSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, scenarioId } = req.body;
      const user = memoryDb.getUser(userId);

      // Check remaining quota if on free trial
      if (
        user.subscription.status === 'free_trial' &&
        user.subscription.rehearsalsRemaining <= 0
      ) {
        res.status(403).json({
          error: 'Free trial limit reached',
          code: 'PAYWALL_TRIGGERED',
          message: 'You have used your free rehearsals. Unlock unlimited high-stakes rehearsals with a 5-day trial.'
        });
        return;
      }

      const scenario = memoryDb.getScenarioById(scenarioId);
      if (!scenario) {
        res.status(404).json({ error: `Scenario not found with ID ${scenarioId}` });
        return;
      }

      const session: RoleplaySession = {
        id: `session-${uuidv4().slice(0, 8)}`,
        userId: user.id,
        scenario,
        turns: [],
        status: 'in_progress',
        startedAt: new Date().toISOString()
      };

      // Add counterpart initial opening line
      const initialOpeningTurn: MessageTurn = {
        id: `turn-${uuidv4().slice(0, 6)}`,
        speaker: 'counterpart',
        message: this.getInitialGreeting(scenario),
        timestamp: new Date().toISOString()
      };
      session.turns.push(initialOpeningTurn);

      memoryDb.saveSession(session);

      res.status(201).json({
        message: 'Rehearsal session started',
        session
      });
    } catch (err) {
      next(err);
    }
  };

  processTurn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId, userMessage } = req.body;
      const session = memoryDb.getSession(sessionId);

      if (!session) {
        res.status(404).json({ error: `Session not found with ID ${sessionId}` });
        return;
      }

      if (session.status !== 'in_progress') {
        res.status(400).json({ error: 'Session is already completed or ended' });
        return;
      }

      // Record User Turn
      const userTurn: MessageTurn = {
        id: `turn-${uuidv4().slice(0, 6)}`,
        speaker: 'user',
        message: userMessage,
        timestamp: new Date().toISOString()
      };
      session.turns.push(userTurn);

      // Generate Counterpart Turn
      const counterpartResponse = await roleplayEngine.generateCounterpartTurn(
        session.scenario,
        session.turns,
        userMessage
      );

      // Attach tactical analysis to user's turn
      userTurn.tacticalAnalysis = counterpartResponse.tacticalAnalysis;

      const counterpartTurn: MessageTurn = {
        id: `turn-${uuidv4().slice(0, 6)}`,
        speaker: 'counterpart',
        message: counterpartResponse.message,
        timestamp: new Date().toISOString()
      };
      session.turns.push(counterpartTurn);

      memoryDb.saveSession(session);

      res.json({
        userTurn,
        counterpartTurn,
        totalTurns: session.turns.length
      });
    } catch (err) {
      next(err);
    }
  };

  scoreAndEndSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId } = req.body;
      const session = memoryDb.getSession(sessionId);

      if (!session) {
        res.status(404).json({ error: `Session not found with ID ${sessionId}` });
        return;
      }

      // Calculate substance rubric
      const rubric = await scoringEngine.evaluateSession(session.scenario, session.turns);

      // Update user streak and XP
      const user = memoryDb.getUser(session.userId);
      const gamificationResult = gamificationService.processSessionCompletion(
        user,
        rubric.overallScore
      );
      memoryDb.updateUser(user.id, gamificationResult.updatedProfile);

      const scorecard: Scorecard = {
        ...rubric,
        id: `scorecard-${uuidv4().slice(0, 8)}`,
        sessionId: session.id,
        xpEarned: gamificationResult.xpEarned,
        newStreak: gamificationResult.newStreak,
        streakExtended: gamificationResult.streakExtended,
        badgeUnlocked: gamificationResult.badgeUnlocked,
        generatedAt: new Date().toISOString()
      };

      session.status = 'completed';
      session.completedAt = new Date().toISOString();
      session.scorecard = scorecard;

      memoryDb.saveSession(session);
      memoryDb.saveScorecard(scorecard);

      res.json({
        message: 'Rehearsal completed and scored',
        scorecard,
        session,
        updatedUser: gamificationResult.updatedProfile
      });
    } catch (err) {
      next(err);
    }
  };
}

export const roleplayController = new RoleplayController();

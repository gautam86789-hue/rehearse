import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { memoryDb, getLastUpdateUserError } from '../db/client.js';
import { roleplayEngine } from '../services/roleplayEngine.js';
import { scoringEngine } from '../services/scoringEngine.js';
import { gamificationService } from '../services/gamificationService.js';
import { computeCompetencyProfile } from '../services/competencyProfileService.js';
import { RoleplaySession, MessageTurn, Scorecard } from '../types/index.js';
import { z } from 'zod';

export const startSessionSchema = z.object({
  userId: z.string().optional(),
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
  // Openers are deliberately short and casual — a real conversation starts
  // with a hello, not with the full backstory. The substance comes out as
  // the user talks.
  private getInitialGreeting(scenario: any): string {
    const byArchetype: Record<string, string[]> = {
      defensive_boss: ['Hey! Got a few minutes. What\'s up?', 'Hey, come on in. What\'s on your mind?'],
      guilt_tripper: ['Hey, good timing. What\'s up?', 'Oh hey! Perfect, I was hoping we\'d catch up. What\'s going on?'],
      hard_negotiator: ['Hey, come on in. What did you want to chat about?', 'Hi! Have a seat. What\'s up?'],
      passive_aggressive_peer: ['Oh hey, you wanted to talk?', 'Hey! Sure, what\'s up?'],
      micromanager: ['Hey, perfect timing. What\'s going on?', 'Hey! What\'s up?'],
      skeptical_investor: ['Hi, thanks for making time. So, what have you got for me?', 'Hey! Good to see you. What\'s on your mind?'],
      startup_cofounder: ['Hey. So, what\'s on your mind?', 'Hey, you wanted to talk?']
    };
    const options = byArchetype[scenario.counterpartArchetype] || ['Hey! Good to see you. What\'s up?', 'Hey there, what\'s on your mind?'];
    return options[Math.floor(Math.random() * options.length)];
  }

  startSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, scenarioId } = req.body;
      const resolvedUserId = userId || req.userId || 'demo-user-1';
      const user = await memoryDb.getUser(resolvedUserId);

      // Check remaining quota if on free rehearsals/trial
      const freeTrialExhausted =
        (user.subscription.status === 'free_rehearsals' || user.subscription.status === 'free_trial') &&
        user.subscription.rehearsalsRemaining <= 0;

      // Promo-code access (see subscriptionController.redeemPromoCode) isn't
      // a real store subscription, so nothing else expires it automatically
      // the way a RevenueCat webhook would — check trialEndsAt directly here,
      // the same date-based check the free trial itself doesn't need since
      // it's gated by rehearsal count instead.
      const promoExpired =
        user.subscription.status === 'active_promo' &&
        !!user.subscription.trialEndsAt &&
        new Date(user.subscription.trialEndsAt) < new Date();

      if (freeTrialExhausted || promoExpired) {
        res.status(403).json({
          error: freeTrialExhausted ? 'Rehearsal limit reached' : 'Promo access has ended',
          code: 'PAYWALL_TRIGGERED',
          message: freeTrialExhausted
            ? 'You have used your 3 free rehearsals. Redeem an access code to unlock unlimited practice.'
            : 'Your promo access code has expired. Redeem a new access code to continue.'
        });
        return;
      }

      const scenario = await memoryDb.getScenarioById(scenarioId);
      if (!scenario) {
        res.status(404).json({ error: `Scenario not found with ID ${scenarioId}` });
        return;
      }

      const session: RoleplaySession = {
        id: uuidv4(),
        userId: user.id,
        scenario,
        turns: [],
        status: 'in_progress',
        startedAt: new Date().toISOString()
      };

      // Add counterpart initial opening line
      const initialOpeningTurn: MessageTurn = {
        id: uuidv4(),
        speaker: 'counterpart',
        message: this.getInitialGreeting(scenario),
        timestamp: new Date().toISOString()
      };
      session.turns.push(initialOpeningTurn);

      await memoryDb.saveSession(session);

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
      const session = await memoryDb.getSession(sessionId);

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
        id: uuidv4(),
        speaker: 'user',
        message: userMessage,
        timestamp: new Date().toISOString()
      };
      session.turns.push(userTurn);

      // Generate Counterpart Turn — calibrated against the user's rolling
      // performance profile so the same archetype reads as tougher for a
      // consistently strong user and slightly more forgiving on a skill
      // they're still building (see roleplayEngine.getDifficultyCalibration).
      const priorSessions = await memoryDb.getUserSessions(session.userId);
      const competencyProfile = computeCompetencyProfile(priorSessions);
      const counterpartResponse = await roleplayEngine.generateCounterpartTurn(
        session.scenario,
        session.turns,
        userMessage,
        competencyProfile
      );

      // Attach tactical analysis to user's turn
      userTurn.tacticalAnalysis = counterpartResponse.tacticalAnalysis;

      const counterpartTurn: MessageTurn = {
        id: uuidv4(),
        speaker: 'counterpart',
        message: counterpartResponse.message,
        timestamp: new Date().toISOString()
      };
      session.turns.push(counterpartTurn);

      await memoryDb.saveSession(session);

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
      const session = await memoryDb.getSession(sessionId);

      if (!session) {
        res.status(404).json({ error: `Session not found with ID ${sessionId}` });
        return;
      }

      // Prior sessions only — this one is still 'in_progress' with no
      // scorecard yet, so computeCompetencyProfile's own completed+scorecard
      // filter excludes it naturally without needing to slice it out here.
      const priorSessions = await memoryDb.getUserSessions(session.userId);
      const competencyProfile = computeCompetencyProfile(priorSessions);

      // Calculate substance rubric
      const rubric = await scoringEngine.evaluateSession(session.scenario, session.turns, competencyProfile);

      // Update user streak and XP
      const user = await memoryDb.getUser(session.userId);
      const gamificationResult = gamificationService.processSessionCompletion(
        user,
        rubric.overallScore
      );
      await memoryDb.updateUser(user.id, gamificationResult.updatedProfile);
      const persistError = getLastUpdateUserError();
      if (persistError) {
        console.warn('scoreAndEndSession: user update did not persist to Supabase', persistError);
      }

      const scorecard: Scorecard = {
        ...rubric,
        id: uuidv4(),
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

      await memoryDb.saveSession(session);
      await memoryDb.saveScorecard(scorecard);

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

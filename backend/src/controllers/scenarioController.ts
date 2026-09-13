import { Request, Response, NextFunction } from 'express';
import { memoryDb } from '../db/client.js';
import { ARCHETYPES } from '../db/seedData.js';
import { scenarioGeneratorService } from '../services/scenarioGeneratorService.js';
import { z } from 'zod';

export const generateScenarioSchema = z.object({
  situation: z.string().min(5, 'Please provide at least a brief sentence describing your situation'),
  counterpartRole: z.string().optional(),
  counterpartArchetype: z.enum([
    'defensive_boss',
    'guilt_tripper',
    'hard_negotiator',
    'passive_aggressive_peer',
    'micromanager'
  ]).optional(),
  targetGoal: z.string().optional()
});

export class ScenarioController {
  async getScenarios(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, difficulty, audience } = req.query;
      let scenarios = await memoryDb.getAllScenarios();

      if (category) {
        scenarios = scenarios.filter((s) => s.category === category);
      }
      if (difficulty) {
        scenarios = scenarios.filter((s) => s.difficulty === difficulty);
      }
      if (audience) {
        // Custom (user-generated) scenarios have no audiences tag — keep them
        // visible to everyone rather than hiding them from their own author.
        scenarios = scenarios.filter((s) => !s.audiences?.length || s.audiences.includes(audience as any));
      }

      res.json({
        total: scenarios.length,
        scenarios
      });
    } catch (err) {
      next(err);
    }
  }

  async getScenarioById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const scenario = await memoryDb.getScenarioById(id);

      if (!scenario) {
        res.status(404).json({ error: `Scenario not found with ID ${id}` });
        return;
      }

      res.json({ scenario });
    } catch (err) {
      next(err);
    }
  }

  async getArchetypes(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        archetypes: Object.values(ARCHETYPES)
      });
    } catch (err) {
      next(err);
    }
  }

  async generateCustomScenario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { situation, counterpartRole, counterpartArchetype, targetGoal } = req.body;
      const scenario = await scenarioGeneratorService.generateCustomScenario({
        situation,
        counterpartRole,
        counterpartArchetype,
        targetGoal
      });

      // Persist so it can be practiced immediately (and durably, if Supabase is configured)
      await memoryDb.saveScenario(scenario);

      res.status(201).json({
        message: 'Custom scenario brief generated successfully',
        scenario
      });
    } catch (err) {
      next(err);
    }
  }
}

export const scenarioController = new ScenarioController();

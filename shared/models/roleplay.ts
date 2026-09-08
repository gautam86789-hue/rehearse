import { Scenario } from './scenario.js';
import { Scorecard } from './scoring.js';

export interface MessageTurn {
  id: string;
  speaker: 'user' | 'counterpart';
  message: string;
  timestamp: string;
  tacticalAnalysis?: {
    assertivenessScore?: number;
    clarityScore?: number;
    boundaryScore?: number;
  };
}

export interface RoleplaySession {
  id: string;
  userId: string;
  scenario: Scenario;
  turns: MessageTurn[];
  status: 'in_progress' | 'completed' | 'abandoned';
  scorecard?: Scorecard;
  startedAt: string;
  completedAt?: string;
}

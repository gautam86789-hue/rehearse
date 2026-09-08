import { Router } from 'express';
import {
  roleplayController,
  startSessionSchema,
  turnSchema,
  scoreSessionSchema
} from '../controllers/roleplayController.js';
import { validateBody } from '../middleware/errorHandler.js';

const router = Router();

router.post('/start', validateBody(startSessionSchema), roleplayController.startSession);
router.post('/turn', validateBody(turnSchema), roleplayController.processTurn);
router.post('/score', validateBody(scoreSessionSchema), roleplayController.scoreAndEndSession);

export default router;

import { Router } from 'express';
import { scenarioController, generateScenarioSchema } from '../controllers/scenarioController.js';
import { validateBody } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', scenarioController.getScenarios);
router.get('/archetypes', scenarioController.getArchetypes);
router.get('/:id', scenarioController.getScenarioById);
router.post('/generate', validateBody(generateScenarioSchema), scenarioController.generateCustomScenario);

export default router;

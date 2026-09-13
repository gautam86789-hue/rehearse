import { Router } from 'express';
import { dailyController, submitPuzzleSchema } from '../controllers/dailyController.js';
import { validateBody } from '../middleware/errorHandler.js';

const router = Router();

router.get('/framework', dailyController.getFrameworkOfTheDay);
router.get('/puzzle', dailyController.getDailyPuzzle);
router.get('/word', dailyController.getWordOfTheDay);
router.post('/puzzle/submit', validateBody(submitPuzzleSchema), dailyController.submitDailyPuzzle);

export default router;

import { Router } from 'express';
import { replyCoachController, generateRepliesSchema } from '../controllers/replyCoachController.js';
import { validateBody } from '../middleware/errorHandler.js';

const router = Router();

router.post('/generate', validateBody(generateRepliesSchema), replyCoachController.generateReplies);

export default router;

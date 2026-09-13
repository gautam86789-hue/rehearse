import { Router } from 'express';
import { assistantController, assistantChatSchema } from '../controllers/assistantController.js';
import { validateBody } from '../middleware/errorHandler.js';

const router = Router();

router.post('/chat', validateBody(assistantChatSchema), assistantController.chat);

export default router;

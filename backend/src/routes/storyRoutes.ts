import { Router } from 'express';
import { storyController } from '../controllers/storyController.js';

const router = Router();

router.get('/node', storyController.getNodeStory);

export default router;

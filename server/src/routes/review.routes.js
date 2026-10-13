import { Router } from 'express';
import { getReviewQueue, handleReviewAction } from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getReviewQueue);
router.post('/:id', handleReviewAction);

export default router;

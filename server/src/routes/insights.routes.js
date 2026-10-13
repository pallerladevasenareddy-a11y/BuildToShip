import { Router } from 'express';
import { getSummary } from '../controllers/insights.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', getSummary);

export default router;

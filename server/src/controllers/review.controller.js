import { db } from '../services/db.service.js';
import { performReviewAction } from '../services/invoice.service.js';
import { reviewActionSchema } from '../schemas/review.schema.js';

export async function getReviewQueue(req, res, next) {
  try {
    const status = req.query.status || 'OPEN';
    const findings = await db.getFindingsByUser(req.user.id, status);

    res.status(200).json({
      success: true,
      data: findings,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleReviewAction(req, res, next) {
  try {
    const validated = reviewActionSchema.parse(req.body);
    const result = await performReviewAction(req.user.id, req.params.id, validated);

    res.status(200).json({
      success: true,
      message: `Action ${validated.action} executed successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

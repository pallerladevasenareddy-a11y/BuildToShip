import { getInsightsSummary } from '../services/insights.service.js';

export async function getSummary(req, res, next) {
  try {
    const summary = await getInsightsSummary(req.user.id);
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

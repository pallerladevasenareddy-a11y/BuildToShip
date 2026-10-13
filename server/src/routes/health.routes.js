import { Router } from 'express';
import { isLiveGeminiAvailable, isLiveSupabaseAvailable, env } from '../config/env.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'DocuSense AI API',
    version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    integrations: {
      gemini: {
        configured: isLiveGeminiAvailable,
        model: env.GEMINI_MODEL,
      },
      supabase: {
        configured: isLiveSupabaseAvailable,
        bucket: env.SUPABASE_STORAGE_BUCKET,
      },
    },
  });
});

export default router;

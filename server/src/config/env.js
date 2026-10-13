import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long').default('docusense_dev_jwt_secret_change_in_production_key_2026_xyz'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  SUPABASE_STORAGE_BUCKET: z.string().default('invoice-documents'),
  MAX_UPLOAD_SIZE_MB: z.string().default('10').transform((v) => parseInt(v, 10)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

export const isLiveGeminiAvailable = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '');
export const isLiveSupabaseAvailable = Boolean(
  env.SUPABASE_URL && 
  env.SUPABASE_URL.trim() !== '' && 
  env.SUPABASE_SERVICE_ROLE_KEY && 
  env.SUPABASE_SERVICE_ROLE_KEY.trim() !== ''
);

if (!isLiveGeminiAvailable) {
  console.warn('[DocuSense] GEMINI_API_KEY is not set. Live AI extraction will return an explicit AI-unavailable error unless Synthetic Demo Mode is chosen.');
}

if (!isLiveSupabaseAvailable) {
  console.warn('[DocuSense] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. Using secure local in-memory persistence store.');
}

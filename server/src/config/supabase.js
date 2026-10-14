import { createClient } from '@supabase/supabase-js';
import { env, isLiveSupabaseAvailable } from './env.js';

let supabaseClient = null;

if (isLiveSupabaseAvailable) {
  try {
    const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    supabaseClient = createClient(env.SUPABASE_URL, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('[DocuSense] Connected to Supabase project:', env.SUPABASE_URL);
  } catch (error) {
    console.error('[DocuSense] Failed to initialize Supabase client:', error.message);
  }
}

export const supabase = supabaseClient;

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function checkConfigured(url, key) {
  if (!url || !key) return false;
  const trimmedUrl = url.trim();
  const trimmedKey = key.trim();
  if (!trimmedUrl || !trimmedKey) return false;
  if (
    trimmedUrl.includes('your-project-ref') ||
    trimmedUrl.includes('placeholder') ||
    trimmedUrl.includes('<project-ref>') ||
    trimmedUrl.includes('YOUR_PROJECT_REF')
  ) {
    return false;
  }
  try {
    const parsed = new URL(trimmedUrl);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = checkConfigured(supabaseUrl, supabaseAnonKey);

let supabaseClient = null;
if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    });
  } catch (error) {
    console.error('[DocuSense] Error initializing Supabase client:', error);
  }
}

export const supabase = supabaseClient;

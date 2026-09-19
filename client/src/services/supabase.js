import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy-anon-key';

let supabaseClient = null;

try {
  if (supabaseUrl && supabaseUrl !== 'https://example.supabase.co') {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (err) {
  console.warn('⚠️ Could not initialize Supabase client:', err.message);
}

export const supabase = supabaseClient;

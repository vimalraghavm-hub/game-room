import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key';

let supabase = null;

try {
  if (supabaseUrl && supabaseUrl !== 'https://example.supabase.co') {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('⚡ Supabase client initialized.');
  } else {
    console.log('⚠️ Supabase URL not configured. Running with mock DB persistence.');
  }
} catch (err) {
  console.warn('⚠️ Could not initialize Supabase:', err.message);
}

export default supabase;

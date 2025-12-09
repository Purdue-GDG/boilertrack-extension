//This is the main client to define our superbase database
import { createClient, type Session } from '@supabase/supabase-js';

//Grab this from the env.local (on .gitignore and not here to avoid publicity)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

//if either of the credentials are missing, throw an error
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.',
  );
}

//define supabase variable
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'boilertrack-extension-auth',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
  

export type { Session };

import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key must be provided in the .env file.');
  // In a real app, you might throw an error or handle this more gracefully
}

// Create a single Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional: Define types for your database schema if you have generated them
// import { Database } from './types/supabase';
// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

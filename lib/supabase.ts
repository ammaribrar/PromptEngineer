import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yboaekytjuggorfqnrrp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlib2Fla3l0anVnZ29yZnFucnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjU1MjYsImV4cCI6MjA3OTkwMTUyNn0.T6Dm5ISKz2zv4D26kUt8zDu4Xzn2hVf0Xu-Jwtctt0g';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('[Supabase] Initializing with URL:', supabaseUrl);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

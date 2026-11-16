import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://ntiwgqurbsenjhiimoem.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_T1yloi6K-rCPlYKwKDOqaw_lHcDQCnc';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

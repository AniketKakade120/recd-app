import { createBrowserClient } from '@supabase/ssr'

export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  URL.canParse(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_anon_key_here'
);

if (!isSupabaseConfigured) {
  console.log(
    '%c[Rec\'d] Running in mock data mode. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to connect Supabase.',
    'color: #FACC15; font-weight: bold;'
  );
}

export function createClient() {
  if (!isSupabaseConfigured) {
    return null;
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const supabase = createClient();

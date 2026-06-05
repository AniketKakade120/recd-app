import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use the standard Supabase client since RLS on profiles allows SELECT for all authenticated users
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() || '';

  if (query.length < 2) {
    return NextResponse.json({ results: [], error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  // Get the user's auth token from the request cookies/headers
  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie');
  
  // Create a Supabase client with the user's auth context
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    },
  });

  // Verify the user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ results: [], error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Search profiles with OR filter on username and display_name
    // Supabase .or() syntax for ilike across multiple columns
    const searchPattern = `%${query}%`;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, taste_archetype, taste_score')
      .neq('id', user.id)                         // Exclude self
      .eq('discoverable', true)                    // Only discoverable
      .eq('profile_visibility', 'public')          // Only public profiles
      .eq('onboarding_completed', true)            // Only onboarded users
      .or(`username.ilike.${searchPattern},display_name.ilike.${searchPattern}`)
      .limit(15);

    if (error) {
      console.error('[People Search] Supabase error:', error);
      return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 });
    }

    // Map to safe response shape
    const results = (data || []).map(p => ({
      id: p.id,
      username: p.username || 'user',
      displayName: p.display_name || 'User',
      avatarUrl: p.avatar_url || '',
      tasteArchetype: p.taste_archetype || '',
      tasteScore: p.taste_score || 0,
    }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error('[People Search] Unexpected error:', err);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 });
  }
}

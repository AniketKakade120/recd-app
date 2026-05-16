import { NextResponse } from 'next/server';
import { searchTmdb } from '@/lib/tmdb';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  const region = searchParams.get('region') || 'IN';
  console.log(`[Rec'd Search] Query: "${query}", Region: ${region}`);
  
  try {
    // 1. Search local DB first
    const supabase = await createClient();
    let localResults: any[] = [];
    if (supabase) {
      const { data } = await supabase
        .from('titles')
        .select('*')
        .ilike('title', `%${query}%`)
        .limit(5);
      
      if (data) {
        localResults = data.map(dbTitle => ({
          id: dbTitle.id,
          tmdbId: dbTitle.id.startsWith('tmdb-') ? parseInt(dbTitle.id.replace('tmdb-', '')) : null,
          title: dbTitle.title,
          type: dbTitle.type,
          posterUrl: dbTitle.poster_url,
          backdropUrl: dbTitle.backdrop_url,
          posterGradient: dbTitle.poster_gradient,
          releaseYear: dbTitle.release_year,
          genres: dbTitle.genres || [],
          runtime: dbTitle.runtime,
          overview: dbTitle.overview || '',
          externalRating: dbTitle.external_rating || 0,
          platforms: dbTitle.platforms || [],
          format: dbTitle.format,
          language: dbTitle.language,
        }));
      }
    }

    // 2. Search TMDB
    const tmdbResults = await searchTmdb(query, region);

    // 3. Merge results (Prefer local results for the same title)
    const mergedResults = [...localResults];
    
    tmdbResults.forEach(tr => {
      if (!mergedResults.some(lr => lr.id === tr.id)) {
        mergedResults.push(tr);
      }
    });

    return NextResponse.json(mergedResults.slice(0, 10));
  } catch (error: any) {
    console.error('Search Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to fetch search results', detail: error?.message }, { status: 500 });
  }
}

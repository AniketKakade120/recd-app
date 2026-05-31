import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News',
  10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
  10767: 'Talk', 10768: 'War & Politics',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get('tmdbId');
  const type = searchParams.get('type') as 'movie' | 'series' | null;

  if (!tmdbId || !type) {
    return NextResponse.json(
      { error: 'Parameters "tmdbId" and "type" are required' },
      { status: 400 }
    );
  }

  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
  }

  try {
    const id = parseInt(tmdbId, 10);
    const mediaType = type === 'series' ? 'tv' : 'movie';

    // Fetch full details in a single call (with credits and watch providers)
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,watch/providers`
    );

    if (!response.ok) {
      throw new Error(`TMDB responded with ${response.status}`);
    }

    const data = await response.json();

    const isMovie = mediaType === 'movie';
    const releaseDate = isMovie ? data.release_date : data.first_air_date;
    const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : new Date().getFullYear();

    const genres = data.genres
      ? data.genres.map((g: any) => g.name)
      : (data.genre_ids || []).map((gid: number) => GENRE_MAP[gid] || 'Unknown').filter((g: string) => g !== 'Unknown');

    // Extract cast (top 10)
    const cast = (data.credits?.cast || []).slice(0, 10).map((c: any) => ({
      id: String(c.id),
      name: c.name,
      characterName: c.character,
      profileImageUrl: c.profile_path ? `${TMDB_IMAGE_BASE_URL}/w185${c.profile_path}` : undefined,
      order: c.order
    }));

    // Extract director/creator
    let director = { id: '', name: '', role: isMovie ? 'Director' : 'Creator' };
    if (isMovie) {
      const d = data.credits?.crew?.find((c: any) => c.job === 'Director');
      if (d) {
        director = { id: String(d.id), name: d.name, role: 'Director' };
      }
    } else {
      if (data.created_by && data.created_by[0]) {
        director = { id: String(data.created_by[0].id), name: data.created_by[0].name, role: 'Creator' };
      }
    }

    // Extract watch providers (Default to India 'IN', fallback to US)
    const providerRegion = data['watch/providers']?.results?.['IN'] || data['watch/providers']?.results?.['US'];
    const flatrate = providerRegion?.flatrate || [];
    const free = providerRegion?.free || [];
    const ads = providerRegion?.ads || [];
    
    const allProviders = [...flatrate, ...free, ...ads];
    const providers = Array.from(new Map(allProviders.map((p: any) => [p.provider_id, p])).values());
    const platforms = providers.map((p: any) => p.provider_name);
    
    // Helper to generate search URLs since TMDB doesn't give direct deep links
    const getPlatformUrl = (platformName: string, movieTitle: string) => {
      const q = encodeURIComponent(movieTitle);
      const name = platformName.toLowerCase();
      if (name.includes('netflix')) return `https://www.netflix.com/search?q=${q}`;
      if (name.includes('prime') || name.includes('amazon')) return `https://www.amazon.com/s?k=${q}&i=instant-video`;
      if (name.includes('apple')) return `https://tv.apple.com/search?q=${q}`;
      if (name.includes('disney')) return `https://www.disneyplus.com/search?q=${q}`;
      if (name.includes('max') || name.includes('hbo')) return `https://play.max.com/search?q=${q}`;
      if (name.includes('hulu')) return `https://www.hulu.com/search?q=${q}`;
      if (name.includes('youtube')) return `https://www.youtube.com/results?search_query=${q}`;
      if (name.includes('mubi')) return `https://mubi.com/search?query=${q}`;
      return `https://www.google.com/search?q=${q}+on+${encodeURIComponent(platformName)}`;
    };

    const titleStr = isMovie ? data.title : data.name;

    const platformAvailability = providers.map((p: any) => ({
      platformName: p.provider_name,
      logoUrl: `${TMDB_IMAGE_BASE_URL}/w92${p.logo_path}`,
      region: data['watch/providers']?.results?.['IN'] ? 'IN' : 'US',
      url: getPlatformUrl(p.provider_name, titleStr)
    }));

    const title = {
      id: `tmdb-${id}`,
      tmdbId: id,
      title: isMovie ? data.title : data.name,
      type: isMovie ? 'movie' : 'series',
      posterUrl: data.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${data.poster_path}` : undefined,
      backdropUrl: data.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/w1280${data.backdrop_path}` : undefined,
      posterGradient: (id % 10) + 1,
      releaseYear,
      genres: genres.length > 0 ? genres : ['Drama'],
      runtime: data.runtime ? `${data.runtime} min` : (data.episode_run_time?.[0] ? `${data.episode_run_time[0]} min` : undefined),
      overview: data.overview || '',
      externalRating: data.vote_average ? Math.round(data.vote_average * 10) / 10 : 0,
      externalRatings: {
        tmdb: data.vote_average ? Math.round(data.vote_average * 10) / 10 : undefined,
        imdb: data.vote_average ? Math.round((data.vote_average + 0.3) * 10) / 10 : undefined,
      },
      format: isMovie ? 'Movie' : 'Series',
      language: data.original_language,
      cast,
      directorOrCreatorProfile: director,
      platforms,
      platformAvailability,
    };

    return NextResponse.json(title);
  } catch (error: any) {
    console.error('TMDB Details Error:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch title details', detail: error?.message },
      { status: 500 }
    );
  }
}

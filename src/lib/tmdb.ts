import type { Title, TitleType } from './types';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// TMDB Genre Map
const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

function mapTmdbToTitle(item: any): Title | null {
  if (item.media_type === 'person') return null;
  if (item.media_type !== 'movie' && item.media_type !== 'tv' && !item.title && !item.name) return null;

  const isMovie = item.media_type === 'movie' || (item.media_type !== 'tv' && !!item.title);
  const releaseDate = isMovie ? item.release_date : item.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : new Date().getFullYear();
  
  const genres = item.genre_ids 
    ? item.genre_ids.map((id: number) => GENRE_MAP[id] || 'Unknown').filter((g: string) => g !== 'Unknown')
    : (item.genres ? item.genres.map((g: any) => g.name) : []);

  return {
    id: `tmdb-${item.id}`,
    tmdbId: item.id,
    title: isMovie ? item.title : item.name,
    type: isMovie ? 'movie' : 'series',
    posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${item.poster_path}` : undefined,
    backdropUrl: item.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/w1280${item.backdrop_path}` : undefined,
    posterGradient: Math.floor(Math.random() * 10) + 1,
    releaseYear,
    genres: genres.length > 0 ? genres : ['Drama'],
    overview: item.overview || '',
    externalRating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 0,
    format: isMovie ? 'Movie' : 'Series',
    language: item.original_language,
    cast: [], // Populated by details call
    directorOrCreatorProfile: { id: '', name: '', role: isMovie ? 'Director' : 'Creator' } // Populated by details call
  };
}

export async function searchTmdb(query: string, region = 'IN'): Promise<Title[]> {
  if (!TMDB_API_KEY) {
    console.warn('[Rec\'d TMDB] TMDB_API_KEY is not set. Skipping search.');
    return [];
  }
  
  console.log('[Rec\'d TMDB] Searching for:', query);
  
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&region=${region}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map results and filter out people or nulls
    const results: Title[] = (data.results || [])
      .map(mapTmdbToTitle)
      .filter((t: Title | null) => t !== null);
      
    return results;
  } catch (error) {
    console.error('[Rec\'d TMDB] Search failed:', error);
    return [];
  }
}

export async function getTrendingTmdb(region = 'IN'): Promise<Title[]> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB_API_KEY is not set. Skipping trending.');
    return [];
  }
  
  // Using discover to get trending content specifically from India with regional language focus
  const response = await fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&watch_region=${region}&with_origin_country=${region}&with_original_language=hi|ta|te|ml|kn|bn|mr|pa|gu&sort_by=popularity.desc`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch from TMDB');
  }

  const data = await response.json();
  
  const results: Title[] = data.results
    .map(mapTmdbToTitle)
    .filter((t: Title | null) => t !== null);
    
  return results;
}

export async function getTitleDetails(tmdbId: number, type: 'movie' | 'series'): Promise<Partial<Title>> {
  if (!TMDB_API_KEY) return {};

  const mediaType = type === 'series' ? 'tv' : 'movie';
  const response = await fetch(
    `${TMDB_BASE_URL}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,watch/providers,external_ids`
  );

  if (!response.ok) return {};

  const data = await response.json();
  
  // Extract cast (top 10)
  const cast = (data.credits?.cast || []).slice(0, 10).map((c: any) => ({
    id: String(c.id),
    name: c.name,
    characterName: c.character,
    profileImageUrl: c.profile_path ? `${TMDB_IMAGE_BASE_URL}/w185${c.profile_path}` : undefined,
    order: c.order
  }));

  // Extract director/creator
  let director = { id: '', name: '', role: type === 'series' ? 'Creator' : ('Director' as any) };
  if (type === 'series') {
    if (data.created_by && data.created_by[0]) {
      director = { id: String(data.created_by[0].id), name: data.created_by[0].name, role: 'Creator' };
    }
  } else {
    const d = data.credits?.crew?.find((c: any) => c.job === 'Director');
    if (d) {
      director = { id: String(d.id), name: d.name, role: 'Director' };
    }
  }

  // Extract watch providers (Default to India 'IN')
  const providers = data['watch/providers']?.results?.['IN']?.flatrate || [];
  const platforms = providers.map((p: any) => p.provider_name);
  const platformAvailability = providers.map((p: any) => ({
    platformName: p.provider_name,
    logoUrl: `${TMDB_IMAGE_BASE_URL}/w92${p.logo_path}`,
    region: 'IN'
  }));

  return {
    cast,
    directorOrCreatorProfile: director,
    platforms,
    platformAvailability,
    runtime: data.runtime ? `${data.runtime} min` : (data.episode_run_time ? `${data.episode_run_time[0]} min` : undefined),
    language: data.original_language
  };
}

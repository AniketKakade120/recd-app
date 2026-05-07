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
  if (item.media_type !== 'movie' && item.media_type !== 'tv') return null;

  const isMovie = item.media_type === 'movie';
  const releaseDate = isMovie ? item.release_date : item.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : new Date().getFullYear();
  
  const genres = item.genre_ids 
    ? item.genre_ids.map((id: number) => GENRE_MAP[id] || 'Unknown').filter((g: string) => g !== 'Unknown')
    : [];

  return {
    id: `tmdb-${item.id}`,
    tmdbId: item.id,
    title: isMovie ? item.title : item.name,
    type: isMovie ? 'movie' : 'series',
    posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${item.poster_path}` : undefined,
    backdropUrl: item.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/w1280${item.backdrop_path}` : undefined,
    posterGradient: Math.floor(Math.random() * 10) + 1, // Random gradient fallback
    releaseYear,
    genres: genres.length > 0 ? genres : ['Drama'], // Fallback
    overview: item.overview || '',
    externalRating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 0,
    format: isMovie ? 'Movie' : 'Series',
  };
}

export async function searchTmdb(query: string): Promise<Title[]> {
  if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY is not set');
  
  const response = await fetch(
    `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch from TMDB');
  }

  const data = await response.json();
  
  // Map results and filter out people or nulls
  const results: Title[] = data.results
    .map(mapTmdbToTitle)
    .filter((t: Title | null) => t !== null);
    
  return results;
}

export async function getTrendingTmdb(): Promise<Title[]> {
  if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY is not set');
  
  const response = await fetch(
    `${TMDB_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}`
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

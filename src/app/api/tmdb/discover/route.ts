import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const GENRE_MAP: Record<string, number> = {
  'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35,
  'Crime': 80, 'Documentary': 99, 'Drama': 18, 'Family': 10751,
  'Fantasy': 14, 'History': 36, 'Horror': 27, 'Music': 10402,
  'Mystery': 9648, 'Romance': 10749, 'Sci-Fi': 878, 'TV Movie': 10770,
  'Thriller': 53, 'War': 10752, 'Western': 37,
};

const PROVIDER_MAP: Record<string, number> = {
  'Netflix': 8,
  'Prime Video': 119, // or 9
  'Disney+': 337,
  'Apple TV+': 350,
  'Hulu': 15,
  'Max': 384,
  'Peacock': 386,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre');
  const platform = searchParams.get('platform');
  const region = searchParams.get('region') || 'US';

  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
  }

  try {
    let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`;

    if (genre) {
      const genreId = GENRE_MAP[genre];
      if (genreId) {
        url += `&with_genres=${genreId}`;
      }
    }

    if (platform) {
      const providerId = PROVIDER_MAP[platform];
      if (providerId) {
        url += `&with_watch_providers=${providerId}&watch_region=${region}`;
      }
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`TMDB responded with ${response.status}`);
    }

    const data = await response.json();
    const results = data.results || [];

    const mappedTitles = results.map((movie: any) => ({
      id: `tmdb-${movie.id}`,
      tmdbId: movie.id,
      title: movie.title,
      type: 'movie',
      posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}` : undefined,
      backdropUrl: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/w1280${movie.backdrop_path}` : undefined,
      releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
      externalRating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : 0,
      format: 'Movie'
    }));

    return NextResponse.json(mappedTitles);
  } catch (error: any) {
    console.error('TMDB Discover Error:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch discover details', detail: error?.message },
      { status: 500 }
    );
  }
}

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

    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );

    if (!response.ok) {
      throw new Error(`TMDB responded with ${response.status}`);
    }

    const data = await response.json();

    const titles = (data.results || []).slice(0, 12).map((item: any) => {
      const isMovie = mediaType === 'movie';
      const releaseDate = isMovie ? item.release_date : item.first_air_date;
      const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : new Date().getFullYear();

      const genres = (item.genre_ids || [])
        .map((gid: number) => GENRE_MAP[gid] || 'Unknown')
        .filter((g: string) => g !== 'Unknown');

      return {
        id: `tmdb-${item.id}`,
        tmdbId: item.id,
        title: isMovie ? item.title : item.name,
        type: isMovie ? 'movie' : 'series',
        posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${item.poster_path}` : undefined,
        backdropUrl: item.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/w1280${item.backdrop_path}` : undefined,
        posterGradient: (item.id % 10) + 1,
        releaseYear,
        genres: genres.length > 0 ? genres : ['Drama'],
        overview: item.overview || '',
        externalRating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 0,
        format: isMovie ? 'Movie' : 'Series',
        language: item.original_language,
        cast: [],
        platforms: [],
        platformAvailability: [],
      };
    });

    return NextResponse.json(titles);
  } catch (error: any) {
    console.error('TMDB Similar Error:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch similar titles', detail: error?.message },
      { status: 500 }
    );
  }
}

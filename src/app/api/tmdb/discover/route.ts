import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const GENRE_TO_TMDB_ID: Record<string, number> = {
  'Drama': 18,
  'Comedy': 35,
  'Thriller': 53,
  'Horror': 27,
  'Romance': 10749,
  'Sci-fi': 878,
  'Documentary': 99,
  'Anime': 16, // Maps to Animation
  'Crime': 80,
  'Fantasy': 14,
};

// Common provider IDs (using IN region IDs where applicable, e.g., Disney+ Hotstar)
const PLATFORM_TO_TMDB_ID: Record<string, string | number> = {
  'Netflix': 8,
  'Prime Video': 119,
  'JioHotstar': '122|220', // Disney+ Hotstar | JioCinema
  'SonyLIV': 237,
  'ZEE5': 232,
  'AHA': 532,
  'Apple TV': 2,
  'YouTube': 192,
  'MUBI': 11,
};

const LANGUAGE_TO_CODE: Record<string, string> = {
  'English': 'en',
  'Hindi': 'hi',
  'Tamil': 'ta',
  'Telugu': 'te',
  'Malayalam': 'ml',
  'Kannada': 'kn',
  'Bengali': 'bn',
  'Marathi': 'mr',
  'Gujarati': 'gu',
  'Punjabi': 'pa',
  'Korean': 'ko',
  'Japanese': 'ja',
};

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
  const genre = searchParams.get('genre');
  const platform = searchParams.get('platform');
  const language = searchParams.get('language');
  const upcoming = searchParams.get('upcoming') === 'true';
  // Default to IN region as requested
  const watchRegion = searchParams.get('watch_region') || 'IN';
  const originCountry = searchParams.get('origin_country');
  const originalLanguage = searchParams.get('original_language');

  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
  }

  try {
    let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&page=1`;

    if (upcoming) {
      const today = new Date().toISOString().split('T')[0];
      const threeMonthsLater = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      url += `&primary_release_date.gte=${today}&primary_release_date.lte=${threeMonthsLater}&with_release_type=3&region=${watchRegion}`;
    }

    if (genre) {
      const genreId = GENRE_TO_TMDB_ID[genre];
      if (genreId) {
        url += `&with_genres=${genreId}`;
      }
    }

    if (platform) {
      if (platform === 'Theatre') {
        // Now playing in theatres
        url += `&with_release_type=3&region=${watchRegion}`; // Theatrical in region
      } else {
        const providerId = PLATFORM_TO_TMDB_ID[platform];
        if (providerId) {
          url += `&with_watch_providers=${providerId}&watch_region=${watchRegion}`;
        }
      }
    }

    if (language) {
      const languageCode = LANGUAGE_TO_CODE[language];
      if (languageCode) {
        url += `&with_original_language=${languageCode}`;
      }
    }

    if (originCountry) {
      url += `&with_origin_country=${originCountry}`;
    }

    if (originalLanguage) {
      url += `&with_original_language=${originalLanguage}`;
    }

    console.log('TMDB Discover URL:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`TMDB responded with ${response.status}`);
    }

    const data = await response.json();

    const titles = (data.results || []).slice(0, 12).map((item: any) => {
      const releaseYear = item.release_date ? new Date(item.release_date).getFullYear() : new Date().getFullYear();

      const genres = (item.genre_ids || [])
        .map((gid: number) => GENRE_MAP[gid] || 'Unknown')
        .filter((g: string) => g !== 'Unknown');

      return {
        id: `tmdb-${item.id}`,
        tmdbId: item.id,
        title: item.title,
        type: 'movie', // Discover defaults to movie here
        posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${item.poster_path}` : undefined,
        backdropUrl: item.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/w1280${item.backdrop_path}` : undefined,
        posterGradient: (item.id % 10) + 1,
        releaseYear,
        genres: genres.length > 0 ? genres : ['Drama'],
        overview: item.overview || '',
        externalRating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 0,
        format: 'Movie',
        language: item.original_language,
      };
    });

    return NextResponse.json(titles);
  } catch (error: any) {
    console.error('TMDB Discover Error:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch curated titles', detail: error?.message },
      { status: 500 }
    );
  }
}

// TMDB API client placeholder — Rec'd
// If NEXT_PUBLIC_TMDB_API_KEY is set, use TMDB. Otherwise, fall back to mock data.

import { Title } from '@/lib/types';

const TMDB_KEY = typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_TMDB_API_KEY
  : process.env.NEXT_PUBLIC_TMDB_API_KEY;

const TMDB_BASE = 'https://api.themoviedb.org/3';

function hasTmdb(): boolean {
  return !!TMDB_KEY;
}

// TODO: Connect to real TMDB API
export async function searchTitles(query: string): Promise<Title[]> {
  if (!hasTmdb()) return []; // caller should fall back to mock
  // const res = await fetch(`${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`);
  // const data = await res.json();
  // return mapTmdbResults(data.results);
  return [];
}

export async function getTrendingTitles(): Promise<Title[]> {
  if (!hasTmdb()) return [];
  return [];
}

export async function getTitleDetails(id: number): Promise<Title | null> {
  if (!hasTmdb()) return null;
  return null;
}

export async function getRecommendedTitles(_preferences: string[]): Promise<Title[]> {
  if (!hasTmdb()) return [];
  return [];
}

export { hasTmdb };

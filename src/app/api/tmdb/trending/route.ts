import { NextResponse } from 'next/server';
import { getTrendingTmdb } from '@/lib/tmdb';

export async function GET() {
  try {
    const results = await getTrendingTmdb();
    return NextResponse.json(results);
  } catch (error) {
    console.error('TMDB Trending Error:', error);
    return NextResponse.json({ error: 'Failed to fetch trending results' }, { status: 500 });
  }
}

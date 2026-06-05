import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getTrendingTmdb } from '@/lib/tmdb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || 'IN';
  try {
    const results = await getTrendingTmdb(region);
    return NextResponse.json(results);
  } catch (error) {
    console.error('TMDB Trending Error:', error);
    return NextResponse.json({ error: 'Failed to fetch trending results' }, { status: 500 });
  }
}

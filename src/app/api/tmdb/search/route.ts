import { NextResponse } from 'next/server';
import { searchTmdb } from '@/lib/tmdb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const results = await searchTmdb(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('TMDB Search Error:', error);
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
  }
}

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  const dummyTitle = {
    id: 'tmdb-9999999',
    title: 'Test Movie',
    type: 'movie',
    poster_url: null,
    backdrop_url: null,
    poster_gradient: 1,
    release_year: 2024,
    genres: ['Action'],
    runtime: null,
    overview: 'Test overview',
    external_rating: null,
    platforms: [],
    format: 'Movie',
    language: null,
    cast_data: [],
    director_data: {},
    watch_providers: []
  };

  const { error: titleError } = await supabase.from('titles').upsert(dummyTitle, { onConflict: 'id', ignoreDuplicates: true });
  console.log('Title Upsert Error:', titleError);

  const dummyRec = {
    title_id: 'tmdb-9999999',
    group_id: null,
    recommended_by: 'bef20171-54e7-4977-85aa-16d5f7d38918',
    reason: 'Test reason',
    confidence_score: 90,
    mood_tags: [],
    primary_stamp: undefined,
    status: 'verdict_pending',
    recommended_to_group: false
  };

  const { data, error: recError } = await supabase.from('recommendations').insert(dummyRec).select().single();
  console.log('Recommendation Insert Error:', recError);
  console.log('Inserted Data:', data);
}

testInsert();

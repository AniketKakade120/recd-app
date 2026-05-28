require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  console.log('Signing up dummy user...');
  const email = `testuser_${Date.now()}@example.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
  });

  if (authError) {
    console.error('Sign up failed:', authError);
    return;
  }

  console.log('Signed up! User ID:', authData.user.id);
  
  // Wait a sec for triggers to create profile
  await new Promise(r => setTimeout(r, 2000));

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

  console.log('Upserting title...');
  const { error: titleError } = await supabase.from('titles').upsert(dummyTitle, { onConflict: 'id', ignoreDuplicates: true });
  console.log('Title Upsert Error:', titleError);

  const dummyRec = {
    title_id: 'tmdb-9999999',
    group_id: null,
    recommended_by: authData.user.id,
    reason: 'Test reason',
    confidence_score: 90,
    mood_tags: [],
    primary_stamp: undefined,
    status: 'verdict_pending',
    recommended_to_group: false
  };

  console.log('Inserting recommendation...');
  const { data, error: recError } = await supabase.from('recommendations').insert(dummyRec).select().single();
  console.log('Recommendation Insert Error:', recError);
  console.log('Inserted Data:', data);
}

testInsert();

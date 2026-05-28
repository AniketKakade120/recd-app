const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jhophllmyiucnsecgeky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impob3BobGxteWl1Y25zZWNnZWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTkxNjYsImV4cCI6MjA5MzY5NTE2Nn0.qSqHvbHnDT1vgKbPnvJAmnA1ejCCAXQt4NVUXTwlm3Q'
);

const userId = 'd058c06a-6222-485a-aef3-7573222bfd06';

async function test(name, query) {
  try {
    const { data, error } = await query;
    if (error) {
      console.error(`❌ Table: ${name} | Error: ${error.message} (${error.code})`);
    } else {
      console.log(`✅ Table: ${name} | Succeeded! Rows: ${data ? (Array.isArray(data) ? data.length : '1') : '0'}`);
    }
  } catch (err) {
    console.error(`❌ Table: ${name} | Threw Exception:`, err.message);
  }
}

async function run() {
  console.log('--- TESTING ALL TABLES IN HYDRATION ---');
  await test('recommendations', supabase.from('recommendations').select('*, targets:recommendation_targets(user_id)'));
  await test('ratings', supabase.from('ratings').select('*'));
  await test('group_members', supabase.from('group_members').select('group_id').eq('user_id', userId));
  await test('watchlist_items', supabase.from('watchlist_items').select('*').eq('user_id', userId));
  await test('crew_connections', supabase.from('crew_connections').select('*, crew_member_profile:profiles!crew_member_id (*)').eq('user_id', userId).eq('status', 'accepted'));
  
  // Notice: crew_requests in context.tsx
  await test('crew_requests', supabase.from('crew_requests').select('*, sender_profile:profiles!sender_id (*), receiver_profile:profiles!receiver_id (*)').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`));
  
  await test('notifications', supabase.from('notifications').select('*').eq('user_id', userId));
  await test('activity', supabase.from('activity').select('*').limit(20));
  await test('watchlist_lists', supabase.from('watchlist_lists').select('*').eq('user_id', userId));
  await test('comments', supabase.from('comments').select('*'));
  await test('profiles', supabase.from('profiles').select('*, prefs:user_preferences(genres, moods)'));
  console.log('--- END OF TESTS ---');
}

run();

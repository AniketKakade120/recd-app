require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  const { data, error } = await supabase
    .from('recommendations')
    .insert({
      title_id: 'test_movie', // must exist in titles
      group_id: null,
      recommended_by: 'bef20171-54e7-4977-85aa-16d5f7d38918',
      reason: 'test',
      status: 'verdict_pending',
      confidence_score: 95
    })
    .select();
  console.log('Result:', data);
  console.log('Error:', error);
}

testInsert();

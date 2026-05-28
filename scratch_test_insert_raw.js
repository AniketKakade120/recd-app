require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  const { error } = await supabase
    .from('recommendations')
    .insert({
      title_id: 'movie_123',
      recommended_by: 'demo-user-id-001',
      reason: 'test'
    });
    
  console.log('Error:', error);
}

testInsert();

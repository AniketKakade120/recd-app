require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkConstraint() {
  const { data, error } = await supabase.rpc('get_foreign_keys');
  if (error) {
    console.error('RPC failed:', error);
    // Since we probably don't have the RPC, let's just use PostgREST introspection
    const { data: intro, error: introError } = await supabase.from('recommendations').select('recommended_by').limit(1);
    console.log(intro, introError);
  } else {
    console.log(data);
  }
}

checkConstraint();

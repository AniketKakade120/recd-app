require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_foreign_keys');
  if (error) {
    // try direct SQL if we had service key, but we don't.
    // Let's use the PostgREST openapi spec properly!
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
    const text = await res.text();
    console.log(text.substring(0, 500)); // Just see what it returns
  }
}

checkSchema();

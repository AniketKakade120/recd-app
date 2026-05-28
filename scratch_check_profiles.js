require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkProfiles() {
  const { data, error } = await supabase.from('profiles').select('*');
  console.log('Profiles in DB:', data?.length);
  if (data) {
    data.forEach(p => console.log(`- ${p.username} (${p.id})`));
  }
}

checkProfiles();

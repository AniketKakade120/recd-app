require('dotenv').config({ path: '.env.local' });

async function getSwagger() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
  const json = await res.json();
  const recs = json.definitions.recommendations;
  console.log(JSON.stringify(recs, null, 2));
}

getSwagger();

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function inspectConstraint() {
  // We can't easily query pg_constraint without postgres access from client.
  // But wait! Is there any edge case in the `recommendations` insertion?
  console.log('Skipping pg_constraint. Checking recommendations data instead.');
}

inspectConstraint();

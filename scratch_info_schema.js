require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkInfoSchema() {
  const { data, error } = await supabase
    .from('information_schema.key_column_usage')
    .select('*')
    .eq('constraint_name', 'recommendations_recommended_by_fkey');
  
  console.log('Error:', error);
  console.log('Data:', data);
}

checkInfoSchema();

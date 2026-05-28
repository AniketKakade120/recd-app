const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jhophllmyiucnsecgeky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impob3BobGxteWl1Y25zZWNnZWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTkxNjYsImV4cCI6MjA5MzY5NTE2Nn0.qSqHvbHnDT1vgKbPnvJAmnA1ejCCAXQt4NVUXTwlm3Q'
);

async function run() {
  const userId = 'd058c06a-6222-485a-aef3-7573222bfd06';
  console.log(`Checking user_preferences for user: ${userId}`);

  const { data: prefs, error: prErr } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId);

  if (prErr) console.error('Preferences Error:', prErr.message);
  else {
    console.log(`Found ${prefs.length} preference records:`);
    console.log(prefs);
  }
}

run();

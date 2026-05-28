const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jhophllmyiucnsecgeky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impob3BobGxteWl1Y25zZWNnZWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTkxNjYsImV4cCI6MjA5MzY5NTE2Nn0.qSqHvbHnDT1vgKbPnvJAmnA1ejCCAXQt4NVUXTwlm3Q'
);

async function run() {
  console.log('Testing profiles select...');
  const { data, error } = await supabase
    .from('profiles')
    .select('*, prefs:user_preferences(genres, moods)');

  if (error) {
    console.error('Query failed:', error);
  } else {
    console.log('Query succeeded! Profiles:', data.length);
    console.log('First profile:', JSON.stringify(data[0], null, 2));
  }
}

run();

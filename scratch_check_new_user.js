const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jhophllmyiucnsecgeky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impob3BobGxteWl1Y25zZWNnZWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTkxNjYsImV4cCI6MjA5MzY5NTE2Nn0.qSqHvbHnDT1vgKbPnvJAmnA1ejCCAXQt4NVUXTwlm3Q'
);

async function run() {
  console.log('--- CHECKING NEW USER AND PROFILE STATUS ---');
  
  // 1. Check profiles count and profiles rows
  const { data: profiles, error: profError } = await supabase.from('profiles').select('*');
  if (profError) {
    console.error('Error fetching profiles:', profError);
  } else {
    console.log(`Profiles found: ${profiles.length}`);
    if (profiles.length > 0) {
      console.log('First profile detail:', JSON.stringify(profiles[0], null, 2));
    }
  }

  // 2. Check user_preferences
  const { data: preferences, error: prefError } = await supabase.from('user_preferences').select('*');
  if (prefError) {
    console.error('Error fetching user_preferences:', prefError);
  } else {
    console.log(`User Preferences found: ${preferences.length}`);
    if (preferences.length > 0) {
      console.log('First preference detail:', JSON.stringify(preferences[0], null, 2));
    }
  }
  
  console.log('--- END OF CHECKS ---');
}

run();

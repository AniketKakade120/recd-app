const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jhophllmyiucnsecgeky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impob3BobGxteWl1Y25zZWNnZWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTkxNjYsImV4cCI6MjA5MzY5NTE2Nn0.qSqHvbHnDT1vgKbPnvJAmnA1ejCCAXQt4NVUXTwlm3Q'
);

async function run() {
  console.log('--- DETAILED DB INSPECT START ---');

  // Let's inspect the active tables
  const tables = ['profiles', 'crew_connections', 'crew_requests', 'invites', 'user_connections'];
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`Table '${table}': ERROR - ${error.message}`);
      } else {
        console.log(`Table '${table}': EXISTS (returned ${data.length} rows or empty)`);
        if (data.length > 0) {
          console.log(`Columns sample:`, Object.keys(data[0]));
        }
      }
    } catch (e) {
      console.log(`Table '${table}': EXCEPTION - ${e.message}`);
    }
  }

  console.log('--- DETAILED DB INSPECT END ---');
}

run();

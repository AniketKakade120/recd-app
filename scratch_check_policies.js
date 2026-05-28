const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jhophllmyiucnsecgeky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impob3BobGxteWl1Y25zZWNnZWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTkxNjYsImV4cCI6MjA5MzY5NTE2Nn0.qSqHvbHnDT1vgKbPnvJAmnA1ejCCAXQt4NVUXTwlm3Q'
);

async function run() {
  console.log('--- FETCHING DATABASE POLICIES ---');
  // We can query pg_policies using an RPC or a custom query.
  // Wait! Supabase API might not let us query pg_policies directly unless we use an RPC.
  // Let's see if we can query pg_catalog or if it fails.
  const { data, error } = await supabase.rpc('get_policies_diagnostic');
  if (error) {
    console.log('get_policies_diagnostic RPC not found, falling back to manual schema test...');
    // We can also create a temporary function to fetch policies, or just write SQL to execute it.
    // Let's create an RPC or execute a raw SQL block.
  } else {
    console.log('Policies:', data);
  }
}

run();

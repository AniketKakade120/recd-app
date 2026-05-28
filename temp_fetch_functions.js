const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jhophllmyiucnsecgeky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impob3BobGxteWl1Y25zZWNnZWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTkxNjYsImV4cCI6MjA5MzY5NTE2Nn0.qSqHvbHnDT1vgKbPnvJAmnA1ejCCAXQt4NVUXTwlm3Q'
);

async function run() {
  console.log('--- FETCH SQL FUNCTIONS START ---');
  
  // We can execute SQL queries by calling a RPC if there's any generic SQL exec function,
  // or we can query information schema, but wait! Supabase Client has no direct SQL exec query client,
  // BUT we can test calling the RPC functions to see their schema/errors!
  // Wait, let's call accept_crew_invite with a fake code and see the error!
  
  const { data: res1, error: err1 } = await supabase.rpc('accept_crew_invite', { invite_code_input: 'FAKE_CODE' });
  console.log('accept_crew_invite call response:', res1, 'Error:', err1);

  const { data: res2, error: err2 } = await supabase.rpc('accept_crew_request', { request_id: '00000000-0000-0000-0000-000000000000' });
  console.log('accept_crew_request call response:', res2, 'Error:', err2);
  
  console.log('--- FETCH SQL FUNCTIONS END ---');
}

run();

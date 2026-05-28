const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jhophllmyiucnsecgeky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impob3BobGxteWl1Y25zZWNnZWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTkxNjYsImV4cCI6MjA5MzY5NTE2Nn0.qSqHvbHnDT1vgKbPnvJAmnA1ejCCAXQt4NVUXTwlm3Q'
);

async function run() {
  console.log('--- DATABASE DIAGNOSTIC START ---');
  
  // 1. Check Profiles
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  if (pErr) console.error('Profiles Fetch Error:', pErr.message);
  else {
    console.log(`\nProfiles Total: ${profiles.length}`);
    profiles.forEach(p => {
      console.log(`- ID: ${p.id} | Name: ${p.display_name} | Username: ${p.username} | Onboarded: ${p.onboarding_completed}`);
    });
  }

  // 2. Check Connections
  const { data: conns, error: cErr } = await supabase.from('crew_connections').select('*');
  if (cErr) console.error('Connections Fetch Error:', cErr.message);
  else {
    console.log(`\nConnections Total: ${conns.length}`);
    conns.forEach(c => {
      console.log(`- ID: ${c.id} | UserA: ${c.user_id} | UserB: ${c.crew_member_id} | Status: ${c.status}`);
    });
  }

  // 3. Check Requests
  const { data: reqs, error: rErr } = await supabase.from('crew_requests').select('*');
  if (rErr) console.error('Requests Fetch Error:', rErr.message);
  else {
    console.log(`\nRequests Total: ${reqs.length}`);
    reqs.forEach(r => {
      console.log(`- ID: ${r.id} | Sender: ${r.sender_id} | Receiver: ${r.receiver_id} | Status: ${r.status}`);
    });
  }

  // 4. Check Invites
  const { data: invites, error: iErr } = await supabase.from('invites').select('*');
  if (iErr) console.error('Invites Fetch Error:', iErr.message);
  else {
    console.log(`\nInvites Total: ${invites.length}`);
    invites.forEach(i => {
      console.log(`- ID: ${i.id} | Code: ${i.invite_code} | InvitedBy: ${i.invited_by} | Status: ${i.status}`);
    });
  }

  console.log('\n--- DATABASE DIAGNOSTIC END ---');
}

run();

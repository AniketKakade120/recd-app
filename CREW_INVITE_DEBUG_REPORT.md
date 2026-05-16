# CREW & INVITE SYSTEM DEBUG REPORT

## 1. Current Failing Flows
- **Invite Link**: Points to `/invite/[id]` but has no `invites` table to back it. It relies on a fragile 'direct profile fetch' that often fails or hangs.
- **Add to Crew**: Uses an 'instant mutual add' logic in `actions.ts`. This bypasses user consent and fails silently if RLS blocks the reciprocal insert.
- **Missing Visibility**: There is no way for a user to see 'Requests Received' because the data model doesn't support 'Pending' states.

## 2. Root Causes Identified
- **Missing Schema**: `crew_requests`, `invites`, and `notifications` tables do not exist.
- **RLS Conflicts**: The existing `user_connections` policy `auth.uid() = user_id` prevents User A from creating the reciprocal record for User B in a single transaction from the client.
- **Terminology Mismatch**: The code uses 'Friends' in some places and 'Crew' in others, leading to inconsistent state tracking.

## 3. Recommended Fix
- **Schema Migration**: Drop the current `user_connections` (or rename/migrate it) and implement the 4 new tables.
- **Server Actions**: Move all social logic to the server to handle reciprocal writes safely outside of strict client-side RLS constraints.
- **State Management**: Update the Global Context to track `pending` states.

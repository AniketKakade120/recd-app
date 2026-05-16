# Crew Social System: Fix Report & Deep Dive

## 1. Root Cause Analysis
The system was previously using a "permissive" RLS model that allowed the frontend to directly insert into the `crew_connections` table.
**The Failure**: When User B accepted User A's invite, the app attempted to insert two reciprocal rows:
1. `User A -> User B`
2. `User B -> User A`
Because User B was the only authenticated user, RLS blocked the insertion of the `User A -> User B` row, resulting in the error: `new row violates row-level security policy for table "crew_connections"`.

---

## 2. Solution: Transactional RPC Architecture
I shifted all reciprocal logic to the **Database Layer** using PostgreSQL RPC functions.

### Key Changes:
- **No Direct Inserts**: Frontend is now restricted from directly inserting into `crew_connections`.
- **Atomic Operations**: `accept_crew_request` and `accept_crew_invite` are now atomic RPC functions. They handle updating the request status and inserting both reciprocal connection rows in a single server-side transaction.
- **Security Definer**: These functions run with elevated privileges (`SECURITY DEFINER`), allowing them to create the reciprocal link that the end-user's RLS would normally block.

---

## 3. Database Migrations (Implemented via SQL Editor)
- **RPC `accept_crew_request(uuid)`**: Handles direct request acceptance.
- **RPC `accept_crew_invite(text)`**: Handles joining via invite links.
- **Constraints**: Added `UNIQUE` indexes on `(user_id, crew_member_id)` and `(sender_id, receiver_id)` to prevent duplicates.
- **RLS Lockdown**: `crew_connections` is now `SELECT` only for authenticated users (own rows only).

---

## 4. Codebase Updates

### Backend (`src/lib/supabase/actions.ts`)
- Replaced direct DB calls in `acceptCrewRequest` and `acceptCrewInvite` with `supabase.rpc()` calls.
- Improved `sendCrewRequest` to be more robust (checking for existing connections first).

### State Management (`src/lib/context.tsx`)
- **`refreshData`**: Updated to use optimized Joins to fetch profile data for crew members and pending requests in one go.
- **Social Hooks**: Updated `acceptCrewRequest` and `acceptInvite` to handle structured responses and display friendly toasts.

### UI Components
- **`InviteAcceptancePage`**: Now handles specific error codes (Invalid vs. Expired vs. Own Invite).
- **`ProfileCrewTab`**: Refactored to show "Requests Received" and "Requests Sent" as distinct sections using the new global state.

---

## 5. How to Test

### Test 1: Invite Link
1.  **User A**: Click "Invite Friends" on Profile, copy link.
2.  **User B**: Open link, click "Accept & Join".
3.  **Verify**: Both users should immediately see each other in "My Crew".

### Test 2: Direct Request
1.  **User A**: Search for User B, click "Add to Crew".
2.  **User B**: Go to Profile -> Crew -> Requests.
3.  **Verify**: User B sees the request. Click "Accept". Both are now connected.

---

## 6. Current Status
- **Invite Links**: Reusable (multiple people can join via one link).
- **Email Invites**: Disabled (shows "Coming Soon" - Copy Link is the primary path).
- **Security**: High. RLS is active and direct client-side spoofing is blocked.

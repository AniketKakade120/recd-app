# Technical Spec: Rec'd Social Architecture (Request-Accept)

## 1. Objective
A transactional social system where users connect via **Invite Links** or **Direct Requests**. Connections are reciprocal (Mutual).

---

## 2. Database Schema (Supabase)

### `public.profiles`
- `id` (UUID, PK)
- `username` (Text, Unique)
- `onboarding_completed` (Boolean)
- `taste_archetype` (Text)

### `public.invites`
- `invite_code` (Text, Unique): Used in URLs like `/invite/crew/[code]`.
- `invited_by` (UUID): Reference to the creator.
- `status` (Text): 'active', 'used', 'expired'.

### `public.crew_requests`
- `sender_id` (UUID)
- `receiver_id` (UUID)
- `status` (Text): 'pending', 'accepted', 'rejected'.

### `public.crew_connections` (Reciprocal)
- `user_id` (UUID)
- `crew_member_id` (UUID)
- *Note: A mutual friendship exists as two rows: (A,B) and (B,A).*

---

## 3. Backend Logic (Server Actions)
*Located in `src/lib/supabase/actions.ts`*

### `acceptInvite(code)`
1. Validates the `invite_code`.
2. Fetches the `invited_by` (Inviter) ID.
3. Creates an entry in `crew_requests` as `status: 'accepted'`.
4. Creates **two reciprocal rows** in `crew_connections`.

### `sendCrewRequest(receiverId)`
1. Checks for existing connections/requests.
2. Inserts a 'pending' row into `crew_requests`.
3. Triggers a notification.

---

## 4. Frontend State Management
*Located in `src/lib/context.tsx`*

- **`AppProvider`**: Listens to `onAuthStateChange`.
- **`loading`**: Boolean. Stays true until the Profile fetch is complete.
- **`isAuthenticated`**: Boolean. Based on Supabase session.
- **`isOnboarded`**: Boolean. Derived from `profile.onboarding_completed`.
- **`refreshData()`**: Fetches all connections and requests from Supabase and populates the global state.

---

## 5. Navigation & Security Logic (The "Shield")
*Located in `src/components/AppShell.tsx`*

### Onboarding Guard
- If `isAuthenticated` is true BUT `isOnboarded` is false, redirects to `/onboarding`.
- **Safety Fix**: Uses a `__mountedTime` grace period (10s) to prevent premature redirects while the session is still loading.

### Loading Spinner
- Shows if `loading` is true OR if `isAuthenticated` is true but `currentUser` (profile) is still missing.

---

## 6. Key Components
- `InviteModal.tsx`: Generates the `inviteUrl`.
- `ProfileCrewTab.tsx`: Displays "My Crew" and "Requests" tabs.
- `src/app/invite/crew/[code]/page.tsx`: The landing page for joining.

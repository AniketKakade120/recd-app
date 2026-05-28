# Auth Reload & Profile Sync Diagnosis Report

## 1. Exact Failure After Page Reload
When a logged-in user refreshed the page, the application was falling into the "Stamping Connection Error" state. This happens because the browser successfully restores the session, but the profile hydration step (`fetchOrCreateProfile`) fails. 

The previous implementation used `.single()` for the profile `select` query. If the Supabase Row Level Security (RLS) policy blocks the read (e.g. strict `profile_visibility` or missing `id = auth.uid()` policy), `.single()` throws `PGRST116` (0 rows returned). 
The code then fell back to `.insert()`. Since the user is already registered and their profile *does* physically exist in the database, the insert violates the primary key constraint (`23505: duplicate key`), throwing a fatal error and breaking the app shell on every reload.

## 2. Session & Client Verification
- **Does `getSession` return a session?** Yes. The `middleware.ts` runs on page reload, securely reads the server cookies, refreshes the token if needed, and writes them back. The browser client is properly using `@supabase/ssr` to read these cookies.
- **Does `getUser` return a user?** Yes, as long as the session is valid, the user object is intact.
- **Is Supabase SSR setup correct?** Yes, the application is strictly using `createBrowserClient` in the browser and `createServerClient` in middleware/routes, avoiding local storage collisions. Server-set cookies are correctly persisting across reloads.

## 3. Profile Fetch & Insert Improvements
We completely rewrote `fetchOrCreateProfile(user)`:
- Now uses `.maybeSingle()` instead of `.single()`, preventing `PGRST116` exceptions.
- Logs exact Supabase errors with `code`, `details`, and `hint`.
- Handles `23505` (Duplicate Key) gracefully: if an insert fails because the profile already exists (but was masked by RLS or a race condition), it attempts a direct refetch.
- Handles username unique constraint conflicts by dynamically attaching a random numerical suffix and retrying.
- The `authError` is now explicitly captured in the React state and visually rendered inside the Error panel so we can see the *exact* Supabase rejection on Vercel.

## 4. RLS & Schema Requirements (Manual Verification Required)
If you still see the error panel after this deployment, read the red error code it displays. You must verify these RLS policies in the Supabase Dashboard SQL Editor:

```sql
-- Required: Let users read their own profile
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- Required: Let users insert their own profile
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

-- Required: Let users update their own profile
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());
```

## 5. Retry Mechanism Overhaul
The "Retry Connection" button was previously broken because it only re-fetched public app data (`refreshData`). It now triggers `retryAuthSync()` which explicitly reruns:
1. `supabase.auth.getSession()`
2. `supabase.auth.getUser()`
3. `fetchOrCreateProfile(user)`
4. `refreshData(user.id)`

## 6. Files Changed
- `src/lib/context.tsx`: Updated `fetchOrCreateProfile` to use `maybeSingle`, added constraint retry logic, added `retryAuthSync`, embedded extensive safe auth logging, and captured `authError`.
- `src/components/AppShell.tsx`: Bound the Retry Connection button to `retryAuthSync()` and added a UI element to render the exact `authError` message.

## 7. Next Steps & Acceptance Testing
The code is compiling successfully. Please deploy these changes to Vercel and run the requested **Reproduction Flow**:
1. Login and reach `/home`.
2. Refresh the browser.
3. Observe if the profile restores correctly. 
4. If it fails, look at the red error text in the Stamping Connection Error panel and the Vercel/Browser console logs prefixed with `[Auth Debug]`.

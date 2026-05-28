# Auth Permanent Fix Report

## What Changed

### Problem
The app had an unstable Google OAuth login flow on Vercel. After logout and login again, the AppShell would sometimes get stuck spinning or show a "Stamping Connection Error" fallback. The root cause was a fragile two-hop callback architecture with cookie/session race conditions.

### Old Flow (Broken)
```
/login → Google → /api/auth/callback → 302 redirect to /auth/callback
→ client-side exchangeCodeForSession → redirect to /home
```

**Why it broke:**
1. OAuth code was exchanged **client-side** in the browser, but the PKCE code verifier cookie was sometimes not available after the server redirect.
2. Middleware ran on callback routes, interfering with cookie state during exchange.
3. `INITIAL_SESSION` fired with no session (cookie race), prematurely setting `loading: false`.
4. `signOut()` was fire-and-forget, causing cookie/state desync on re-login.

### New Flow (Fixed)
```
/login → Google → /api/auth/callback
→ server-side exchangeCodeForSession (sets cookies on response)
→ 302 redirect to /home (cookies travel with redirect)
```

**What's different:**
- OAuth code is exchanged **server-side** exactly once.
- Session cookies are written directly onto the redirect response.
- No client-side exchange. No second redirect hop.
- Middleware is excluded from all auth callback routes.
- `signOut()` is properly awaited.
- `INITIAL_SESSION` with no session attempts a `getSession()` recovery before giving up.

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/api/auth/callback/route.ts` | Rewrote: server-side code exchange with cookie-bearing redirect |
| `src/app/auth/callback/page.tsx` | Neutralized: no longer exchanges code, just a safety redirect |
| `src/lib/context.tsx` | Hardened `INITIAL_SESSION` handler; `signOut()` now awaited |
| `src/middleware.ts` | Excluded `api/auth/*` and `auth/callback` from matcher |
| `src/components/AppShell.tsx` | Added `/api/auth/callback` to all public route lists |

---

## Required Supabase Dashboard Configuration

### Authentication → URL Configuration

**Site URL:**
```
https://YOUR_PRODUCTION_DOMAIN
```
(e.g., `https://recd-app.vercel.app` or `https://recd.club`)

**Redirect URLs (add ALL of these):**
```
https://YOUR_PRODUCTION_DOMAIN/api/auth/callback
http://localhost:3000/api/auth/callback
```

If using Vercel preview deployments, also add:
```
https://*.vercel.app/api/auth/callback
```

> [!IMPORTANT]
> The redirect URL in Supabase must **exactly** match the `redirectTo` value used in `signInWithOAuth`. The app uses `/api/auth/callback` — NOT `/auth/callback`.

---

## Required Vercel Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | `eyJ...` |
| `NEXT_PUBLIC_APP_URL` | Your production app URL | `https://recd-app.vercel.app` |
| `TMDB_API_KEY` | TMDB API key (server-side) | `4e32f...` |

> [!CAUTION]
> `NEXT_PUBLIC_APP_URL` must NOT be `http://localhost:3000` in production. Set it to your actual Vercel/custom domain.

---

## Test Checklist

- [ ] **Fresh login**: Clear cookies → `/login` → Google → new user lands on `/onboarding`, returning user lands on `/home`
- [ ] **Logout + re-login**: Login → Logout → Login again → no infinite loader, lands on `/home`
- [ ] **Page refresh**: Login → `/home` → refresh → session restores, no bounce to `/`
- [ ] **Deprecated route**: Navigate to `/auth/callback?code=fake` → redirects safely, does NOT exchange code client-side
- [ ] **Middleware**: Confirm `/api/auth/callback` is NOT intercepted by middleware (no `[Supabase middleware]` logs on callback)

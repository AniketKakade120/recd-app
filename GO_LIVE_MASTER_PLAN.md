# Rec'd Club: Go-Live Strategy & Audit Master

This document aggregates the full product audit, technical implementation plans, and go-live roadmaps for the Rec'd Club MVP.

---

# 1. Product Audit
**Executive Summary**: Rec’d is in a "high-fidelity prototype" state. Visually, it is stunning and highly cinematic, but technically, it is largely decoupled from a persistent backend. While Supabase schema and auth hooks are present, the application state (`AppContext`) still defaults to empty mock arrays, and most write actions (like creating a recommendation or group) do not yet fully synchronize with the database or update the global state in a way that persists across reloads. The TMDB integration is working for search and trending content, which is a major win.

**MVP Readiness Score**: **4.5 / 10**

### Critical Blockers
1. **The "Empty World" Problem**: New users land on a "dead" feed.
2. **Auth-Onboarding Loop**: Potential for users to get stuck if profile syncing fails.
3. **Write Actions Lack Persistence**: "Save" buttons often don't persist to the DB.
4. **Group Membership Discovery**: No "Join Group via Link" logic implemented yet.

---

# 2. Go-Live Roadmap
### Phases
- **Phase 1: Auth & User Accounts**: Configure Google OAuth and fix onboarding loops.
- **Phase 2: Database Persistence**: Transition core data (recommendations, watchlist) to Supabase.
- **Phase 3: Groups & Invites**: Enable `invite_code` generation and the `/invite/group/[code]` landing page.
- **Phase 4: Recommendations & Verdicts**: Close the "Recommend -> Watch -> Verdict" loop.
- **Phase 5: Sharing & Public Pages**: Build `/list/[slug]` public read-only pages and OG metadata.
- **Phase 6: QA & Closed Beta**: Invite 20 trusted users for stress-testing.

---

# 3. Supabase Implementation
- **Provider**: Google OAuth (Gmail).
- **Onboarding Flow**: On first sign-in, create a record in `profiles`. If `onboarding_completed` is false, force redirect to `/onboarding`.
- **Key Tables**: `profiles`, `user_connections`, `groups`, `group_members`, `titles`, `recommendations`, `ratings`, `watchlist_items`.
- **RLS**: Secure all user-generated content so only owners or group members can view/edit.

---

# 4. Groups & Invites
- **Invite Link Format**: `https://recd.club/invite/group/[invite_code]`
- **Join Logic**: Land on a preview page showing group name and vibe; join only after logging in.
- **Permissions**: Owners manage metadata; members send recommendations.

---

# 5. Share System
- **Resources**: Lists, Titles, and Public Profiles.
- **Metadata**: Dynamic OpenGraph tags using high-res TMDB backdrops and list collages.
- **CTA**: Logged-out users are prompted to "Join Rec'd to see more."

---

# 6. Real Data & TMDB
- **Sync Strategy**: Call `ensureTitleExistsInDb` when a user interacts with a title.
- **Caching**: Store cast/director and overview in Supabase to minimize TMDB API rate-limiting.
- **Taste Score**: Calculated as `(Total Successful Recs / Total Recs Given) * 100`.

---

# 7. Environment Setup
- **Keys Required**: 
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `TMDB_API_KEY` (Server-side)
    - `NEXT_PUBLIC_APP_URL`

---

# 8. Beta Launch Plan
- **Audience**: 20 friends / 5 groups.
- **Metrics**: 3 recs/user/week, 50% verdict completion rate.
- **Feedback**: 1-on-1 interviews and a dedicated feedback channel.

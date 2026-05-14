# Rec'd Project Context Summary

This document serves as a "save point" for the Rec'd social recommendation platform, detailing the current architecture, recent major refactors, and the roadmap.

## 🚀 Project Overview
**Rec'd** is a cinematic, social-first movie and TV recommendation platform built with **Next.js 16 (Turbopack)**, **TypeScript**, and **Tailwind CSS**. It integrates live data from the **TMDB API** and uses **Supabase** for persistence.

## 🏗️ Technical Architecture
- **State Management**: `AppProvider` (`src/lib/context.tsx`) handles global state (user, recommendations, titles, toasts, and global modals).
- **API Layer**: 
  - Proxied TMDB routes (`/api/tmdb/*`) to protect API keys.
  - Supabase integration for persisting titles and user data.
- **Routing**: App Router with cinematic transitions.
- **Design System**: Dark-mode, premium aesthetics using a custom palette (Ink, Bone, Cinema Red) and Glassmorphism.

## 🔄 Recent Major Changes

### 1. Recommendation Modal Refactor
- **Status**: Complete.
- **Change**: The `/recommend` page was removed and replaced with a **global wide modal**.
- **Logic**: Triggered via `openRecommendModal(data)` from the context.
- **Components**: `src/components/RecommendModal.tsx` handles the 4-step stepper flow (Search -> Audience -> Case -> Preview).
- **Integration**: Replaced all hard links to `/recommend` with modal triggers in `AppShell`, `TitleCard`, `WatchlistItem`, etc.

### 2. TMDB Data Mapping Fixes
- **Status**: Complete.
- **Fix**: Resolved a bug where TMDB "Person" results (e.g., creators like Masashi Kishimoto) were being incorrectly mapped as "TV Series". This prevented "ghost" titles from appearing in search results and fixed detail page 404/500 errors.

### 3. Personalization & Discovery
- **Status**: Active.
- **Features**: Implemented "Curated for You" rows on the Home page based on user preferences (Genres/Streaming Platforms) using the `/api/tmdb/discover` endpoint.

## ⚠️ Known Issues / Blockers
- **Folder Lock**: The `src/app/recommend` directory became locked by the OS during deletion. **Action Required**: Manually delete `src/app/recommend` from File Explorer to resolve the "FATAL" Turbopack error.
- **Persistent Hydration**: Some data (like search results) is currently in-memory; ongoing work to ensure all fetched TMDB titles are synced to Supabase `titles` table.

## 🗺️ Roadmap & Next Steps
1. **Supabase Persistence**: Finalize the auto-syncing of every viewed/recommended TMDB title to the database.
2. **Crew Social Layer**: Refine the "Crew" search and invite flow.
3. **Taste Score Refinement**: Implement the logic to update user Taste Scores based on verdict accuracy.

---
*Context preserved as of: 2024-05-13*

# Rec'd V2

A premium, cinematic social recommendation platform. Good taste travels person to person.

## The Concept

"Your friends rate your taste."

Rec'd is a social movie and series recommendation app where:
1. You recommend content to your friends or groups
2. They save it to their watchlist and watch it
3. They rate both the content itself AND how good your recommendation was
4. You earn stamps (like "Good Call" or "Certified Good Call") which build your overall "Taste Score"

It's designed to feel less like a database and more like a trust-based discovery platform.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 (Custom Design System, `@theme inline`)
- **Language**: TypeScript
- **State Management**: React Context (`AppProvider`)
- **Data Layer**: Mock Data (Ready for Supabase + TMDB)

## Features

- **Dark Cinematic UI**: Premium dark mode with subtle glows, glassmorphism, and editorial typography
- **Taste Score**: A dynamically calculated reputation score based on how accurately you recommend
- **Social Feed**: See your crew's activity, verdicts, and stamps
- **Groups**: Create private or public groups for shared watchlists (e.g., "Film Chaos Club")
- **3-Step Rating Flow**: Rate content → Rate accuracy → Give a stamp
- **Single-Page Recommend**: Streamlined form with live card preview

## Local Development

The app currently uses a comprehensive mock data layer so it can be developed and reviewed without backend keys.

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Then open `http://localhost:3000` in your browser.
Click "Demo Login" on the login screen to access the full app experience.

## Environment Variables

When you're ready to connect the backend:

```env
# Required for real auth & database
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Required for search & metadata (falls back to mock data if missing)
NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-key
```

## Design System

- **Colors**: Ink (`#0C0C0D`), Bone (`#F3F1EB`), Cinema Red (`#E02020`), Surface (`#111111`)
- **Typography**: Playfair Display (Headings), Inter (UI)
- **Stamps**: Visual ticket-shaped badges that act as the currency of the app

## Project Structure

- `/src/app`: Next.js App Router pages (Home, Feed, Discover, Groups, Recommend, Watchlist, Profile)
- `/src/components`: Reusable UI components (Cards, Stamps, Avatars, Modals)
- `/src/lib`: Types, context, mock data, and utilities

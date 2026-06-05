-- Rec'd Club: People Search Migration
-- Run this in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/jhophllmyiucnsecgeky/sql/new

-- 1. Add discoverable column to profiles (defaults all existing users to true)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS discoverable BOOLEAN DEFAULT true;

-- 2. Index for search performance on discoverable + public profiles
CREATE INDEX IF NOT EXISTS idx_profiles_search 
  ON public.profiles (discoverable, profile_visibility) 
  WHERE discoverable = true AND profile_visibility = 'public';

-- 3. Trigram index for faster ILIKE searches on username and display_name
-- (requires pg_trgm extension, which Supabase has by default)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_profiles_username_trgm 
  ON public.profiles USING gin (username gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_profiles_display_name_trgm 
  ON public.profiles USING gin (display_name gin_trgm_ops);

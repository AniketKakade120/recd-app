-- Run this script in your Supabase SQL Editor to fix ALL remaining corrupted foreign keys that reference profiles.
-- This will fix the group functionality, user connections, comments, and watchlists.

-- 1. groups table
ALTER TABLE public.groups DROP CONSTRAINT IF EXISTS groups_created_by_fkey;
ALTER TABLE public.groups ADD CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. group_members table
ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;
ALTER TABLE public.group_members ADD CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. user_preferences table
ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;
ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. user_connections table
ALTER TABLE public.user_connections DROP CONSTRAINT IF EXISTS user_connections_user_id_fkey;
ALTER TABLE public.user_connections ADD CONSTRAINT user_connections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_connections DROP CONSTRAINT IF EXISTS user_connections_connected_user_id_fkey;
ALTER TABLE public.user_connections ADD CONSTRAINT user_connections_connected_user_id_fkey FOREIGN KEY (connected_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 5. watchlist_items table
ALTER TABLE public.watchlist_items DROP CONSTRAINT IF EXISTS watchlist_items_user_id_fkey;
ALTER TABLE public.watchlist_items ADD CONSTRAINT watchlist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 6. watchlist_lists table
ALTER TABLE public.watchlist_lists DROP CONSTRAINT IF EXISTS watchlist_lists_user_id_fkey;
ALTER TABLE public.watchlist_lists ADD CONSTRAINT watchlist_lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 7. comments table
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Rec'd Club: Master Database Wipe & Reset Script
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/jhophllmyiucnsecgeky/sql/new

-- 1. Wipe all user-generated data in the public schema
TRUNCATE public.comments CASCADE;
TRUNCATE public.activity CASCADE;
TRUNCATE public.ratings CASCADE;
TRUNCATE public.watchlist_list_items CASCADE;
TRUNCATE public.watchlist_lists CASCADE;
TRUNCATE public.watchlist_items CASCADE;
TRUNCATE public.recommendation_targets CASCADE;
TRUNCATE public.recommendations CASCADE;
TRUNCATE public.group_members CASCADE;
TRUNCATE public.groups CASCADE;
TRUNCATE public.user_connections CASCADE;
TRUNCATE public.crew_connections CASCADE;
TRUNCATE public.crew_requests CASCADE;
TRUNCATE public.invites CASCADE;
TRUNCATE public.notifications CASCADE;
TRUNCATE public.user_preferences CASCADE;
TRUNCATE public.profiles CASCADE;

-- 2. Delete all users from Supabase Auth
DELETE FROM auth.users;

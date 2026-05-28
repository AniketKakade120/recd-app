-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Fix the foreign key on recommendations table
ALTER TABLE public.recommendations 
DROP CONSTRAINT IF EXISTS recommendations_recommended_by_fkey;

ALTER TABLE public.recommendations 
ADD CONSTRAINT recommendations_recommended_by_fkey 
FOREIGN KEY (recommended_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Check for any mismatched UUIDs just in case
-- This will ensure no orphaned records exist
DELETE FROM public.recommendations 
WHERE recommended_by NOT IN (SELECT id FROM public.profiles);

-- Run this script in your Supabase SQL Editor to fix the remaining corrupted constraints

-- 1. Fix the constraints on the activity table
ALTER TABLE public.activity DROP CONSTRAINT IF EXISTS activity_user_id_fkey;
ALTER TABLE public.activity DROP CONSTRAINT IF EXISTS activity_target_user_id_fkey;

ALTER TABLE public.activity 
ADD CONSTRAINT activity_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.activity 
ADD CONSTRAINT activity_target_user_id_fkey 
FOREIGN KEY (target_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Fix the constraint on the recommendation_targets table (which is the next step in the flow)
ALTER TABLE public.recommendation_targets DROP CONSTRAINT IF EXISTS recommendation_targets_user_id_fkey;

ALTER TABLE public.recommendation_targets 
ADD CONSTRAINT recommendation_targets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Fix ratings table just in case they rate it next!
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_rated_by_fkey;

ALTER TABLE public.ratings 
ADD CONSTRAINT ratings_rated_by_fkey 
FOREIGN KEY (rated_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

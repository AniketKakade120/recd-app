-- Run this script in your Supabase SQL Editor to fix the desynced verdict state

UPDATE public.recommendations 
SET status = 'verdict_given' 
WHERE id IN (
  SELECT recommendation_id FROM public.ratings
);

-- Rec'd Club: RLS Recursion Fix & Missing Comments Table Migration
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/jhophllmyiucnsecgeky/sql/new

-- 1. SECURITY DEFINER HELPER FUNCTIONS (Bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.check_is_group_member(group_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = $1 AND gm.user_id = $2
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_is_recommender(rec_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.recommendations r
    WHERE r.id = $1 AND r.recommended_by = $2
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_is_rec_target(rec_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.recommendation_targets rt
    WHERE rt.recommendation_id = $1 AND rt.user_id = $2
  );
END;
$$;


-- 2. DROP EXISTING RECURSIVE POLICIES
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON public.group_members;
DROP POLICY IF EXISTS "View relevant recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Users can see relevant recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "View recommendation targets" ON public.recommendation_targets;
DROP POLICY IF EXISTS "View relevant activity" ON public.activity;


-- 3. DEFINE CLEAN, RECURSION-FREE POLICIES
-- A. Group Members
CREATE POLICY "Users can view members of groups they belong to" ON public.group_members
  FOR SELECT USING (
    user_id = auth.uid() OR public.check_is_group_member(group_id, auth.uid())
  );

-- B. Recommendation Targets
CREATE POLICY "View recommendation targets" ON public.recommendation_targets
  FOR SELECT USING (
    user_id = auth.uid() OR public.check_is_recommender(recommendation_id, auth.uid())
  );

-- C. Recommendations
CREATE POLICY "Users can see relevant recommendations" ON public.recommendations
  FOR SELECT USING (
    recommended_by = auth.uid() OR
    (group_id IS NULL AND public.check_is_rec_target(id, auth.uid())) OR
    (group_id IS NOT NULL AND public.check_is_group_member(group_id, auth.uid()))
  );

-- D. Activity
CREATE POLICY "View relevant activity" ON public.activity
  FOR SELECT USING (
    user_id = auth.uid() OR target_user_id = auth.uid() OR
    (group_id IS NOT NULL AND public.check_is_group_member(group_id, auth.uid()))
  );


-- 4. CREATE MISSING COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    title_id TEXT REFERENCES public.titles(id),
    recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE CASCADE NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies
DROP POLICY IF EXISTS "Users can view comments on visible recommendations" ON public.comments;
DROP POLICY IF EXISTS "Users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

-- Define Comments policies
CREATE POLICY "Users can view comments on visible recommendations" ON public.comments
  FOR SELECT USING (
    public.check_is_recommender(recommendation_id, auth.uid()) OR
    public.check_is_rec_target(recommendation_id, auth.uid()) OR
    (group_id IS NOT NULL AND public.check_is_group_member(group_id, auth.uid()))
  );

CREATE POLICY "Users can insert comments" ON public.comments
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- Grant privileges to authenticated role
GRANT SELECT, INSERT, DELETE ON public.comments TO authenticated;

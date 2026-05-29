-- Fix the infinite recursion deadlock on group_members SELECT policy

-- 1. Create a secure helper function to check membership without triggering recursion
CREATE OR REPLACE FUNCTION public.is_group_member(check_group_id uuid, check_user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.group_members WHERE group_id = check_group_id AND user_id = check_user_id);
END;
$$;

-- 2. Drop the old broken policy that causes Postgres to crash/block silently
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON public.group_members;

-- 3. Create the new clean policy
CREATE POLICY "Users can view members of groups they belong to" ON public.group_members
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR 
  public.is_group_member(group_id, auth.uid()) OR 
  EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND privacy = 'public')
);

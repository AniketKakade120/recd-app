-- Ultimate fix for Postgres RLS Circular Dependency

-- 1. Function to securely check membership without triggering RLS
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

-- 2. Function to securely check if a group is public without triggering RLS
CREATE OR REPLACE FUNCTION public.is_group_public(check_group_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.groups WHERE id = check_group_id AND privacy = 'public');
END;
$$;

-- 3. Drop ALL existing SELECT policies that were creating a circular loop
DROP POLICY IF EXISTS "Users can view groups they belong to, public groups, or groups they created" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups they belong to or public groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON public.group_members;

-- 4. Create the new clean policies using the SECURITY DEFINER functions
CREATE POLICY "Users can view groups" ON public.groups
FOR SELECT TO authenticated
USING (
  privacy = 'public' OR 
  created_by = auth.uid() OR
  public.is_group_member(id, auth.uid())
);

CREATE POLICY "Users can view group members" ON public.group_members
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR 
  public.is_group_member(group_id, auth.uid()) OR 
  public.is_group_public(group_id)
);

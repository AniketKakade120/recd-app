-- Fix the RLS deadlock on groups and group_members!

-- Drop the old groups SELECT policy
DROP POLICY IF EXISTS "Users can view groups they belong to or public groups" ON public.groups;

-- Create the new groups SELECT policy that ALSO allows the creator to view the group
-- before they have officially been inserted into group_members!
CREATE POLICY "Users can view groups they belong to, public groups, or groups they created" ON public.groups
FOR SELECT TO authenticated
USING (
  privacy = 'public' OR 
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid())
);

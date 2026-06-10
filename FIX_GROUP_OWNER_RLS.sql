-- Fix Row Level Security (RLS) for group_members to allow owners to manage members

-- Drop the old policy if it exists (just in case)
DROP POLICY IF EXISTS "Group owners can delete members" ON public.group_members;

-- Create policy to allow group owners to delete any member from their group
CREATE POLICY "Group owners can delete members" ON public.group_members
FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid())
);

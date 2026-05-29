-- Fix Row Level Security (RLS) for group_members

-- Drop the old overly restrictive policy
DROP POLICY IF EXISTS "Users can insert themselves into groups" ON public.group_members;

-- Create the new policy that allows you to add friends to a group you just created!
CREATE POLICY "Users can insert members into their own groups" ON public.group_members
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid())
);

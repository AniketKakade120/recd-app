CREATE POLICY "Users can remove themselves from groups" ON public.group_members
FOR DELETE USING (auth.uid() = user_id);

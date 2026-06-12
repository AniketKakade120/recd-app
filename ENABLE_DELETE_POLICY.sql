-- Add DELETE policy for recommendations
CREATE POLICY "Users can delete their own recommendations" ON public.recommendations
FOR DELETE USING (
  recommended_by = auth.uid()
);

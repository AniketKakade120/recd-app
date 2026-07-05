-- Drop any restrictive select policy if it exists (Optional, you can check what exists)
-- DROP POLICY IF EXISTS "Users can view their own journal entries" ON journal_entries;

-- Ensure RLS is enabled
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users (or everyone) to select journal entries
-- We'll allow public read access since profiles are public, or at least authenticated read access.
CREATE POLICY "Journal entries are viewable by everyone" 
ON journal_entries FOR SELECT 
USING (true);

-- Ensure the other policies exist for insert/update/delete just in case
CREATE POLICY "Users can insert their own journal entries" 
ON journal_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" 
ON journal_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" 
ON journal_entries FOR DELETE 
USING (auth.uid() = user_id);

CREATE TABLE public.title_comments (
    id TEXT PRIMARY KEY,
    title_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.title_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read title comments" ON public.title_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert title comments" ON public.title_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own title comments" ON public.title_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own title comments" ON public.title_comments FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for fast querying
CREATE INDEX idx_title_comments_title_id ON public.title_comments(title_id);
CREATE INDEX idx_title_comments_user_id ON public.title_comments(user_id);

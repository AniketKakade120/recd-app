-- JOURNAL ENTRIES - SUPABASE SCHEMA MIGRATION

CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    tmdb_id INTEGER NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
    title TEXT NOT NULL,
    poster_path TEXT,
    backdrop_path TEXT,
    release_year INTEGER,
    genres TEXT[] DEFAULT '{}',
    watched_date DATE NOT NULL DEFAULT CURRENT_DATE,
    rating NUMERIC CHECK (rating >= 0 AND rating <= 5),
    stamp TEXT,
    short_verdict TEXT,
    source_type TEXT NOT NULL DEFAULT 'self' CHECK (source_type IN ('self', 'recommended')),
    recommended_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE SET NULL,
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'crew', 'public')),
    platform TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, tmdb_id, media_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tmdb_id ON public.journal_entries(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_media_type ON public.journal_entries(media_type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_watched_date ON public.journal_entries(watched_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_stamp ON public.journal_entries(stamp);
CREATE INDEX IF NOT EXISTS idx_journal_entries_rating ON public.journal_entries(rating);
CREATE INDEX IF NOT EXISTS idx_journal_entries_source_type ON public.journal_entries(source_type);

-- Basic RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal entries" 
ON public.journal_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries" 
ON public.journal_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" 
ON public.journal_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" 
ON public.journal_entries 
FOR DELETE 
USING (auth.uid() = user_id);

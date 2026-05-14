-- REC'D SOCIAL STAMP SYSTEM - SUPABASE SCHEMA
-- This script creates all necessary tables, relationships, and basic RLS policies.

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    taste_archetype TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'crew_only', 'private')),
    taste_score INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. USER PREFERENCES (Onboarding data)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    genres TEXT[] DEFAULT '{}',
    moods TEXT[] DEFAULT '{}',
    formats TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    platforms TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TITLES (Cached from TMDB)
CREATE TABLE IF NOT EXISTS public.titles (
    id TEXT PRIMARY KEY, -- Using custom ID (e.g. tmdb-movie-123)
    tmdb_id INTEGER,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    poster_url TEXT,
    backdrop_url TEXT,
    poster_gradient INTEGER,
    release_year INTEGER,
    genres TEXT[] DEFAULT '{}',
    runtime TEXT,
    overview TEXT,
    external_rating NUMERIC,
    platforms TEXT[] DEFAULT '{}',
    format TEXT,
    language TEXT,
    cast_data JSONB DEFAULT '[]',
    director_data JSONB DEFAULT '{}',
    watch_providers JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. GROUPS
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    vibe TEXT,
    description TEXT,
    privacy TEXT DEFAULT 'private' CHECK (privacy IN ('public', 'private')),
    cover_image_url TEXT,
    avatar_gradient INTEGER DEFAULT 0,
    invite_code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. GROUP MEMBERS
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'mod', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_id, user_id)
);

-- 6. RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title_id TEXT REFERENCES public.titles(id) NOT NULL,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    recommended_by UUID REFERENCES public.profiles(id) NOT NULL,
    reason TEXT,
    confidence_score INTEGER DEFAULT 0,
    mood_tags TEXT[] DEFAULT '{}',
    primary_stamp TEXT,
    verdict_state TEXT DEFAULT 'verdict_pending' CHECK (verdict_state IN ('verdict_pending', 'verdict_given', 'dismissed', 'none')),
    recommended_to_group BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. RECOMMENDATION TARGETS (For direct person-to-person recs)
CREATE TABLE IF NOT EXISTS public.recommendation_targets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(recommendation_id, user_id)
);

-- 8. RATINGS (Verdicts)
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE CASCADE NOT NULL,
    rated_by UUID REFERENCES public.profiles(id) NOT NULL,
    content_rating INTEGER CHECK (content_rating >= 1 AND content_rating <= 5),
    recommendation_result TEXT NOT NULL,
    stamp TEXT,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. WATCHLIST
CREATE TABLE IF NOT EXISTS public.watchlist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title_id TEXT REFERENCES public.titles(id) NOT NULL,
    added_from_recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE SET NULL,
    added_by TEXT DEFAULT 'self',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, title_id)
);

-- 10. CUSTOM LISTS
CREATE TABLE IF NOT EXISTS public.watchlist_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    privacy TEXT DEFAULT 'private' CHECK (privacy IN ('private', 'shared', 'group')),
    cover_style TEXT DEFAULT 'gradient',
    cover_image_url TEXT,
    share_slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.watchlist_list_titles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    list_id UUID REFERENCES public.watchlist_lists(id) ON DELETE CASCADE NOT NULL,
    title_id TEXT REFERENCES public.titles(id) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(list_id, title_id)
);

-- 11. USER CONNECTIONS (Crew)
CREATE TABLE IF NOT EXISTS public.user_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    connected_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'removed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, connected_user_id)
);

-- 12. ACTIVITY FEED
CREATE TABLE IF NOT EXISTS public.activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title_id TEXT REFERENCES public.titles(id) ON DELETE SET NULL,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE SET NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- BASIC RLS POLICIES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_list_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can see, only owner can edit
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Recommendations: Viewable if you are the recommender, a target user, or in the target group
CREATE POLICY "Users can see relevant recommendations" ON public.recommendations 
FOR SELECT USING (
    auth.uid() = recommended_by OR 
    EXISTS (SELECT 1 FROM public.recommendation_targets WHERE recommendation_id = recommendations.id AND user_id = auth.uid()) OR
    (group_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.group_members WHERE group_id = recommendations.group_id AND user_id = auth.uid()))
);

-- Titles: Publicly readable
CREATE POLICY "Titles are readable by all authenticated users" ON public.titles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Titles can be inserted by authenticated users" ON public.titles FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Watchlist: Owner only
CREATE POLICY "Users can manage own watchlist" ON public.watchlist_items FOR ALL USING (auth.uid() = user_id);

-- Lists: Public if shared/group, else owner
CREATE POLICY "Users can see shared lists" ON public.watchlist_lists FOR SELECT USING (privacy != 'private' OR auth.uid() = user_id);
CREATE POLICY "Users can manage own lists" ON public.watchlist_lists FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to handle new user creation from Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

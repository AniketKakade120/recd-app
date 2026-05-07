-- Rec'd Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- USERS
-- ==========================================
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  taste_archetype text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Users can read all users, but only update themselves
alter table public.users enable row level security;
create policy "Public profiles are viewable by everyone." on public.users for select using (true);
create policy "Users can insert their own profile." on public.users for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.users for update using (auth.uid() = id);

-- ==========================================
-- TITLES
-- ==========================================
create table public.titles (
  id text primary key, -- e.g., 'tmdb-12345'
  title text not null,
  type text not null,
  poster_url text,
  backdrop_url text,
  poster_gradient integer not null default 1,
  release_year integer,
  genres text[] default '{}',
  runtime text,
  overview text,
  external_rating numeric,
  platforms text[] default '{}',
  format text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.titles enable row level security;
create policy "Titles are viewable by everyone." on public.titles for select using (true);
-- In a real app, only admins or an edge function would insert titles. For now, allow authenticated users to insert if missing.
create policy "Authenticated users can insert titles" on public.titles for insert to authenticated with check (true);

-- ==========================================
-- GROUPS
-- ==========================================
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  vibe text not null,
  description text,
  cover_image text,
  privacy text default 'private' check (privacy in ('public', 'private')),
  invite_code text unique not null,
  created_by uuid references public.users(id) not null,
  avatar_gradient integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'mod', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, user_id)
);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

-- Groups RLS
create policy "Users can view groups they belong to or public groups" on public.groups for select
  using (privacy = 'public' or exists (select 1 from public.group_members where group_id = id and user_id = auth.uid()));
create policy "Users can insert groups" on public.groups for insert to authenticated with check (created_by = auth.uid());

-- Group Members RLS
create policy "Users can view members of groups they belong to" on public.group_members for select
  using (exists (select 1 from public.groups where id = group_id and privacy = 'public') or exists (select 1 from public.group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid()));
create policy "Users can insert themselves into groups" on public.group_members for insert to authenticated with check (user_id = auth.uid());

-- ==========================================
-- RECOMMENDATIONS
-- ==========================================
create table public.recommendations (
  id uuid default uuid_generate_v4() primary key,
  title_id text references public.titles(id) not null,
  group_id uuid references public.groups(id) on delete cascade,
  recommended_by uuid references public.users(id) not null,
  recommended_to_group boolean default false,
  reason text,
  confidence_score integer,
  mood_tags text[] default '{}',
  primary_stamp text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.recommendation_targets (
  id uuid default uuid_generate_v4() primary key,
  recommendation_id uuid references public.recommendations(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  unique(recommendation_id, user_id)
);

alter table public.recommendations enable row level security;
alter table public.recommendation_targets enable row level security;

-- Recommendations RLS (View if it's in your group, sent by you, or sent directly to you)
create policy "View relevant recommendations" on public.recommendations for select using (
  recommended_by = auth.uid() or 
  (group_id is null and exists (select 1 from public.recommendation_targets rt where rt.recommendation_id = id and rt.user_id = auth.uid())) or
  (group_id is not null and exists (select 1 from public.group_members gm where gm.group_id = recommendations.group_id and gm.user_id = auth.uid()))
);
create policy "Insert recommendations" on public.recommendations for insert to authenticated with check (recommended_by = auth.uid());

-- Targets RLS
create policy "View recommendation targets" on public.recommendation_targets for select using (
  user_id = auth.uid() or exists (select 1 from public.recommendations r where r.id = recommendation_id and r.recommended_by = auth.uid())
);
create policy "Insert targets" on public.recommendation_targets for insert to authenticated with check (
  exists (select 1 from public.recommendations r where r.id = recommendation_id and r.recommended_by = auth.uid())
);

-- ==========================================
-- RATINGS / VERDICTS
-- ==========================================
create table public.ratings (
  id uuid default uuid_generate_v4() primary key,
  recommendation_id uuid references public.recommendations(id) on delete cascade not null,
  rated_by uuid references public.users(id) not null,
  content_rating integer not null check (content_rating >= 1 and content_rating <= 5),
  recommendation_result text not null,
  stamp text,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(recommendation_id, rated_by)
);

alter table public.ratings enable row level security;
create policy "View ratings for visible recommendations" on public.ratings for select using (
  exists (select 1 from public.recommendations r where r.id = recommendation_id)
);
create policy "Insert own ratings" on public.ratings for insert to authenticated with check (rated_by = auth.uid());

-- ==========================================
-- ACTIVITY
-- ==========================================
create table public.activity (
  id uuid default uuid_generate_v4() primary key,
  type text not null,
  user_id uuid references public.users(id) not null,
  target_user_id uuid references public.users(id),
  title_id text references public.titles(id),
  group_id uuid references public.groups(id),
  recommendation_id uuid references public.recommendations(id),
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.activity enable row level security;
create policy "View relevant activity" on public.activity for select using (
  user_id = auth.uid() or target_user_id = auth.uid() or
  (group_id is not null and exists (select 1 from public.group_members gm where gm.group_id = activity.group_id and gm.user_id = auth.uid()))
);
create policy "Insert activity" on public.activity for insert to authenticated with check (user_id = auth.uid());

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================
-- Trigger to automatically create an activity entry when a recommendation is made
create or replace function log_recommendation_activity() returns trigger as $$
begin
  insert into public.activity (type, user_id, title_id, group_id, recommendation_id, message)
  values (
    'recommendation_sent',
    new.recommended_by,
    new.title_id,
    new.group_id,
    new.id,
    'A new recommendation was shared'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_recommendation_created
  after insert on public.recommendations
  for each row execute function log_recommendation_activity();

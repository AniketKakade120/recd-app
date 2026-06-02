-- Rec'd Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clean up existing (Optional: Uncomment if you want to wipe and restart)
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop function if exists public.handle_new_user();
-- drop trigger if exists on_recommendation_created on public.recommendations;
-- drop function if exists log_recommendation_activity();
-- drop table if exists public.activity;
-- drop table if exists public.watchlist_items;
-- drop table if exists public.ratings;
-- drop table if exists public.recommendation_targets;
-- drop table if exists public.recommendations;
-- drop table if exists public.group_members;
-- drop table if exists public.groups;
-- drop table if exists public.titles;
-- drop table if exists public.user_connections;
-- drop table if exists public.user_preferences;
-- drop table if exists public.profiles;
-- drop table if exists public.users;

-- ==========================================
-- PROFILES (Was users)
-- ==========================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  taste_archetype text,
  taste_archetypes text[] default '{}',
  generated_taste_headline text,
  taste_score integer default 0,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Profiles are viewable by everyone, but only updateable by the owner
alter table public.profiles enable row level security;
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- ==========================================
-- USER PREFERENCES
-- ==========================================
create table if not exists public.user_preferences (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  genres text[] default '{}',
  genre_preferences jsonb default '{}',
  moods text[] default '{}',
  formats text[] default '{}',
  languages text[] default '{}',
  platforms text[] default '{}',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_preferences enable row level security;
drop policy if exists "Users can view their own preferences." on public.user_preferences;
create policy "Users can view their own preferences." on public.user_preferences for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own preferences." on public.user_preferences;
create policy "Users can insert their own preferences." on public.user_preferences for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own preferences." on public.user_preferences;
create policy "Users can update their own preferences." on public.user_preferences for update using (auth.uid() = user_id);

-- ==========================================
-- USER CONNECTIONS (Crew)
-- ==========================================
create table if not exists public.user_connections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  connected_user_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'connected',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, connected_user_id)
);

alter table public.user_connections enable row level security;
drop policy if exists "Users can view their own connections." on public.user_connections;
create policy "Users can view their own connections." on public.user_connections for select using (auth.uid() = user_id or auth.uid() = connected_user_id);

drop policy if exists "Users can manage their own connections." on public.user_connections;
create policy "Users can manage their own connections." on public.user_connections for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own connections." on public.user_connections;
create policy "Users can delete their own connections." on public.user_connections for delete using (auth.uid() = user_id);

-- ==========================================
-- TITLES (Cache for TMDB data)
-- ==========================================
create table if not exists public.titles (
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
  language text,
  cast_data jsonb default '[]',
  director_data jsonb default '{}',
  watch_providers jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.titles enable row level security;
drop policy if exists "Titles are viewable by everyone." on public.titles;
create policy "Titles are viewable by everyone." on public.titles for select using (true);

drop policy if exists "Authenticated users can insert titles" on public.titles;
create policy "Authenticated users can insert titles" on public.titles for insert to authenticated with check (true);

-- ==========================================
-- GROUPS
-- ==========================================
create table if not exists public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  vibe text not null,
  description text,
  cover_image text,
  privacy text default 'private' check (privacy in ('public', 'private')),
  invite_code text unique not null,
  created_by uuid references public.profiles(id) not null,
  avatar_gradient integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'mod', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, user_id)
);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

-- Groups RLS
drop policy if exists "Users can view groups they belong to or public groups" on public.groups;
create policy "Users can view groups they belong to or public groups" on public.groups for select
  using (privacy = 'public' or exists (select 1 from public.group_members where group_id = id and user_id = auth.uid()));

drop policy if exists "Users can insert groups" on public.groups;
create policy "Users can insert groups" on public.groups for insert to authenticated with check (created_by = auth.uid());

-- Group Members RLS
drop policy if exists "Users can view members of groups they belong to" on public.group_members;
create policy "Users can view members of groups they belong to" on public.group_members for select
  using (exists (select 1 from public.groups where id = group_id and privacy = 'public') or exists (select 1 from public.group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid()));

drop policy if exists "Users can insert themselves into groups" on public.group_members;
create policy "Users can insert themselves into groups" on public.group_members for insert to authenticated with check (user_id = auth.uid());

-- ==========================================
-- RECOMMENDATIONS
-- ==========================================
create table if not exists public.recommendations (
  id uuid default uuid_generate_v4() primary key,
  title_id text references public.titles(id) not null,
  group_id uuid references public.groups(id) on delete cascade,
  recommended_by uuid references public.profiles(id) not null,
  recommended_to_group boolean default false,
  reason text,
  confidence_score integer,
  mood_tags text[] default '{}',
  primary_stamp text,
  status text default 'verdict_pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.recommendation_targets (
  id uuid default uuid_generate_v4() primary key,
  recommendation_id uuid references public.recommendations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  unique(recommendation_id, user_id)
);

alter table public.recommendations enable row level security;
alter table public.recommendation_targets enable row level security;

-- Recommendations RLS
drop policy if exists "View relevant recommendations" on public.recommendations;
create policy "View relevant recommendations" on public.recommendations for select using (
  recommended_by = auth.uid() or 
  (group_id is null and exists (select 1 from public.recommendation_targets rt where rt.recommendation_id = id and rt.user_id = auth.uid())) or
  (group_id is not null and exists (select 1 from public.group_members gm where gm.group_id = recommendations.group_id and gm.user_id = auth.uid()))
);

drop policy if exists "Insert recommendations" on public.recommendations;
create policy "Insert recommendations" on public.recommendations for insert to authenticated with check (recommended_by = auth.uid());

drop policy if exists "Update recommendations" on public.recommendations;
create policy "Update recommendations" on public.recommendations for update using (
  recommended_by = auth.uid() or 
  (group_id is null and exists (select 1 from public.recommendation_targets rt where rt.recommendation_id = id and rt.user_id = auth.uid())) or
  (group_id is not null and exists (select 1 from public.group_members gm where gm.group_id = recommendations.group_id and gm.user_id = auth.uid()))
);

-- Targets RLS
drop policy if exists "View recommendation targets" on public.recommendation_targets;
create policy "View recommendation targets" on public.recommendation_targets for select using (
  user_id = auth.uid() or exists (select 1 from public.recommendations r where r.id = recommendation_id and r.recommended_by = auth.uid())
);

drop policy if exists "Insert targets" on public.recommendation_targets;
create policy "Insert targets" on public.recommendation_targets for insert to authenticated with check (
  exists (select 1 from public.recommendations r where r.id = recommendation_id and r.recommended_by = auth.uid())
);

-- ==========================================
-- RATINGS / VERDICTS
-- ==========================================
create table if not exists public.ratings (
  id uuid default uuid_generate_v4() primary key,
  recommendation_id uuid references public.recommendations(id) on delete cascade not null,
  rated_by uuid references public.profiles(id) not null,
  content_rating integer not null check (content_rating >= 1 and content_rating <= 5),
  recommendation_result text not null,
  stamp text,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(recommendation_id, rated_by)
);

alter table public.ratings enable row level security;
drop policy if exists "View ratings for visible recommendations" on public.ratings;
create policy "View ratings for visible recommendations" on public.ratings for select using (
  exists (select 1 from public.recommendations r where r.id = recommendation_id)
);

drop policy if exists "Insert own ratings" on public.ratings;
create policy "Insert own ratings" on public.ratings for insert to authenticated with check (rated_by = auth.uid());

-- ==========================================
-- WATCHLIST
-- ==========================================
create table if not exists public.watchlist_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title_id text references public.titles(id) on delete cascade not null,
  added_by text default 'self',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, title_id)
);

alter table public.watchlist_items enable row level security;
drop policy if exists "Users can manage their own watchlist." on public.watchlist_items;
create policy "Users can manage their own watchlist." on public.watchlist_items for all using (auth.uid() = user_id);

-- ==========================================
-- WATCHLIST LISTS
-- ==========================================
create table if not exists public.watchlist_lists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  privacy text default 'private' check (privacy in ('private', 'shared', 'group')),
  cover_style text default 'gradient',
  cover_image text,
  share_slug text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.watchlist_list_items (
  id uuid default uuid_generate_v4() primary key,
  list_id uuid references public.watchlist_lists(id) on delete cascade not null,
  title_id text references public.titles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(list_id, title_id)
);

alter table public.watchlist_lists enable row level security;
alter table public.watchlist_list_items enable row level security;

drop policy if exists "Users can manage their own lists." on public.watchlist_lists;
create policy "Users can manage their own lists." on public.watchlist_lists for all using (auth.uid() = user_id);

drop policy if exists "Users can manage their own list items." on public.watchlist_list_items;
create policy "Users can manage their own list items." on public.watchlist_list_items for all 
  using (exists (select 1 from public.watchlist_lists where id = list_id and user_id = auth.uid()));

-- ==========================================
-- ACTIVITY
-- ==========================================
create table if not exists public.activity (
  id uuid default uuid_generate_v4() primary key,
  type text not null,
  user_id uuid references public.profiles(id) not null,
  target_user_id uuid references public.profiles(id),
  title_id text references public.titles(id),
  group_id uuid references public.groups(id),
  recommendation_id uuid references public.recommendations(id),
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.activity enable row level security;
drop policy if exists "View relevant activity" on public.activity;
create policy "View relevant activity" on public.activity for select using (
  user_id = auth.uid() or target_user_id = auth.uid() or
  (group_id is not null and exists (select 1 from public.group_members gm where gm.group_id = activity.group_id and gm.user_id = auth.uid()))
);

drop policy if exists "Insert activity" on public.activity;
create policy "Insert activity" on public.activity for insert to authenticated with check (user_id = auth.uid());

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- 1. Log recommendation activity
create or replace function log_recommendation_activity() returns trigger as $$
declare
  rec_title text;
begin
  select title into rec_title from public.titles where id = new.title_id;
  
  insert into public.activity (type, user_id, title_id, group_id, recommendation_id, message)
  values (
    'recommendation_sent',
    new.recommended_by,
    new.title_id,
    new.group_id,
    new.id,
    case 
      when new.recommended_to_group = true then 'Recommended ' || coalesce(rec_title, 'a title') || ' to a group'
      else 'Sent a recommendation'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Log rating/verdict activity
create or replace function log_rating_activity() returns trigger as $$
declare
  rec_title_id text;
  rec_title_name text;
  rec_user_id uuid;
begin
  select title_id into rec_title_id from public.recommendations where id = new.recommendation_id;
  select title into rec_title_name from public.titles where id = rec_title_id;
  select recommended_by into rec_user_id from public.recommendations where id = new.recommendation_id;

  insert into public.activity (type, user_id, target_user_id, title_id, recommendation_id, message)
  values (
    'verdict_given',
    new.rated_by,
    rec_user_id,
    rec_title_id,
    new.recommendation_id,
    'Gave a ' || lower(new.stamp) || ' to ' || coalesce(rec_title_name, 'a title')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 3. Log connection activity
create or replace function log_connection_activity() returns trigger as $$
declare
  target_name text;
begin
  select display_name into target_name from public.profiles where id = new.connected_user_id;

  insert into public.activity (type, user_id, target_user_id, message)
  values (
    'new_crew_member',
    new.user_id,
    new.connected_user_id,
    'Added ' || coalesce(target_name, 'someone') || ' to their crew'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_recommendation_created on public.recommendations;
create trigger on_recommendation_created
  after insert on public.recommendations
  for each row execute function log_recommendation_activity();

drop trigger if exists on_rating_created on public.ratings;
create trigger on_rating_created
  after insert on public.ratings
  for each row execute function log_rating_activity();

drop trigger if exists on_connection_created on public.user_connections;
create trigger on_connection_created
  after insert on public.user_connections
  for each row execute function log_connection_activity();

-- 2. Handle new user signup (Auto-create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  insert into public.user_preferences (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================
-- COMMENTS
-- ==========================================
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  group_id uuid references public.groups(id),
  title_id text references public.titles(id),
  recommendation_id uuid references public.recommendations(id),
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.comments enable row level security;
drop policy if exists "Comments are viewable by everyone in the group." on public.comments;
create policy "Comments are viewable by everyone in the group." on public.comments for select using (
  group_id is null or 
  exists (select 1 from public.group_members gm where gm.group_id = comments.group_id and gm.user_id = auth.uid())
);

drop policy if exists "Users can post comments." on public.comments;
create policy "Users can post comments." on public.comments for insert to authenticated with check (auth.uid() = user_id);

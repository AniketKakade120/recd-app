'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type {
  User, Recommendation, Rating, VerdictState, TasteScore, Title,
  Badge, Comment, Group, GroupMember, ActivityItem, WatchlistItem, WatchlistList, UserPreferences, RecAccuracy,
  StampType, CrewConnection, CrewRequest, Notification, TitleComment
} from '@/lib/types';
import {
  mockUsers, mockRecommendations, mockRatings, mockBadges, mockGroups,
  mockGroupMembers, mockActivity, mockTasteScore, mockTitles, mockLeaderboard,
  mockWatchlist, mockWatchlistLists, mockRecommendationImpacts, currentUser as defaultUser,
  mockUserConnections,
} from '@/lib/mock-data';
import { 
  calculateRecommendationImpact, 
  calculateTasteScore 
} from '@/lib/logic/taste-system';
import {
  getRecommendationViewerContext,
  getRecommendationActions,
  ActionSet
} from '@/lib/logic/action-system';
import { ViewerContext } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

// TODO: Replace mock data with Supabase queries


const demoUser: User = {
  id: 'demo-user-id-001',
  username: 'cinephile_demo',
  displayName: 'Cinema Club Demo',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  bio: 'Cinephile exploring the edges of cinema.',
  tasteArchetype: 'Thriller Dealer',
  createdAt: new Date().toISOString(),
};

export type AuthStatus = 'initializing' | 'unauthenticated' | 'authenticated_loading_profile' | 'authenticated_ready' | 'error';

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  authStatus: AuthStatus;
  authError?: string;
  recommendations: Recommendation[];
  ratings: Rating[];
  badges: Badge[];
  groups: Group[];
  groupMembers: GroupMember[];
  activity: ActivityItem[];
  tasteScore: TasteScore;
  watchlist: WatchlistItem[];
  watchlistLists: WatchlistList[];
  userPreferences: UserPreferences;
  inviteLink: string;
  loading: boolean;
  titles: Title[];
  users: User[];
  crewConnections: CrewConnection[];
  crewRequests: CrewRequest[];
  notifications: Notification[];
  comments: Comment[];
  toasts: { id: string; message: string; type?: 'success' | 'error' | 'info'; onUndo?: () => void }[];
  recommendModalOpen: boolean;
  recommendModalData: { titleId?: string; groupId?: string; recipientId?: string } | null;
  giveVerdictModalOpen: boolean;
  giveVerdictModalData: { recommendationId: string; edit?: boolean } | null;
  titleComments: TitleComment[];
}

interface AppContextType extends AppState {
  login: () => Promise<void>;
  enterDemoMode: () => void;
  logout: () => Promise<void>;
  completeOnboarding: (data?: any) => Promise<void>;
  openRecommendModal: (data?: { titleId?: string; groupId?: string; recipientId?: string }) => void;
  closeRecommendModal: () => void;
  openGiveVerdictModal: (recommendationId: string, edit?: boolean) => void;
  closeGiveVerdictModal: () => void;
  addRecommendation: (rec: Recommendation) => void;
  updateVerdictState: (recId: string, state: VerdictState) => void;
  addRating: (rating: Rating) => void;
  createGroup: (group: Group, memberIds?: string[]) => void;
  updateGroup: (groupId: string, data: Partial<Group>, memberIds?: string[]) => void;
  deleteGroup: (groupId: string) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  sendCrewRequest: (receiverId: string, message?: string) => Promise<{ success: boolean; error?: string; alreadyConnected?: boolean; data?: any }>;
  acceptCrewRequest: (requestId: string) => Promise<void>;
  rejectCrewRequest: (requestId: string) => Promise<void>;
  cancelCrewRequest: (requestId: string) => Promise<void>;
  removeCrewMember: (memberId: string) => Promise<void>;
  createInvite: () => Promise<string | null>;
  acceptInvite: (inviteCode: string) => Promise<{
    success: boolean;
    requiresAuth?: boolean;
    alreadyConnected?: boolean;
    errorCode?: string;
  }>;
  isUserInCrew: (targetUserId: string) => boolean;
  getConnectionState: (targetUserId: string) => 'none' | 'self' | 'connected' | 'pending_sent' | 'pending_received' | 'rejected';
  updateUser: (data: Partial<User>) => void;
  getTitle: (id: string) => Title | undefined;
  addTitle: (title: Title) => void;
  getUser: (id: string) => User | undefined;
  getUserByUsername: (username: string) => User | undefined;
  getGroup: (id: string) => Group | undefined;
  getGroupMembers: (groupId: string) => User[];
  getGroupRecommendations: (groupId: string) => Recommendation[];
  getPendingForUser: () => Recommendation[];
  getUserBadges: (userId: string) => Badge[];
  getViewerContext: (rec: Recommendation) => ViewerContext;
  getActions: (rec: Recommendation) => ActionSet;
  getMutualGroups: (targetUserId: string) => Group[];
  isTitleInList: (titleId: string, listId: string) => boolean;
  setListPrivacy: (listId: string, privacy: 'private' | 'shared' | 'group') => void;
  getListStats: (listId: string) => any;
  addToast: (message: string, options?: { type?: 'success' | 'error' | 'info', onUndo?: () => void }) => void;
  removeToast: (id: string) => void;
  leaderboard: typeof mockLeaderboard;
  refreshData: () => Promise<void>;
  addTitleToWatchlist: (titleId: string) => Promise<void>;
  addToWatchlist: (item: WatchlistItem) => void;
  createWatchlistList: (data: Partial<WatchlistList>) => Promise<{ id: string | null; error?: string }>;
  updateWatchlistList: (listId: string, data: Partial<WatchlistList>) => Promise<void>;
  deleteWatchlistList: (listId: string) => Promise<void>;
  addTitleToList: (titleId: string, listId: string) => Promise<void>;
  removeTitleFromList: (listId: string, titleId: string) => Promise<void>;
  markAsWatchedInList: (listId: string, titleId: string) => Promise<void>;
  unmarkAsWatchedInList: (listId: string, titleId: string) => Promise<void>;
  moveToList: (itemId: string, listId: string) => void;
  removeFromWatchlist: (id: string) => Promise<void>;
  updatePreferences: (data: Partial<UserPreferences>) => Promise<void>;
  retryAuthSync: () => Promise<void>;
  addTitleComment: (titleId: string, content: string) => Promise<void>;
  addGroupComment: (groupId: string, titleId: string, comment: string) => Promise<void>;
  joinGroupByCode: (code: string) => Promise<{ success: boolean; groupName?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    isAuthenticated: false,
    isOnboarded: false, // We will evaluate this per user in onAuthStateChange
    authStatus: 'initializing',
    recommendations: mockRecommendations,
    ratings: mockRatings,
    badges: mockBadges,
    groups: mockGroups,
    groupMembers: mockGroupMembers,
    activity: mockActivity,
    tasteScore: mockTasteScore,
    watchlist: mockWatchlist,
    watchlistLists: [],
    userPreferences: { genres: [], moods: [], formats: [], languages: [], platforms: [] },
    inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/invite/ABC123`,
    loading: true,
    titles: mockTitles,
    users: [],
    crewConnections: [],
    crewRequests: [],
    notifications: [],
    comments: [],
    toasts: [],
    recommendModalOpen: false,
    recommendModalData: null,
    giveVerdictModalOpen: false,
    giveVerdictModalData: null,
    titleComments: [],
  });

  // Fix stale closure for refreshData
  const currentUserRef = React.useRef<User | null>(null);
  React.useEffect(() => {
    currentUserRef.current = state.currentUser;
  }, [state.currentUser]);

  // Helper to enforce timeouts on promises
  const withTimeout = <T,>(promise: PromiseLike<T>, ms: number, name: string): Promise<T> => {
    return Promise.race([
      Promise.resolve(promise),
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout at ${name} after ${ms}ms`)), ms))
    ]);
  };

  // Dedicated helper to fetch or create a user profile safely
  const fetchOrCreateProfile = async (user: any) => {
    if (!user?.id) throw new Error("Missing auth user id");
    console.info("[Auth Debug] fetching profile", { userId: user.id });

    const profileResult = await supabase
      .from('profiles')
      .select('*, taste_archetypes')
      .eq('id', user.id)
      .maybeSingle();
    
    const prefsResult = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    let profile = profileResult.data;
    let prefs = prefsResult.data;
    const profileError = profileResult.error;

    if (profileError) {
      console.error("[Auth Debug] Supabase profile error on select", {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      });
      throw new Error('Failed to fetch profile: ' + profileError.message);
    }
    
    console.info("[Auth Debug] profile fetch result", { hasProfile: !!profile, error: profileError });

    const googleName = user.user_metadata?.full_name || user.user_metadata?.name;
    const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const emailPrefix = user.email?.split('@')[0] || 'user';

    // Step 2: If no profile, attempt to create
    if (!profile) {
      console.info("[Auth Debug] creating profile", { userId: user.id });
      
      const newProfile = {
        id: user.id,
        username: emailPrefix,
        display_name: googleName || emailPrefix || 'New User',
        avatar_url: googleAvatar || '',
        bio: '',
        taste_archetype: 'Thriller Dealer',
        taste_score: 50,
        onboarding_completed: false
      };

      const insertResult = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .maybeSingle();
      
      let insertError = insertResult.error;
      profile = insertResult.data;

      // Handle username unique constraint violation (23505 on username)
      if (insertError?.code === '23505' && insertError?.message?.includes('username')) {
        console.warn("[Auth Debug] Username conflict, retrying with random suffix");
        const uniqueSuffix = Math.floor(Math.random() * 10000).toString();
        const retryProfile = { ...newProfile, username: `${emailPrefix}${uniqueSuffix}` };
        const retryInsert = await supabase
          .from('profiles')
          .insert([retryProfile])
          .select()
          .maybeSingle();
        insertError = retryInsert.error;
        profile = retryInsert.data;
      }

      // Handle duplicate profile id (already exists, maybe due to race condition or RLS blocking select)
      if (insertError?.code === '23505' && insertError?.message?.includes('profiles_pkey')) {
        console.warn("[Auth Debug] Profile already exists (duplicate key). Refetching by ID.");
        const refetch = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (refetch.data) {
           profile = refetch.data;
           insertError = null;
        } else {
           throw new Error('Profile exists but cannot be read. Please check RLS policies for public.profiles.');
        }
      }

      console.info("[Auth Debug] profile create result", { hasProfile: !!profile, error: insertError });

      if (insertError) {
        console.error("[Auth Debug] Supabase profile error on insert", {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        throw new Error('Failed to create profile: ' + insertError.message);
      }
      
      // If we STILL don't have a profile after successful insert/refetch (should never happen)
      if (!profile) {
        throw new Error('Profile was neither fetched nor created correctly.');
      }
    }

    // Step 3: Handle preferences if missing
    if (!prefs && !prefsResult.error) {
      const { data: insertedPrefs } = await supabase
        .from('user_preferences')
        .insert([{ user_id: user.id, genres: [], moods: [] }])
        .select()
        .maybeSingle();
      if (insertedPrefs) prefs = insertedPrefs;
    }

    // Step 4: Auto-sync Google Metadata if needed
    let needsUpdate = false;
    const updates: any = {};
    if ((!profile.display_name || profile.display_name === 'User' || profile.display_name === 'New User') && googleName) {
      updates.display_name = googleName;
      profile.display_name = googleName;
      needsUpdate = true;
    }
    if (!profile.avatar_url && googleAvatar) {
      updates.avatar_url = googleAvatar;
      profile.avatar_url = googleAvatar;
      needsUpdate = true;
    }
    
    // We only update if necessary, fire-and-forget to not block hydration
    if (needsUpdate) {
      supabase.from('profiles').update(updates).eq('id', profile.id).then();
    }

    const finalDisplayName = profile.display_name && profile.display_name !== 'User' ? profile.display_name : (googleName || emailPrefix || 'User');
    const finalAvatarUrl = profile.avatar_url || googleAvatar || '';

    return {
      id: profile.id,
      username: profile.username || emailPrefix || 'user',
      displayName: finalDisplayName,
      avatarUrl: finalAvatarUrl,
      bio: profile.bio || '',
      tasteArchetype: profile.taste_archetype as any || 'Thriller Dealer',
      tasteArchetypes: profile.taste_archetypes || [],
      generatedTasteHeadline: profile.generated_taste_headline || undefined,
      createdAt: profile.created_at,
      onboarding_completed: profile.onboarding_completed,
      prefs: prefs ? {
        genres: prefs.genres || [],
        genrePreferences: prefs.genre_preferences || {},
        moods: prefs.moods || [],
        formats: prefs.formats || [],
        languages: prefs.languages || [],
        platforms: prefs.platforms || [],
      } : undefined
    };
  };

  const mapDbTitleToTitle = (dbTitle: any): Title => ({
    id: dbTitle.id,
    tmdbId: dbTitle.id,
    title: dbTitle.title,
    type: dbTitle.type,
    posterUrl: dbTitle.poster_url,
    backdropUrl: dbTitle.backdrop_url,
    posterGradient: dbTitle.poster_gradient,
    releaseYear: dbTitle.release_year,
    genres: dbTitle.genres || [],
    runtime: dbTitle.runtime,
    overview: dbTitle.overview || '',
    externalRating: dbTitle.external_rating || 0,
    platforms: dbTitle.platforms || [],
    platformAvailability: dbTitle.watch_providers || [],
    format: dbTitle.format,
    language: dbTitle.language,
    cast: dbTitle.cast_data || [],
    directorOrCreatorProfile: dbTitle.director_data || { id: '', name: '', role: 'Director' }
  });

  // Accepts an optional userId so it can be called from onAuthStateChange before
  // state.currentUser is set (kills stale closure bug). Falls back to state.currentUser.
  const refreshData = useCallback(async (overrideUserId?: string) => {
    let userId = overrideUserId || currentUserRef.current?.id;
    
    // RECOVERY MODE: If we have no userId (e.g. currentUser failed to load and user clicked Retry),
    // attempt to fetch the session directly.
    if (!userId && isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
      }
    }

    if (!isSupabaseConfigured || !supabase || !userId) return;

    try {
      console.log(`[Rec'd Data] Starting parallel database hydration for user: ${userId}`);

      // Stage 1 (Parallel): Fetch primary independent social and media records concurrently
      const [
        recsResult,
        ratingsResult,
        membershipsResult,
        watchlistResult,
        connResult,
        requestsResult,
        notifResult,
        activityResult,
        listsResult,
        commentsResult,
        profilesResult
      ] = await Promise.all([
        supabase.from('recommendations').select('*, targets:recommendation_targets(user_id)').order('created_at', { ascending: false }),
        supabase.from('ratings').select('*'),
        supabase.from('group_members').select('group_id').eq('user_id', userId),
        supabase.from('watchlist_items').select('*').eq('user_id', userId),
        supabase.from('crew_connections').select('*, crew_member_profile:profiles!crew_member_id (*)').eq('user_id', userId).eq('status', 'accepted'),
        supabase.from('crew_requests').select('*, sender_profile:profiles!sender_id (*), receiver_profile:profiles!receiver_id (*)').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
        supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('activity').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('watchlist_lists').select('*').eq('user_id', userId),
        supabase.from('comments').select('*').order('created_at', { ascending: true }),
        supabase.from('profiles').select('*, taste_archetypes, prefs:user_preferences(genres, moods)')
      ]);

      // Check primary independent query errors
      if (recsResult.error) console.error('[Rec\'d Hydrate] Recommendations fetch error:', recsResult.error.message);
      if (ratingsResult.error) console.error('[Rec\'d Hydrate] Ratings fetch error:', ratingsResult.error.message);
      if (membershipsResult.error) console.error('[Rec\'d Hydrate] Memberships fetch error:', membershipsResult.error.message);
      if (watchlistResult.error) console.error('[Rec\'d Hydrate] Watchlist fetch error:', watchlistResult.error.message);
      if (connResult.error) console.error('[Rec\'d Hydrate] Connections fetch error:', connResult.error.message);
      if (requestsResult.error) console.error('[Rec\'d Hydrate] Requests fetch error:', requestsResult.error.message);
      if (notifResult.error) console.error('[Rec\'d Hydrate] Notifications fetch error:', notifResult.error.message);
      if (activityResult.error) console.error('[Rec\'d Hydrate] Activity fetch error:', activityResult.error.message);
      if (listsResult.error) console.error('[Rec\'d Hydrate] Custom lists fetch error:', listsResult.error.message);
      if (commentsResult.error) console.error('[Rec\'d Hydrate] Comments fetch error:', commentsResult.error.message);
      if (profilesResult.error) console.error('[Rec\'d Hydrate] Profiles fetch error:', profilesResult.error.message);

      // Recovery: If we recovered the session but currentUser is null in state, try to set it from the profilesResult
      const myProfileRecord = profilesResult.data?.find((p: any) => p.id === userId);
      const isMissingCurrentUser = !state.currentUser;

      // Map independent records
      const dbRecs: Recommendation[] = recsResult.data ? recsResult.data.map(r => ({
        id: r.id,
        titleId: r.title_id,
        groupId: r.group_id,
        recommendedBy: r.recommended_by,
        recommendedToUserIds: r.targets?.map((t: any) => t.user_id) || [],
        recommendedToGroup: r.recommended_to_group,
        reason: r.reason,
        confidenceScore: r.confidence_score,
        moodTags: r.mood_tags,
        primaryStamp: r.primary_stamp,
        verdictState: r.status,
        createdAt: r.created_at
      })) : [];

      const dbRatings: Rating[] = ratingsResult.data ? ratingsResult.data.map(r => ({
        id: r.id,
        recommendationId: r.recommendation_id,
        ratedBy: r.rated_by,
        contentRating: r.content_rating,
        recommendationResult: r.recommendation_result,
        stamp: r.stamp,
        comment: r.comment,
        createdAt: r.created_at
      })) : [];

      const myGroupIds = membershipsResult.data?.map(m => m.group_id) || [];
      const myListIds = listsResult.data?.map(l => l.id) || [];

      const dbWatchlist: WatchlistItem[] = watchlistResult.data ? watchlistResult.data.map(w => ({
        id: w.id,
        userId: w.user_id,
        titleId: w.title_id,
        addedBy: w.added_by,
        listIds: [], 
        verdictState: 'none',
        createdAt: w.created_at,
        updatedAt: w.updated_at
      })) : [];

      // Gather involved title IDs for Stage 2 fetching
      const relevantTitleIds = [...new Set([
        ...dbRecs.map(r => r.titleId),
        ...dbWatchlist.map(w => w.titleId)
      ])];

      // Stage 2 (Parallel - Dependent): Fetch related groups, list items, group members and title metadata concurrently
      const [
        groupsResult,
        membersResult,
        listItemsResult,
        titlesResult
      ] = await Promise.all([
        myGroupIds.length > 0 ? supabase.from('groups').select('*').in('id', myGroupIds) : Promise.resolve({ data: [], error: null }),
        myGroupIds.length > 0 ? supabase.from('group_members').select('*').in('group_id', myGroupIds) : Promise.resolve({ data: [], error: null }),
        myListIds.length > 0 ? supabase.from('watchlist_list_items').select('*').in('list_id', myListIds) : Promise.resolve({ data: [], error: null }),
        relevantTitleIds.length > 0 ? supabase.from('titles').select('*').in('id', relevantTitleIds) : Promise.resolve({ data: [], error: null })
      ]);

      if (groupsResult.error) console.error('[Rec\'d Hydrate Stage 2] Groups fetch error:', groupsResult.error.message);
      if (membersResult.error) console.error('[Rec\'d Hydrate Stage 2] Members fetch error:', membersResult.error.message);
      if (listItemsResult.error) console.error('[Rec\'d Hydrate Stage 2] List items fetch error:', listItemsResult.error.message);
      if (titlesResult.error) console.error('[Rec\'d Hydrate Stage 2] Titles fetch error:', titlesResult.error.message);

      // Map Stage 2 data
      const dbGroups: Group[] = groupsResult.data ? groupsResult.data.map(g => ({
        id: g.id,
        name: g.name,
        vibe: g.vibe,
        description: g.description,
        privacy: g.privacy,
        inviteCode: g.invite_code,
        createdBy: g.created_by,
        createdAt: g.created_at,
        avatarGradient: g.avatar_gradient
      })) : [];

      const dbMembers: GroupMember[] = membersResult.data ? membersResult.data.map(m => ({
        id: m.id,
        groupId: m.group_id,
        userId: m.user_id,
        role: m.role,
        joinedAt: m.joined_at
      })) : [];

      const dbLists: WatchlistList[] = listsResult.data ? listsResult.data.map(l => ({
        id: l.id,
        userId: l.user_id,
        name: l.name,
        description: l.description,
        privacy: l.privacy,
        coverStyle: l.cover_style,
        coverImage: l.cover_image,
        titleIds: listItemsResult.data ? listItemsResult.data.filter((item: any) => item.list_id === l.id).map((item: any) => item.title_id) : [],
        watchedTitleIds: listItemsResult.data ? listItemsResult.data.filter((item: any) => item.list_id === l.id && item.watched).map((item: any) => item.title_id) : [],
        createdAt: l.created_at,
        updatedAt: l.updated_at
      })) : [];

      const initialDbTitles = titlesResult.data ? titlesResult.data.map(mapDbTitleToTitle) : [];
      
      // We must also fetch titles for items in custom lists that weren't in the default watchlist/recs
      const listTitleIds = listItemsResult.data ? listItemsResult.data.map((item: any) => item.title_id) : [];
      const fetchedTitleIds = new Set(initialDbTitles.map(t => t.id));
      const missingTitleIds = [...new Set(listTitleIds)].filter(id => !fetchedTitleIds.has(id as string));
      
      let extraTitles: Title[] = [];
      if (missingTitleIds.length > 0) {
        const extraRes = await supabase.from('titles').select('*').in('id', missingTitleIds);
        if (extraRes.data) {
          extraTitles = extraRes.data.map(mapDbTitleToTitle);
        }
      }
      
      const dbTitles = [...initialDbTitles, ...extraTitles];

      const dbConns: CrewConnection[] = connResult.data ? connResult.data.map(c => ({
        id: c.id,
        userId: c.user_id,
        crewMemberId: c.crew_member_id,
        status: c.status as 'accepted',
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        crew_member_profile: c.crew_member_profile ? {
          id: c.crew_member_profile.id,
          username: c.crew_member_profile.username,
          displayName: c.crew_member_profile.display_name,
          avatarUrl: c.crew_member_profile.avatar_url,
          bio: c.crew_member_profile.bio,
          tasteArchetype: c.crew_member_profile.taste_archetype,
          createdAt: c.crew_member_profile.created_at
        } : null
      })) : [];

      const dbRequests: CrewRequest[] = requestsResult.data ? requestsResult.data.map(r => ({
        id: r.id,
        senderId: r.sender_id,
        receiverId: r.receiver_id,
        status: r.status as any,
        message: r.message,
        source: r.source,
        inviteCode: r.invite_code,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        sender_profile: r.sender_profile ? {
          id: r.sender_profile.id,
          username: r.sender_profile.username,
          displayName: r.sender_profile.display_name,
          avatarUrl: r.sender_profile.avatar_url,
          bio: r.sender_profile.bio,
          tasteArchetype: r.sender_profile.taste_archetype,
          createdAt: r.sender_profile.created_at
        } : null,
        receiver_profile: r.receiver_profile ? {
          id: r.receiver_profile.id,
          username: r.receiver_profile.username,
          displayName: r.receiver_profile.display_name,
          avatarUrl: r.receiver_profile.avatar_url,
          bio: r.receiver_profile.bio,
          tasteArchetype: r.receiver_profile.taste_archetype,
          createdAt: r.receiver_profile.created_at
        } : null
      })) : [];

      const dbNotifs: Notification[] = notifResult.data ? notifResult.data.map(n => ({
        id: n.id,
        userId: n.user_id,
        actorId: n.actor_id,
        type: n.type as any,
        title: n.title,
        body: n.body,
        resourceId: n.resource_id,
        read: n.read,
        createdAt: n.created_at
      })) : [];

      const dbActivity: ActivityItem[] = activityResult.data ? activityResult.data.map(a => ({
        id: a.id,
        type: a.type as any,
        userId: a.user_id,
        targetUserId: a.target_user_id,
        titleId: a.title_id,
        groupId: a.group_id,
        recommendationId: a.recommendation_id,
        message: a.message,
        createdAt: a.created_at
      })) : [];

      const dbComments: Comment[] = commentsResult.data ? commentsResult.data.map(c => ({
        id: c.id,
        userId: c.user_id,
        groupId: c.group_id,
        titleId: c.title_id,
        recommendationId: c.recommendation_id,
        comment: c.comment,
        createdAt: c.created_at
      })) : [];

      const dbUsers: User[] = profilesResult.data ? profilesResult.data.map((p: any) => ({
        id: p.id,
        username: p.username || 'user',
        displayName: p.display_name || 'User',
        avatarUrl: p.avatar_url || '',
        bio: p.bio || '',
        tasteArchetype: p.taste_archetype as any || 'Thriller Dealer',
        tasteScore: p.taste_score || 0,
        favoriteGenres: p.prefs?.[0]?.genres || [],
        favoriteMoods: p.prefs?.[0]?.moods || [],
        createdAt: p.created_at,
      })) : [];

      // Update state with database mapped entries
      setState(prev => {
        const enrichedWatchlist = dbWatchlist.map(item => ({
          ...item,
          listIds: dbLists.filter(l => l.titleIds.includes(item.titleId)).map(l => l.id)
        }));

        let recoveredCurrentUser = prev.currentUser;
        let recoveredIsOnboarded = prev.isOnboarded;
        
        // Recover or update currentUser with latest DB profile
        if (myProfileRecord) {
          if (!prev.currentUser) {
            const emailPrefix = 'user';
            recoveredCurrentUser = {
              id: myProfileRecord.id,
              username: myProfileRecord.username || emailPrefix,
              displayName: myProfileRecord.display_name || 'User',
              avatarUrl: myProfileRecord.avatar_url || '',
              bio: myProfileRecord.bio || '',
              tasteArchetype: myProfileRecord.taste_archetype as any || 'Thriller Dealer',
              tasteArchetypes: myProfileRecord.taste_archetypes || [],
              generatedTasteHeadline: myProfileRecord.generated_taste_headline || undefined,
              createdAt: myProfileRecord.created_at,
            };
            recoveredIsOnboarded = !!myProfileRecord.onboarding_completed;
          } else {
            // User exists, just ensure their profile details (like taste traits) are fresh
            recoveredCurrentUser = {
              ...prev.currentUser,
              tasteArchetype: myProfileRecord.taste_archetype as any || prev.currentUser.tasteArchetype,
              tasteArchetypes: myProfileRecord.taste_archetypes || prev.currentUser.tasteArchetypes,
              generatedTasteHeadline: myProfileRecord.generated_taste_headline || prev.currentUser.generatedTasteHeadline,
            };
            recoveredIsOnboarded = !!myProfileRecord.onboarding_completed;
          }
        }

        // Dynamically calculate taste score based on actual DB records
        let hydratedTasteScore = prev.tasteScore;
        if (recoveredCurrentUser) {
          const myRatingsReceived = dbRatings.filter(r => {
            const rec = dbRecs.find(re => re.id === r.recommendationId);
            return rec?.recommendedBy === recoveredCurrentUser!.id && r.ratedBy !== recoveredCurrentUser!.id;
          });

          const myTotalSent = dbRecs.filter(r => r.recommendedBy === recoveredCurrentUser!.id).length;

          const impacts = myRatingsReceived.map((rating, idx) => {
            const rec = dbRecs.find(re => re.id === rating.recommendationId);
            const impact = calculateRecommendationImpact({
              contentRating: rating.contentRating,
              recommendationResult: rating.recommendationResult as any,
              confidenceScore: rec?.confidenceScore,
              moodTags: rec?.moodTags
            });
            return {
              id: `imp-${idx}`,
              recommendationId: rating.recommendationId,
              recommenderId: rec!.recommendedBy,
              receiverId: rating.ratedBy,
              contentRating: rating.contentRating,
              contentRatingScore: impact.contentRatingScore,
              recommendationResult: rating.recommendationResult,
              recommendationResultScore: impact.recommendationResultScore,
              impactScore: impact.impactScore,
              createdAt: rating.createdAt || new Date().toISOString()
            };
          });

          hydratedTasteScore = calculateTasteScore({
            userId: recoveredCurrentUser.id,
            ratingsReceived: impacts as any,
            totalSent: myTotalSent,
            scope: 'global'
          });

          recoveredCurrentUser = {
            ...recoveredCurrentUser,
            tasteScore: hydratedTasteScore.score
          };
        }

        // Merge dbTitles with prev.titles to keep freshly searched TMDB titles
        const mergedTitlesMap = new Map();
        [...prev.titles, ...mockTitles, ...dbTitles].forEach(t => {
          // dbTitles will overwrite prev.titles/mockTitles due to iteration order
          mergedTitlesMap.set(t.id, t);
        });
        const finalTitles = Array.from(mergedTitlesMap.values());

        return {
          ...prev,
          currentUser: recoveredCurrentUser,
          tasteScore: hydratedTasteScore,
          isOnboarded: recoveredIsOnboarded,
          titles: finalTitles,
          recommendations: dbRecs,
          ratings: dbRatings,
          groups: dbGroups,
          groupMembers: dbMembers,
          watchlist: enrichedWatchlist,
          watchlistLists: dbLists,
          crewConnections: dbConns,
          crewRequests: dbRequests,
          notifications: dbNotifs,
          activity: dbActivity.length > 0 ? dbActivity : prev.activity,
          users: dbUsers,
        };
      });

      console.log('[Rec\'d Data] Hydrated successfully in parallel.');
    } catch (err) {
      console.error('Error hydrating state in parallel from Supabase:', err);
    }
  }, []);


  React.useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback to mock mode if Supabase isn't setup
      setState(prev => ({
        ...prev,
        currentUser: demoUser,
        isAuthenticated: true,
        loading: false,
        authStatus: 'authenticated_ready'
      }));
      return;
    }

    // Listen to Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Auth event: ${event}`);
      
      // Handle TOKEN_REFRESHED separately to avoid spinning loader if already logged in
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        if (currentUserRef.current) {
          return; // Profile already exists, token refresh doesn't need to block UI
        }
      }

      let activeSession = session;

      if (!activeSession?.user) {
        if (event === 'SIGNED_OUT') {
          setState(prev => ({ ...prev, currentUser: null, isAuthenticated: false, isOnboarded: false, loading: false, authStatus: 'unauthenticated' }));
          return;
        } else if (event === 'INITIAL_SESSION') {
          console.log('[Auth Debug] getSession result (INITIAL_SESSION): null. Attempting recovery...');
          try {
            const { data: { session: recoveredSession } } = await withTimeout(supabase.auth.getSession(), 8000, 'getSession recovery');
            if (recoveredSession?.user) {
              console.log('[Auth Debug] Session recovered via getSession');
              activeSession = recoveredSession;
            }
          } catch (e) {
            console.warn('[Auth Debug] getSession recovery failed:', e);
          }
        }
      }

      if (!activeSession?.user) {
        setState(prev => ({ ...prev, loading: false, authStatus: 'unauthenticated' }));
        return;
      }

      // We have an active session
      if (event !== 'TOKEN_REFRESHED') {
        setState(prev => ({ ...prev, isAuthenticated: true, loading: true, authStatus: 'authenticated_loading_profile' }));
      }

      try {
        console.log('[Auth Debug] Fetching profile');
        const profileData = await withTimeout(fetchOrCreateProfile(activeSession.user), 15000, 'fetchOrCreateProfile');
        console.log('[Auth] Profile ready');
        
        setState(prev => ({
          ...prev,
          currentUser: {
            id: profileData.id,
            username: profileData.username,
            displayName: profileData.displayName,
            avatarUrl: profileData.avatarUrl,
            bio: profileData.bio,
            tasteArchetype: profileData.tasteArchetype,
            createdAt: profileData.createdAt,
          },
          isOnboarded: !!profileData.onboarding_completed,
          userPreferences: profileData.prefs || prev.userPreferences,
          loading: false,
          authStatus: 'authenticated_ready',
          authError: undefined
        }));
        
        refreshData(activeSession.user.id);
      } catch (err: any) {
        console.error('[Auth Debug] Profile error catch block:', err);
        if (err?.message?.includes('JWT') || err?.message?.includes('unauthorized') || err?.status === 401) {
          supabase.auth.signOut().catch(() => {});
          setState(prev => ({ ...prev, loading: false, authStatus: 'unauthenticated' }));
        } else {
          setState(prev => ({ ...prev, loading: false, authStatus: 'error', authError: err?.message || 'Unknown profile fetch error' }));
        }
      }
    });

    // Timeout to catch stuck initialization (e.g. Supabase navigator.locks hang on reload)
    const safetyTimeout = setTimeout(() => {
      setState(prev => {
        if (prev.authStatus === 'initializing') {
          console.error('[Auth Debug] Supabase onAuthStateChange never fired. Lock is likely stuck.');
          return { 
            ...prev, 
            loading: false, 
            authStatus: 'error', 
            authError: 'Browser session locked. Please click "Sign Out & Escape" below to clear your cookies and sign in again.' 
          };
        }
        if (prev.loading && prev.authStatus !== 'error') {
          console.warn('[Auth Debug] Timeout reached during profile fetch.');
          return { ...prev, loading: false, authStatus: 'error', authError: 'Timeout waiting for profile sync' };
        }
        return prev;
      });
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [refreshData]);

  const retryAuthSync = useCallback(async () => {
    console.log('[Auth Debug] retryAuthSync start');
    setState(prev => ({ ...prev, loading: true, authStatus: 'authenticated_loading_profile', authError: undefined }));
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('[Auth Debug] getSession in retry', { hasSession: !!session, userId: session?.user?.id, sessionError });
      
      if (!session?.user) {
        throw new Error('No active session found during retry');
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('[Auth Debug] getUser in retry', { hasUser: !!user, userId: user?.id, userError });

      if (!user) {
        throw new Error('No active user found during retry');
      }

      const profileData = await fetchOrCreateProfile(user);
      
      setState(prev => ({
        ...prev,
        currentUser: {
          id: profileData.id,
          username: profileData.username,
          displayName: profileData.displayName,
          avatarUrl: profileData.avatarUrl,
          bio: profileData.bio,
          tasteArchetype: profileData.tasteArchetype,
          createdAt: profileData.createdAt,
        },
        isOnboarded: !!profileData.onboarding_completed,
        userPreferences: profileData.prefs || prev.userPreferences,
        loading: false,
        authStatus: 'authenticated_ready',
        authError: undefined
      }));
      
      await refreshData(user.id);
      console.log('[Auth Debug] retryAuthSync success');
    } catch (err: any) {
      console.error('[Auth Debug] retryAuthSync failed:', err);
      setState(prev => ({ ...prev, loading: false, authStatus: 'error', authError: err?.message || 'Retry failed' }));
    }
  }, [refreshData]);

  const addToast = useCallback((message: string, options?: { type?: 'success' | 'error' | 'info', onUndo?: () => void }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setState(prev => ({
      ...prev,
      toasts: [...prev.toasts, { id, message, type: options?.type || 'info', onUndo: options?.onUndo }]
    }));
    
    // Auto-remove after 4s
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        toasts: prev.toasts.filter(t => t.id !== id)
      }));
    }, 4000);
  }, []);

  const addTitle = useCallback((title: Title) => {
    setState(prev => {
      // Don't add if already exists
      if (prev.titles.some(t => t.id === title.id)) return prev;
      return { ...prev, titles: [...prev.titles, title] };
    });
  }, []);

  const addTitleComment = useCallback(async (titleId: string, content: string) => {
    if (!state.currentUser) return;
    
    const newComment: TitleComment = {
      id: `tc_${Math.random().toString(36).substr(2, 9)}`,
      titleId,
      userId: state.currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('title_comments').insert({
          id: newComment.id,
          title_id: newComment.titleId,
          user_id: newComment.userId,
          content: newComment.content,
          created_at: newComment.createdAt
        });
        if (error && error.code !== '42P01') { // Ignore relation doesn't exist for now
          console.error("Error adding title comment to Supabase", error);
        }
      } catch (err) {
        console.error("Supabase insert error", err);
      }
    }

    setState(prev => ({ ...prev, titleComments: [...prev.titleComments, newComment] }));
  }, [state.currentUser]);

  const addGroupComment = useCallback(async (groupId: string, titleId: string, text: string) => {
    if (!state.currentUser) return;
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      groupId,
      titleId,
      userId: state.currentUser.id,
      comment: text,
      createdAt: new Date().toISOString(),
    };
    
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('comments').insert({
          id: newComment.id,
          group_id: newComment.groupId,
          title_id: newComment.titleId,
          user_id: newComment.userId,
          comment: newComment.comment,
          created_at: newComment.createdAt
        });
        if (error) {
          console.error("Error adding group comment to Supabase", error);
        }
      } catch (err) {
        console.error("Failed to add group comment", err);
      }
    }

    setState(prev => ({ ...prev, comments: [...prev.comments, newComment] }));
  }, [state.currentUser]);

  const removeToast = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      toasts: prev.toasts.filter(t => t.id !== id)
    }));
  }, []);

  const openRecommendModal = useCallback((data?: { titleId?: string; groupId?: string; recipientId?: string }) => {
    setState(prev => ({ ...prev, recommendModalOpen: true, recommendModalData: data || null }));
  }, []);

  const closeRecommendModal = useCallback(() => {
    setState(prev => ({ ...prev, recommendModalOpen: false, recommendModalData: null }));
  }, []);
  
  const openGiveVerdictModal = useCallback((recommendationId: string, edit?: boolean) => {
    setState(prev => ({ ...prev, giveVerdictModalOpen: true, giveVerdictModalData: { recommendationId, edit } }));
  }, []);

  const closeGiveVerdictModal = useCallback(() => {
    setState(prev => ({ ...prev, giveVerdictModalOpen: false, giveVerdictModalData: null }));
  }, []);

  const login = useCallback(async () => {
    console.log('[Rec\'d Login] Triggered. Supabase Configured:', isSupabaseConfigured);
    
    if (!isSupabaseConfigured || !supabase) {
       console.log('[Rec\'d Login] Entering Demo Mode because Supabase is not configured.');
       setState(prev => ({ ...prev, currentUser: demoUser, isAuthenticated: true }));
       return;
    }
    
    try {
      // Get current query param 'redirectTo' if present in window location
      const searchParams = new URLSearchParams(window.location.search);
      const redirectToParam = searchParams.get('redirectTo');
      
      const cleanOrigin = window.location.origin.replace(/\/$/, '');
      let redirectUrl = `${cleanOrigin}/api/auth/callback`;
      if (redirectToParam) {
        redirectUrl += `?next=${encodeURIComponent(redirectToParam)}`;
      }
      
      console.log('[Rec\'d Login] Redirecting to Google with:', redirectUrl);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        console.error('[Rec\'d Login] Supabase OAuth Error:', error.message);
        throw error;
      }
    } catch (err) {
      console.error('[Rec\'d Login] Unexpected Error:', err);
      throw err;
    }
  }, []);

  const enterDemoMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentUser: demoUser,
      isAuthenticated: true,
      isOnboarded: false,
      authStatus: 'authenticated_ready',
      loading: false
    }));
  }, []);

  const logout = useCallback(async () => {
    console.log('[Auth] Logout started');
    
    // STEP 1: Await Supabase signOut first so cookies clear fully
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error during logout:', err);
    }
    
    // STEP 2: Clear all React state
    setState(prev => ({ 
      ...prev, 
      currentUser: null, 
      isAuthenticated: false, 
      isOnboarded: false,
      authStatus: 'unauthenticated',
      loading: false,
      recommendations: mockRecommendations,
      ratings: mockRatings,
      groups: mockGroups,
      watchlist: mockWatchlist,
      watchlistLists: [],
      crewConnections: [],
      crewRequests: [],
      activity: mockActivity,
      notifications: [],
      userPreferences: { genres: [], moods: [], formats: [], languages: [], platforms: [] },
    }));
    
    console.log('[Auth] Logout complete');
  }, []);

  const completeOnboarding = useCallback(async (data: any = { onboarding_completed: true }) => {
    // STEP 1: Set React state IMMEDIATELY if finishing
    if (data.onboarding_completed) {
      setState(prev => ({ ...prev, isOnboarded: true }));
    }

    // STEP 2: Wait for DB update to finish so downstream fetchers see fresh data
    if (isSupabaseConfigured && supabase && state.currentUser) {
      const { error } = await supabase.from('profiles').update(data).eq('id', state.currentUser.id);
      if (error) {
        console.error('Error updating profile in Supabase:', error);
      }
    }
  }, [state.currentUser]);

  const updatePreferences = useCallback(async (data: Partial<UserPreferences>) => {
    setState(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, ...data }
    }));

    if (isSupabaseConfigured && supabase && state.currentUser) {
      // 1. Try to update the existing user preferences row
      const { data: updateData, error: updateError } = await supabase
        .from('user_preferences')
        .update({
          genres: data.genres,
          genre_preferences: data.genrePreferences,
          moods: data.moods,
          formats: data.formats,
          languages: data.languages,
          platforms: data.platforms,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', state.currentUser.id)
        .select();

      // 2. Self-healing fallback: If the row doesn't exist (e.g. legacy users), insert it
      if (!updateError && (!updateData || updateData.length === 0)) {
        console.log('[Rec\'d] Preferences row not found, creating new one...');
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: state.currentUser.id,
            genres: data.genres || [],
            genre_preferences: data.genrePreferences || {},
            moods: data.moods || [],
            formats: data.formats || [],
            languages: data.languages || [],
            platforms: data.platforms || [],
            updated_at: new Date().toISOString()
          });
        
        if (insertError) console.error('Error inserting preferences in Supabase:', insertError);
      } else if (updateError) {
        console.error('Error updating preferences in Supabase:', updateError);
      }
    }
  }, [state.currentUser]);

  const addRecommendation = useCallback(async (rec: Recommendation) => {
    if (isSupabaseConfigured && supabase) {
      // Use local client instead of server action
      try {
        // 1. Ensure title is in DB first (cached from TMDB) using secure client-side connection
        const title = state.titles.find(t => t.id === rec.titleId);
        if (title) {
           const { error: titleError } = await supabase.from('titles').upsert({
             id: title.id,
             title: title.title,
             type: title.type,
             poster_url: title.posterUrl || null,
             backdrop_url: title.backdropUrl || null,
             poster_gradient: title.posterGradient,
             release_year: title.releaseYear,
             genres: title.genres,
             runtime: title.runtime || null,
             overview: title.overview,
             external_rating: title.externalRating,
             platforms: title.platforms || [],
             format: title.format || 'Movie',
             language: title.language || null,
             cast_data: title.cast || [],
             director_data: title.directorOrCreatorProfile || {},
             watch_providers: title.platformAvailability || []
           }, { onConflict: 'id', ignoreDuplicates: true });
           
           if (titleError) throw titleError;
        }

        const { data, error: recError } = await supabase
          .from('recommendations')
          .insert({
            title_id: rec.titleId,
            group_id: rec.groupId || null,
            recommended_by: state.currentUser.id, // FORCE IT HERE to bypass any weird React state masking!
            reason: rec.reason,
            confidence_score: rec.confidenceScore,
            mood_tags: rec.moodTags,
            primary_stamp: rec.primaryStamp,
            status: 'verdict_pending',
            recommended_to_group: rec.recommendedToGroup
          })
          .select()
          .single();

        if (recError) throw recError;

        // Link to target users if direct rec
        const targetUserIds = rec.recommendedToUserIds || [];
        if (targetUserIds.length > 0) {
          const targets = targetUserIds.map(userId => ({
            recommendation_id: data.id,
            user_id: userId
          }));

          const { error: targetError } = await supabase
            .from('recommendation_targets')
            .insert(targets);

          if (targetError) throw targetError;
        }

        refreshData();
        return;
      } catch (err: any) {
        console.error('Failed to save recommendation:', err);
        addToast(err?.message || String(err), { type: 'error' });
        return; // CRITICAL: Do not fall through to mock fallback if DB fails!
      }
    }

    // Mock fallback
    setState(prev => ({
      ...prev,
      recommendations: [rec, ...prev.recommendations],
      activity: [{
        id: `act-${Date.now()}`, type: 'recommendation_sent' as const,
        userId: rec.recommendedBy, targetUserId: rec.recommendedToUserIds?.[0],
        titleId: rec.titleId, groupId: rec.groupId,
        message: `New recommendation sent`, createdAt: new Date().toISOString(),
      }, ...prev.activity],
    }));
  }, [state.titles, refreshData]);

   const updateVerdictState = useCallback(async (recId: string, state: VerdictState) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('recommendations').update({ status: state }).eq('id', recId);
      refreshData();
      return;
    }
    setState(prev => ({
      ...prev,
      recommendations: prev.recommendations.map(r => r.id === recId ? { ...r, verdictState: state } : r),
    }));
  }, [refreshData]);

  const addRating = useCallback(async (rating: Rating) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('ratings')
          .insert({
            recommendation_id: rating.recommendationId,
            rated_by: rating.ratedBy,
            content_rating: rating.contentRating,
            recommendation_result: rating.recommendationResult,
            stamp: rating.stamp,
            comment: rating.comment
          })
          .select()
          .single();

        if (error) throw error;

        // Update recommendation state
        await supabase
          .from('recommendations')
          .update({ status: 'verdict_given' })
          .eq('id', rating.recommendationId);

        refreshData();
        return;
      } catch (err: any) {
        console.error('Failed to save rating:', err);
        addToast(`Rating failed: ${err?.message}`, { type: 'error' });
        return; // DO NOT FALL THROUGH TO MOCK STATE
      }
    }

    setState(prev => {
      // Check if rating already exists for this recommendation by this user
      const existingRatingIndex = prev.ratings.findIndex(r => r.recommendationId === rating.recommendationId && r.ratedBy === rating.ratedBy);
      
      let newRatings;
      if (existingRatingIndex > -1) {
        newRatings = [...prev.ratings];
        newRatings[existingRatingIndex] = { ...newRatings[existingRatingIndex], ...rating, updatedAt: new Date().toISOString() } as any;
      } else {
        newRatings = [...prev.ratings, rating];
      }
      
      // Find original recommendation
      const rec = prev.recommendations.find(r => r.id === rating.recommendationId);

      // Calculate Recommendation Impact for this rating
      const impact = calculateRecommendationImpact({
        contentRating: rating.contentRating,
        recommendationResult: rating.recommendationResult,
        confidenceScore: rec?.confidenceScore,
        moodTags: rec?.moodTags
      });
      
      // Update recommendation status and primary stamp
      const updatedRecs = prev.recommendations.map(r =>
        r.id === rating.recommendationId ? { ...r, verdictState: 'verdict_given' as const, primary_stamp: rating.stamp } : r
      );

      // If the rating is for the current user's recommendation, update their Taste Score
      // In a real app, this would happen server-side or via a more robust aggregation
      let newTasteScore = prev.tasteScore;
      if (rec?.recommendedBy === prev.currentUser?.id && rating.ratedBy !== prev.currentUser?.id) {
        // Mocking the impact list update
        const impacts = [...mockRecommendationImpacts, {
          id: `imp-${Date.now()}`,
          recommendationId: rating.recommendationId,
          recommenderId: rec.recommendedBy,
          receiverId: rating.ratedBy,
          contentRating: rating.contentRating,
          contentRatingScore: impact.contentRatingScore,
          recommendationResult: rating.recommendationResult,
          recommendationResultScore: impact.recommendationResultScore,
          impactScore: impact.impactScore,
          createdAt: new Date().toISOString()
        }];

        newTasteScore = calculateTasteScore({
          userId: prev.currentUser.id,
          ratingsReceived: impacts as any,
          totalSent: prev.tasteScore.totalRecommendationsSent,
          scope: 'global'
        });
      }

      return {
        ...prev,
        ratings: newRatings,
        recommendations: updatedRecs,
        tasteScore: newTasteScore,
      };
    });
  }, [refreshData]);

  const createGroup = useCallback(async (group: Group, memberIds: string[] = []) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('groups')
        .insert({
          id: group.id,
          name: group.name,
          vibe: group.vibe,
          description: group.description,
          privacy: group.privacy,
          invite_code: group.inviteCode,
          created_by: state.currentUser?.id || group.createdBy,
          avatar_gradient: group.avatarGradient
        });

      if (!error) {
        // Add creator as owner
        const members = [
          { group_id: group.id, user_id: state.currentUser?.id || group.createdBy, role: 'owner' },
          ...memberIds.map(id => ({ group_id: group.id, user_id: id, role: 'member' }))
        ];
        
        const { error: memberError } = await supabase.from('group_members').insert(members);
        
        if (memberError) {
          console.error('Failed to insert group members:', memberError);
          addToast(`Member Error: ${memberError.message}`, { type: 'error' });
          return;
        }

        refreshData();
        return;
      } else {
        console.error('Failed to create group:', error);
        addToast(`Group Error: ${error.message}`, { type: 'error' });
        return;
      }
    }

    setState(prev => ({
      ...prev,
      groups: [...prev.groups, group],
      groupMembers: [...prev.groupMembers, {
        id: `gm-${Date.now()}`, groupId: group.id,
        userId: prev.currentUser?.id || '', role: 'owner' as const,
        joinedAt: new Date().toISOString(),
      }],
    }));
  }, [state.currentUser, refreshData]);

  const updateGroup = useCallback(async (groupId: string, data: Partial<Group>, memberIds?: string[]) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('groups').update({
        name: data.name,
        vibe: data.vibe,
        description: data.description,
        privacy: data.privacy,
        avatar_gradient: data.avatarGradient
      }).eq('id', groupId);

      if (memberIds) {
        await supabase.from('group_members').delete().eq('group_id', groupId).neq('role', 'owner');
        if (memberIds.length > 0) {
          const members = memberIds.map(id => ({ group_id: groupId, user_id: id, role: 'member' }));
          await supabase.from('group_members').insert(members);
        }
      }

      refreshData();
      return;
    }
    setState(prev => {
      let newGroupMembers = prev.groupMembers;
      if (memberIds) {
        const owner = prev.groupMembers.find(gm => gm.groupId === groupId && gm.role === 'owner');
        const otherGroups = prev.groupMembers.filter(gm => gm.groupId !== groupId);
        
        newGroupMembers = [...otherGroups];
        if (owner) newGroupMembers.push(owner);
        
        memberIds.forEach(id => {
          newGroupMembers.push({
            id: `gm-${Date.now()}-${Math.random()}`,
            groupId,
            userId: id,
            role: 'member' as const,
            joinedAt: new Date().toISOString()
          });
        });
      }
      return {
        ...prev,
        groups: prev.groups.map(g => g.id === groupId ? { ...g, ...data } : g),
        groupMembers: newGroupMembers
      };
    });
  }, [refreshData]);

  const deleteGroup = useCallback(async (groupId: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('groups').delete().eq('id', groupId);
      refreshData();
      return;
    }
    setState(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g.id !== groupId),
      groupMembers: prev.groupMembers.filter(gm => gm.groupId !== groupId)
    }));
  }, [refreshData]);

  const joinGroup = useCallback(async (groupId: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('group_members').insert({
        group_id: groupId,
        user_id: state.currentUser?.id || '',
        role: 'member'
      });
      refreshData();
      return;
    }
    setState(prev => ({
      ...prev,
      groupMembers: [...prev.groupMembers, {
        id: `gm-${Date.now()}`, groupId,
        userId: prev.currentUser?.id || '', role: 'member' as const,
        joinedAt: new Date().toISOString(),
      }],
    }));
  }, [state.currentUser, refreshData]);

  const joinGroupByCode = useCallback(async (code: string) => {
    const uppercaseCode = code.toUpperCase();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('groups').select('id, name').eq('invite_code', uppercaseCode).single();
      if (error || !data) return { success: false };
      
      await supabase.from('group_members').insert({
        group_id: data.id,
        user_id: state.currentUser?.id || '',
        role: 'member'
      });
      refreshData();
      return { success: true, groupName: data.name };
    } else {
      const target = mockGroups.find(g => g.inviteCode === uppercaseCode);
      if (!target) return { success: false };
      joinGroup(target.id);
      return { success: true, groupName: target.name };
    }
  }, [state.currentUser, refreshData, joinGroup]);

  const leaveGroup = useCallback(async (groupId: string) => {
    if (!state.currentUser?.id) return;
    if (isSupabaseConfigured && supabase) {
      await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', state.currentUser.id);
      refreshData();
      return;
    }
    setState(prev => ({
      ...prev,
      groupMembers: prev.groupMembers.filter(gm => !(gm.groupId === groupId && gm.userId === prev.currentUser?.id))
    }));
  }, [state.currentUser?.id, refreshData]);

  const sendCrewRequest = useCallback(async (receiverId: string) => {
    if (!state.currentUser?.id) return { success: false, error: 'Not authenticated' };
    
    // 1. Check if already connected (via local state)
    const isConnected = state.crewConnections.some(c => c.crewMemberId === receiverId);
    if (isConnected) return { success: true, alreadyConnected: true };

    // 2. Check for reverse pending request (Product logic: If they requested you, just accept it)
    const reverseReq = state.crewRequests.find(r => r.senderId === receiverId && r.receiverId === state.currentUser!.id && r.status === 'pending');
    
    if (reverseReq) {
      const { data, error } = await supabase.rpc('accept_crew_request', { request_id: reverseReq.id });
      if (error) {
        console.error('Error accepting reverse request:', error);
        addToast('Failed to accept existing request', { type: 'error' });
        return { success: false, error: 'Failed to accept existing request' };
      }
      addToast('Request accepted!', { type: 'success' });
      refreshData();
      return { success: true, alreadyConnected: true };
    }

    // 3. Create the request
    const { data, error } = await supabase
      .from('crew_requests')
      .upsert({
        sender_id: state.currentUser.id,
        receiver_id: receiverId,
        status: 'pending',
        message: null,
        source: 'direct',
        updated_at: new Date().toISOString()
      }, { onConflict: 'sender_id,receiver_id' })
      .select()
      .single();

    if (error) {
      console.error('Error sending request:', error);
      addToast(error.message || 'Failed to send request', { type: 'error' });
      return { success: false, error: error.message };
    }

    addToast('Request sent.', { type: 'success' });
    refreshData();
    return { success: true, data };
  }, [state.currentUser, state.crewConnections, state.crewRequests, addToast, refreshData]);

  const acceptCrewRequest = useCallback(async (requestId: string) => {
    const { data, error } = await supabase.rpc('accept_crew_request', { request_id: requestId });
    if (error) {
      console.error('Error accepting crew request:', error);
      addToast('Couldn’t accept request. Please try again.', { type: 'error' });
    } else {
      addToast('Joined crew!', { type: 'success' });
      refreshData();
    }
  }, [addToast, refreshData]);

  const rejectCrewRequest = useCallback(async (requestId: string) => {
    if (!state.currentUser?.id) return;
    const { error } = await supabase
      .from('crew_requests')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('receiver_id', state.currentUser.id);
      
    if (error) {
      console.error('Error rejecting crew request:', error);
      addToast('Failed to reject request', { type: 'error' });
    } else {
      addToast('Request rejected.', { type: 'info' });
      refreshData();
    }
  }, [state.currentUser, addToast, refreshData]);

  const cancelCrewRequest = useCallback(async (requestId: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('crew_requests').delete().eq('id', requestId);
      refreshData();
    }
  }, [refreshData]);

  const removeCrewMember = useCallback(async (memberId: string) => {
    if (!state.currentUser?.id) return;
    const { error } = await supabase
      .from('crew_connections')
      .delete()
      .or(`and(user_id.eq.${state.currentUser.id},crew_member_id.eq.${memberId}),and(user_id.eq.${memberId},crew_member_id.eq.${state.currentUser.id})`);
      
    if (error) {
      console.error('Error removing crew member:', error);
      addToast('Failed to remove member', { type: 'error' });
    } else {
      addToast('Removed from crew.', { type: 'info' });
      refreshData();
    }
  }, [state.currentUser, addToast, refreshData]);

  const createInvite = useCallback(async () => {
    if (!state.currentUser?.id) {
      addToast('Not authenticated', { type: 'error' });
      return null;
    }
    
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://recd-app.vercel.app';
    const inviteUrl = `${appUrl}/invite/crew/${inviteCode}`;

    const { error } = await supabase
      .from('invites')
      .insert({
        invite_type: 'crew',
        invited_by: state.currentUser.id,
        invite_code: inviteCode,
        invite_url: inviteUrl,
        status: 'active'
      });

    if (error) {
      console.error('Error creating invite:', error);
      addToast(error.message || 'Failed to create invite', { type: 'error' });
      return null;
    }
    
    return inviteUrl;
  }, [state.currentUser, addToast]);

  const acceptInvite = useCallback(async (inviteCode: string) => {
    if (!state.currentUser?.id) return { success: false, requiresAuth: true };
    
    const { data, error } = await supabase.rpc('accept_crew_invite', {
      invite_code_input: inviteCode
    });

    if (error) {
      let errorCode = 'UNKNOWN';
      let message = 'Failed to join crew';
      if (error.message.includes('Invite not found')) { errorCode = 'NOT_FOUND'; message = 'This invite link is invalid.'; }
      else if (error.message.includes('Invite is not active')) { errorCode = 'INACTIVE'; message = 'This invite has expired.'; }
      else if (error.message.includes('Cannot accept own invite')) { errorCode = 'OWN_INVITE'; message = 'You cannot accept your own invite.'; }
      
      addToast(message, { type: 'error' });
      return { success: false, errorCode };
    }

    const alreadyConnected = data?.already_connected || false;
    addToast(alreadyConnected ? 'You’re already in each other’s crew.' : 'You’re now in each other’s crew.', { type: 'success' });
    refreshData();
    return { success: true, alreadyConnected };
  }, [state.currentUser, addToast, refreshData]);

  const isUserInCrew = useCallback((targetUserId: string) => {
    if (!state.currentUser) return false;
    return state.crewConnections.some(c => c.crewMemberId === targetUserId);
  }, [state.currentUser, state.crewConnections]);

  const getConnectionState = useCallback((targetUserId: string) => {
    if (!state.currentUser) return 'none';
    if (targetUserId === state.currentUser.id) return 'self';
    
    // 1. Check accepted connections
    const isConnected = state.crewConnections.some(c => c.crewMemberId === targetUserId);
    if (isConnected) return 'connected';

    // 2. Check requests
    const req = state.crewRequests.find(r => 
      (r.senderId === state.currentUser?.id && r.receiverId === targetUserId) ||
      (r.receiverId === state.currentUser?.id && r.senderId === targetUserId)
    );

    if (req) {
      if (req.status === 'accepted') return 'connected';
      if (req.status === 'pending') {
        return req.senderId === state.currentUser.id ? 'pending_sent' : 'pending_received';
      }
    }

    return 'none';
  }, [state.currentUser, state.crewConnections, state.crewRequests]);

  const getMutualGroups = useCallback((targetUserId: string) => {
    const myGroupIds = state.groupMembers.filter(gm => gm.userId === state.currentUser?.id).map(gm => gm.groupId);
    const targetGroupIds = state.groupMembers.filter(gm => gm.userId === targetUserId).map(gm => gm.groupId);
    const mutualIds = myGroupIds.filter(id => targetGroupIds.includes(id));
    return state.groups.filter(g => mutualIds.includes(g.id));
  }, [state.currentUser, state.groupMembers, state.groups]);

  const addToWatchlist = useCallback((item: WatchlistItem) => {
    setState(prev => ({ ...prev, watchlist: [item, ...prev.watchlist] }));
  }, []);

  const addTitleToWatchlist = useCallback(async (titleId: string) => {
    if (!state.currentUser) return;
    
    // 1. Optimistic update
    const newItem: WatchlistItem = {
      id: `wl-${Date.now()}`,
      userId: state.currentUser.id,
      titleId,
      addedBy: 'self',
      listIds: [],
      verdictState: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addToWatchlist(newItem);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('watchlist_items')
          .insert({
            user_id: state.currentUser.id,
            title_id: titleId,
            added_by: 'self'
          });

        if (error) throw error;
        refreshData();
      } catch (err) {
        console.error('Failed to add to watchlist:', err);
      }
    }
  }, [state.currentUser, addToWatchlist, refreshData]);

  const createWatchlistList = useCallback(async (data: Partial<WatchlistList>): Promise<{ id: string | null; error?: string }> => {
    const id = data.id || `list-${Math.random().toString(36).substr(2, 9)}`;
    const newList: WatchlistList = {
      id,
      userId: state.currentUser?.id || 'user-1',
      name: data.name || 'Untitled List',
      description: data.description,
      privacy: data.privacy || 'private',
      coverStyle: data.coverStyle || 'gradient',
      titleIds: data.titleIds || [],
      watchedTitleIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // 1. Optimistic update
    setState(prev => ({
      ...prev,
      watchlistLists: [newList, ...prev.watchlistLists]
    }));
    if (isSupabaseConfigured && supabase && state.currentUser) {
      try {
        const { data: dbList, error } = await supabase
          .from('watchlist_lists')
          .insert({
            user_id: state.currentUser.id,
            name: data.name || 'Untitled List',
            description: data.description || null,
            privacy: data.privacy || 'private',
            cover_style: data.coverStyle || 'gradient',
            share_slug: Math.random().toString(36).substring(2, 10)
          })
          .select()
          .single();

        if (error) throw error;
        
        const finalTitleIds = data.titleIds || [];
        if (finalTitleIds.length > 0) {
          const { error: itemsError } = await supabase
            .from('watchlist_list_items')
            .insert(finalTitleIds.map(tId => ({
              list_id: dbList.id,
              title_id: tId
            })));
          if (itemsError) console.error('Failed to insert initial list items', itemsError);
        }

        setState(prev => ({
          ...prev,
          watchlistLists: prev.watchlistLists.map(l => l.id === id ? {
            id: dbList.id,
            userId: dbList.user_id,
            name: dbList.name,
            description: dbList.description,
            privacy: dbList.privacy,
            coverStyle: dbList.cover_style,
            titleIds: finalTitleIds,
            watchedTitleIds: [],
            createdAt: dbList.created_at,
            updatedAt: dbList.updated_at
          } : l)
        }));
        
        refreshData();
        return { id: dbList.id };
      } catch (err) {
        console.error('Failed to save watchlist list:', err);
        return { id: null, error: err instanceof Error ? err.message : 'Database error' };
      }
    }

    return { id };
  }, [state.currentUser, refreshData]);

  const updateWatchlistList = useCallback(async (listId: string, data: Partial<WatchlistList>) => {
    // 1. Optimistic update
    setState(prev => ({
      ...prev,
      watchlistLists: prev.watchlistLists.map(l => 
        l.id === listId ? { ...l, ...data, updatedAt: new Date().toISOString() } : l
      )
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('watchlist_lists')
          .update({
            name: data.name,
            description: data.description,
            privacy: data.privacy,
            cover_style: data.coverStyle
          })
          .eq('id', listId);
      } catch (err) {
        console.error('Failed to update watchlist list:', err);
      }
    }
    refreshData();
  }, [refreshData]);

  const deleteWatchlistList = useCallback(async (listId: string) => {
    // 1. Optimistic update
    setState(prev => ({
      ...prev,
      watchlistLists: prev.watchlistLists.filter(l => l.id !== listId)
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('watchlist_lists').delete().eq('id', listId);
      } catch (err) {
        console.error('Failed to delete watchlist list:', err);
      }
    }
    refreshData();
  }, [refreshData]);

  const addTitleToList = useCallback(async (titleId: string, listId: string) => {
    // 1. Optimistic update so UI reflects immediately
    setState(prev => {
      const updatedLists = prev.watchlistLists.map(list => {
        if (list.id === listId && !list.titleIds.includes(titleId)) {
          return { ...list, titleIds: [...list.titleIds, titleId], watchedTitleIds: list.watchedTitleIds || [], updatedAt: new Date().toISOString() };
        }
        return list;
      });

      const existingItem = prev.watchlist.find(i => i.titleId === titleId);
      let updatedWatchlist = [...prev.watchlist];

      if (existingItem) {
        updatedWatchlist = prev.watchlist.map(i => {
          if (i.titleId === titleId && !i.listIds.includes(listId)) {
            return { ...i, listIds: [...i.listIds, listId], updatedAt: new Date().toISOString() };
          }
          return i;
        });
      }

      return { ...prev, watchlistLists: updatedLists, watchlist: updatedWatchlist };
    });

    if (isSupabaseConfigured && supabase) {
      const title = state.titles.find(t => t.id === titleId);
      if (title) {
        await supabase.from('titles').upsert({
          id: title.id,
          title: title.title,
          type: title.type,
          poster_url: title.posterUrl || null,
          backdrop_url: title.backdropUrl || null,
          poster_gradient: title.posterGradient,
          release_year: title.releaseYear,
          genres: title.genres,
          runtime: title.runtime || null,
          overview: title.overview,
          external_rating: title.externalRating,
          platforms: title.platforms || [],
          format: title.format || 'Movie',
          language: title.language || null,
          cast_data: title.cast || [],
          director_data: title.directorOrCreatorProfile || {},
          watch_providers: title.platformAvailability || []
        }, { onConflict: 'id', ignoreDuplicates: true });
      }
      
      await supabase
        .from('watchlist_list_items')
        .upsert({ list_id: listId, title_id: titleId }, { onConflict: 'list_id,title_id' });
      
      refreshData();
    }
  }, [state.titles, state.currentUser, refreshData]);

  const removeTitleFromList = useCallback(async (listId: string, titleId: string) => {
    // 1. Optimistic update
    setState(prev => {
      const updatedLists = prev.watchlistLists.map(l => 
        l.id === listId ? { ...l, titleIds: l.titleIds.filter(id => id !== titleId), watchedTitleIds: (l.watchedTitleIds || []).filter(id => id !== titleId), updatedAt: new Date().toISOString() } : l
      );
      
      const updatedWatchlist = prev.watchlist.map(item => {
        if (item.titleId === titleId) {
          return { ...item, listIds: item.listIds.filter(id => id !== listId), updatedAt: new Date().toISOString() };
        }
        return item;
      });

      return { ...prev, watchlistLists: updatedLists, watchlist: updatedWatchlist };
    });

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('watchlist_list_items')
        .delete()
        .eq('list_id', listId)
        .eq('title_id', titleId);
      refreshData();
    }
  }, [refreshData]);

  const markAsWatchedInList = useCallback(async (listId: string, titleId: string) => {
    setState(prev => {
      const updatedLists = prev.watchlistLists.map(l => 
        l.id === listId && !l.watchedTitleIds?.includes(titleId)
          ? { ...l, watchedTitleIds: [...(l.watchedTitleIds || []), titleId], updatedAt: new Date().toISOString() }
          : l
      );
      return { ...prev, watchlistLists: updatedLists };
    });

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('watchlist_list_items')
        .update({ watched: true })
        .eq('list_id', listId)
        .eq('title_id', titleId);
      refreshData();
    }
  }, [refreshData]);

  const unmarkAsWatchedInList = useCallback(async (listId: string, titleId: string) => {
    setState(prev => {
      const updatedLists = prev.watchlistLists.map(l => 
        l.id === listId
          ? { ...l, watchedTitleIds: (l.watchedTitleIds || []).filter(id => id !== titleId), updatedAt: new Date().toISOString() }
          : l
      );
      return { ...prev, watchlistLists: updatedLists };
    });

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('watchlist_list_items')
        .update({ watched: false })
        .eq('list_id', listId)
        .eq('title_id', titleId);
      refreshData();
    }
  }, [refreshData]);

  const moveToList = useCallback((itemId: string, listId: string) => {
    setState(prev => {
      const updatedWatchlist = prev.watchlist.map(item => {
        if (item.id === itemId && !item.listIds.includes(listId)) {
          return { ...item, listIds: [...item.listIds, listId], updatedAt: new Date().toISOString() };
        }
        return item;
      });

      const item = prev.watchlist.find(i => i.id === itemId);
      const updatedLists = prev.watchlistLists.map(list => {
        if (list.id === listId && item && !list.titleIds.includes(item.titleId)) {
          return { ...list, titleIds: [...list.titleIds, item.titleId], watchedTitleIds: list.watchedTitleIds || [], updatedAt: new Date().toISOString() };
        }
        return list;
      });

      return { ...prev, watchlist: updatedWatchlist, watchlistLists: updatedLists };
    });
  }, []);

  const removeFromWatchlist = useCallback(async (id: string) => {
    const item = state.watchlist.find(w => w.id === id);
    
    // 1. Optimistic update: remove from global watchlist AND all custom lists
    setState(prev => {
      const targetTitleId = prev.watchlist.find(w => w.id === id)?.titleId;
      
      const updatedLists = prev.watchlistLists.map(l => {
        if (targetTitleId && l.titleIds.includes(targetTitleId)) {
          return { ...l, titleIds: l.titleIds.filter(tid => tid !== targetTitleId), watchedTitleIds: (l.watchedTitleIds || []).filter(tid => tid !== targetTitleId), updatedAt: new Date().toISOString() };
        }
        return l;
      });

      return { 
        ...prev, 
        watchlist: prev.watchlist.filter(w => w.id !== id),
        watchlistLists: updatedLists
      };
    });

    if (item && isSupabaseConfigured && supabase && state.currentUser) {
      // Delete from main watchlist table using client
      try {
        await supabase
          .from('watchlist_items')
          .delete()
          .eq('user_id', state.currentUser.id)
          .eq('title_id', item.titleId);
      } catch (err) {
        console.error('Failed to remove from watchlist:', err);
      }
      
      // Also explicitly delete from all list tables to ensure DB consistency
      const listIds = item.listIds || [];
      await Promise.all(listIds.map(listId => 
        supabase
          .from('watchlist_list_items')
          .delete()
          .eq('list_id', listId)
          .eq('title_id', item.titleId)
      ));
      
      refreshData();
    }
  }, [state.watchlist, state.currentUser, refreshData]);


  const updateUser = useCallback(async (data: Partial<User>) => {
    if (isSupabaseConfigured && supabase && state.currentUser) {
      // Map camelCase User keys to database snake_case profiles columns
      const dbUpdates: any = {};
      
      if (data.username !== undefined) dbUpdates.username = data.username;
      if (data.displayName !== undefined) dbUpdates.display_name = data.displayName;
      if (data.avatarUrl !== undefined) dbUpdates.avatar_url = data.avatarUrl;
      if (data.bio !== undefined) dbUpdates.bio = data.bio;
      if (data.tasteArchetype !== undefined) dbUpdates.taste_archetype = data.tasteArchetype;
      if (data.profileVisibility !== undefined) dbUpdates.profile_visibility = data.profileVisibility;

      const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', state.currentUser.id);
      
      if (error) {
        console.error('Failed to update profile in database:', error);
        addToast(error.message || 'Failed to update profile', { type: 'error' });
        return;
      }

      // Optimistic Update: Immediately update React state to feel ultra-responsive
      setState(prev => {
        if (!prev.currentUser) return prev;
        const updatedUser = { ...prev.currentUser, ...data };
        return {
          ...prev,
          currentUser: updatedUser,
          users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
        };
      });

      refreshData();
    } else {
      setState(prev => {
        if (!prev.currentUser) return prev;
        const updatedUser = { ...prev.currentUser, ...data };
        return {
          ...prev,
          currentUser: updatedUser,
          users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
        };
      });
    }
    addToast('Profile updated successfully.', { type: 'success' });
  }, [state.currentUser, refreshData, addToast]);

  const isTitleInList = useCallback((titleId: string, listId: string) => {
    const list = state.watchlistLists.find(l => l.id === listId);
    return list ? list.titleIds.includes(titleId) : false;
  }, [state.watchlistLists]);

  const setListPrivacy = useCallback((listId: string, privacy: 'private' | 'shared' | 'group') => {
    setState(prev => ({
      ...prev,
      watchlistLists: prev.watchlistLists.map(l => 
        l.id === listId ? { ...l, privacy, updatedAt: new Date().toISOString() } : l
      )
    }));
  }, []);

  const getListStats = useCallback((listId: string) => {
    const list = state.watchlistLists.find(l => l.id === listId);
    if (!list) return null;
    
    const titlesInList = list.titleIds.map(id => state.titles.find(t => t.id === id)).filter(Boolean) as Title[];
    const movies = titlesInList.filter(t => t.type === 'movie').length;
    const shows = titlesInList.filter(t => t.type === 'series').length;
    
    // Find recs for titles in this list
    const recs = state.recommendations.filter(r => list.titleIds.includes(r.titleId));
    const stamped = recs.filter(r => r.verdictState === 'verdict_given').length;

    // Calculate top genre
    const genres = titlesInList.flatMap(t => t.genres);
    const genreCounts = genres.reduce((acc, g) => {
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixed';

    return {
      total: list.titleIds.length,
      movies,
      shows,
      stamped,
      fromCrew: recs.length,
      topGenre
    };
  }, [state.watchlistLists, state.titles, state.recommendations]);


  const getTitle = useCallback((id: string) => state.titles.find(t => t.id === id), [state.titles]);

  const getUser = useCallback((id: string) => state.users.find(u => u.id === id), [state.users]);
  const getUserByUsername = useCallback((username: string) => state.users.find(u => u.username === username), [state.users]);
  const getGroup = useCallback((id: string) => state.groups.find(g => g.id === id), [state.groups]);

  const getGroupMembersFn = useCallback((groupId: string) => {
    // 1. Check local state first
    const memberRelations = state.groupMembers.filter(gm => gm.groupId === groupId);
    const memberIds = memberRelations.map(gm => gm.userId);
    const members = state.users.filter(u => memberIds.includes(u.id));

    if (members.length > 0) return members;
    return [];
  }, [state.groupMembers, state.users]);

  const getGroupRecommendations = useCallback((groupId: string) => {
    return state.recommendations.filter(r => r.groupId === groupId);
  }, [state.recommendations]);

  const getPendingForUser = useCallback(() => {
    return state.recommendations.filter(
      r => r.recommendedToUserIds?.includes(state.currentUser?.id || '') &&
        r.verdictState === 'verdict_pending'
    );
  }, [state.recommendations, state.currentUser]);

  const getUserBadgesFn = useCallback((userId: string) => {
    return state.badges.filter(b => b.userId === userId);
  }, [state.badges]);

  const getViewerContext = useCallback((rec: Recommendation): ViewerContext => {
    return getRecommendationViewerContext(state.currentUser, rec, state.ratings);
  }, [state.currentUser, state.ratings]);

  const getActions = useCallback((rec: Recommendation): ActionSet => {
    const context = getViewerContext(rec);
    return getRecommendationActions(context);
  }, [getViewerContext]);

  const value: AppContextType = {
    addRecommendation,
    ...state, login, logout, completeOnboarding,
    openRecommendModal, closeRecommendModal,
    openGiveVerdictModal, closeGiveVerdictModal,
    updateVerdictState, addRating, createGroup, updateGroup, deleteGroup, joinGroup, leaveGroup,
    addToWatchlist,
    addTitleToWatchlist,
    createWatchlistList,
    updateWatchlistList,
    deleteWatchlistList,
    addTitleToList,
    removeTitleFromList,
    markAsWatchedInList,
    unmarkAsWatchedInList,
    moveToList,
    removeFromWatchlist,
    updatePreferences,
    sendCrewRequest,
    acceptCrewRequest,
    rejectCrewRequest,
    cancelCrewRequest,
    removeCrewMember,
    createInvite,
    acceptInvite,
    isUserInCrew,
    getConnectionState,
    getMutualGroups,
    updateUser,
    isTitleInList,
    setListPrivacy,
    getListStats,
    addToast,
    removeToast,
    getTitle, addTitle, getUser, getUserByUsername, getGroup, getGroupMembers: getGroupMembersFn,
    getGroupRecommendations, getPendingForUser, getUserBadges: getUserBadgesFn,
    getViewerContext, getActions,
    leaderboard: mockLeaderboard, refreshData, enterDemoMode,
    retryAuthSync,
    addTitleComment,
    addGroupComment,
    joinGroupByCode
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}

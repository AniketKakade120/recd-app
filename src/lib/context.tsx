'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type {
  User, Recommendation, Rating, VerdictState, TasteScore, Title,
  Badge, Comment, Group, GroupMember, ActivityItem, WatchlistItem, WatchlistList, UserPreferences, RecAccuracy,
  StampType, CrewConnection, CrewRequest, Notification,
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
import { 
  ensureTitleExistsInDb, 
  saveRecommendation, 
  saveRating, 
  saveWatchlistItem, 
  deleteWatchlistItem,
  updateWatchlistListDb,
  deleteWatchlistListDb,
  createWatchlistList as createWatchlistListDb,
  addTitleToListDb,
  removeTitleFromListDb,
  sendCrewRequest as sendCrewRequestAction,
  acceptCrewRequest as acceptCrewRequestAction,
  rejectCrewRequest as rejectCrewRequestAction,
  removeCrewMember as removeCrewMemberAction,
  createCrewInvite as createCrewInviteAction,
  acceptCrewInvite as acceptCrewInviteAction,
  getCrewState as getCrewStateAction
} from '@/lib/supabase/actions';

// TODO: Replace mock data with Supabase queries

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
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
  updateGroup: (groupId: string, data: Partial<Group>) => void;
  deleteGroup: (groupId: string) => void;
  joinGroup: (groupId: string) => void;
  sendCrewRequest: (receiverId: string, message?: string) => Promise<void>;
  acceptCrewRequest: (requestId: string) => Promise<void>;
  rejectCrewRequest: (requestId: string) => Promise<void>;
  cancelCrewRequest: (requestId: string) => Promise<void>;
  removeCrewMember: (memberId: string) => Promise<void>;
  createInvite: () => Promise<string | null>;
  acceptInvite: (inviteCode: string) => Promise<boolean>;
  isUserInCrew: (targetUserId: string) => boolean;
  getConnectionState: (targetUserId: string) => 'none' | 'pending_sent' | 'pending_received' | 'connected' | 'rejected';
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
  moveToList: (itemId: string, listId: string) => void;
  removeFromWatchlist: (id: string) => Promise<void>;
  updatePreferences: (data: Partial<UserPreferences>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    isAuthenticated: false,
    isOnboarded: false, // We will evaluate this per user in onAuthStateChange
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
  });

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

  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !state.currentUser) return;

    try {
      const userId = state.currentUser.id;

      // 1. Fetch relevant recommendations (Sent by me OR To me OR in my Groups)
      // For simplicity and speed, we fetch recent and filter client-side, but scoped
      const { data: recsData } = await supabase.from('recommendations').select(`
        *,
        targets:recommendation_targets(user_id)
      `).order('created_at', { ascending: false });
      
      const dbRecs: Recommendation[] = recsData ? recsData.map(r => ({
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

      // 2. Fetch relevant ratings
      const { data: ratingsData } = await supabase.from('ratings').select('*');
      const dbRatings: Rating[] = ratingsData ? ratingsData.map(r => ({
        id: r.id,
        recommendationId: r.recommendation_id,
        ratedBy: r.rated_by,
        contentRating: r.content_rating,
        recommendationResult: r.recommendation_result,
        stamp: r.stamp,
        comment: r.comment,
        createdAt: r.created_at
      })) : [];

      // 3. Fetch MY groups
      const { data: myMemberships } = await supabase.from('group_members').select('group_id').eq('user_id', userId);
      const myGroupIds = myMemberships?.map(m => m.group_id) || [];
      
      const { data: groupsData } = await supabase.from('groups').select('*').in('id', myGroupIds);
      const dbGroups: Group[] = groupsData ? groupsData.map(g => ({
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

      // 4. Fetch all group members for my groups
      const { data: membersData } = await supabase.from('group_members').select('*').in('group_id', myGroupIds);
      const dbMembers: GroupMember[] = membersData ? membersData.map(m => ({
        id: m.id,
        groupId: m.group_id,
        userId: m.user_id,
        role: m.role,
        joinedAt: m.joined_at
      })) : [];

      // 5. Fetch MY watchlist
      const { data: watchlistData } = await supabase.from('watchlist_items').select('*').eq('user_id', userId);
      const dbWatchlist: WatchlistItem[] = watchlistData ? watchlistData.map(w => ({
        id: w.id,
        userId: w.user_id,
        titleId: w.title_id,
        addedBy: w.added_by,
        listIds: [], 
        verdictState: 'none',
        createdAt: w.created_at,
        updatedAt: w.updated_at
      })) : [];

      // 6. Fetch titles involved in above data
      const relevantTitleIds = [...new Set([
        ...dbRecs.map(r => r.titleId),
        ...dbWatchlist.map(w => w.titleId)
      ])];
      
      const { data: titlesData } = await supabase.from('titles').select('*').in('id', relevantTitleIds);
      const dbTitles = titlesData ? titlesData.map(mapDbTitleToTitle) : [];

      // 7. Fetch crew connections (My connections)
      const { data: connData } = await supabase.from('crew_connections').select('*').eq('user_id', userId).eq('status', 'accepted');
      const dbConns: CrewConnection[] = connData ? connData.map(c => ({
        id: c.id,
        userId: c.user_id,
        crewMemberId: c.crew_member_id,
        status: c.status as 'accepted',
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })) : [];

      // 7b. Fetch Crew Requests
      const { data: requestsData } = await supabase.from('crew_requests').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
      const dbRequests: CrewRequest[] = requestsData ? requestsData.map(r => ({
        id: r.id,
        senderId: r.sender_id,
        receiverId: r.receiver_id,
        status: r.status as any,
        message: r.message,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      })) : [];

      // 7c. Fetch Notifications
      const { data: notifData } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      const dbNotifs: Notification[] = notifData ? notifData.map(n => ({
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

      // 8. Fetch activity
      const { data: activityData } = await supabase.from('activity').select('*').order('created_at', { ascending: false }).limit(20);
      const dbActivity: ActivityItem[] = activityData ? activityData.map(a => ({
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

      // 9. Fetch watchlist lists
      const { data: listsData } = await supabase.from('watchlist_lists').select('*').eq('user_id', userId);
      const myIds = listsData?.map(l => l.id) || [];
      const { data: listItemsData } = await supabase.from('watchlist_list_items').select('*').in('list_id', myIds);
      
      const dbLists: WatchlistList[] = listsData ? listsData.map(l => ({
        id: l.id,
        userId: l.user_id,
        name: l.name,
        description: l.description,
        privacy: l.privacy,
        coverStyle: l.cover_style,
        coverImage: l.cover_image,
        titleIds: listItemsData ? listItemsData.filter((item: any) => item.list_id === l.id).map((item: any) => item.title_id) : [],
        createdAt: l.created_at,
        updatedAt: l.updated_at
      })) : [];

      // 10. Fetch relevant comments
      const { data: commentsData } = await supabase.from('comments').select('*').order('created_at', { ascending: true });
      const dbComments: Comment[] = commentsData ? commentsData.map(c => ({
        id: c.id,
        userId: c.user_id,
        groupId: c.group_id,
        titleId: c.title_id,
        recommendationId: c.recommendation_id,
        comment: c.comment,
        createdAt: c.created_at
      })) : [];

      // 11. Fetch profiles for users state
      const { data: profilesData } = await supabase.from('profiles').select(`
        *,
        prefs:user_preferences(genres, moods)
      `);
      const dbUsers: User[] = profilesData ? profilesData.map((p: any) => ({
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

      // Update state with DB data
      setState(prev => {
        // Link watchlist items to their lists
        const enrichedWatchlist = dbWatchlist.map(item => ({
          ...item,
          listIds: dbLists.filter(l => l.titleIds.includes(item.titleId)).map(l => l.id)
        }));

        return {
          ...prev,
          titles: dbTitles.length > 0 ? [...dbTitles, ...mockTitles.filter(mt => !dbTitles.some(dt => dt.id === mt.id))] : prev.titles,
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
    } catch (err) {
      console.error('Error hydrating state from Supabase:', err);
    }
  }, []);


  React.useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback to mock mode if Supabase isn't setup
      setState(prev => ({
        ...prev,
        currentUser: defaultUser,
        isAuthenticated: true,
        loading: false,
      }));
      return;
    }

    // Listen to Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Rec'd Auth] Event: ${event}`, session?.user?.email);
      
      if (!session?.user) {
        console.log('[Rec\'d Auth] No session found.');
        setState(prev => ({
          ...prev,
          currentUser: null,
          isAuthenticated: false,
          isOnboarded: false,
          loading: false,
        }));
        return;
      }

      // Optimistic Update: Set authenticated and user immediately
      // Keep loading=true until profile fetch confirms onboarding status
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        // Do NOT set isOnboarded here — wait for DB profile fetch
        // Do NOT set loading: false — wait for profile fetch
        currentUser: prev.currentUser || {
          id: session.user.id,
          username: session.user.email?.split('@')[0] || 'user',
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          avatarUrl: session.user.user_metadata?.avatar_url || '',
          bio: '',
          tasteArchetype: 'Thriller Dealer',
          createdAt: new Date().toISOString(),
        }
      }));

      try {
        // Fetch real profile details — this determines onboarding status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const { data: prefs } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }

        if (profile) {
          console.log(`[Rec'd Auth] Profile found. Onboarded: ${profile.onboarding_completed}`);
          const dbOnboarded = !!profile.onboarding_completed;
          setState(prev => ({
            ...prev,
            currentUser: {
              id: profile.id,
              username: profile.username || session.user.email?.split('@')[0] || 'user',
              displayName: profile.display_name || session.user.user_metadata?.full_name || 'User',
              avatarUrl: profile.avatar_url || session.user.user_metadata?.avatar_url || '',
              bio: profile.bio || '',
              tasteArchetype: profile.taste_archetype as any || 'Thriller Dealer',
              createdAt: profile.created_at,
            },
            isOnboarded: dbOnboarded,
            userPreferences: prefs ? {
              genres: prefs.genres || [],
              moods: prefs.moods || [],
              formats: prefs.formats || [],
              languages: prefs.languages || [],
              platforms: prefs.platforms || [],
            } : prev.userPreferences,
            loading: false,
          }));
        } else {
          console.log('[Rec\'d Auth] No profile record found — trigger might be slow or failed.');
          // If profile is missing, we still need to show onboarding
          setState(prev => ({ ...prev, isOnboarded: false, loading: false }));
        }
      } catch (err) {
        console.error('Background profile fetch error:', err);
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    refreshData();

    // Safety timeout to ensure loading doesn't stay true forever (e.g. network issues)
    const safetyTimeout = setTimeout(() => {
      setState(prev => {
        if (prev.loading) {
          console.warn('[Rec\'d] Auth state took too long to resolve, forcing loading to false.');
          return { ...prev, loading: false };
        }
        return prev;
      });
    }, 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
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
       setState(prev => ({ ...prev, currentUser: defaultUser, isAuthenticated: true }));
       return;
    }
    
    try {
      const cleanOrigin = window.location.origin.replace(/\/$/, '');
      const redirectUrl = `${cleanOrigin}/api/auth/callback`;
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
      currentUser: defaultUser,
      isAuthenticated: true,
      isOnboarded: false,
      loading: false
    }));
  }, []);

  const logout = useCallback(async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        supabase.auth.signOut(); // Fire and forget
      }
    } catch (err) {
      console.error('Error during logout:', err);
    }
    // Clear local session state only - do NOT touch DB onboarding flag
    setState(prev => ({ 
      ...prev, 
      currentUser: null, 
      isAuthenticated: false, 
      isOnboarded: false,
      loading: false 
    }));
  }, []);

  const completeOnboarding = useCallback(async (data: any = { onboarding_completed: true }) => {
    // STEP 1: Set React state IMMEDIATELY if finishing
    if (data.onboarding_completed) {
      setState(prev => ({ ...prev, isOnboarded: true }));
    }

    // STEP 2: Fire-and-forget DB update — persists across sessions
    if (isSupabaseConfigured && supabase && state.currentUser) {
      supabase.from('profiles').update(data).eq('id', state.currentUser.id)
        .then(({ error }) => { if (error) console.error('Error updating profile in Supabase:', error); });
    }
  }, [state.currentUser]);

  const updatePreferences = useCallback(async (data: Partial<UserPreferences>) => {
    setState(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, ...data }
    }));

    if (isSupabaseConfigured && supabase && state.currentUser) {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: state.currentUser.id,
          ...data,
          updated_at: new Date().toISOString()
        });
      
      if (error) console.error('Error updating preferences in Supabase:', error);
    }
  }, [state.currentUser]);

  const addRecommendation = useCallback(async (rec: Recommendation) => {
    if (isSupabaseConfigured && supabase) {
      // 1. Ensure title is in DB first (cached from TMDB)
      const title = state.titles.find(t => t.id === rec.titleId);
      if (title) await ensureTitleExistsInDb(title);

      const { success, error } = await saveRecommendation(rec, rec.recommendedToUserIds || []);
      
      if (success) {
        refreshData();
        return;
      } else {
        console.error('Failed to save recommendation:', error);
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
      const { success, error } = await saveRating(rating);

      if (success) {
        refreshData();
        return;
      } else {
        console.error('Failed to save rating:', error);
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
      
      // Calculate Recommendation Impact for this rating
      const impact = calculateRecommendationImpact({
        contentRating: rating.contentRating,
        recommendationResult: rating.recommendationResult
      });

      // Find original recommendation
      const rec = prev.recommendations.find(r => r.id === rating.recommendationId);
      
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
        
        await supabase.from('group_members').insert(members);
        refreshData();
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

  const updateGroup = useCallback(async (groupId: string, data: Partial<Group>) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('groups').update({
        name: data.name,
        vibe: data.vibe,
        description: data.description,
        privacy: data.privacy,
        avatar_gradient: data.avatarGradient
      }).eq('id', groupId);
      refreshData();
      return;
    }
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id === groupId ? { ...g, ...data } : g)
    }));
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

  const sendCrewRequest = useCallback(async (receiverId: string, message?: string) => {
    if (!state.currentUser) return;
    const { success, error } = await sendCrewRequestAction(receiverId, message);
    if (success) {
      addToast('Crew request sent!', { type: 'success' });
      refreshData();
    } else {
      addToast(error || 'Failed to send request', { type: 'error' });
    }
  }, [state.currentUser, addToast, refreshData]);

  const acceptCrewRequest = useCallback(async (requestId: string) => {
    const { success, error } = await acceptCrewRequestAction(requestId);
    if (success) {
      addToast('Accepted! You are now in each other\'s crew.', { type: 'success' });
      refreshData();
    } else {
      addToast(error || 'Failed to accept request', { type: 'error' });
    }
  }, [addToast, refreshData]);

  const rejectCrewRequest = useCallback(async (requestId: string) => {
    const { success, error } = await rejectCrewRequestAction(requestId);
    if (success) {
      addToast('Request rejected.', { type: 'info' });
      refreshData();
    } else {
      addToast(error || 'Failed to reject request', { type: 'error' });
    }
  }, [addToast, refreshData]);

  const cancelCrewRequest = useCallback(async (requestId: string) => {
    // For MVP, cancel is same as delete/reject by sender
    if (isSupabaseConfigured && supabase) {
      await supabase.from('crew_requests').delete().eq('id', requestId);
      refreshData();
    }
  }, [refreshData]);

  const removeCrewMember = useCallback(async (memberId: string) => {
    const { success, error } = await removeCrewMemberAction(memberId);
    if (success) {
      addToast('Removed from crew.', { type: 'info' });
      refreshData();
    } else {
      addToast(error || 'Failed to remove member', { type: 'error' });
    }
  }, [addToast, refreshData]);

  const createInvite = useCallback(async () => {
    const { success, data, error } = await createCrewInviteAction();
    if (success && data) {
      return data.invite_url;
    } else {
      addToast(error || 'Failed to create invite', { type: 'error' });
      return null;
    }
  }, [addToast]);

  const acceptInvite = useCallback(async (inviteCode: string) => {
    const res = await acceptCrewInviteAction(inviteCode);
    if (res.success) {
      addToast('Joined crew successfully!', { type: 'success' });
      refreshData();
      return true;
    } else {
      if ((res as any).requires_auth) {
        return false; // Handle redirect in component
      }
      addToast(res.error || 'Failed to join crew', { type: 'error' });
      return false;
    }
  }, [addToast, refreshData]);

  const isUserInCrew = useCallback((targetUserId: string) => {
    if (!state.currentUser) return false;
    return state.crewConnections.some(c => c.crewMemberId === targetUserId);
  }, [state.currentUser, state.crewConnections]);

  const getConnectionState = useCallback((targetUserId: string) => {
    if (!state.currentUser) return 'none';
    if (isUserInCrew(targetUserId)) return 'connected';

    const req = state.crewRequests.find(r => 
      (r.senderId === state.currentUser?.id && r.receiverId === targetUserId) ||
      (r.receiverId === state.currentUser?.id && r.senderId === targetUserId)
    );

    if (req) {
      if (req.status === 'pending') {
        return req.senderId === state.currentUser?.id ? 'pending_sent' : 'pending_received';
      }
      return req.status as any;
    }

    return 'none';
  }, [state.currentUser, state.crewRequests, isUserInCrew]);

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
    
    if (isSupabaseConfigured && supabase) {
      const { success, error } = await saveWatchlistItem(state.currentUser.id, titleId);
      if (success) {
        refreshData();
        return;
      } else {
        console.error('Failed to add to watchlist:', error);
      }
    }

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
  }, [state.currentUser, addToWatchlist, refreshData]);

  const createWatchlistList = useCallback(async (data: Partial<WatchlistList>): Promise<{ id: string | null; error?: string }> => {
    if (isSupabaseConfigured && supabase && state.currentUser) {
      const { success, data: newList, error } = await createWatchlistListDb(state.currentUser.id, data);
      if (success && newList) {
        refreshData();
        return { id: newList.id };
      }
      return { id: null, error: typeof error === 'string' ? error : (error as any)?.message || 'Database error' };
    }

    const id = data.id || `list-${Math.random().toString(36).substr(2, 9)}`;
    const newList: WatchlistList = {
      id,
      userId: state.currentUser?.id || 'user-1',
      name: data.name || 'Untitled List',
      description: data.description,
      privacy: data.privacy || 'private',
      coverStyle: data.coverStyle || 'gradient',
      titleIds: data.titleIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      watchlistLists: [newList, ...prev.watchlistLists]
    }));
    return { id };
  }, [state.currentUser]);

  const updateWatchlistList = useCallback(async (listId: string, data: Partial<WatchlistList>) => {
    if (isSupabaseConfigured && supabase) {
      await updateWatchlistListDb(listId, data);
      refreshData();
      return;
    }
    setState(prev => ({
      ...prev,
      watchlistLists: prev.watchlistLists.map(l => 
        l.id === listId ? { ...l, ...data, updatedAt: new Date().toISOString() } : l
      )
    }));
  }, []);

  const deleteWatchlistList = useCallback(async (listId: string) => {
    if (isSupabaseConfigured && supabase) {
      await deleteWatchlistListDb(listId);
      refreshData();
      return;
    }
    setState(prev => ({
      ...prev,
      watchlistLists: prev.watchlistLists.filter(l => l.id !== listId)
    }));
  }, []);

  const addTitleToList = useCallback(async (titleId: string, listId: string) => {
    if (isSupabaseConfigured && supabase) {
      // Ensure title exists in DB
      const title = state.titles.find(t => t.id === titleId);
      if (title) await ensureTitleExistsInDb(title);
      
      await addTitleToListDb(titleId, listId);
      
      // Also ensure it's in the general watchlist so it shows up in UI filters
      if (state.currentUser) {
        await saveWatchlistItem(state.currentUser.id, titleId, 'self');
      }
      
      refreshData();
      return;
    }
    setState(prev => {
      // 1. Update the list
      const updatedLists = prev.watchlistLists.map(list => {
        if (list.id === listId && !list.titleIds.includes(titleId)) {
          return { ...list, titleIds: [...list.titleIds, titleId], updatedAt: new Date().toISOString() };
        }
        return list;
      });

      // 2. Ensure item exists in watchlist and is linked to this list
      const existingItem = prev.watchlist.find(i => i.titleId === titleId);
      let updatedWatchlist = [...prev.watchlist];

      if (existingItem) {
        updatedWatchlist = prev.watchlist.map(i => {
          if (i.titleId === titleId && !i.listIds.includes(listId)) {
            return { ...i, listIds: [...i.listIds, listId], updatedAt: new Date().toISOString() };
          }
          return i;
        });
      } else if (prev.currentUser) {
        updatedWatchlist.unshift({
          id: `wl-${Date.now()}`,
          userId: prev.currentUser.id,
          titleId,
          addedBy: 'self',
          listIds: [listId],
          verdictState: 'none',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      return { ...prev, watchlistLists: updatedLists, watchlist: updatedWatchlist };
    });
  }, []);

  const removeTitleFromList = useCallback(async (listId: string, titleId: string) => {
    if (isSupabaseConfigured && supabase) {
      await removeTitleFromListDb(titleId, listId);
      refreshData();
      return;
    }
    setState(prev => {
      const updatedLists = prev.watchlistLists.map(l => 
        l.id === listId ? { ...l, titleIds: l.titleIds.filter(id => id !== titleId), updatedAt: new Date().toISOString() } : l
      );
      
      const updatedWatchlist = prev.watchlist.map(item => {
        if (item.titleId === titleId) {
          return { ...item, listIds: item.listIds.filter(id => id !== listId), updatedAt: new Date().toISOString() };
        }
        return item;
      });

      return { ...prev, watchlistLists: updatedLists, watchlist: updatedWatchlist };
    });
  }, []);

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
          return { ...list, titleIds: [...list.titleIds, item.titleId], updatedAt: new Date().toISOString() };
        }
        return list;
      });

      return { ...prev, watchlist: updatedWatchlist, watchlistLists: updatedLists };
    });
  }, []);

  const removeFromWatchlist = useCallback(async (id: string) => {
    const item = state.watchlist.find(w => w.id === id);
    if (item && isSupabaseConfigured && supabase && state.currentUser) {
      await deleteWatchlistItem(state.currentUser.id, item.titleId);
    }
    setState(prev => ({ ...prev, watchlist: prev.watchlist.filter(w => w.id !== id) }));
  }, [state.watchlist, state.currentUser]);


  const updateUser = useCallback(async (data: Partial<User>) => {
    if (isSupabaseConfigured && supabase && state.currentUser) {
      await supabase.from('profiles').update(data).eq('id', state.currentUser.id);
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

  const addTitle = useCallback((title: Title) => {
    setState(prev => {
      // Don't add if already exists
      if (prev.titles.some(t => t.id === title.id)) return prev;
      return { ...prev, titles: [...prev.titles, title] };
    });
  }, []);
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
    return getRecommendationActions(context.verdictState, context.viewerRole);
  }, [getViewerContext]);

  const value: AppContextType = {
    addRecommendation,
    ...state, login, logout, completeOnboarding,
    openRecommendModal, closeRecommendModal,
    openGiveVerdictModal, closeGiveVerdictModal,
    updateVerdictState, addRating, createGroup, updateGroup, deleteGroup, joinGroup,
    addToWatchlist,
    addTitleToWatchlist,
    createWatchlistList,
    updateWatchlistList,
    deleteWatchlistList,
    addTitleToList,
    removeTitleFromList,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}

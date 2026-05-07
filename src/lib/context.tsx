'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type {
  User, Recommendation, Rating, RecommendationStatus, TasteScore, Title,
  Badge, Group, GroupMember, ActivityItem, WatchlistItem, UserPreferences, RecAccuracy,
  StampType,
} from '@/lib/types';
import {
  mockUsers, mockRecommendations, mockRatings, mockBadges, mockGroups,
  mockGroupMembers, mockActivity, mockTasteScore, mockTitles, mockLeaderboard,
  mockWatchlist, currentUser as defaultUser,
} from '@/lib/mock-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { ensureTitleExistsInDb } from '@/lib/supabase/actions';

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
  userPreferences: UserPreferences;
  inviteLink: string;
  loading: boolean;
  titles: Title[];
  users: User[];
}

interface AppContextType extends AppState {
  login: (user?: User) => void;
  logout: () => void;
  completeOnboarding: () => void;
  addRecommendation: (rec: Recommendation) => void;
  updateRecommendationStatus: (recId: string, status: RecommendationStatus) => void;
  addRating: (rating: Rating) => void;
  createGroup: (group: Group) => void;
  joinGroup: (groupId: string) => void;
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: string) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  getTitle: (id: string) => typeof mockTitles[0] | undefined;
  getUser: (id: string) => User | undefined;
  getGroup: (id: string) => Group | undefined;
  getGroupMembers: (groupId: string) => User[];
  getGroupRecommendations: (groupId: string) => Recommendation[];
  getPendingForUser: () => Recommendation[];
  getUserBadges: (userId: string) => Badge[];
  leaderboard: typeof mockLeaderboard;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    isAuthenticated: false,
    isOnboarded: false,
    recommendations: mockRecommendations,
    ratings: mockRatings,
    badges: mockBadges,
    groups: mockGroups,
    groupMembers: mockGroupMembers,
    activity: mockActivity,
    tasteScore: mockTasteScore,
    watchlist: [],
    userPreferences: { genres: [], moods: [], formats: [], languages: [], platforms: [] },
    inviteLink: 'https://recd.app/invite/ABC123',
    loading: isSupabaseConfigured,
    titles: isSupabaseConfigured ? [] : mockTitles,
    users: isSupabaseConfigured ? [] : mockUsers,
  });

  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      // 1. Fetch Current User (Mocking Auth session for now)
      // In a real app, this would be supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .single();

      if (profile) {
        // Fetch all related data
        const [recs, groupsData, members, ratingsData, activityData, titlesData, usersData] = await Promise.all([
          supabase.from('recommendations').select('*').order('created_at', { ascending: false }),
          supabase.from('groups').select('*'),
          supabase.from('group_members').select('*'),
          supabase.from('ratings').select('*'),
          supabase.from('activity').select('*').order('created_at', { ascending: false }),
          supabase.from('titles').select('*'),
          supabase.from('users').select('*'),
        ]);

        setState(prev => ({
          ...prev,
          currentUser: profile as any as User,
          isAuthenticated: true,
          recommendations: recs.data as any[] || [],
          groups: groupsData.data as any[] || [],
          groupMembers: members.data as any[] || [],
          ratings: ratingsData.data as any[] || [],
          activity: activityData.data as any[] || [],
          titles: titlesData.data as any[] || [],
          users: usersData.data as any[] || [],
          loading: false,
        }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  React.useEffect(() => {
    if (isSupabaseConfigured) {
      refreshData();
    } else {
      // Fallback to mock data immediately
      setState(prev => ({
        ...prev,
        currentUser: defaultUser,
        isAuthenticated: true,
        recommendations: mockRecommendations,
        groups: mockGroups,
        groupMembers: mockGroupMembers,
        ratings: mockRatings,
        activity: mockActivity,
        titles: mockTitles,
        users: mockUsers,
        watchlist: mockWatchlist,
        loading: false,
      }));
    }
  }, [refreshData]);

  const login = useCallback((user?: User) => {
    setState(prev => ({ ...prev, currentUser: user || defaultUser, isAuthenticated: true }));
  }, []);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, currentUser: null, isAuthenticated: false, isOnboarded: false }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState(prev => ({ ...prev, isOnboarded: true }));
  }, []);

  const addRecommendation = useCallback(async (rec: Recommendation) => {
    if (isSupabaseConfigured && supabase) {
      // 1. Ensure title is in DB first (cached from TMDB)
      const title = state.titles.find(t => t.id === rec.titleId);
      if (title) await ensureTitleExistsInDb(title);

      const { data, error } = await supabase
        .from('recommendations')
        .insert({
          id: rec.id,
          title_id: rec.titleId,
          group_id: rec.groupId || null,
          recommended_by: rec.recommendedBy,
          reason: rec.reason,
          confidence_score: rec.confidenceScore,
          mood_tags: rec.moodTags,
          primary_stamp: rec.primaryStamp,
          status: rec.status,
          recommended_to_group: !!rec.groupId,
        })
        .select()
        .single();

      if (!error) {
        // Also handle targets if it's a direct recommendation
        if (rec.recommendedToUserIds && rec.recommendedToUserIds.length > 0) {
          await supabase.from('recommendation_targets').insert(
            rec.recommendedToUserIds.map(uid => ({
              recommendation_id: rec.id,
              user_id: uid
            }))
          );
        }
        refreshData();
        return;
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

  const updateRecommendationStatus = useCallback(async (recId: string, status: RecommendationStatus) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('recommendations').update({ status }).eq('id', recId);
      refreshData();
      return;
    }
    setState(prev => ({
      ...prev,
      recommendations: prev.recommendations.map(r => r.id === recId ? { ...r, status } : r),
    }));
  }, [refreshData]);

  const addRating = useCallback(async (rating: Rating) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('ratings')
        .insert({
          id: rating.id,
          recommendation_id: rating.recommendationId,
          rated_by: rating.ratedBy,
          content_rating: rating.contentRating,
          recommendation_result: rating.recommendationResult,
          stamp: rating.stamp,
          comment: rating.comment
        });

      if (!error) {
        // Status is updated via trigger in DB or manually here
        await supabase.from('recommendations').update({ 
          status: 'rated',
          primary_stamp: rating.stamp 
        }).eq('id', rating.recommendationId);
        
        refreshData();
        return;
      }
    }

    setState(prev => {
      const newRatings = [...prev.ratings, rating];
      const userRatings = newRatings.filter(r => {
        const rec = prev.recommendations.find(rec => rec.id === r.recommendationId);
        return rec?.recommendedBy === prev.currentUser?.id;
      });
      const avgAccuracy = userRatings.length > 0
        ? userRatings.reduce((sum, r) => sum + r.contentRating, 0) / userRatings.length
        : prev.tasteScore.avgAccuracy;
      return {
        ...prev,
        ratings: newRatings,
        recommendations: prev.recommendations.map(r =>
          r.id === rating.recommendationId ? { ...r, status: 'rated' as const, primary_stamp: rating.stamp } : r
        ),
        tasteScore: {
          ...prev.tasteScore,
          score: Math.round((avgAccuracy / 5) * 100),
          totalRated: prev.tasteScore.totalRated + 1,
          avgAccuracy: Math.round(avgAccuracy * 10) / 10,
          goodCallPct: rating.recommendationResult === 'Nailed it'
            ? Math.min(100, prev.tasteScore.goodCallPct + 1)
            : prev.tasteScore.goodCallPct,
        },
      };
    });
  }, [refreshData]);

  const createGroup = useCallback(async (group: Group) => {
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
        // Add creator as member
        await supabase.from('group_members').insert({
          group_id: group.id,
          user_id: state.currentUser?.id || group.createdBy,
          role: 'owner'
        });
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

  const addToWatchlist = useCallback((item: WatchlistItem) => {
    setState(prev => ({ ...prev, watchlist: [item, ...prev.watchlist] }));
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setState(prev => ({ ...prev, watchlist: prev.watchlist.filter(w => w.id !== id) }));
  }, []);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setState(prev => ({ ...prev, userPreferences: { ...prev.userPreferences, ...prefs } }));
  }, []);

  const getTitle = useCallback((id: string) => mockTitles.find(t => t.id === id), []);
  const getUser = useCallback((id: string) => mockUsers.find(u => u.id === id), []);
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
        (r.status === 'pending' || r.status === 'accepted')
    );
  }, [state.recommendations, state.currentUser]);

  const getUserBadgesFn = useCallback((userId: string) => {
    return state.badges.filter(b => b.userId === userId);
  }, [state.badges]);

  const value: AppContextType = {
    ...state, login, logout, completeOnboarding, addRecommendation,
    updateRecommendationStatus, addRating, createGroup, joinGroup,
    addToWatchlist, removeFromWatchlist, updatePreferences,
    getTitle, getUser, getGroup, getGroupMembers: getGroupMembersFn,
    getGroupRecommendations, getPendingForUser, getUserBadges: getUserBadgesFn,
    leaderboard: mockLeaderboard, refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}

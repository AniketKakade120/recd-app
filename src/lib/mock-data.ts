import type { 
  User, Group, GroupMember, Title, Recommendation, Rating, Badge, ActivityItem, 
  LeaderboardEntry, WatchlistItem, TasteScore, Comment, 
  UserPreferences, RecommendationImpact, TasteMatchBreakdown,
  CrewConnection, WatchlistList
} from './types';

// ── EMPTY PRODUCTION STATE ──────────────────────────────────────────────────

export const mockUsers: User[] = [];
export const currentUser = null;
export const mockUserConnections: CrewConnection[] = [];
export const mockUserPreferences: UserPreferences[] = [];
export const mockTitles: Title[] = [];
export const mockGroups: Group[] = [];
export const mockGroupMembers: GroupMember[] = [];
export const mockRecommendations: Recommendation[] = [];
export const mockRatings: Rating[] = [];
export const mockRecommendationImpacts: RecommendationImpact[] = [];
export const mockBadges: Badge[] = [];
export const mockWatchlist: WatchlistItem[] = [];
export const mockWatchlistLists: WatchlistList[] = [];
export const mockActivity: ActivityItem[] = [];
export const mockLeaderboard: LeaderboardEntry[] = [];

export const mockTasteScore: TasteScore = {
  score: 0,
  label: 'New Taste',
  totalRecommendationsSent: 0,
  totalRecommendationsRated: 0,
  responseRate: 0,
  averageImpactScore: 0,
  mostTrustedBy: 'None',
  recentTrend: 'stable',
  calculatedAt: new Date().toISOString(),
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

export function getUserById(id: string) { return mockUsers.find(u => u.id === id); }
export function getTitleById(id: string) { return mockTitles.find(t => t.id === id); }
export function getGroupById(id: string) { return mockGroups.find(g => g.id === id); }

export function getGroupMembers(groupId: string): User[] {
  const ids = mockGroupMembers.filter(gm => gm.groupId === groupId).map(gm => gm.userId);
  return mockUsers.filter(u => ids.includes(u.id));
}

export function getGroupRecommendations(groupId: string) {
  return mockRecommendations.filter(r => r.groupId === groupId);
}

export function getUserRecommendations(userId: string) {
  return mockRecommendations.filter(r => r.recommendedToUserIds?.includes(userId) || r.recommendedBy === userId);
}

export function getPendingForUser(userId: string) {
  return mockRecommendations.filter(r =>
    r.recommendedToUserIds?.includes(userId) && r.verdictState === 'verdict_pending'
  );
}

export function getRatingForRecommendation(recId: string) {
  return mockRatings.find(r => r.recommendationId === recId);
}

export function getUserBadges(userId: string) {
  return mockBadges.filter(b => b.userId === userId);
}

export const ALL_GENRES = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-fi',
  'Thriller', 'Anime',
];

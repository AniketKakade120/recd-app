// Supabase-ready data model types — Rec'd Social Stamp system

// ============================================
// USER
// ============================================

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  tasteArchetype: TasteArchetype;
  createdAt: string;
}

export type TasteArchetype =
  | 'Emotional Damage Dealer'
  | 'Plot Twist Addict'
  | 'Comfort Watch Specialist'
  | 'Horror Sicko'
  | 'Rom-Com Apologist'
  | 'Prestige TV Snob'
  | 'Anime Evangelist'
  | 'Slow-Burn Criminal'
  | 'Franchise Defender'
  | 'Documentary Goblin'
  | 'Sitcom Loyalist'
  | 'Thriller Merchant';

export const TASTE_ARCHETYPES: TasteArchetype[] = [
  'Emotional Damage Dealer',
  'Plot Twist Addict',
  'Comfort Watch Specialist',
  'Horror Sicko',
  'Rom-Com Apologist',
  'Prestige TV Snob',
  'Anime Evangelist',
  'Slow-Burn Criminal',
  'Franchise Defender',
  'Documentary Goblin',
  'Sitcom Loyalist',
  'Thriller Merchant',
];

// User preferences (set during onboarding)
export interface UserPreferences {
  userId?: string;
  genres: Genre[];
  moods: Mood[];
  formats: Format[];
  languages: Language[];
  platforms: StreamingPlatform[];
}

// ============================================
// STAMPS & BADGES
// ============================================

// Recommendation stamps (the 6 scalable core stamps)
export type StampType =
  | 'Certified Good Call'
  | 'Worth It'
  | 'Crew Pick'
  | 'Risky But Worth It'
  | 'Not For Everyone'
  | 'Missed The Mark';

// Achievement badges (shown on profile, separate from stamps)
export type AchievementBadgeType =
  | 'First Stamp'
  | 'Trusted Taste'
  | 'Top Recommender'
  | 'Consistent Picker'
  | 'Crew Player'
  | 'Good Taste'
  | 'Group Favorite'
  | 'Hidden Gem Finder';

// All badge types combined
export type BadgeType = StampType | AchievementBadgeType;

export type BadgeCategory = 'recommendation' | 'achievement' | 'group' | 'warning';

export const CORE_STAMPS: StampType[] = [
  'Certified Good Call', 'Worth It', 'Crew Pick', 'Risky But Worth It', 'Not For Everyone', 'Missed The Mark'
];

export const ACHIEVEMENT_BADGES: AchievementBadgeType[] = [
  'First Stamp', 'Trusted Taste', 'Top Recommender', 'Consistent Picker', 'Crew Player', 'Good Taste', 'Group Favorite', 'Hidden Gem Finder',
];

export const ACHIEVEMENT_BADGE_DESCRIPTIONS: Record<AchievementBadgeType, string> = {
  'First Stamp': 'You made your first recommendation. Welcome to the game.',
  'Trusted Taste': 'Your recs are rated highly by your crew.',
  'Top Recommender': 'You\'ve sent more recs than anyone in your crew.',
  'Consistent Picker': 'Your recommendations consistently land.',
  'Crew Player': 'Active across multiple groups. A true connector.',
  'Good Taste': 'Your taste score speaks for itself.',
  'Group Favorite': 'The most recommended person in a group.',
  'Hidden Gem Finder': 'You surface titles nobody else is talking about.',
};

// ============================================
// PROFILE STATS
// ============================================

export interface ProfileStats {
  userId: string;
  tasteScore: number;
  reputationLabel: string;
  totalRecommendationsGiven: number;
  totalRecommendationsReceived: number;
  totalRatingsGiven: number;
  totalStampsEarned: number;
  bestCategory: string;
  mostTrustedBy: string;
  monthlyTrend: number;
}

// ============================================
// GROUPS
// ============================================

export interface Group {
  id: string;
  name: string;
  vibe: GroupVibe;
  description: string;
  coverImage?: string;
  icon?: string;
  privacy: 'public' | 'private';
  inviteCode: string;
  createdBy: string;
  createdAt: string;
  avatarGradient: number;
}

export type GroupVibe =
  | 'Movie chaos'
  | 'Prestige drama'
  | 'Comfort watch club'
  | 'Horror nights'
  | 'Sitcom people'
  | 'Anything goes'
  | 'Sci-fi heads'
  | 'Slow burn crew'
  | 'Documentary deep dives';

export const GROUP_VIBES: GroupVibe[] = [
  'Movie chaos',
  'Prestige drama',
  'Comfort watch club',
  'Horror nights',
  'Sitcom people',
  'Anything goes',
  'Sci-fi heads',
  'Slow burn crew',
  'Documentary deep dives',
];

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'mod' | 'member';
  joinedAt: string;
}

// ============================================
// TITLES
// ============================================

export interface Title {
  id: string;
  tmdbId?: number;
  title: string;
  type: TitleType;
  posterUrl?: string;
  backdropUrl?: string;
  posterGradient: number;
  releaseYear: number;
  genres: string[];
  runtime?: string;
  overview: string;
  externalRating: number;
  externalRatings?: {
    imdb?: number;
    tmdb?: number;
    critics?: number;
  };
  platforms?: string[];
  format?: ContentFormat;
  language?: string;
  cast?: string[];
  creatorOrDirector?: string;
}

export type TitleType = 'movie' | 'series' | 'limited_series' | 'documentary' | 'anime' | 'short_film';

export type ContentFormat = 'Movie' | 'Series' | 'Limited series' | 'Documentary' | 'Anime' | 'Short film';

// ============================================
// RECOMMENDATIONS
// ============================================

export type RecommendationStatus =
  | 'pending'
  | 'accepted'
  | 'maybe_later'
  | 'not_my_vibe'
  | 'watching'
  | 'watched'
  | 'rated';

export interface Recommendation {
  id: string;
  titleId: string;
  groupId?: string;
  recommendedBy: string;
  recommendedToUserIds?: string[];
  recommendedToGroup: boolean;
  reason: string;
  confidenceScore: number;
  moodTags: MoodTag[];
  tasteMatchScore?: number;
  primaryStamp?: StampType;
  status: RecommendationStatus;
  savedToWatchlist?: boolean;
  createdAt: string;
}

export type MoodTag =
  | 'Comfort watch'
  | 'Intense'
  | 'Emotional'
  | 'Funny'
  | 'Dark'
  | 'Weird'
  | 'Inspiring'
  | 'Mind-bending'
  | 'Slow burn'
  | 'Prestige'
  | 'Cult pick';

export const MOOD_TAGS: MoodTag[] = [
  'Comfort watch', 'Intense', 'Emotional', 'Funny', 'Dark',
  'Weird', 'Inspiring', 'Mind-bending', 'Slow burn', 'Prestige', 'Cult pick',
];

// ============================================
// RATING (3-step flow)
// ============================================

export type RecAccuracy = 'Nailed it' | 'Pretty close' | 'Not for me';

export const REC_ACCURACY_OPTIONS: RecAccuracy[] = [
  'Nailed it', 'Pretty close', 'Not for me',
];

export interface Rating {
  id: string;
  recommendationId: string;
  ratedBy: string;
  contentRating: number; // 1-5 stars
  recommendationResult: RecAccuracy;
  stamp?: StampType;
  comment?: string;
  createdAt: string;
}

// ============================================
// WATCHLIST
// ============================================

export interface WatchlistItem {
  id: string;
  userId: string;
  titleId: string;
  addedFromRecommendationId?: string;
  recommendedBy?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'saved' | 'recommended' | 'watching' | 'watched' | 'rated';
  stamp?: StampType;
  createdAt: string;
}

// ============================================
// BADGES
// ============================================

export interface Badge {
  id: string;
  userId: string;
  groupId?: string;
  badgeType: BadgeType;
  category: BadgeCategory;
  earnedAt: string;
}

// ============================================
// INVITE
// ============================================

export interface Invite {
  id: string;
  groupId?: string;
  invitedBy: string;
  inviteLink: string;
  inviteCode: string;
  email?: string;
  status: 'copied' | 'sent' | 'accepted' | 'expired';
  createdAt: string;
}

// ============================================
// ACTIVITY
// ============================================

export interface ActivityItem {
  id: string;
  type: ActivityType;
  userId: string;
  targetUserId?: string;
  titleId?: string;
  groupId?: string;
  recommendationId?: string;
  message: string;
  createdAt: string;
}

export type ActivityType =
  | 'recommendation_sent'
  | 'recommendation_accepted'
  | 'recommendation_rated'
  | 'taste_score_changed'
  | 'badge_earned'
  | 'member_joined'
  | 'movie_trending'
  | 'added_to_watchlist'
  | 'review_posted'
  | 'saved_to_watchlist';

// ============================================
// GROUP COMMENTS (Crew Discussion)
// ============================================

export interface GroupComment {
  id: string;
  groupId: string;
  titleId: string;
  userId: string;
  comment: string;
  createdAt: string;
}

// ============================================
// TASTE SCORE
// ============================================

export interface TasteScore {
  score: number;
  totalSent: number;
  totalRated: number;
  avgAccuracy: number;
  goodCallPct: number;
  mostTrustedBy: string;
  bestCategories?: string[];
  recentTrend?: 'up' | 'down' | 'stable';
}

export function getTasteLabel(score: number): string {
  if (score >= 90) return 'Certified Taste';
  if (score >= 80) return 'Great Taste';
  if (score >= 65) return 'Trusted Enough';
  if (score >= 50) return 'Mixed Taste';
  return 'Under Review';
}

// ============================================
// LEADERBOARD
// ============================================

export interface LeaderboardEntry {
  rank: number;
  user: User;
  tasteScore: number;
  badge?: BadgeType;
  label: string;
}

// ============================================
// CATEGORY SYSTEM (for onboarding & filters)
// ============================================

export type Genre = 'Drama' | 'Comedy' | 'Thriller' | 'Horror' | 'Romance' | 'Sci-fi' | 'Documentary' | 'Anime' | 'Crime' | 'Fantasy';
export const GENRES: Genre[] = ['Drama', 'Comedy', 'Thriller', 'Horror', 'Romance', 'Sci-fi', 'Documentary', 'Anime', 'Crime', 'Fantasy'];

export type Mood = 'Comfort watch' | 'Intense' | 'Emotional' | 'Funny' | 'Dark' | 'Weird' | 'Inspiring' | 'Mind-bending' | 'Slow burn';
export const MOODS: Mood[] = ['Comfort watch', 'Intense', 'Emotional', 'Funny', 'Dark', 'Weird', 'Inspiring', 'Mind-bending', 'Slow burn'];

export type Format = 'Movie' | 'Series' | 'Limited series' | 'Documentary' | 'Anime' | 'Short film';
export const FORMATS: Format[] = ['Movie', 'Series', 'Limited series', 'Documentary', 'Anime', 'Short film'];

export type Language = 'English' | 'Hindi' | 'Korean' | 'Japanese' | 'Indian regional' | 'Global cinema';
export const LANGUAGES: Language[] = ['English', 'Hindi', 'Korean', 'Japanese', 'Indian regional', 'Global cinema'];

export type StreamingPlatform = 'Netflix' | 'Prime Video' | 'Disney+' | 'Apple TV' | 'YouTube' | 'MUBI' | 'Theatre';
export const PLATFORMS: StreamingPlatform[] = ['Netflix', 'Prime Video', 'Disney+', 'Apple TV', 'YouTube', 'MUBI', 'Theatre'];

// ============================================
// HELPERS
// ============================================

export const CONFIDENCE_LABELS = [
  { min: 0, max: 30, label: 'Risky take' },
  { min: 31, max: 60, label: 'I see the vision' },
  { min: 61, max: 85, label: 'Pretty confident' },
  { min: 86, max: 100, label: 'Certified good call' },
];

export function getConfidenceLabel(score: number): string {
  const match = CONFIDENCE_LABELS.find(c => score >= c.min && score <= c.max);
  return match?.label ?? 'Unknown';
}

export const RECOMMENDATION_REASONS = [
  "This feels painfully you.",
  "You'll either love this or block me.",
  "Trust me, this is your exact vibe.",
  "The ending will personally attack you.",
  "You need this for character development.",
  "Good story. Better damage.",
];

// Stamps to show based on rating tier
export function getContextualStamps(contentRating: number, recAccuracy: RecAccuracy): StampType[] {
  if (contentRating >= 4 && recAccuracy === 'Nailed it') {
    return ['Certified Good Call', 'Crew Pick', 'Worth It'];
  }
  if (contentRating >= 3 || recAccuracy === 'Pretty close') {
    return ['Worth It', 'Risky But Worth It', 'Not For Everyone'];
  }
  return ['Not For Everyone', 'Missed The Mark'];
}

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
  tasteArchetypes?: TasteArchetype[];
  generatedTasteHeadline?: string;
  tasteScore?: number;
  reputationLabel?: string;
  favoriteGenres?: Genre[];
  favoriteMoods?: Mood[];
  preferredPlatforms?: StreamingPlatform[];
  preferences?: UserPreferences;
  profileVisibility?: 'public' | 'crew_only' | 'private';
  age_acknowledged?: boolean;
  age_acknowledged_at?: string;
  createdAt: string;
}

export interface CrewRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message?: string;
  source?: string | null;
  inviteCode?: string | null;
  createdAt: string;
  updatedAt: string;
  sender_profile?: User | null;
  receiver_profile?: User | null;
}

export interface CrewConnection {
  id: string;
  userId: string;
  crewMemberId: string;
  status: 'accepted';
  createdAt: string;
  updatedAt: string;
  crew_member_profile: User | null;
}

export interface PublicUserProfile extends User {
  publicListIds: string[];
  publicRecommendationIds: string[];
  badgeIds: string[];
  mutualGroupIds: string[];
  isConnectedToCurrentUser: boolean;
}

export interface CrewMember {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  tasteScore: number;
  reputationLabel: string;
  tasteArchetype: TasteArchetype;
  mutualGroupCount: number;
  favoriteGenres: Genre[];
  addedAt: string;
}

export interface PeopleSearchResult {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  tasteScore: number;
  reputationLabel: string;
  mutualGroupCount: number;
  isConnectedToCurrentUser: boolean;
}

export type TasteArchetype =
  | 'Emotional Damage Dealer'
  | 'Plot Twist Addict'
  | 'Comfort Watch Expert'
  | 'Horror Sicko'
  | 'Rom-Com Defender'
  | 'Prestige TV Snob'
  | 'Anime Evangelist'
  | 'Slow-Burn Believer'
  | 'Franchise Defender'
  | 'Documentary Deep Diver'
  | 'Sitcom Loyalist'
  | 'Thriller Dealer';

export const TASTE_ARCHETYPES: TasteArchetype[] = [
  'Emotional Damage Dealer',
  'Plot Twist Addict',
  'Comfort Watch Expert',
  'Horror Sicko',
  'Rom-Com Defender',
  'Prestige TV Snob',
  'Anime Evangelist',
  'Slow-Burn Believer',
  'Franchise Defender',
  'Documentary Deep Diver',
  'Sitcom Loyalist',
  'Thriller Dealer',
];

export const TASTE_ARCHETYPE_DESCRIPTIONS: Record<TasteArchetype, string> = {
  'Emotional Damage Dealer': 'Stories that hurt beautifully.',
  'Plot Twist Addict': 'You live for the reveal.',
  'Comfort Watch Expert': 'Safe picks. Good vibes.',
  'Horror Sicko': 'Fear is part of the fun.',
  'Rom-Com Defender': 'Love clichés, proudly.',
  'Prestige TV Snob': 'Only the serious stuff.',
  'Anime Evangelist': 'You will convert people.',
  'Slow-Burn Believer': 'Patience. Payoff. Pain.',
  'Franchise Defender': 'Sequels deserve rights.',
  'Documentary Deep Diver': 'Real stories hit harder.',
  'Sitcom Loyalist': 'Low stakes. High comfort.',
  'Thriller Dealer': 'Stress, but make it fun.',
};


// User preferences (set during onboarding)
export interface UserPreferences {
  userId?: string;
  genres: Genre[];
  genrePreferences?: Record<string, number>;
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
  | 'Missed The Mark'
  | 'Good Call'
  | 'Mixed Response';

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
  'Certified Good Call', 'Worth It', 'Crew Pick', 'Risky But Worth It', 'Not For Everyone', 'Missed The Mark', 'Good Call', 'Mixed Response'
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

export interface PlatformAvailability {
  platformName: string;
  logoUrl?: string;
  url?: string;
  region?: string;
}

export interface DirectorOrCreator {
  id: string;
  name: string;
  role: 'Director' | 'Creator';
  profileImageUrl?: string;
}

export interface CastMember {
  id: string;
  name: string;
  characterName: string;
  profileImageUrl?: string;
  order: number;
}

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
  platformAvailability?: PlatformAvailability[];
  format?: ContentFormat;
  language?: string;
  cast: CastMember[];
  directorOrCreatorProfile: DirectorOrCreator;
}

export type TitleType = 'movie' | 'series' | 'limited_series' | 'documentary' | 'anime' | 'short_film';

export type ContentFormat = 'Movie' | 'Series' | 'Limited series' | 'Documentary' | 'Anime' | 'Short film';

// ============================================
// RECOMMENDATIONS
// ============================================

export type RecommendationStatus = 
  | 'pending'
  | 'accepted'
  | 'watching'
  | 'watched'
  | 'rated'
  | 'maybe_later'
  | 'not_my_vibe';

export type VerdictState =
  | 'verdict_pending'
  | 'verdict_given'
  | 'dismissed'
  | 'none';

export interface TitleComment {
  id: string;
  titleId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

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
  verdictState: VerdictState;
  createdAt: string;
  cancelledAt?: string | null;
}

export interface ReceiverRecommendationState {
  recommendationId: string;
  receiverId: string;
  verdictState: VerdictState;
  watchlistStatus?: 'saved' | 'none';
  hasRated: boolean;
  ratingId?: string;
  updatedAt: string;
}

export type ViewerRole = 'recommender' | 'receiver' | 'ratedReceiver' | 'groupMember' | 'outsider';

export interface ViewerContext {
  viewerRole: ViewerRole;
  isRecommender: boolean;
  isReceiver: boolean;
  hasRated: boolean;
  verdictState: VerdictState;
  canGiveVerdict: boolean;
  canViewVerdict: boolean;
  canEditVerdict: boolean;
  canSave: boolean;
}

export type MoodTag =
  | 'Comfort Watch'
  | 'Feel-good'
  | 'Intense'
  | 'Emotional'
  | 'Funny'
  | 'Dark'
  | 'Weird'
  | 'Mind-bending'
  | 'Slow Burn'
  | 'Prestige'
  | 'Cult pick';

export const MOOD_TAGS: MoodTag[] = [
  'Comfort Watch', 'Feel-good', 'Intense', 'Emotional', 'Funny', 'Dark',
  'Weird', 'Mind-bending', 'Slow Burn', 'Prestige', 'Cult pick',
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
  addedBy: 'self' | 'recommendation' | 'group';
  listIds: string[];
  verdictState: VerdictState;
  stamp?: StampType;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  privacy: 'private' | 'shared' | 'group';
  coverStyle: 'collage' | 'gradient' | 'poster_stack';
  coverImage?: string;
  titleIds: string[];
  watchedTitleIds: string[];
  createdAt: string;
  updatedAt: string;
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
  inviteType: 'crew' | 'group' | 'list';
  invitedBy: string;
  invitedUserId?: string;
  invitedEmail?: string;
  inviteCode: string;
  inviteUrl?: string;
  status: 'active' | 'accepted' | 'expired' | 'revoked';
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  actorId?: string;
  type: 'crew_request_received' | 'crew_request_accepted' | 'invite_received' | string;
  title: string;
  body?: string;
  resourceId?: string;
  read: boolean;
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
// COMMENTS
// ============================================

export interface Comment {
  id: string;
  userId: string;
  groupId?: string;
  titleId?: string;
  recommendationId?: string;
  comment: string;
  createdAt: string;
}

// ============================================
// TASTE SCORE
// ============================================

export interface TasteScore {
  score: number;
  label: string;
  totalRecommendationsSent: number;
  totalRecommendationsRated: number;
  responseRate: number;
  averageImpactScore: number;
  bestCategory?: string;
  mostTrustedBy?: string;
  recentTrend?: 'up' | 'down' | 'stable';
  calculatedAt: string;
}

export interface TasteScoreBreakdown extends TasteScore {
  userId: string;
  scope: 'global' | 'group';
  groupId?: string;
}

export interface RecommendationImpact {
  id: string;
  recommendationId: string;
  recommenderId: string;
  receiverId: string;
  groupId?: string;
  contentRating: number;
  contentRatingScore: number;
  recommendationResult: RecAccuracy;
  recommendationResultScore: number;
  impactScore: number;
  stamp?: StampType;
  createdAt: string;
}

export interface TasteMatchBreakdown {
  recommendationId?: string;
  titleId: string;
  receiverId: string;
  recommenderId?: string;
  groupId?: string;
  tasteMatchScore: number;
  contentPreferenceMatch: number;
  recommenderAffinity: number;
  crewSignal: number;
  recommenderConfidence: number;
  signalConfidence: 'strong' | 'some' | 'new';
  explanationBullets: string[];
  calculatedAt: string;
}

export interface RecommenderAffinity {
  recommenderId: string;
  receiverId: string;
  totalPastRecommendations: number;
  averageResultScore: number;
  signalConfidence: 'strong' | 'some' | 'new';
  affinityScore: number;
}

export interface CrewSignal {
  titleId: string;
  receiverId: string;
  groupId?: string;
  savedByCrewCount: number;
  positiveRatingsCount: number;
  positiveStampCount: number;
  groupVerdict?: string;
  crewSignalScore: number;
}

export function getTasteLabel(score: number): string {
  if (score >= 90) return 'Certified Taste';
  if (score >= 80) return 'Great Taste';
  if (score >= 70) return 'Trusted Taste';
  if (score >= 60) return 'Mixed Taste';
  if (score >= 50) return 'Risky Taste';
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

export type Mood = 'Comfort Watch' | 'Feel-good' | 'Intense' | 'Emotional' | 'Funny' | 'Dark' | 'Weird' | 'Mind-bending' | 'Slow Burn';
export const MOODS: Mood[] = ['Comfort Watch', 'Feel-good', 'Intense', 'Emotional', 'Funny', 'Dark', 'Weird', 'Mind-bending', 'Slow Burn'];

export type Format = 'Movie' | 'Series' | 'Mini Series' | 'Documentary' | 'Anime' | 'Short Film';
export const FORMATS: Format[] = ['Movie', 'Series', 'Mini Series', 'Documentary', 'Anime', 'Short Film'];

export type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Malayalam' | 'Kannada' | 'Bengali' | 'Marathi' | 'Gujarati' | 'Punjabi' | 'Korean' | 'Japanese' | 'Global Cinema';
export const LANGUAGES: Language[] = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Korean', 'Japanese', 'Global Cinema'];


export type StreamingPlatform = 'Netflix' | 'Prime Video' | 'JioHotstar' | 'SonyLIV' | 'ZEE5' | 'AHA' | 'Apple TV' | 'YouTube' | 'MUBI' | 'Theatre';
export const PLATFORMS: StreamingPlatform[] = ['Netflix', 'Prime Video', 'JioHotstar', 'SonyLIV', 'ZEE5', 'AHA', 'Apple TV', 'YouTube', 'MUBI', 'Theatre'];

// ============================================
// JOURNAL
// ============================================

export interface JournalEntry {
  id: string;
  userId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  backdropPath?: string;
  releaseYear?: number;
  genres: string[];
  watchedDate: string;
  rating?: number;
  stamp?: string;
  shortVerdict?: string;
  sourceType: 'self' | 'recommended';
  recommendedByUserId?: string;
  recommendationId?: string;
  visibility: 'private' | 'crew' | 'public';
  platform?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryInsert {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  backdropPath?: string;
  releaseYear?: number;
  genres?: string[];
  watchedDate?: string;
  rating?: number;
  stamp?: string;
  shortVerdict?: string;
  sourceType?: 'self' | 'recommended';
  recommendedByUserId?: string;
  recommendationId?: string;
  visibility?: 'private' | 'crew' | 'public';
  platform?: string;
}

export interface JournalStats {
  loggedCount: number;
  avgRating: number;
  topGenre: string;
  topStamp: string;
}

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

// Stamps to show based on rating result
export function getContextualStamps(recAccuracy: RecAccuracy): StampType[] {
  switch (recAccuracy) {
    case 'Nailed it':
      return ['Certified Good Call', 'Worth It', 'Good Call' as any, 'Cult Pick'];
    case 'Pretty close':
      return ['Risky But Worth It', 'Mixed Response' as any, 'Not For Everyone', 'Worth It'];
    case 'Not for me':
      return ['Missed The Mark', 'Not For Everyone', 'Questionable Taste' as any];
    default:
      return CORE_STAMPS;
  }
}

import { 
  Title, 
  User, 
  UserPreferences, 
  Recommendation, 
  Rating, 
  RecAccuracy,
  RecommendationImpact,
  TasteScoreBreakdown,
  TasteMatchBreakdown,
  RecommenderAffinity,
  CrewSignal,
  getTasteLabel,
  getConfidenceLabel
} from '@/lib/types';

// ============================================
// TASTE SCORE LOGIC (User Reputation)
// ============================================

/**
 * Calculates the impact of a single recommendation rating.
 * Formula: (Rec Result Score * 0.8) + (Content Rating Score * 0.2)
 */
export function calculateRecommendationImpact(params: {
  contentRating: number;
  recommendationResult: RecAccuracy;
  confidenceScore?: number;
  moodTags?: string[];
}): { contentRatingScore: number; recommendationResultScore: number; impactScore: number; bonusApplied?: string } {
  // Content Rating: 1-5 stars -> 20-100 scale
  const contentRatingScore = params.contentRating * 20;

  // Recommendation Result: Nailed it = 100, Pretty close = 70, Not for me = 30
  const resultScoreMap: Record<RecAccuracy, number> = {
    'Nailed it': 100,
    'Pretty close': 70,
    'Not for me': 30,
  };
  const recommendationResultScore = resultScoreMap[params.recommendationResult];

  let impactScore = (recommendationResultScore * 0.8) + (contentRatingScore * 0.2);
  let bonusApplied: string | undefined;

  const isRisky = (params.confidenceScore !== undefined && params.confidenceScore < 40) ||
                  (params.moodTags && (params.moodTags.includes('Weird') || params.moodTags.includes('Cult pick') || params.moodTags.includes('Dark')));

  if (isRisky) {
    if (params.recommendationResult === 'Not for me') {
      // The "Self-Awareness" Bonus. You knew it was a risky take/not for everyone.
      // Instead of failing with 28/100, you get a "Correct Prediction" baseline score.
      impactScore = Math.max(impactScore, 75);
      bonusApplied = 'Self-Awareness Bonus (Correctly predicted risk)';
    } else if (params.recommendationResult === 'Nailed it') {
      // The "Tastemaker" Bonus. You recommended something risky and they loved it!
      impactScore = Math.min(100, impactScore + 20);
      bonusApplied = 'Tastemaker Bonus (Successful risky take)';
    }
  }

  return {
    contentRatingScore,
    recommendationResultScore,
    impactScore,
    bonusApplied
  };
}

/**
 * Calculates a user's Taste Score (global or group-specific).
 * Excludes self-ratings.
 */
export function calculateTasteScore(params: {
  userId: string;
  ratingsReceived: RecommendationImpact[];
  totalSent: number;
  scope: 'global' | 'group';
  groupId?: string;
}): TasteScoreBreakdown {
  const ratings = params.scope === 'group' 
    ? params.ratingsReceived.filter(r => r.groupId === params.groupId)
    : params.ratingsReceived;

  const totalRated = ratings.length;
  const averageImpactScore = totalRated > 0
    ? ratings.reduce((sum, r) => sum + r.impactScore, 0) / totalRated
    : 0;

  const score = Math.round(averageImpactScore);
  const responseRate = params.totalSent > 0 ? (totalRated / params.totalSent) * 100 : 0;

  return {
    userId: params.userId,
    scope: params.scope,
    groupId: params.groupId,
    score,
    label: getTasteLabel(score),
    totalRecommendationsSent: params.totalSent,
    totalRecommendationsRated: totalRated,
    responseRate: Math.round(responseRate),
    averageImpactScore: Math.round(averageImpactScore),
    calculatedAt: new Date().toISOString(),
  };
}

// ============================================
// TASTE MATCH LOGIC (Personalized Fit)
// ============================================

/**
 * Calculates Content Preference Match (0-100).
 * Matches title metadata against user preferences.
 */
export function calculateContentPreferenceMatch(params: {
  title: Title;
  preferences: UserPreferences;
  userHistory?: {
    savedTitleIds: string[];
    ratedTitleIds: string[];
  };
}): { score: number; matchedFactors: string[] } {
  const { title, preferences, userHistory } = params;
  let score = 0;
  const matchedFactors: string[] = [];

  // Genre match (0-30 pts)
  const matchingGenres = title.genres.filter(g => preferences.genres.includes(g as any));
  const genrePoints = Math.min(30, matchingGenres.length * 15);
  score += genrePoints;
  if (genrePoints > 0) matchedFactors.push(`Matches your interest in ${matchingGenres.slice(0, 2).join(' & ')}`);

  // Mood match (0-25 pts)
  // For MVP, we'll assume title has mood tags or we map from genre/type
  // (In real app, Title would have moodTags too)
  // Let's check format/type for now as proxy if moodTags missing
  const moodPoints = preferences.moods.some(m => title.genres.includes(m)) ? 25 : 15;
  score += moodPoints;
  if (moodPoints >= 20) matchedFactors.push("Fits your current vibe preferences");

  // Format match (0-15 pts)
  if (title.format && preferences.formats.includes(title.format as any)) {
    score += 15;
    matchedFactors.push(`Matches your preferred format (${title.format})`);
  }

  // Language match (0-10 pts)
  if (title.language && preferences.languages.includes(title.language as any)) {
    score += 10;
  }

  // Platform match (0-10 pts)
  if (title.platforms?.some(p => preferences.platforms.includes(p as any))) {
    score += 10;
  }

  // Similarity (0-10 pts)
  if (userHistory?.savedTitleIds.includes(title.id)) {
    score += 10;
    matchedFactors.push("Similar to titles you've saved");
  }

  return { score: Math.min(100, score), matchedFactors };
}

/**
 * Calculates Recommender Affinity.
 * How well this recommender understands this receiver specifically.
 */
export function calculateRecommenderAffinity(params: {
  recommenderId: string;
  receiverId: string;
  pastRecommendations: Rating[]; // Ratings given by receiver for this recommender
  recommenderFallbackScore: number; // Global Taste Score of recommender
}): RecommenderAffinity {
  const { pastRecommendations, recommenderFallbackScore } = params;
  const total = pastRecommendations.length;

  let affinityScore = 60; // Baseline
  let signalConfidence: 'strong' | 'some' | 'new' = 'new';

  if (total >= 5) {
    const resultMap: Record<RecAccuracy, number> = { 'Nailed it': 100, 'Pretty close': 70, 'Not for me': 30 };
    const avg = pastRecommendations.reduce((sum, r) => sum + resultMap[r.recommendationResult], 0) / total;
    affinityScore = avg;
    signalConfidence = 'strong';
  } else if (total > 0) {
    const resultMap: Record<RecAccuracy, number> = { 'Nailed it': 100, 'Pretty close': 70, 'Not for me': 30 };
    const historyAvg = pastRecommendations.reduce((sum, r) => sum + resultMap[r.recommendationResult], 0) / total;
    // Blend: 60% history, 40% fallback
    affinityScore = (historyAvg * 0.6) + (recommenderFallbackScore * 0.4);
    signalConfidence = 'some';
  } else {
    affinityScore = recommenderFallbackScore > 0 ? (recommenderFallbackScore * 0.7) + 20 : 60;
    signalConfidence = 'new';
  }

  return {
    recommenderId: params.recommenderId,
    receiverId: params.receiverId,
    totalPastRecommendations: total,
    averageResultScore: affinityScore,
    signalConfidence,
    affinityScore: Math.round(affinityScore),
  };
}

/**
 * Calculates Crew Signal.
 * How the receiver's network responded to this title.
 */
export function calculateCrewSignal(params: {
  titleId: string;
  receiverId: string;
  crewActivity: {
    savedByCount: number;
    highRatingsCount: number;
    positiveStampsCount: number;
    groupVerdict?: string;
  };
}): CrewSignal {
  let score = 50; // Neutral baseline

  const { crewActivity } = params;
  
  if (crewActivity.savedByCount >= 2) score += 10;
  if (crewActivity.highRatingsCount >= 3) score += 15;
  if (crewActivity.positiveStampsCount >= 2) score += 15;
  
  if (crewActivity.groupVerdict === 'Crew Pick' || crewActivity.groupVerdict === 'Certified Good Call') {
    score += 15;
  }

  // Clamp 0-100
  score = Math.max(0, Math.min(100, score));

  return {
    titleId: params.titleId,
    receiverId: params.receiverId,
    savedByCrewCount: crewActivity.savedByCount,
    positiveRatingsCount: crewActivity.highRatingsCount,
    positiveStampCount: crewActivity.positiveStampsCount,
    groupVerdict: crewActivity.groupVerdict,
    crewSignalScore: score,
  };
}

/**
 * Final Taste Match % Calculation.
 * Formula: (Content 45%) + (Affinity 35%) + (Crew 15%) + (Confidence 5%)
 */
export function calculateTasteMatch(params: {
  title: Title;
  receiver: User;
  recommender?: User;
  confidenceScore?: number;
  preferences: UserPreferences;
  recommenderAffinity: number;
  crewSignalScore: number;
  matchedFactors: string[];
}): TasteMatchBreakdown {
  const { title, receiver, recommender, confidenceScore = 80, recommenderAffinity, crewSignalScore, matchedFactors } = params;

  const contentPref = calculateContentPreferenceMatch({ title, preferences: params.preferences });
  
  const weightedScore = 
    (contentPref.score * 0.45) + 
    (recommenderAffinity * 0.35) + 
    (crewSignalScore * 0.15) + 
    (confidenceScore * 0.05);

  const roundedScore = Math.round(weightedScore);

  // Build explanation bullets
  const explanationBullets = [...contentPref.matchedFactors];
  if (recommenderAffinity >= 85) explanationBullets.push(`${recommender?.displayName || 'The recommender'} usually gets your taste`);
  if (crewSignalScore >= 70) explanationBullets.push("Popular with your crew");

  return {
    titleId: title.id,
    receiverId: receiver.id,
    recommenderId: recommender?.id,
    tasteMatchScore: roundedScore,
    contentPreferenceMatch: contentPref.score,
    recommenderAffinity,
    crewSignal: crewSignalScore,
    recommenderConfidence: confidenceScore,
    signalConfidence: recommenderAffinity > 80 ? 'strong' : recommenderAffinity > 60 ? 'some' : 'new',
    explanationBullets: explanationBullets.slice(0, 4),
    calculatedAt: new Date().toISOString(),
  };
}

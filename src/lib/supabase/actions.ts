'use server';

import { createClient } from './server';
import { Title } from '../types';
import { getTitleDetails } from '../tmdb';

/**
 * Ensures a TMDB title is cached in our local Supabase database
 * before we attempt to create recommendations or activity linked to it.
 */
export async function ensureTitleExistsInDb(title: Title) {
  const supabase = await createClient();
  
  if (!supabase) {
    console.warn('Supabase not configured, skipping title sync.');
    return { success: true }; // Fallback for mock mode
  }

  try {
    // Enrich with details if missing (cast/director)
    let enrichedTitle = { ...title };
    if ((!title.cast || title.cast.length === 0) && title.tmdbId) {
      const details = await getTitleDetails(title.tmdbId, title.type === 'movie' ? 'movie' : 'series');
      enrichedTitle = { ...title, ...details };
    }

    const { error } = await supabase
      .from('titles')
      .upsert({
        id: enrichedTitle.id,
        title: enrichedTitle.title,
        type: enrichedTitle.type,
        poster_url: enrichedTitle.posterUrl || null,
        backdrop_url: enrichedTitle.backdropUrl || null,
        poster_gradient: enrichedTitle.posterGradient,
        release_year: enrichedTitle.releaseYear,
        genres: enrichedTitle.genres,
        runtime: enrichedTitle.runtime || null,
        overview: enrichedTitle.overview,
        external_rating: enrichedTitle.externalRating,
        platforms: enrichedTitle.platforms || [],
        format: enrichedTitle.format || 'Movie',
        language: enrichedTitle.language || null,
        cast_data: enrichedTitle.cast || [],
        director_data: enrichedTitle.directorOrCreatorProfile || {},
        watch_providers: enrichedTitle.platformAvailability || []
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Failed to sync title to Supabase:', error);
      return { success: false, error };
    }

    return { success: true, title: enrichedTitle };
  } catch (err) {
    console.error('Exception syncing title:', err);
    return { success: false, error: err };
  }
}

/**
 * Saves a recommendation to Supabase and links it to target users
 */
export async function saveRecommendation(rec: any, targetUserIds: string[]) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { data, error: recError } = await supabase
      .from('recommendations')
      .insert({
        title_id: rec.titleId,
        group_id: rec.groupId || null,
        recommended_by: rec.recommendedBy,
        reason: rec.reason,
        confidence_score: rec.confidenceScore,
        mood_tags: rec.moodTags,
        primary_stamp: rec.primaryStamp,
        verdict_state: 'verdict_pending',
        recommended_to_group: rec.recommendedToGroup
      })
      .select()
      .single();

    if (recError) throw recError;

    // Link to target users if direct rec
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

    return { success: true, data };
  } catch (err) {
    console.error('Error saving recommendation:', err);
    return { success: false, error: err };
  }
}

/**
 * Saves a rating (verdict) to Supabase
 */
export async function saveRating(rating: any) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

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
      .update({ verdict_state: 'verdict_given' })
      .eq('id', rating.recommendationId);

    return { success: true, data };
  } catch (err) {
    console.error('Error saving rating:', err);
    return { success: false, error: err };
  }
}

/**
 * Adds an item to the user's watchlist
 */
export async function saveWatchlistItem(userId: string, titleId: string, addedBy: string = 'self') {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { data, error } = await supabase
      .from('watchlist_items')
      .upsert({
        user_id: userId,
        title_id: titleId,
        added_by: addedBy
      }, { onConflict: 'user_id,title_id' })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error saving watchlist item:', err);
    return { success: false, error: err };
  }
}

/**
 * Connects two users (Crew)
 */
export async function saveUserConnection(userId: string, connectedUserId: string) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { data, error } = await supabase
      .from('user_connections')
      .upsert({
        user_id: userId,
        connected_user_id: connectedUserId,
        status: 'connected'
      }, { onConflict: 'user_id,connected_user_id' })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error saving connection:', err);
    return { success: false, error: err };
  }
}

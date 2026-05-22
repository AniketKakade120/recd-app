'use server';

import { createClient } from './server';
import { Title } from '../types';
import { getTitleDetails } from '../tmdb';
import { headers } from 'next/headers';

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
        status: 'verdict_pending',
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
      .update({ status: 'verdict_given' })
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
 * Removes an item from the user's watchlist
 */
export async function deleteWatchlistItem(userId: string, titleId: string) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { error } = await supabase
      .from('watchlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('title_id', titleId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting watchlist item:', err);
    return { success: false, error: err };
  }
}

/**
 * Sends a Crew Request to another user
 */
export async function sendCrewRequest(receiverId: string, message?: string) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    if (user.id === receiverId) throw new Error('You cannot add yourself to your crew');

    // 1. Check if already connected
    const { data: existingConn } = await supabase
      .from('crew_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('crew_member_id', receiverId)
      .maybeSingle();
    
    if (existingConn) {
      return { success: true, alreadyConnected: true };
    }

    // 2. Check for reverse pending request (Product logic: If they requested you, just accept it)
    const { data: reverseReq } = await supabase
      .from('crew_requests')
      .select('id')
      .eq('sender_id', receiverId)
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .maybeSingle();
    
    if (reverseReq) {
      return await acceptCrewRequest(reverseReq.id);
    }

    // 3. Create the request
    const { data, error } = await supabase
      .from('crew_requests')
      .upsert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: 'pending',
        message: message || null,
        source: 'direct',
        updated_at: new Date().toISOString()
      }, { onConflict: 'sender_id,receiver_id' })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (err: any) {
    console.error('Error sending crew request:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Accepts a Crew Request via secure RPC
 */
export async function acceptCrewRequest(requestId: string) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { data, error } = await supabase.rpc('accept_crew_request', {
      request_id: requestId
    });

    if (error) throw error;
    
    return { 
      success: true, 
      message: 'You are now in each other’s crew.' 
    };
  } catch (err: any) {
    console.error('Error accepting crew request:', err);
    return { 
      success: false, 
      error: 'Couldn’t accept request. Please try again.' 
    };
  }
}

/**
 * Rejects a Crew Request
 */
export async function rejectCrewRequest(requestId: string) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('crew_requests')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('receiver_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error rejecting crew request:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Removes a member from Crew (Reciprocal)
 */
export async function removeCrewMember(memberId: string) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Delete both directions
    const { error } = await supabase
      .from('crew_connections')
      .delete()
      .or(`and(user_id.eq.${user.id},crew_member_id.eq.${memberId}),and(user_id.eq.${memberId},crew_member_id.eq.${user.id})`);

    if (error) throw error;
    
    // Also mark request as cancelled/none if it exists
    await supabase
      .from('crew_requests')
      .delete()
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${memberId}),and(sender_id.eq.${memberId},receiver_id.eq.${user.id})`);

    return { success: true };
  } catch (err: any) {
    console.error('Error removing crew member:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Creates a new Crew Invite link
 */
export async function createCrewInvite() {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Dynamic host detection to ensure invite links always match the active domain (including Vercel previews)
    let appUrl = 'https://recd-app.vercel.app';
    try {
      const headersList = await headers();
      const host = headersList.get('host');
      const proto = headersList.get('x-forwarded-proto') || 'https';
      if (host) {
        appUrl = `${proto}://${host}`;
      }
    } catch (e) {
      console.warn('Could not read request headers inside createCrewInvite, using fallback:', e);
      appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://recd-app.vercel.app';
    }

    const inviteUrl = `${appUrl}/invite/crew/${inviteCode}`;

    const { data, error } = await supabase
      .from('invites')
      .insert({
        invite_type: 'crew',
        invited_by: user.id,
        invite_code: inviteCode,
        invite_url: inviteUrl,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error creating crew invite:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Accepts a Crew Invite by code via secure RPC
 */
export async function acceptCrewInvite(inviteCode: string) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, requires_auth: true };

    const { data, error } = await supabase.rpc('accept_crew_invite', {
      invite_code_input: inviteCode
    });

    if (error) {
      if (error.message.includes('Invite not found')) return { success: false, errorCode: 'NOT_FOUND', message: 'This invite link is invalid.' };
      if (error.message.includes('Invite is not active')) return { success: false, errorCode: 'INACTIVE', message: 'This invite has expired.' };
      if (error.message.includes('Cannot accept own invite')) return { success: false, errorCode: 'OWN_INVITE', message: 'You cannot accept your own invite.' };
      throw error;
    }

    return { 
      success: true, 
      alreadyConnected: data?.already_connected || false,
      message: data?.already_connected ? 'You’re already in each other’s crew.' : 'You’re now in each other’s crew.'
    };
  } catch (err: any) {
    console.error('Error accepting crew invite:', err);
    return { success: false, error: 'Couldn’t join crew. Please try again.' };
  }
}

/**
 * Gets the connection state between current user and target user
 */
export async function getCrewState(targetUserId: string) {
  const supabase = await createClient();
  if (!supabase) return 'none';

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === targetUserId) return 'none';

    // Check connection first
    const { data: connection } = await supabase
      .from('crew_connections')
      .select('status')
      .eq('user_id', user.id)
      .eq('crew_member_id', targetUserId)
      .maybeSingle();

    if (connection) return 'connected';

    // Check requests
    const { data: request } = await supabase
      .from('crew_requests')
      .select('status, sender_id')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
      .maybeSingle();

    if (request) {
      if (request.status === 'accepted') return 'connected';
      if (request.status === 'pending') {
        return request.sender_id === user.id ? 'pending_sent' : 'pending_received';
      }
      if (request.status === 'rejected') return 'rejected';
    }

    return 'none';
  } catch (err) {
    return 'none';
  }
}
/**
 * Creates a new watchlist list
 */
export async function createWatchlistList(userId: string, data: any) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    // Generate a simple slug for sharing
    const shareSlug = `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;

    const { data: newList, error } = await supabase
      .from('watchlist_lists')
      .insert({
        user_id: userId,
        name: data.name,
        description: data.description,
        privacy: data.privacy || 'private',
        cover_style: data.coverStyle || 'gradient',
        share_slug: shareSlug
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: newList };
  } catch (err: any) {
    console.error('Error creating watchlist list:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Adds a title to a custom list
 */
export async function addTitleToListDb(titleId: string, listId: string) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { error } = await supabase
      .from('watchlist_list_items')
      .upsert({
        list_id: listId,
        title_id: titleId
      }, { onConflict: 'list_id,title_id' });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error adding title to list:', err);
    return { success: false, error: err };
  }
}

/**
 * Removes a title from a custom list
 */
export async function removeTitleFromListDb(titleId: string, listId: string) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { error } = await supabase
      .from('watchlist_list_items')
      .delete()
      .eq('list_id', listId)
      .eq('title_id', titleId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error removing title from list:', err);
    return { success: false, error: err };
  }
}

/**
 * Updates a watchlist list's metadata
 */
export async function updateWatchlistListDb(listId: string, data: any) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { error } = await supabase
      .from('watchlist_lists')
      .update({
        name: data.name,
        description: data.description,
        privacy: data.privacy,
        cover_style: data.coverStyle,
        updated_at: new Date().toISOString()
      })
      .eq('id', listId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error updating watchlist list:', err);
    return { success: false, error: err };
  }
}

/**
 * Deletes a watchlist list
 */
export async function deleteWatchlistListDb(listId: string) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { error } = await supabase
      .from('watchlist_lists')
      .delete()
      .eq('id', listId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting watchlist list:', err);
    return { success: false, error: err };
  }
}

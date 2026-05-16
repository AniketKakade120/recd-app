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

    const { data, error } = await supabase
      .from('crew_requests')
      .upsert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: 'pending',
        message: message || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'sender_id,receiver_id' })
      .select()
      .single();

    if (error) throw error;

    // Create notification for receiver
    await supabase.from('notifications').insert({
      user_id: receiverId,
      actor_id: user.id,
      type: 'crew_request_received',
      title: 'New Crew Request',
      body: 'Someone wants to join your crew.',
      resource_id: data.id
    });

    return { success: true, data };
  } catch (err: any) {
    console.error('Error sending crew request:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Accepts a Crew Request
 */
export async function acceptCrewRequest(requestId: string) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 1. Get the request details
    const { data: request, error: fetchError } = await supabase
      .from('crew_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) throw new Error('Request not found');
    if (request.receiver_id !== user.id) throw new Error('Not authorized to accept this request');

    // 2. Update request status
    const { error: updateError } = await supabase
      .from('crew_requests')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // 3. Create mutual connections
    const { error: connError } = await supabase
      .from('crew_connections')
      .upsert([
        { user_id: request.sender_id, crew_member_id: request.receiver_id, status: 'accepted' },
        { user_id: request.receiver_id, crew_member_id: request.sender_id, status: 'accepted' }
      ], { onConflict: 'user_id,crew_member_id' });

    if (connError) throw connError;

    // 4. Create notification for sender
    await supabase.from('notifications').insert({
      user_id: request.sender_id,
      actor_id: user.id,
      type: 'crew_request_accepted',
      title: 'Crew Request Accepted',
      body: 'You are now in each other\'s crew.',
      resource_id: request.id
    });

    return { success: true };
  } catch (err: any) {
    console.error('Error accepting crew request:', err);
    return { success: false, error: err.message || 'Unknown error' };
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
 * Accepts a Crew Invite by code
 */
export async function acceptCrewInvite(inviteCode: string) {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, requires_auth: true };

    // 1. Get the invite
    const { data: invite, error: fetchError } = await supabase
      .from('invites')
      .select('*')
      .eq('invite_code', inviteCode)
      .eq('status', 'active')
      .single();

    if (fetchError || !invite) throw new Error('Invite not found or expired');
    if (invite.invited_by === user.id) throw new Error('You cannot accept your own invite');

    // 2. Create mutual connections
    const { error: connError } = await supabase
      .from('crew_connections')
      .upsert([
        { user_id: invite.invited_by, crew_member_id: user.id, status: 'accepted' },
        { user_id: user.id, crew_member_id: invite.invited_by, status: 'accepted' }
      ], { onConflict: 'user_id,crew_member_id' });

    if (connError) throw connError;

    // 3. Mark invite as accepted (if needed, or keep active for multi-use)
    // For MVP, we can keep it active but track the join in a separate table if we want.
    // Let's just create a notification for the inviter.
    await supabase.from('notifications').insert({
      user_id: invite.invited_by,
      actor_id: user.id,
      type: 'crew_request_accepted',
      title: 'New Crew Member',
      body: 'Someone joined your crew via invite link.',
      resource_id: invite.id
    });

    return { success: true };
  } catch (err: any) {
    console.error('Error accepting crew invite:', err);
    return { success: false, error: err.message || 'Unknown error' };
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

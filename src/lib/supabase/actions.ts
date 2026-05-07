'use server';

import { createClient } from './server';
import { Title } from '../types';

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
    const { error } = await supabase
      .from('titles')
      .upsert({
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
        format: title.format || 'Movie'
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Failed to sync title to Supabase:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception syncing title:', err);
    return { success: false, error: err };
  }
}

import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { 
  mockUsers, 
  mockGroups, 
  mockGroupMembers, 
  mockRecommendations, 
  mockTitles, 
  mockRatings,
  mockActivity 
} from '@/lib/mock-data';

export async function GET() {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    console.log('Starting seed...');

    // 1. Seed Users
    const { error: userError } = await supabase
      .from('users')
      .upsert(mockUsers.map(u => ({
        id: u.id,
        username: u.username,
        display_name: u.displayName,
        avatar_url: u.avatarUrl,
        bio: u.bio,
        taste_archetype: u.tasteArchetype
      })));
    if (userError) throw userError;

    // 2. Seed Titles
    const { error: titleError } = await supabase
      .from('titles')
      .upsert(mockTitles.map(t => ({
        id: t.id,
        title: t.title,
        type: t.type,
        poster_url: t.posterUrl,
        backdrop_url: t.backdropUrl,
        poster_gradient: t.posterGradient,
        release_year: t.releaseYear,
        genres: t.genres,
        runtime: t.runtime,
        overview: t.overview,
        external_rating: t.externalRating
      })));
    if (titleError) throw titleError;

    // 3. Seed Groups
    const { error: groupError } = await supabase
      .from('groups')
      .upsert(mockGroups.map(g => ({
        id: g.id,
        name: g.name,
        vibe: g.vibe,
        description: g.description,
        invite_code: g.inviteCode,
        created_by: g.createdBy,
        avatar_gradient: g.avatarGradient
      })));
    if (groupError) throw groupError;

    // 4. Seed Group Members
    const { error: memberError } = await supabase
      .from('group_members')
      .upsert(mockGroupMembers.map(gm => ({
        id: gm.id,
        group_id: gm.groupId,
        user_id: gm.userId,
        role: gm.role
      })));
    if (memberError) throw memberError;

    // 5. Seed Recommendations
    const { error: recError } = await supabase
      .from('recommendations')
      .upsert(mockRecommendations.map(r => ({
        id: r.id,
        title_id: r.titleId,
        group_id: r.groupId,
        recommended_by: r.recommendedBy,
        reason: r.reason,
        confidence_score: r.confidenceScore,
        mood_tags: r.moodTags,
        status: r.status,
        primary_stamp: r.primaryStamp
      })));
    if (recError) throw recError;

    // 6. Seed Ratings
    const { error: ratingError } = await supabase
      .from('ratings')
      .upsert(mockRatings.map(r => ({
        id: r.id,
        recommendation_id: r.recommendationId,
        rated_by: r.ratedBy,
        content_rating: r.contentRating,
        recommendation_result: r.recommendationResult,
        stamp: r.stamp,
        comment: r.comment
      })));
    if (ratingError) throw ratingError;

    // 7. Seed Activity
    const { error: activityError } = await supabase
      .from('activity')
      .upsert(mockActivity.map(a => ({
        id: a.id,
        type: a.type,
        user_id: a.userId,
        target_user_id: a.targetUserId,
        title_id: a.titleId,
        group_id: a.groupId,
        recommendation_id: a.recommendationId,
        message: a.message,
        created_at: a.createdAt
      })));
    if (activityError) throw activityError;

    return NextResponse.json({ success: true, message: 'Database seeded successfully with mock data!' });
  } catch (err: any) {
    console.error('Seeding error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

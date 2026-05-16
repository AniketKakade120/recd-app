import {
  Recommendation, 
  VerdictState, 
  User, 
  ViewerContext, 
  ViewerRole, 
  Rating 
} from '../types';

/**
 * Determines the viewer's context relative to a recommendation
 */
export function getRecommendationViewerContext(
  currentUser: User | null,
  recommendation: Recommendation,
  ratings: Rating[] = []
): ViewerContext {
  if (!currentUser) {
    return {
      viewerRole: 'outsider',
      isRecommender: false,
      isReceiver: false,
      hasRated: false,
      verdictState: recommendation.verdictState,
      canGiveVerdict: false,
      canViewVerdict: recommendation.verdictState === 'verdict_given',
      canEditVerdict: false,
      canSave: true,
    };
  }

  const isRecommender = recommendation.recommendedBy === currentUser.id;
  const isReceiver = recommendation.recommendedToUserIds?.includes(currentUser.id) || false;
  
  // Find if this viewer has rated this specific recommendation
  const viewerRating = ratings.find(r => r.recommendationId === recommendation.id && r.ratedBy === currentUser.id);
  const hasRated = !!viewerRating;

  let viewerRole: ViewerRole = 'outsider';
  if (isRecommender) viewerRole = 'recommender';
  else if (isReceiver) viewerRole = hasRated ? 'ratedReceiver' : 'receiver';
  else if (recommendation.groupId) viewerRole = 'groupMember';

  const verdictState = recommendation.verdictState;

  return {
    viewerRole,
    isRecommender,
    isReceiver,
    hasRated,
    verdictState,
    
    // Simplified Permission Matrix
    canGiveVerdict: isReceiver && (verdictState as VerdictState) === 'verdict_pending' && !hasRated,
    canViewVerdict: (verdictState as VerdictState) === 'verdict_given' || (isRecommender && (verdictState as VerdictState) === 'verdict_given') || (viewerRole === 'groupMember' && (verdictState as VerdictState) === 'verdict_given'),
    canEditVerdict: isReceiver && hasRated,
    canSave: (verdictState as VerdictState) === 'verdict_pending',
  };
}

export interface RecommendationAction {
  label: string;
  action: string;
  variant: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  icon?: string;
}

export interface ActionSet {
  primary?: RecommendationAction;
  secondary?: RecommendationAction;
  tertiary?: RecommendationAction;
}

/**
 * Returns the CTA matrix for a recommendation based on receiver status and viewer role
 */
export function getRecommendationActions(
  verdictState: VerdictState,
  role: ViewerRole
): ActionSet {
  // Recommenders see outcome
  if (role === 'recommender') {
    if (verdictState === 'verdict_given') {
      return {
        primary: { label: 'View Verdict', action: 'view_verdict', variant: 'primary' }
      };
    }
    return {
      primary: { label: 'View Details', action: 'view_details', variant: 'primary' },
      secondary: { label: 'Nudge', action: 'nudge', variant: 'ghost' }
    };
  }

  // Outsiders or Group Members (not the target)
  if (role === 'outsider' || role === 'groupMember') {
    if (verdictState === 'verdict_given') {
      return {
        primary: { label: 'View Verdict', action: 'view_verdict', variant: 'primary' }
      };
    }
    return {
      primary: { label: 'View Details', action: 'view_details', variant: 'primary' },
      secondary: { label: 'Save', action: 'save', variant: 'secondary' }
    };
  }

  // Receivers (The core loop: Give vs View)
  switch (verdictState) {
    case 'verdict_pending':
      return {
        primary: { label: 'Give Verdict', action: 'rate', variant: 'primary' },
        secondary: { label: 'Save', action: 'save', variant: 'secondary' }
      };
    
    case 'verdict_given':
      return {
        primary: { label: 'View Verdict', action: 'view_verdict', variant: 'primary' },
        secondary: { label: 'Edit Verdict', action: 'edit_verdict', variant: 'secondary' }
      };
    
    default:
      return {
        primary: { label: 'View Details', action: 'view_details', variant: 'primary' }
      };
  }
}

export type WatchlistItemType = 'manually_saved' | 'recommended_pending_verdict' | 'recommended_verdict_given';

/**
 * Categorizes a watchlist item for UI/UX purposes
 */
export function getWatchlistItemType(item: any): WatchlistItemType {
  if (!item.addedFromRecommendationId && item.addedBy === 'self') {
    return 'manually_saved';
  }
  if (item.verdictState === 'verdict_given') {
    return 'recommended_verdict_given';
  }
  return 'recommended_pending_verdict';
}

/**
 * Returns the correct CTA matrix for a watchlist item
 */
export function getWatchlistItemActions(item: any): ActionSet {
  const type = getWatchlistItemType(item);

  switch (type) {
    case 'manually_saved':
      return {
        primary: { label: 'View', action: 'view', variant: 'primary' },
        secondary: { label: 'Recommend', action: 'recommend', variant: 'secondary' }
      };

    case 'recommended_pending_verdict':
      return {
        primary: { label: 'Give Verdict', action: 'rate', variant: 'primary' },
        secondary: { label: 'Move to list', action: 'move_to_list', variant: 'secondary' }
      };

    case 'recommended_verdict_given':
      return {
        primary: { label: 'View Verdict', action: 'view_verdict', variant: 'primary' },
        secondary: { label: 'Edit Verdict', action: 'edit_verdict', variant: 'secondary' }
      };

    default:
      return {
        primary: { label: 'View', action: 'view', variant: 'primary' }
      };
  }
}

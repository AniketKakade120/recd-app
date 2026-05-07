'use client';

import { RecommendationStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: RecommendationStatus;
  className?: string;
}

const statusConfig: Record<RecommendationStatus, { label: string; classes: string }> = {
  pending: { label: 'Pending', classes: 'bg-bone/8 text-bone/70 border-bone/15' },
  accepted: { label: 'Accepted', classes: 'bg-cinema-red/10 text-cinema-red border-cinema-red/20' },
  watching: { label: 'Watching', classes: 'bg-bone/8 text-bone/70 border-bone/15' },
  watched: { label: 'Watched', classes: 'bg-cinema-red/10 text-cinema-red/80 border-cinema-red/20' },
  rated: { label: 'Rated', classes: 'bg-cinema-red/15 text-cinema-red border-cinema-red/30' },
  maybe_later: { label: 'Later', classes: 'bg-muted/10 text-muted border-muted/20' },
  not_my_vibe: { label: 'Passed', classes: 'bg-muted/10 text-muted border-muted/20' },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${config.classes} ${className}`}>
      {config.label}
    </span>
  );
}

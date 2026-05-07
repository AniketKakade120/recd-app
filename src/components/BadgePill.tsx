'use client';

import { BadgeType } from '@/lib/types';
import StampBadge from './StampBadge';

interface BadgePillProps {
  badge: BadgeType;
  className?: string;
}

// Backward-compatible wrapper around StampBadge
export default function BadgePill({ badge, className = '' }: BadgePillProps) {
  return <StampBadge stamp={badge} size="md" variant="outline" className={className} />;
}

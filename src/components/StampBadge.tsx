'use client';

import type { BadgeType } from '@/lib/types';

interface StampBadgeProps {
  stamp: BadgeType;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'circular'; 
  className?: string;
}

const SIZE_CLASSES: Record<string, string> = {
  xs: 'px-2 py-0.5 text-[9px]',
  sm: 'px-3 py-1 text-[10px]',
  md: 'px-3.5 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
};

export default function StampBadge({ stamp, size = 'sm', variant = 'outline', className = '' }: StampBadgeProps) {
  
  // Determine color scheme based on stamp category
  let colorClasses = 'bg-ink border-border text-bone/80'; // default neutral
  
  const positive = ['Certified Good Call', 'Worth It', 'Crew Pick', 'Risky But Worth It'];
  const negative = ['Not For Everyone', 'Missed The Mark'];
  
  if (positive.includes(stamp)) {
    colorClasses = 'bg-cinema-red text-bone border-cinema-red';
  } else if (negative.includes(stamp)) {
    colorClasses = 'bg-neutral-800 text-bone border-neutral-700';
  } else {
    // Achievements / neutral
    colorClasses = 'bg-surface border-border text-bone';
  }

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;

  return (
    <span className={`inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-full border ${sizeClass} ${colorClasses} ${className}`}>
      {stamp}
    </span>
  );
}

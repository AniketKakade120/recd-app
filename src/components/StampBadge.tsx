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
    colorClasses = 'bg-cinema-red/90 text-bone border-cinema-red/50 shadow-[0_0_15px_rgba(234,51,51,0.3)]';
  } else if (negative.includes(stamp)) {
    colorClasses = 'bg-white/5 backdrop-blur-md text-muted border-white/10';
  } else {
    // Achievements / neutral
    colorClasses = 'bg-white/5 backdrop-blur-md border-white/10 text-bone';
  }

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;

  return (
    <span className={`inline-flex items-center justify-center font-black uppercase tracking-[0.1em] rounded-lg border backdrop-blur-md transition-all duration-300 ${sizeClass} ${colorClasses} ${className}`}>
      {stamp}
    </span>
  );
}

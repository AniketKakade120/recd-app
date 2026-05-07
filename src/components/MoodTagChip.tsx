'use client';

import { MoodTag } from '@/lib/types';

interface MoodTagChipProps {
  tag: MoodTag | string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function MoodTagChip({ tag, selected = false, onClick, className = '' }: MoodTagChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg border transition-all btn-press ${
        selected
          ? 'bg-cinema-red border-cinema-red text-bone'
          : 'bg-surface border-border text-muted hover:border-bone/20 hover:text-bone'
      } ${className}`}
    >
      {tag}
    </button>
  );
}

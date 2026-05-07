'use client';

import { RecAccuracy } from '@/lib/types';

interface ReactionChipProps {
  tag: RecAccuracy | string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const reactionIcons: Record<string, string> = {
  'Nailed it': '🎯',
  'Pretty close': '👌',
  'Not for me': '🤷',
};

export default function ReactionChip({ tag, selected = false, onClick, className = '' }: ReactionChipProps) {
  const icon = reactionIcons[tag] || '•';
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all btn-press
        ${selected
          ? 'bg-cinema-red border-cinema-red text-bone'
          : 'bg-surface border-border text-muted hover:border-bone/20 hover:text-bone'
        } ${className}`}
    >
      <span>{icon}</span>
      <span>{tag}</span>
    </button>
  );
}

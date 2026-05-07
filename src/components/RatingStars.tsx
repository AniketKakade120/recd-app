'use client';

import { useState } from 'react';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export default function RatingStars({ value, onChange, readonly = false, size = 'md', className = '' }: RatingStarsProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className={`flex gap-1 ${className}`} role="group" aria-label="Rating stars">
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={`${sizes[size]} transition-all ${
              readonly ? 'cursor-default' : 'cursor-pointer btn-press hover:scale-110'
            } ${filled ? 'text-cinema-red' : 'text-border'}`}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

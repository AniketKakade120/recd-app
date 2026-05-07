'use client';

import { getConfidenceLabel } from '@/lib/types';

interface ConfidenceSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export default function ConfidenceSlider({ value, onChange, className = '' }: ConfidenceSliderProps) {
  const label = getConfidenceLabel(value);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">Taste match</span>
        <span className="text-sm font-semibold text-cinema-red">{value}% — {label}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
        aria-label="Taste match score"
      />
      <div className="flex justify-between text-xs text-muted/60">
        <span>Low match</span>
        <span>Possible</span>
        <span>Strong</span>
        <span>Perfect</span>
      </div>
    </div>
  );
}

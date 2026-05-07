'use client';

import { getTasteLabel } from '@/lib/types';

interface TasteScoreCardProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { width: 80, stroke: 5, fontSize: 'text-lg', labelSize: 'text-xs', tierSize: 'text-sm' },
  md: { width: 120, stroke: 6, fontSize: 'text-3xl', labelSize: 'text-xs', tierSize: 'text-xs' },
  lg: { width: 160, stroke: 8, fontSize: 'text-4xl', labelSize: 'text-sm', tierSize: 'text-xs' },
};

export default function TasteScoreCard({ score, label = 'Taste Score', size = 'md', className = '' }: TasteScoreCardProps) {
  const config = sizeConfig[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const tierLabel = getTasteLabel(score);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg width={config.width} height={config.width} className="-rotate-90">
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={config.stroke}
          />
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="var(--cinema-red)"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="animate-score"
            style={{ filter: 'drop-shadow(0 0 8px rgba(236, 32, 32, 0.3))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${config.fontSize} font-bold text-bone font-editorial`}>{score}</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className={`${config.tierSize} font-semibold text-cinema-red`}>{tierLabel}</span>
        <span className={`${config.labelSize} text-muted font-medium`}>{label}</span>
      </div>
    </div>
  );
}

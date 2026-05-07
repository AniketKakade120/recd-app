'use client';

interface TasteScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const SIZES = {
  sm: { svg: 64, r: 26, stroke: 4, text: 'text-lg' },
  md: { svg: 100, r: 42, stroke: 6, text: 'text-2xl' },
  lg: { svg: 140, r: 58, stroke: 7, text: 'text-3xl' },
};

export default function TasteScoreRing({ score, size = 'md', label }: TasteScoreRingProps) {
  const { svg, r, stroke, text } = SIZES[size];
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const cx = svg / 2;

  const color = score >= 80 ? '#E02020' : score >= 65 ? '#E02020' : '#A6A19A';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: svg, height: svg }}>
        <svg width={svg} height={svg} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
          <circle
            cx={cx} cy={cx} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="animate-score"
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${text} font-bold text-bone font-editorial`}>{score}</span>
          <span className="text-xs text-muted uppercase tracking-wider">taste</span>
        </div>
      </div>
      {label && <p className="text-xs text-muted text-center">{label}</p>}
    </div>
  );
}

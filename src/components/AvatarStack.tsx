'use client';

interface AvatarStackProps {
  names: string[];
  max?: number;
  size?: 'xs' | 'sm' | 'md';
}

const COLORS = ['bg-brick', 'bg-[#1a2d3d]', 'bg-[#1a2d1a]', 'bg-[#2d1a2d]', 'bg-[#2d2510]'];

const SIZES = {
  xs: 'w-5 h-5 text-sm -ml-1.5',
  sm: 'w-7 h-7 text-sm -ml-2',
  md: 'w-9 h-9 text-xs -ml-2.5',
};

export default function AvatarStack({ names, max = 4, size = 'sm' }: AvatarStackProps) {
  const shown = names.slice(0, max);
  const overflow = names.length - max;

  return (
    <div className="flex items-center">
      {shown.map((name, i) => {
        const initials = name.slice(0, 1).toUpperCase();
        const color = COLORS[i % COLORS.length];
        return (
          <div key={name}
            className={`${SIZES[size]} ${color} text-bone rounded-full flex items-center justify-center font-bold shrink-0 border-2 border-ink first:ml-0 ${size === 'xs' ? '-ml-1.5' : size === 'sm' ? '-ml-2' : '-ml-2.5'}`}
            style={{ zIndex: shown.length - i }}>
            {initials}
          </div>
        );
      })}
      {overflow > 0 && (
        <div className={`${SIZES[size]} bg-warm-grey text-muted rounded-full flex items-center justify-center font-bold shrink-0 border-2 border-ink ${size === 'xs' ? '-ml-1.5' : size === 'sm' ? '-ml-2' : '-ml-2.5'}`}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

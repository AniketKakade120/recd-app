'use client';

const AVATAR_COLORS = [
  'bg-brick text-bone',
  'bg-[#1a2d3d] text-bone',
  'bg-[#1a2d1a] text-bone',
  'bg-[#2d1a2d] text-bone',
  'bg-[#2d2510] text-bone',
  'bg-warm-grey text-bone',
];

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  xs: 'w-5 h-5 text-xs',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
  xl: 'w-16 h-16 text-xl',
};

export default function UserAvatar({ name, avatarUrl, size = 'md', className = '' }: UserAvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colorClass = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt={name} className={`${SIZES[size]} rounded-full object-cover ${className}`} />
    );
  }

  return (
    <div className={`${SIZES[size]} ${colorClass} rounded-full flex items-center justify-center font-bold shrink-0 ${className}`}>
      {initials}
    </div>
  );
}

'use client';

import Link from 'next/link';
import UserAvatar from './UserAvatar';

interface ClickableUserAvatarProps {
  userId: string;
  username: string;
  name: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
}

export default function ClickableUserAvatar({
  userId,
  username,
  name,
  avatarUrl,
  size = 'md',
  showBadge = false,
  className = '',
}: ClickableUserAvatarProps) {
  return (
    <Link 
      href={`/profile/${username}`}
      className={`block hover:opacity-80 transition-opacity active:scale-95 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <UserAvatar 
        name={name} 
        avatarUrl={avatarUrl} 
        size={size} 
        showBadge={showBadge} 
      />
    </Link>
  );
}

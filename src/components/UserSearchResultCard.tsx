'use client';

import UserAvatar from './UserAvatar';
import AddToCrewButton from './AddToCrewButton';
import Link from 'next/link';

interface SearchResultUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  tasteArchetype: string;
  tasteScore: number;
}

interface UserSearchResultCardProps {
  user: SearchResultUser;
}

export default function UserSearchResultCard({ user }: UserSearchResultCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-surface border border-border rounded-2xl hover:border-border-strong transition-all group">
      {/* Avatar */}
      <Link href={`/profile/${user.username}`} className="shrink-0">
        <UserAvatar name={user.displayName} size="md" />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${user.username}`} className="block group/name">
          <h3 className="text-sm font-bold text-bone truncate group-hover/name:text-cinema-red transition-colors">
            {user.displayName}
          </h3>
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest">@{user.username}</p>
        </Link>
        {user.tasteArchetype && (
          <span className="inline-block mt-1.5 px-2 py-0.5 bg-cinema-red/10 border border-cinema-red/20 rounded-md text-[9px] font-bold text-cinema-red uppercase tracking-widest">
            {user.tasteArchetype}
          </span>
        )}
      </div>

      {/* Action */}
      <div className="shrink-0">
        <AddToCrewButton userId={user.id} username={user.username} className="text-xs !px-4 !py-2" />
      </div>
    </div>
  );
}

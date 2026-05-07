'use client';

import { LeaderboardEntry } from '@/lib/types';
import UserAvatar from './UserAvatar';
import StampBadge from './StampBadge';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

export default function LeaderboardRow({ entry, isCurrentUser = false }: LeaderboardRowProps) {
  const getRankDisplay = () => {
    if (entry.rank === 1) return { text: '1', color: 'text-cinema-red' };
    if (entry.rank === 2) return { text: '2', color: 'text-bone/70' };
    if (entry.rank === 3) return { text: '3', color: 'text-bone/50' };
    return { text: String(entry.rank), color: 'text-muted/50' };
  };

  const rank = getRankDisplay();

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
      isCurrentUser ? 'bg-surface border border-cinema-red/20' : 'hover:bg-surface/50 border border-transparent'
    }`}>
      <div className={`w-6 text-center font-bold text-lg font-editorial ${rank.color}`}>
        {rank.text}
      </div>
      
      <UserAvatar name={entry.user.displayName} size="md" />
      
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-bone truncate">{entry.user.displayName}</span>
          {isCurrentUser && <span className="text-sm uppercase tracking-wider bg-cinema-red/15 text-cinema-red px-1.5 py-0.5 rounded font-semibold">You</span>}
        </div>
        <div className="text-xs text-muted truncate">{entry.label}</div>
      </div>
      
      <div className="flex flex-col items-end shrink-0">
        <div className="font-bold text-xl text-cinema-red">{entry.tasteScore}%</div>
        {entry.badge && (
          <div className="hidden sm:block mt-1">
            <StampBadge stamp={entry.badge} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import type { Group } from '@/lib/types';
import { useApp } from '@/lib/context';
import AvatarStack from './AvatarStack';
import StampBadge from './StampBadge';

interface GroupCardProps {
  group: Group;
  showJoin?: boolean;
}

export default function GroupCard({ group, showJoin }: GroupCardProps) {
  const { getGroupMembers, joinGroup } = useApp();
  const members = getGroupMembers(group.id);
  const memberNames = members.map(m => m.displayName);

  return (
    <Link href={`/groups/${group.id}`} className="block group">
      <div className="rounded-2xl bg-surface border border-border hover:border-border-strong card-hover h-full flex flex-col relative overflow-hidden">
        
        {/* Cover Image Banner */}
        <div className={`h-28 w-full relative ${!group.coverImage ? `poster-gradient-${(group.avatarGradient % 10) + 1}` : ''}`}>
          {group.coverImage && <img src={group.coverImage} alt="Cover" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        </div>

        {/* Card Content Area */}
        <div className="px-5 pb-5 pt-0 flex flex-col flex-1 relative z-10 -mt-10">
          
          <div className="flex items-end justify-between mb-3">
            <div className={`w-16 h-16 rounded-xl shadow-lg border-4 border-surface poster-gradient-${group.avatarGradient} shrink-0`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
              group.privacy === 'private'
                ? 'border-border bg-ink text-muted'
                : 'border-cinema-red/30 bg-cinema-red/10 text-cinema-red'
            }`}>
              {group.privacy}
            </span>
          </div>
          
          <h3 className="font-bold text-lg text-bone truncate">{group.name}</h3>
          <p className="text-xs text-cinema-red/80 font-medium tracking-wide uppercase mt-1">{group.vibe}</p>

          {group.description && (
            <p className="text-sm text-bone/70 my-4 line-clamp-2 leading-relaxed flex-1">{group.description}</p>
          )}

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <AvatarStack names={memberNames} size="sm" max={3} />
              <span className="text-xs font-medium text-muted">{members.length} member{members.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

        {showJoin && (
          <button
            onClick={e => { e.preventDefault(); joinGroup(group.id); }}
            className="w-full mt-3 py-1.5 bg-cinema-red/10 border border-cinema-red/20 text-cinema-red text-xs font-semibold rounded-lg hover:bg-cinema-red hover:text-bone transition-colors btn-press">
            Join Group
          </button>
        )}
        </div>
      </div>
    </Link>
  );
}

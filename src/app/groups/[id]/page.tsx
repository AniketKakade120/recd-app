'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import PageHeader from '@/components/PageHeader';
import RecommendationCard from '@/components/RecommendationCard';
import UserAvatar from '@/components/UserAvatar';
import EmptyState from '@/components/EmptyState';
import InviteModal from '@/components/InviteModal';
import StampBadge from '@/components/StampBadge';

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { getGroup, getGroupMembers, getGroupRecommendations } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'watched'>('all');
  const [inviteOpen, setInviteOpen] = useState(false);

  const group = getGroup(resolvedParams.id);
  const members = getGroupMembers(resolvedParams.id);
  const allRecommendations = getGroupRecommendations(resolvedParams.id);

  if (!group) {
    return <EmptyState title="Group not found" description="This group doesn't exist or you don't have access." />;
  }

  const recommendations = allRecommendations.filter(rec => {
    if (filter === 'pending') return rec.status === 'pending';
    if (filter === 'watched') return rec.status === 'watched' || rec.status === 'rated';
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader title={group.name} subtitle={group.vibe} backButton action={
        <div className="flex gap-2">
          <button onClick={() => setInviteOpen(true)} className="px-3 py-1.5 bg-surface border border-border text-bone/70 rounded-lg text-xs font-medium hover:bg-surface-hover btn-press">Invite</button>
          <Link href={`/recommend?groupId=${group.id}`} className="px-3 py-1.5 bg-cinema-red text-bone rounded-lg text-xs font-semibold hover:bg-cinema-red/90 btn-press inline-block">Rec to Group</Link>
        </div>
      } />

      {/* Group badge */}
      <div className="flex items-center gap-3">
        <StampBadge stamp="Crew Pick" size="md" />
        {group.description && <p className="text-xs text-muted">{group.description}</p>}
      </div>

      {/* Members */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-bone">Members ({members.length})</h2>
          <button onClick={() => setInviteOpen(true)} className="text-xs text-cinema-red hover:text-cinema-red/80">Invite code: {group.inviteCode}</button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {members.map(member => (
            <div key={member.id} className="flex flex-col items-center gap-1 shrink-0 w-14">
              <UserAvatar name={member.displayName} size="lg" />
              <span className="text-sm text-muted truncate w-full text-center">{member.displayName}</span>
            </div>
          ))}
          <button onClick={() => setInviteOpen(true)} className="flex flex-col items-center gap-1 shrink-0 w-14 group">
            <div className="w-12 h-12 rounded-full border border-dashed border-border flex items-center justify-center text-muted group-hover:border-cinema-red group-hover:text-cinema-red transition-colors">+</div>
            <span className="text-sm text-muted group-hover:text-cinema-red transition-colors">Add</span>
          </button>
        </div>
      </section>

      {/* Filters */}
      <div className="flex gap-1.5 border-b border-border pb-2">
        {(['all', 'pending', 'watched'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-surface text-bone' : 'text-muted hover:text-bone'}`}>
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Watched'}
          </button>
        ))}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map(rec => <RecommendationCard key={rec.id} recommendation={rec} groupContext={resolvedParams.id} />)}
        </div>
      ) : (
        <EmptyState title="No recs yet" description="Be the first to recommend something." inviteCta action={
          <Link href={`/recommend?groupId=${group.id}`} className="text-cinema-red font-medium hover:text-cinema-red/80 text-sm">Recommend something →</Link>
        } />
      )}

      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} groupName={group.name} />
    </div>
  );
}

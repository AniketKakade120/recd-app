'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import PageHeader from '@/components/PageHeader';
import RecommendationCard from '@/components/RecommendationCard';
import UserAvatar from '@/components/UserAvatar';
import EmptyState from '@/components/EmptyState';
import InviteModal from '@/components/InviteModal';
import GroupModal from '@/components/GroupModal';
import StampBadge from '@/components/StampBadge';
import ClickableUserAvatar from '@/components/ClickableUserAvatar';

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { getGroup, getGroupMembers, getGroupRecommendations, openRecommendModal, currentUser, leaveGroup, addToast } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'watched'>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editInitialStep, setEditInitialStep] = useState(1);

  const group = getGroup(resolvedParams.id);
  const members = getGroupMembers(resolvedParams.id);
  const allRecommendations = getGroupRecommendations(resolvedParams.id);

  if (!group) {
    return <EmptyState title="Group not found" description="This group doesn't exist or you don't have access." />;
  }

  const recommendations = allRecommendations.filter(rec => {
    if (filter === 'pending') return rec.verdictState === 'verdict_pending';
    if (filter === 'watched') return rec.verdictState === 'verdict_given';
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title={<span className="text-5xl md:text-6xl">{group.name}</span>}
        subtitle={group.vibe} 
        breadcrumbItems={[
          { label: 'Groups', href: '/groups' },
          { label: group.name, isCurrent: true }
        ]}
        mobileBackLabel="Groups"
        mobileBackHref="/groups"
        action={
          <div className="flex gap-2">
            <button onClick={() => setInviteOpen(true)} className="px-3 py-1.5 bg-surface border border-border text-bone/70 rounded-lg text-xs font-medium hover:bg-surface-hover btn-press">Invite</button>
            <button onClick={() => openRecommendModal({ groupId: group.id })} className="px-3 py-1.5 bg-cinema-red text-bone rounded-lg text-xs font-semibold hover:bg-cinema-red/90 btn-press inline-block">Rec to Group</button>
          </div>
        } 
      />

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
            <div key={member.id} className="flex flex-col items-center gap-1 shrink-0 w-16">
              <ClickableUserAvatar 
                userId={member.id} 
                username={member.username} 
                name={member.displayName} 
                size="lg" 
              />
              <Link 
                href={`/profile/${member.username}`}
                className="text-[10px] font-bold text-muted truncate w-full text-center hover:text-bone transition-colors"
              >
                {member.displayName}
              </Link>
            </div>
          ))}
          {currentUser?.id === group.createdBy && (
            <button onClick={() => { setEditInitialStep(2); setEditModalOpen(true); }} className="flex flex-col items-center gap-1 shrink-0 w-14 group">
              <div className="w-12 h-12 rounded-full border border-dashed border-border flex items-center justify-center text-muted group-hover:border-cinema-red group-hover:text-cinema-red transition-colors">+</div>
              <span className="text-sm text-muted group-hover:text-cinema-red transition-colors">Add</span>
            </button>
          )}
        </div>
      </section>

      {/* Filters */}
      <div className="flex gap-6 border-b border-border pb-px mb-4">
        {(['all', 'pending', 'watched'] as const).map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative ${
              filter === f ? 'text-bone' : 'text-muted hover:text-bone/80'
            }`}
          >
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Watched'}
            {filter === f && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cinema-red rounded-t-full shadow-[0_-2px_10px_rgba(234,51,51,0.5)]" />
            )}
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
          <button onClick={() => openRecommendModal({ groupId: group.id })} className="text-cinema-red font-medium hover:text-cinema-red/80 text-sm">Recommend something →</button>
        } />
      )}

      {/* Danger Zone */}
      {currentUser?.id !== group.createdBy && members.some(m => m.id === currentUser?.id) && (
        <div className="pt-12 pb-8 flex justify-center border-t border-border mt-12">
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to leave this group?')) {
                leaveGroup(group.id);
                addToast('You have left the group.');
                router.push('/groups');
              }
            }} 
            className="text-xs font-bold text-cinema-red/70 hover:text-cinema-red transition-colors uppercase tracking-widest"
          >
            Leave Group
          </button>
        </div>
      )}

      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} groupName={group.name} inviteCode={group.inviteCode} />
      <GroupModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} group={group} initialStep={editInitialStep} />
    </div>
  );
}

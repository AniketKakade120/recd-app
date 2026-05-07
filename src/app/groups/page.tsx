'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import GroupCard from '@/components/GroupCard';
import InviteModal from '@/components/InviteModal';
import { GROUP_VIBES, type GroupVibe } from '@/lib/types';
import { mockGroups } from '@/lib/mock-data';

export default function GroupsPage() {
  const { groups, createGroup, joinGroup, groupMembers, currentUser } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupVibe, setGroupVibe] = useState<GroupVibe>('Movie chaos');
  const [joinCode, setJoinCode] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);

  const myGroupIds = groupMembers.filter(gm => gm.userId === currentUser?.id).map(gm => gm.groupId);
  const myGroups = groups.filter(g => myGroupIds.includes(g.id));
  const discoverGroups = mockGroups.filter(g => g.privacy === 'public' && !myGroupIds.includes(g.id));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    createGroup({
      id: `group-${Date.now()}`, name: groupName, vibe: groupVibe, description: '',
      privacy: 'private', inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdBy: currentUser?.id || 'user-1', createdAt: new Date().toISOString(),
      avatarGradient: Math.ceil(Math.random() * 10),
    });
    setIsCreating(false); setGroupName('');
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const target = groups.find(g => g.inviteCode === joinCode.toUpperCase());
    joinGroup(target?.id || 'group-1');
    setIsJoining(false); setJoinCode('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center py-6 border-b border-border">
        <p className="text-xs text-cinema-red uppercase tracking-widest font-semibold mb-2">Find Your Crew</p>
        <h1 className="text-3xl font-bold text-bone font-editorial mb-2">Great taste is better together.</h1>
        <p className="text-sm text-muted max-w-md mx-auto">Join groups, discover new favorites, and share what&apos;s worth watching.</p>
        <div className="flex justify-center gap-3 mt-5">
          <button onClick={() => { setIsCreating(true); setIsJoining(false); }}
            className="px-5 py-2.5 bg-cinema-red text-bone rounded-xl text-sm font-semibold hover:bg-cinema-red/90 btn-press transition-colors">
            + Create a Group
          </button>
          <button onClick={() => { setIsJoining(true); setIsCreating(false); }}
            className="px-5 py-2.5 bg-surface border border-border text-bone rounded-xl text-sm font-medium hover:bg-surface-hover btn-press transition-colors">
            Join with Code
          </button>
        </div>
      </div>

      {/* Create form */}
      {isCreating && (
        <div className="rounded-2xl bg-surface border border-cinema-red/20 p-5 glow-red page-enter">
          <h3 className="font-bold text-sm mb-4 text-bone">Create a new group</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1">Group Name</label>
              <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Film Chaos Club" autoFocus />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-2">Vibe</label>
              <div className="flex flex-wrap gap-1.5">
                {GROUP_VIBES.map(v => (
                  <button key={v} type="button" onClick={() => setGroupVibe(v)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all btn-press ${
                      groupVibe === v ? 'bg-cinema-red border-cinema-red text-bone' : 'bg-ink border-border text-muted hover:text-bone'
                    }`}>{v}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreating(false)} className="px-3 py-1.5 text-xs text-muted hover:text-bone">Cancel</button>
              <button type="submit" disabled={!groupName.trim()} className="px-5 py-2 bg-cinema-red text-bone rounded-xl text-xs font-semibold disabled:opacity-40 btn-press">Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Join form */}
      {isJoining && (
        <div className="rounded-2xl bg-surface border border-border p-5 page-enter">
          <h3 className="font-bold text-sm mb-4 text-bone">Join a group</h3>
          <form onSubmit={handleJoin} className="flex gap-3">
            <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value)}
              placeholder="Enter invite code" autoFocus className="uppercase flex-1" />
            <button type="submit" disabled={!joinCode.trim()} className="px-5 py-2 bg-cinema-red text-bone rounded-xl text-sm font-semibold disabled:opacity-40 btn-press shrink-0">Join</button>
            <button type="button" onClick={() => setIsJoining(false)} className="px-3 py-2 text-muted text-sm hover:text-bone">✕</button>
          </form>
        </div>
      )}

      {/* My Groups */}
      {myGroups.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-bone mb-4">My Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myGroups.map(g => <GroupCard key={g.id} group={g} />)}
          </div>
        </section>
      )}

      {/* Discover Groups */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-bone">Discover Groups</h2>
          <span className="text-xs text-muted">{discoverGroups.length} public groups</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {discoverGroups.map(g => <GroupCard key={g.id} group={g} showJoin />)}
        </div>
      </section>

      {groups.length === 0 && !isCreating && (
        <div className="py-16 text-center">
          <p className="text-3xl mb-3 opacity-20">✦</p>
          <h3 className="font-bold text-bone mb-1">No groups yet</h3>
          <p className="text-sm text-muted mb-4">Create a group or join one to start recommending.</p>
          <button onClick={() => setInviteOpen(true)}
            className="px-5 py-2.5 bg-cinema-red text-bone rounded-xl text-sm font-semibold btn-press hover:bg-cinema-red/90">
            Invite friends
          </button>
        </div>
      )}

      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}

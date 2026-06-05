'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Group } from '@/lib/types';
import { useApp } from '@/lib/context';
import AvatarStack from './AvatarStack';
import StampBadge from './StampBadge';
import GroupModal from './GroupModal';
import InviteModal from './InviteModal';
import LeaveGroupConfirmModal from './LeaveGroupConfirmModal';

interface GroupCardProps {
  group: Group;
  showJoin?: boolean;
}

export default function GroupCard({ group, showJoin }: GroupCardProps) {
  const { getGroupMembers, joinGroup, leaveGroup, currentUser, deleteGroup, addToast } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  
  const members = getGroupMembers(group.id);
  const memberNames = members.map(m => m.displayName);
  const isOwner = currentUser?.id === group.createdBy;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this group? This cannot be undone.')) {
      deleteGroup(group.id);
      addToast('Group deleted.');
    }
  };

  return (
    <>
    <Link href={`/groups/${group.id}`} className="block group h-full">
      <div className="relative bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cinema-red/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cinema-red/10 flex flex-col h-full">
        
        {/* Cover Image Banner */}
        <div className={`h-24 w-full relative ${!group.coverImage ? `poster-gradient-${(group.avatarGradient % 10) + 1}` : 'bg-surface'}`}>
          {group.coverImage && <img src={group.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
          
          {/* Admin Menu */}
          <div className="absolute top-4 right-4 z-20">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
              className={`p-2 rounded-xl transition-all ${showMenu ? 'bg-bone text-ink shadow-xl' : 'bg-black/20 backdrop-blur-md text-bone hover:bg-black/40'}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-12 w-48 bg-bone rounded-2xl shadow-2xl overflow-hidden z-40 py-1 animate-in fade-in zoom-in-95 duration-200">
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowInviteModal(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-ink text-xs font-bold hover:bg-ink/5 transition-colors text-left"
                  >
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                     Invite to group
                  </button>
                  
                  {isOwner ? (
                    <>
                      <div className="h-px bg-ink/5 my-1" />
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEditModal(true); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-ink text-xs font-bold hover:bg-ink/5 transition-colors text-left"
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                         Edit group
                      </button>
                      <button 
                        onClick={handleDelete}
                        className="w-full flex items-center gap-3 px-4 py-3 text-cinema-red text-xs font-bold hover:bg-cinema-red/5 transition-colors text-left"
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                         Delete group
                      </button>
                    </>
                  ) : members.some(m => m.id === currentUser?.id) ? (
                    <>
                      <div className="h-px bg-ink/5 my-1" />
                      <button 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          setShowLeaveModal(true);
                          setShowMenu(false); 
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-cinema-red text-xs font-bold hover:bg-cinema-red/5 transition-colors text-left"
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                         Leave group
                      </button>
                    </>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card Content Area */}
        <div className="px-6 pb-6 pt-0 flex flex-col flex-1 relative z-10 -mt-12">
          
          <div className="flex items-end justify-between mb-5">
            {/* Dynamic Avatar Cluster replacing the empty square */}
            <div className="w-20 h-20 rounded-[24px] shadow-2xl border-4 border-[#0a0a0a] bg-surface flex items-center justify-center shrink-0 overflow-hidden relative">
              <div className={`absolute inset-0 opacity-50 poster-gradient-${group.avatarGradient}`} />
              <div className="absolute inset-0 backdrop-blur-md" />
              <div className="relative z-10 scale-125 pointer-events-none">
                <AvatarStack names={memberNames} size="md" max={3} />
              </div>
            </div>

            <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${
              group.privacy === 'private'
                ? 'border-white/5 bg-white/5 text-muted/80 backdrop-blur-sm'
                : 'border-cinema-red/30 bg-cinema-red/10 text-cinema-red shadow-[0_0_15px_rgba(234,51,51,0.2)]'
            }`}>
              {group.privacy === 'private' ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
              )}
              {group.privacy}
            </span>
          </div>
          
          <h3 className="font-editorial text-2xl text-bone tracking-tight group-hover:text-cinema-red transition-colors duration-300">{group.name}</h3>
          <p className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase mt-2">{group.vibe}</p>

          {group.description && (
            <p className="text-sm text-bone/60 my-5 line-clamp-2 leading-relaxed flex-1">{group.description}</p>
          )}
          {!group.description && <div className="flex-1 my-3" />}

          <div className="flex items-center justify-between mt-auto pt-5">
            <div className="flex items-center gap-3">
              <AvatarStack names={memberNames} size="sm" max={3} />
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{members.length} member{members.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

        {showJoin && (
          <button
            onClick={e => { e.preventDefault(); joinGroup(group.id); }}
            className="w-full mt-5 py-3 bg-cinema-red text-bone text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-cinema-red/90 transition-all btn-press shadow-lg shadow-cinema-red/20">
            Join Group
          </button>
        )}
        </div>
      </div>
    </Link>

    <GroupModal 
      isOpen={showEditModal} 
      onClose={() => setShowEditModal(false)} 
      group={group} 
    />
    <InviteModal 
      isOpen={showInviteModal} 
      onClose={() => setShowInviteModal(false)} 
      groupName={group.name}
    />
    <LeaveGroupConfirmModal
      isOpen={showLeaveModal}
      onClose={() => setShowLeaveModal(false)}
      group={group}
    />
    </>
  );
}

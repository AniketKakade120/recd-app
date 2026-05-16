'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Group } from '@/lib/types';
import { useApp } from '@/lib/context';
import AvatarStack from './AvatarStack';
import StampBadge from './StampBadge';
import GroupModal from './GroupModal';
import InviteModal from './InviteModal';

interface GroupCardProps {
  group: Group;
  showJoin?: boolean;
}

export default function GroupCard({ group, showJoin }: GroupCardProps) {
  const { getGroupMembers, joinGroup, currentUser, deleteGroup, addToast } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
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
    <Link href={`/groups/${group.id}`} className="block group">
      <div className="rounded-[32px] bg-surface border border-border hover:border-border-strong card-hover h-full flex flex-col relative overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
        
        {/* Cover Image Banner */}
        <div className={`h-32 w-full relative ${!group.coverImage ? `poster-gradient-${(group.avatarGradient % 10) + 1}` : ''}`}>
          {group.coverImage && <img src={group.coverImage} alt="Cover" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
          
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
                  
                  {isOwner && (
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
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card Content Area */}
        <div className="px-6 pb-6 pt-0 flex flex-col flex-1 relative z-10 -mt-12">
          
          <div className="flex items-end justify-between mb-4">
            <div className={`w-20 h-20 rounded-[24px] shadow-2xl border-4 border-surface poster-gradient-${group.avatarGradient} shrink-0`} />
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${
              group.privacy === 'private'
                ? 'border-white/10 bg-ink text-muted/60'
                : 'border-cinema-red/30 bg-cinema-red/10 text-cinema-red shadow-[0_0_15px_rgba(234,51,51,0.2)]'
            }`}>
              {group.privacy}
            </span>
          </div>
          
          <h3 className="font-bold text-xl text-bone tracking-tight group-hover:text-cinema-red transition-colors duration-300">{group.name}</h3>
          <p className="text-[10px] text-cinema-red font-black tracking-[0.2em] uppercase mt-2">{group.vibe}</p>

          {group.description && (
            <p className="text-sm text-bone/60 my-5 line-clamp-2 leading-relaxed flex-1 italic">&ldquo;{group.description}&rdquo;</p>
          )}

          <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
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
    </>
  );
}

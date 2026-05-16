'use client';

import { use, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import ListTitleCard from '@/components/ListTitleCard';
import AddTitleToListModal from '@/components/AddTitleToListModal';
import ShareListModal from '@/components/ShareListModal';
import CreateListModal from '@/components/CreateListModal';
import DeleteListConfirmModal from '@/components/DeleteListConfirmModal';
import UserAvatar from '@/components/UserAvatar';
import Breadcrumbs from '@/components/Breadcrumbs';
import MobileBackLink from '@/components/MobileBackLink';

export default function ListDetailPage({ params }: { params: Promise<{ listId: string }> }) {
  const { listId } = use(params);
  const router = useRouter();
  const { watchlistLists, watchlist, getTitle, getUser, getListStats } = useApp();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  const list = watchlistLists.find(l => l.id === listId);
  const creator = list ? getUser(list.userId) : null;
  const stats = useMemo(() => getListStats(listId), [listId, getListStats, list?.titleIds]);
  
  const listItems = useMemo(() => {
    if (!list) return [];
    
    // Construct items from titleIds directly to ensure everything in the list shows up
    // even if it's not in the general watchlist state yet
    return list.titleIds.map(titleId => {
      const existing = watchlist.find(item => item.titleId === titleId);
      if (existing) return existing;
      
      // Fallback: Create a ghost item for display
      return {
        id: `ghost-${titleId}`,
        userId: list.userId,
        titleId,
        addedBy: 'self' as const,
        listIds: [list.id],
        verdictState: 'none' as const,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt
      };
    });
  }, [list, watchlist]);

  if (!list) {
    return (
      <div className="py-32 text-center animate-in fade-in duration-500">
         <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-bone/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
         </div>
         <h2 className="text-3xl font-bold text-bone font-editorial mb-4">List not found</h2>
         <button onClick={() => router.push('/watchlist')} className="text-cinema-red font-black uppercase tracking-widest text-[10px]">Back to Watchlist</button>
      </div>
    );
  }

  const coverImage = list.coverImage || (list.titleIds.length > 0 ? getTitle(list.titleIds[0])?.posterUrl : null);

  return (
    <div className="relative pb-32">
        {/* Cinematic Header Backdrop */}
        <div className="absolute inset-x-0 top-0 h-[60vh] overflow-hidden pointer-events-none">
           {coverImage ? (
             <img src={coverImage} className="w-full h-full object-cover opacity-20 blur-[100px] scale-125" alt="" />
           ) : (
             <div className="w-full h-full bg-gradient-to-b from-cinema-red/10 to-transparent" />
           )}
           <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 pt-12">
          <div className="mb-12">
            <Breadcrumbs items={[
              { label: 'Watchlist', href: '/watchlist' },
              { label: list.name, isCurrent: true }
            ]} />
            <MobileBackLink label="Watchlist" href="/watchlist" />
          </div>

          {/* List Hero */}
          <div className="flex flex-col lg:flex-row gap-12 lg:items-end mb-24">
            {/* Cover Art */}
            <div className="w-48 h-48 sm:w-64 sm:h-64 flex-shrink-0 rounded-[48px] overflow-hidden border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative group">
               {list.coverStyle === 'gradient' ? (
                 <div className="w-full h-full bg-gradient-to-br from-cinema-red/40 to-ink flex items-center justify-center">
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-700">🎬</span>
                 </div>
               ) : (
                 <>
                   {coverImage ? (
                     <img src={coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={list.name} />
                   ) : (
                     <div className="w-full h-full bg-surface-hover flex items-center justify-center text-4xl text-bone/20">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                     </div>
                   )}
                 </>
               )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                 <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                   <UserAvatar name={creator?.displayName} avatarUrl={creator?.avatarUrl} size="xs" />
                   <span className="text-[10px] font-bold text-bone/80">{creator?.displayName || 'Unknown'}</span>
                 </div>
                 <div className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                   list.privacy === 'private' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' : 'border-cinema-red/30 bg-cinema-red/10 text-cinema-red'
                 }`}>
                    {list.privacy}
                 </div>
                 <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                    Updated {new Date(list.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                 </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold font-editorial text-bone mb-6 leading-none tracking-tight">
                {list.name}
              </h1>
              
              {list.description && (
                <p className="text-xl text-muted max-w-2xl leading-relaxed font-medium">
                  {list.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-12">
                 <button 
                   onClick={() => setShowAddModal(true)}
                   className="px-8 py-4 bg-cinema-red text-bone font-black uppercase tracking-widest rounded-2xl hover:bg-cinema-red/90 transition-all btn-press shadow-2xl shadow-cinema-red/20 flex items-center gap-3 text-xs"
                 >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14m-7-7h14"/></svg>
                    Add Title
                 </button>
                 <button 
                   onClick={() => setShowShareModal(true)}
                   className="px-8 py-4 bg-white/5 border border-white/10 text-bone font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all btn-press text-xs flex items-center gap-3"
                 >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                    Share
                 </button>
                 <div className="relative">
                    <button 
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className={`p-4 rounded-2xl transition-all ${showMoreMenu ? 'bg-bone text-ink' : 'bg-white/5 border border-white/10 text-bone hover:bg-white/10'}`}
                    >
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                    
                    {showMoreMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                        <div 
                          className="absolute right-0 top-16 w-56 bg-bone rounded-2xl shadow-2xl overflow-hidden z-50 py-1 animate-in fade-in zoom-in-95 duration-200"
                        >
                          <button 
                            onClick={() => { setShowEditModal(true); setShowMoreMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-ink text-xs font-bold hover:bg-ink/5 transition-colors text-left"
                          >
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                             Edit list
                          </button>
                          <div className="h-px bg-ink/5 my-1" />
                          <button 
                            onClick={() => { setShowDeleteModal(true); setShowMoreMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-cinema-red text-xs font-bold hover:bg-cinema-red/5 transition-colors text-left"
                          >
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                             Delete list
                          </button>
                        </div>
                      </>
                    )}
                 </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 mb-16 p-8 bg-surface border border-white/5 rounded-3xl">
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Titles</p>
                <p className="text-2xl font-bold text-bone">{stats?.total}</p>
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Type</p>
                <p className="text-2xl font-bold text-bone truncate">{stats?.movies}M / {stats?.shows}S</p>
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Top Genre</p>
                <p className="text-2xl font-bold text-bone truncate">{stats?.topGenre}</p>
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Stamped</p>
                <p className="text-2xl font-bold text-bone">{stats?.stamped}</p>
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">From Crew</p>
                <p className="text-2xl font-bold text-bone">{stats?.fromCrew}</p>
             </div>
          </div>

          {/* Titles Grid */}
          <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
             <h2 className="text-xl font-bold text-bone font-editorial">
               The Collection
             </h2>
             <div className="flex items-center gap-6">
                <button className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-bone transition-colors">By Date Added</button>
                <button className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-bone transition-colors">Grid View</button>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
             {listItems.map(item => (
               <ListTitleCard key={item.id} item={item} list={list} />
             ))}
             {listItems.length === 0 && (
               <div className="col-span-full py-32 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-bone/10 mb-8 border border-white/5 border-dashed">
                     <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M12 8v8m-4-4h8"/></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-bone mb-2 font-editorial">This list is waiting for its first pick.</h3>
                  <p className="text-muted max-w-sm mb-10 font-medium">Search for something worth saving, or add from your crew’s recommendations.</p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-bone hover:bg-white/10 transition-all"
                  >
                    Add title
                  </button>
               </div>
             )}
          </div>
        </div>

        {/* Modals */}
        <AddTitleToListModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          list={list} 
        />
        
        <ShareListModal 
          isOpen={showShareModal} 
          onClose={() => setShowShareModal(false)} 
          list={list} 
        />

        <CreateListModal 
          isOpen={showEditModal} 
          onClose={() => setShowEditModal(false)} 
          list={list} 
        />

        <DeleteListConfirmModal 
          isOpen={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)} 
          list={list} 
        />
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import WatchlistItemCard from '@/components/WatchlistItemCard';
import ListCard from '@/components/ListCard';
import CreateListModal from '@/components/CreateListModal';
import { getWatchlistItemType } from '@/lib/logic/action-system';

export default function WatchlistPage() {
  const { watchlist, watchlistLists, currentUser } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'lists' | 'from_crew' | 'pending' | 'stamped' | 'saved_by_me'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case 'all': return watchlist;
      case 'from_crew': return watchlist.filter(i => i.addedBy === 'recommendation' || i.addedBy === 'group');
      case 'pending': return watchlist.filter(i => i.verdictState === 'verdict_pending');
      case 'stamped': return watchlist.filter(i => i.verdictState === 'verdict_given' && i.stamp);
      case 'saved_by_me': return watchlist.filter(i => i.addedBy === 'self');
      default: return watchlist;
    }
  }, [watchlist, activeTab]);

  const stats = [
    { label: 'Total Picks', value: watchlist.length },
    { label: 'Lists', value: watchlistLists.length },
    { label: 'From Crew', value: watchlist.filter(i => i.addedBy === 'recommendation').length },
    { label: 'Pending', value: watchlist.filter(i => i.verdictState === 'verdict_pending').length },
  ];

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'lists', label: 'Lists' },
    { id: 'from_crew', label: 'From Crew' },
    { id: 'pending', label: 'Pending Verdicts' },
    { id: 'stamped', label: 'Stamped' },
    { id: 'saved_by_me', label: 'Saved by Me' },
  ];

  return (
    <>
      <div className="space-y-12 page-enter pb-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-1">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold font-editorial text-bone mb-3 leading-tight tracking-tight">
              My Watchlist
            </h1>
            <p className="text-base text-muted leading-relaxed">
              The stories you want to see, recommended by people you trust.
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowCreateModal(true)}
               className="px-6 py-3 bg-cinema-red text-bone font-bold rounded-xl hover:bg-cinema-red/90 transition-all btn-press shadow-lg shadow-cinema-red/20 text-sm"
             >
               Create List
             </button>
              <button className="p-3.5 bg-surface border border-border text-bone rounded-xl hover:bg-surface-hover transition-all btn-press">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
           {stats.map(stat => (
             <div key={stat.label} className="bg-surface border border-border p-6 rounded-3xl">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-bone">{stat.value}</p>
             </div>
           ))}
        </div>

        {/* Navigation Tabs */}
        <div className="relative mb-10 border-b border-white/5 px-1">
          <div className="flex items-center gap-8 overflow-x-auto pb-px scrollbar-hide">
             {tabs.map(tab => {
               const isActive = activeTab === tab.id;
               return (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`relative py-4 text-xs font-bold transition-all ${
                     isActive ? 'text-bone' : 'text-muted hover:text-bone/60'
                   }`}
                 >
                   {tab.label}
                   {isActive && (
                     <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cinema-red shadow-[0_0_12px_rgba(234,51,51,0.5)] rounded-full" />
                   )}
                 </button>
               );
             })}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'lists' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {watchlistLists.map(list => (
               <ListCard key={list.id} list={list} />
             ))}
             {watchlistLists.length === 0 && (
               <div className="col-span-full py-20 text-center bg-surface border border-dashed border-border rounded-[40px]">
                  <p className="text-muted text-lg mb-6">No lists yet. Create one for a mood, a weekend, or a friend’s chaotic recs.</p>
                  <button onClick={() => setShowCreateModal(true)} className="text-cinema-red font-bold uppercase tracking-widest text-sm">Create List</button>
               </div>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {filteredItems.map(item => (
               <WatchlistItemCard key={item.id} item={item} />
             ))}
             {filteredItems.length === 0 && (
               <div className="col-span-full py-32 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-bone/20 mb-8">
                     <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-bone mb-2 font-editorial">Your watchlist is waiting for a good call.</h3>
                  <p className="text-muted max-w-xs mb-10">Save titles to your library or check out recommendations from your crew.</p>
                  <button 
                    onClick={() => router.push('/explore')}
                    className="px-8 py-3 border border-border rounded-xl text-xs font-bold uppercase tracking-widest text-bone hover:bg-white/5 transition-all"
                  >
                    Explore Picks
                  </button>
               </div>
             )}
          </div>
        )}
      </div>

      <CreateListModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </>
  );
}

'use client';

import { use, useMemo } from 'react';
import { Film } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import UserAvatar from '@/components/UserAvatar';
import Breadcrumbs from '@/components/Breadcrumbs';
import MobileBackLink from '@/components/MobileBackLink';

export default function SharedListPage({ params }: { params: Promise<{ listId: string }> }) {
  const { listId } = use(params);
  const { watchlistLists, titles, getUser, getTitle, addToast, currentUser } = useApp();
  
  const list = watchlistLists.find(l => l.id === listId);
  const creator = list ? getUser(list.userId) : null;
  
  const listItems = useMemo(() => {
    if (!list) return [];
    return list.titleIds.map(id => titles.find(t => t.id === id)).filter(Boolean);
  }, [list, titles]);

  if (!list || list.privacy === 'private') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
         <h1 className="text-4xl font-bold font-editorial text-bone mb-4">List not found or private</h1>
         <p className="text-muted mb-8">This collection might be hidden or doesn&apos;t exist.</p>
         <Link href="/home" className="text-cinema-red font-black uppercase tracking-widest text-[10px]">Back to Rec&apos;d</Link>
      </div>
    );
  }

  const handleSaveList = () => {
    if (!currentUser) {
      addToast('Sign in to save this list.', { type: 'info' });
      return;
    }
    addToast('List saved to your library.', { type: 'success' });
  };

  return (
    <div className="min-h-screen bg-background text-bone pb-32">
      {/* Branding Header */}
      <header className="px-8 py-10 flex flex-col items-center gap-6">
         <Link href="/" className="text-3xl font-black tracking-tighter text-cinema-red italic">REC&apos;D</Link>
         
         <div className="w-full max-w-4xl mx-auto flex justify-center md:justify-start">
            <Breadcrumbs items={[
              { label: 'Explore', href: '/explore' },
              { label: list.name, isCurrent: true }
            ]} />
            <MobileBackLink label="Explore" href="/explore" />
         </div>
      </header>

      {/* Cinematic Hero */}
      <div className="relative pt-12 pb-24 overflow-hidden border-y border-white/5">
        <div className="absolute inset-0 opacity-10 blur-3xl scale-150">
           {listItems[0]?.posterUrl && <img src={listItems[0].posterUrl} className="w-full h-full object-cover" alt="" />}
        </div>
        
        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto rounded-[40px] overflow-hidden border border-white/10 shadow-2xl mb-12 transform -rotate-2">
             {list.coverStyle === 'gradient' ? (
                <div className="w-full h-full bg-gradient-to-br from-cinema-red/40 to-ink flex items-center justify-center">
                   <Film className="w-16 h-16 text-cinema-red/50" strokeWidth={1.5} />
                </div>
             ) : (
                <img src={listItems[0]?.posterUrl} className="w-full h-full object-cover" alt="" />
             )}
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
             <UserAvatar name={creator?.displayName} avatarUrl={creator?.avatarUrl} size="xs" />
             <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Curated by {creator?.displayName}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold font-editorial mb-6 leading-tight">{list.name}</h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-12">{list.description}</p>

          <div className="flex flex-wrap items-center justify-center gap-4">
             <button 
               onClick={handleSaveList}
               className="px-10 py-4 bg-cinema-red text-bone font-black uppercase tracking-widest rounded-2xl hover:bg-cinema-red/90 transition-all shadow-xl shadow-cinema-red/20 text-xs"
             >
                Save List
             </button>
             <Link 
               href={`/watchlist/${list.id}`}
               className="px-10 py-4 bg-white/5 border border-white/10 text-bone font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all text-xs"
             >
                Open in Rec&apos;d
             </Link>
          </div>
        </div>
      </div>

      {/* Titles Grid */}
      <div className="max-w-6xl mx-auto px-8 mt-24">
         <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
            <h2 className="text-xl font-bold font-editorial">The Collection ({list.titleIds.length})</h2>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {listItems.map(title => (
              <div 
                key={title?.id}
                className="group animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 mb-4 shadow-lg group-hover:border-white/20 transition-all">
                  {title?.posterUrl ? (
                    <img src={title.posterUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                  ) : (
                    <div className="w-full h-full bg-surface-hover flex items-center justify-center text-bone/10 font-editorial text-4xl">
                       {title?.title.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-bold text-bone/90 group-hover:text-cinema-red transition-colors">{title?.title}</h3>
                <p className="text-[10px] text-muted uppercase tracking-widest mt-1">{title?.releaseYear} • {title?.format}</p>
              </div>
            ))}
         </div>
      </div>

      {/* Footer Branding */}
      <footer className="mt-40 border-t border-white/5 pt-20 px-8 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-8">Join the crew</p>
         <Link href="/home" className="text-6xl md:text-8xl font-black italic tracking-tighter text-white hover:text-cinema-red transition-colors">REC&apos;D</Link>
         <p className="text-muted mt-8 max-w-sm mx-auto text-sm">The social home for your movie and show recommendations.</p>
      </footer>
    </div>
  );
}

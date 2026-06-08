'use client';

import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/lib/context';
import type { WatchlistList, Title } from '@/lib/types';
import { ensureTitleExistsInDb } from '@/lib/supabase/actions';
import ModalBase from '@/components/ModalBase';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list?: WatchlistList; // If provided, we are in edit mode
  preselectedTitleId?: string;
}

export default function CreateListModal({ isOpen, onClose, list, preselectedTitleId }: CreateListModalProps) {
  const { 
    createWatchlistList, 
    updateWatchlistList, 
    deleteWatchlistList, 
    addTitleToList, 
    removeTitleFromList,
    addTitle,
    titles,
    getTitle,
    watchlistLists
  } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'private' | 'shared' | 'group'>('private');
  const [coverStyle, setCoverStyle] = useState<'collage' | 'gradient' | 'poster_stack'>('gradient');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Title[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<'details' | 'movies' | 'share'>('details');
  const [createdListId, setCreatedListId] = useState<string | null>(null);

  // Initialize from list if editing
  useEffect(() => {
    if (list) {
      setName(list.name);
      setDescription(list.description || '');
      setPrivacy(list.privacy);
      setCoverStyle(list.coverStyle);
      setView('details');
    } else {
      setName('');
      setDescription('');
      setPrivacy('private');
      setCoverStyle('gradient');
      setView('details');
      setCreatedListId(null);
    }
  }, [list, isOpen]);

  const activeListId = list?.id || createdListId;
  const currentList = watchlistLists.find(l => l.id === activeListId);
  const currentListTitles = useMemo(() => {
    if (!currentList) return [];
    return currentList.titleIds.map(id => getTitle(id)).filter(Boolean) as Title[];
  }, [currentList, getTitle]);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out titles already in the list
          setSearchResults(data.filter((t: Title) => !currentList?.titleIds.includes(t.id)).slice(0, 5));
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearchLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, currentList]);

  if (!isOpen) return null;

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    try {
      if (list) {
        await updateWatchlistList(list.id, { name, description, privacy, coverStyle });
        setView('movies');
        return;
      }

      if (createdListId) {
        await updateWatchlistList(createdListId, { name, description, privacy, coverStyle });
        setView('movies');
        return;
      }

      // Create the list first
      const { id, error } = await createWatchlistList({
        name,
        description,
        privacy,
        coverStyle,
        titleIds: preselectedTitleId ? [preselectedTitleId] : []
      });

      if (id) {
        setCreatedListId(id);
        setView('movies');
      } else {
        console.error('Failed to create list:', error);
      }
    } catch (err) {
      console.error('Error in handleNextStep:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalize = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onClose();
    }, 800);
  };

  const handleShare = (platform: string) => {
    alert(`Sharing to ${platform} coming soon!`);
  };

  const handleDelete = () => {
    if (!list) return;
    if (confirm('Are you sure you want to delete this list? This cannot be undone.')) {
      deleteWatchlistList(list.id);
      onClose();
    }
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      hideHeader={true}
      noPadding={true}
    >
      <div className="flex flex-col h-full">
        {/* Step Indicator (Only for creation) */}
        {!list && (
          <div className="flex-none flex px-10 pt-10 pb-4 gap-2">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${view === 'details' ? 'bg-cinema-red shadow-[0_0_12px_rgba(234,51,51,0.4)]' : 'bg-white/10'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${view === 'movies' ? 'bg-cinema-red shadow-[0_0_12px_rgba(234,51,51,0.4)]' : 'bg-white/10'}`} />
          </div>
        )}

        {/* Tab View Switcher (Only for editing) */}
        {list && (
          <div className="flex-none flex px-10 pt-8 border-b border-white/5">
            {[
              { id: 'details', label: 'Identity' },
              { id: 'movies', label: 'Curation' },
              { id: 'share', label: 'Sharing' }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id as any)}
                className={`pb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  view === v.id ? 'text-bone border-b-2 border-cinema-red' : 'text-muted hover:text-bone'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        {/* Header - Fixed at top */}
        <div className="flex-none px-10 pt-8 flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold font-editorial text-bone leading-tight">
              {view === 'details' ? (list ? 'Update Collection' : 'New Collection') : 'Curate Content'}
            </h2>
            <p className="text-[10px] text-muted mt-1 uppercase tracking-widest font-bold">
              {view === 'details' ? 'Define the vibe and privacy.' : `Add titles to your "${name}" list.`}
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full transition-all text-muted hover:text-bone">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-10 pb-6 scrollbar-hide">

          {view === 'details' && (
            <form id="list-details-form" onSubmit={handleNextStep} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">List Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Slow Burns, Weekend Watch"
                  className="w-full bg-ink border border-border rounded-xl px-4 py-3 text-bone focus:outline-none focus:border-cinema-red transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Description (Optional)</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What's the vibe of this list?"
                  className="w-full bg-ink border border-border rounded-xl px-4 py-3 text-bone focus:outline-none focus:border-cinema-red transition-colors h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Privacy</label>
                  <div className="flex bg-ink p-1 rounded-xl border border-border">
                    {(['private', 'shared'] as const).map(p => (
                      <button 
                        key={p}
                        type="button"
                        onClick={() => setPrivacy(p)}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                          privacy === p ? 'bg-white/10 text-bone' : 'text-muted hover:text-bone/60'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Cover Style</label>
                  <div className="flex bg-ink p-1 rounded-xl border border-border">
                    {(['gradient', 'collage', 'poster_stack'] as const).map(s => (
                      <button 
                        key={s}
                        type="button"
                        onClick={() => setCoverStyle(s)}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                          coverStyle === s ? 'bg-white/10 text-bone' : 'text-muted hover:text-bone/60'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </form>
          )}

          {view === 'movies' && activeListId && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Search to Add */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Search Library</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted pointer-events-none z-10">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by title..."
                    className="w-full bg-ink border border-border rounded-2xl pr-12 py-4 text-bone focus:outline-none focus:border-cinema-red transition-all shadow-inner text-sm"
                    style={{ paddingLeft: '3.5rem' }}
                  />
                  {searchLoading && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-cinema-red border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-4 bg-ink/80 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-2xl">
                    {searchResults.map(result => (
                      <button
                        key={result.id}
                        onClick={async () => {
                          // Ensure title is in DB and also in our local context state
                          await ensureTitleExistsInDb(result);
                          addTitle(result); // Add to local state so it appears immediately
                          addTitleToList(result.id, activeListId);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-all text-left group"
                      >
                        <div className={`w-12 h-16 rounded-lg overflow-hidden shrink-0 poster-gradient-${result.posterGradient} border border-white/5 shadow-lg group-hover:border-white/20 transition-all`}>
                          {result.posterUrl && <img src={result.posterUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-bone truncate group-hover:text-cinema-red transition-colors">{result.title}</p>
                          <p className="text-[10px] text-muted uppercase tracking-widest mt-0.5">{result.releaseYear} • {result.format}</p>
                        </div>
                        <div className="p-2.5 bg-cinema-red text-bone rounded-xl shadow-lg shadow-cinema-red/20 group-hover:scale-110 transition-all">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Movies */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-4 px-1">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-muted">In this list ({currentList?.titleIds.length || 0})</label>
                   {currentList?.titleIds.length > 0 && (
                     <span className="text-[10px] font-bold text-cinema-red uppercase tracking-widest">Live Sync active</span>
                   )}
                </div>
                
                <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-2 scrollbar-hide">
                  {currentListTitles.map(t => (
                    <div key={t.id} className="flex items-center gap-4 p-3 bg-white/2 border border-white/5 rounded-2xl group animate-in zoom-in-95 duration-300">
                      <div className={`w-10 h-14 rounded-lg overflow-hidden shrink-0 poster-gradient-${t.posterGradient} border border-white/5 shadow-md`}>
                        {t.posterUrl && <img src={t.posterUrl} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-bone truncate">{t.title}</p>
                        <p className="text-[10px] text-muted uppercase tracking-widest mt-0.5">{t.releaseYear}</p>
                      </div>
                      <button 
                        onClick={() => removeTitleFromList(activeListId, t.id)}
                        className="p-3 bg-white/5 hover:bg-cinema-red/10 text-muted hover:text-cinema-red rounded-xl transition-all"
                        title="Remove from list"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                  {currentListTitles.length === 0 && (
                    <div className="py-12 text-center bg-white/2 rounded-[32px] border border-dashed border-white/5 animate-in fade-in duration-700">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-muted/30">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
                      </div>
                      <p className="text-xs text-muted font-medium italic">Your collection is empty.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {view === 'share' && activeListId && (
            <div className="space-y-8 py-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center">
                 <div className="w-16 h-16 bg-cinema-red/10 text-cinema-red rounded-full flex items-center justify-center mx-auto mb-4 border border-cinema-red/20">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                 </div>
                 <h3 className="text-xl font-bold text-bone mb-2">Spread the taste.</h3>
                 <p className="text-sm text-muted">Invite your crew to see this collection or share it across the web.</p>
              </div>

              <div className="space-y-3">
                 <button 
                    onClick={() => {
                      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://recd.app';
                      navigator.clipboard.writeText(`${origin}/list/${activeListId}`);
                      alert('Link copied to clipboard!');
                    }}
                    className="w-full p-4 bg-ink border border-border rounded-2xl flex items-center justify-between hover:border-bone/20 transition-all group"
                 >
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-white/5 rounded-lg text-muted">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                       </div>
                       <span className="text-sm font-bold text-bone">Copy Link</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-cinema-red opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                 </button>

                 <div className="grid grid-cols-3 gap-3">
                    {['Instagram', 'Twitter', 'WhatsApp'].map(p => (
                      <button 
                        key={p}
                        onClick={() => handleShare(p)}
                        className="flex flex-col items-center justify-center p-4 bg-ink border border-border rounded-2xl hover:border-bone/20 transition-all gap-2"
                      >
                         <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-muted">
                            {p === 'Instagram' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>}
                            {p === 'Twitter' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>}
                            {p === 'WhatsApp' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-10.6 8.38 8.38 0 013.8.9L21 3.5l-2.1 4.7z"/></svg>}
                         </div>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{p}</span>
                      </button>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer area for CTAs - Always visible */}
        <div className="flex-none px-10 pb-10 pt-6 border-t border-white/5 bg-surface z-10">
          {view === 'details' && (
            <div className="flex items-center gap-3">
              {list && (
                <button 
                  type="button"
                  onClick={handleDelete}
                  className="p-4 bg-white/5 text-muted hover:text-cinema-red hover:bg-cinema-red/5 border border-white/5 rounded-xl transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              )}
              <button 
                type="submit" 
                form="list-details-form"
                disabled={submitting || !name.trim()}
                className="flex-1 py-4 bg-cinema-red text-bone font-bold uppercase tracking-widest rounded-xl disabled:opacity-40 btn-press transition-all flex items-center justify-center gap-3 text-xs"
              >
                {submitting && <div className="w-4 h-4 border-2 border-bone/30 border-t-bone rounded-full animate-spin" />}
                {submitting ? 'Saving...' : (list || createdListId) ? 'Save Changes & Continue' : 'Next: Add Movies'}
              </button>
            </div>
          )}
          
          {(view === 'movies' || view === 'share') && (
            <button 
              onClick={handleFinalize}
              className="w-full py-5 bg-cinema-red text-bone font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-cinema-red/20 btn-press flex items-center justify-center gap-3 text-xs"
            >
              {submitting && <div className="w-5 h-5 border-2 border-bone/30 border-t-bone rounded-full animate-spin" />}
              {view === 'share' ? 'Done' : (list ? 'Update Collection' : 'Finalize Collection')}
            </button>
          )}
        </div>
      </div>
    </ModalBase>
  );
}

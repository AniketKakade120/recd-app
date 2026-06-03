'use client';

import React, { useRef, useState, useEffect } from 'react';
import { TasteProfilePoster } from '@/components/onboarding/TasteProfilePoster';
import { usePosterExport } from '@/hooks/usePosterExport';
import { User, UserPreferences } from '@/lib/types';
import { Download, Edit2, Loader2 } from 'lucide-react';

interface TasteProfileCardProps {
  user: User;
  preferences: UserPreferences;
  onEdit?: () => void;
}

export default function TasteProfileCard({ user, preferences, onEdit }: TasteProfileCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);
  const { exportPoster, isExporting } = usePosterExport();

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setScale(entry.contentRect.width / 1080);
      }
    });
    if (containerRef.current) {
      obs.observe(containerRef.current);
    }
    return () => obs.disconnect();
  }, []);

  const handleDownload = async () => {
    if (!posterRef.current || isExporting) return;
    await exportPoster(posterRef.current, `${user.username}-taste-profile.png`);
  };

  const archetypes = user.tasteArchetypes?.length ? user.tasteArchetypes : [user.tasteArchetype];

  return (
    <div className="bg-surface border border-border rounded-[32px] overflow-hidden flex flex-col shadow-2xl relative group">
      {/* Header section with Edit button */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center bg-gradient-to-b from-ink/80 to-transparent">
        <h3 className="text-[10px] font-black text-bone uppercase tracking-[0.2em] drop-shadow-md">Taste Profile</h3>
        {onEdit && (
          <button 
            onClick={onEdit} 
            className="text-[10px] font-bold text-cinema-red uppercase tracking-widest hover:text-bone hover:bg-cinema-red/20 px-3 py-1.5 rounded-full transition-all bg-ink/50 backdrop-blur-md border border-cinema-red/30 flex items-center gap-1.5"
          >
            <Edit2 size={12} /> Edit
          </button>
        )}
      </div>

      {/* Scaled Poster Container */}
      <div 
        ref={containerRef} 
        className="w-full relative aspect-[1080/1920] bg-ink overflow-hidden"
      >
        {/* Offscreen real size for export */}
        <div className="absolute top-0 left-0 -z-10 opacity-0 pointer-events-none">
          <TasteProfilePoster 
            ref={posterRef}
            displayName={user.displayName}
            archetypes={archetypes}
            genrePreferences={preferences.genrePreferences || {}}
            vibes={preferences.moods.slice(0, 3)}
          />
        </div>

        {/* Scaled Preview */}
        <div 
          className="absolute top-0 left-0 origin-top-left pointer-events-none transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
        >
          <TasteProfilePoster 
            displayName={user.displayName}
            archetypes={archetypes}
            genrePreferences={preferences.genrePreferences || {}}
            vibes={preferences.moods.slice(0, 3)}
          />
        </div>

        {/* Hover overlay for download */}
        <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none backdrop-blur-[2px]">
          <button 
            onClick={handleDownload}
            disabled={isExporting}
            className="pointer-events-auto flex items-center gap-2 px-6 py-3 bg-cinema-red text-bone font-bold rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isExporting ? 'Generating...' : 'Save Image'}
          </button>
        </div>
      </div>
      
      {/* Mobile-visible download button (since hover doesn't work well on mobile) */}
      <div className="lg:hidden p-4 border-t border-border bg-ink">
        <button 
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-surface-hover text-bone text-sm font-bold rounded-xl active:scale-95 transition-all"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {isExporting ? 'Generating...' : 'Save Poster'}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { GENRES, MOODS, PLATFORMS, LANGUAGES, type Genre, type Mood, type StreamingPlatform, type Language } from '@/lib/types';

interface EditPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'genres' | 'moods' | 'platforms' | 'languages';

export default function EditPreferencesModal({ isOpen, onClose }: EditPreferencesModalProps) {
  const { userPreferences, updatePreferences } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('genres');
  
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>(userPreferences.genres || []);
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>(userPreferences.moods || []);
  const [selectedPlatforms, setSelectedPlatforms] = useState<StreamingPlatform[]>(userPreferences.platforms || []);
  const [selectedLanguages, setSelectedLanguages] = useState<any[]>(userPreferences.languages || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleSelection = <T extends string>(item: T, current: T[], setter: (val: T[]) => void) => {
    if (current.includes(item)) {
      setter(current.filter(i => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updatePreferences({
        genres: selectedGenres,
        moods: selectedMoods,
        platforms: selectedPlatforms,
        languages: selectedLanguages
      });
      onClose();
    } catch (error) {
      console.error('Failed to update preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: { id: TabType; label: string; items: any[]; current: any[]; setter: any }[] = [
    { id: 'genres', label: 'Genres', items: GENRES, current: selectedGenres, setter: setSelectedGenres },
    { id: 'moods', label: 'Moods', items: MOODS, current: selectedMoods, setter: setSelectedMoods },
    { id: 'platforms', label: 'Platforms', items: PLATFORMS, current: selectedPlatforms, setter: setSelectedPlatforms },
    { id: 'languages', label: 'Regions', items: LANGUAGES, current: selectedLanguages, setter: setSelectedLanguages },
  ];

  const currentTabData = tabs.find(t => t.id === activeTab)!;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative z-10 w-full md:max-w-xl bg-surface border border-border rounded-t-3xl md:rounded-3xl p-8 animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-bone font-editorial">Taste Profile</h2>
            <p className="text-sm text-muted mt-1">Select all categories that define your taste.</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted hover:text-bone transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-border mb-8 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold uppercase tracking-widest relative transition-all ${
                activeTab === tab.id ? 'text-bone' : 'text-muted hover:text-bone/70'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-1.5 py-0.5 bg-ink rounded text-[10px] text-muted">{tab.current.length}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cinema-red rounded-t-full shadow-[0_-2px_10px_rgba(234,51,51,0.5)]" />
              )}
            </button>
          ))}
        </div>

        {/* Selection Flow (Consistent Chips) */}
        <div className="flex-1 overflow-y-auto min-h-[300px] pr-2 custom-scrollbar">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pb-8">
            {currentTabData.items.map(item => {
              const isSelected = currentTabData.current.includes(item);
              
              return (
                <button
                  key={item}
                  onClick={() => toggleSelection(item, currentTabData.current, currentTabData.setter)}
                  className={`px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-95 ${
                    isSelected 
                      ? 'bg-cinema-red/10 border-cinema-red/50 text-bone shadow-[0_0_30px_rgba(229,9,20,0.15)] ring-1 ring-cinema-red/30' 
                      : 'bg-surface/50 backdrop-blur-sm border-border text-muted hover:border-border-strong hover:text-bone hover:bg-surface'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-border mt-auto shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-surface-hover border border-border text-bone font-bold rounded-2xl hover:bg-warm-grey transition-all btn-press text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-[2] py-4 bg-cinema-red text-bone font-bold rounded-2xl hover:bg-cinema-red/90 transition-all btn-press shadow-lg shadow-cinema-red/20 text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Updating Taste...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

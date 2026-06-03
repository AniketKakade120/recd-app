'use client';

import { useState, useRef } from 'react';
import { useApp } from '@/lib/context';
import { TASTE_ARCHETYPES, TasteArchetype, GENRES, MOODS, PLATFORMS, LANGUAGES, type Genre, type Mood, type StreamingPlatform, type Language } from '@/lib/types';
import { TasteProfilePoster } from '@/components/onboarding/TasteProfilePoster';
import { usePosterExport } from '@/hooks/usePosterExport';
import { Download, Loader2, Film, Zap, Rocket, Cat, Drama, Laugh, Ghost, Heart, Video, Search, Sword } from 'lucide-react';

function generateHeadline(archetype: string, topGenre: string, topVibe?: string): string {
  const base: Record<string, string> = {
    'Emotional Damage Dealer': 'Emotional chaos curator',
    'Plot Twist Addict': 'Plot-twist seeker',
    'Comfort Watch Expert': 'Comfort-watch soul',
    'Horror Sicko': 'Fear-first watcher',
    'Rom-Com Defender': 'Rom-com defender',
    'Prestige TV Snob': 'Prestige TV loyalist',
    'Anime Evangelist': 'Anime evangelist',
    'Slow-Burn Believer': 'Slow-burn heartbreak specialist',
    'Franchise Defender': 'Franchise defender',
    'Documentary Deep Diver': 'Documentary deep diver',
    'Sitcom Loyalist': 'Sitcom loyalist',
    'Thriller Dealer': 'Thriller-first, feelings-later watcher',
  };
  const title = base[archetype] || 'Cinematic soul';
  
  if (topGenre && topVibe) {
    return `${title} with ${topVibe.toLowerCase()} ${topGenre.toLowerCase()} tendencies`;
  }
  return title;
}

interface EditPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'traits' | 'genres' | 'moods' | 'platforms' | 'languages';

const GenreIcon = ({ genre, size=24 }: { genre: string, size?: number }) => {
  const p = { className: "text-bone/70", size, strokeWidth: 1.5 };
  switch(genre) {
    case 'Drama': return <Drama {...p} />;
    case 'Comedy': return <Laugh {...p} />;
    case 'Thriller': return <Zap {...p} />;
    case 'Horror': return <Ghost {...p} />;
    case 'Romance': return <Heart {...p} />;
    case 'Sci-fi': return <Rocket {...p} />;
    case 'Documentary': return <Video {...p} />;
    case 'Anime': return <Cat {...p} />;
    case 'Crime': return <Search {...p} />;
    case 'Fantasy': return <Sword {...p} />;
    default: return <Film {...p} />;
  }
};

export default function EditPreferencesModal({ isOpen, onClose }: EditPreferencesModalProps) {
  const { userPreferences, updatePreferences, currentUser, completeOnboarding, refreshData } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('traits');
  
  const [selectedTraits, setSelectedTraits] = useState<TasteArchetype[]>(
    currentUser?.tasteArchetypes?.length ? currentUser.tasteArchetypes : 
    currentUser?.tasteArchetype ? [currentUser.tasteArchetype] : []
  );
  
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>(userPreferences?.genres || []);
  const [genrePreferences, setGenrePreferences] = useState<Record<string, number>>(userPreferences?.genrePreferences || {});
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>(userPreferences?.moods || []);
  const [selectedPlatforms, setSelectedPlatforms] = useState<StreamingPlatform[]>(userPreferences?.platforms || []);
  const [selectedLanguages, setSelectedLanguages] = useState<any[]>(userPreferences?.languages || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Poster Export
  const posterRef = useRef<HTMLDivElement>(null);
  const { exportPoster, isExporting } = usePosterExport();

  if (!isOpen) return null;

  const toggleSelection = <T extends string>(item: T, current: T[], setter: (val: T[]) => void) => {
    if (current.includes(item)) {
      setter(current.filter(i => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  const handleGenreToggle = (g: Genre) => {
    if (selectedGenres.includes(g)) {
      setSelectedGenres(selectedGenres.filter(x => x !== g));
      const newPrefs = { ...genrePreferences };
      delete newPrefs[g];
      setGenrePreferences(newPrefs);
    } else {
      if (selectedGenres.length >= 8) return; // Prevent too many for the radar chart
      setSelectedGenres([...selectedGenres, g]);
      setGenrePreferences({ ...genrePreferences, [g]: 3 });
    }
  };

  const handleSliderChange = (genre: string, val: number) => {
    setGenrePreferences({ ...genrePreferences, [genre]: val });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updatePreferences({
        genres: selectedGenres,
        genrePreferences,
        moods: selectedMoods,
        platforms: selectedPlatforms,
        languages: selectedLanguages
      });

      const topGenres = [...GENRES].sort((a,b) => (genrePreferences[b]||3) - (genrePreferences[a]||3));
      const topGenre = topGenres[0] || 'Drama';
      const topVibe = selectedMoods[0];
      const headline = generateHeadline(selectedTraits[0] || 'Comfort Watch Expert', topGenre, topVibe);

      await completeOnboarding({
        taste_archetypes: selectedTraits,
        generated_taste_headline: headline
      });
      
      await refreshData();
      onClose();
    } catch (error) {
      console.error('Failed to update preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (!posterRef.current || isExporting) return;
    await exportPoster(posterRef.current, `${currentUser?.username || 'taste'}-profile.png`);
  };

  const tabs: { id: TabType; label: string; items: any[]; current: any[]; setter: any }[] = [
    { id: 'traits', label: 'Taste Traits', items: TASTE_ARCHETYPES, current: selectedTraits, setter: setSelectedTraits },
    { id: 'genres', label: 'Genres', items: GENRES, current: selectedGenres, setter: setSelectedGenres },
    { id: 'moods', label: 'Moods', items: MOODS, current: selectedMoods, setter: setSelectedMoods },
    { id: 'platforms', label: 'Platforms', items: PLATFORMS, current: selectedPlatforms, setter: setSelectedPlatforms },
    { id: 'languages', label: 'Regions', items: LANGUAGES, current: selectedLanguages, setter: setSelectedLanguages },
  ];

  const currentTabData = tabs.find(t => t.id === activeTab)!;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative z-10 w-full md:max-w-2xl bg-surface border border-border rounded-t-3xl md:rounded-3xl p-6 md:p-8 animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-bone font-editorial">Taste Profile</h2>
            <p className="text-sm text-muted mt-1">Select all categories that define your taste.</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted hover:text-bone transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-border mb-6 shrink-0 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold uppercase tracking-widest relative transition-all whitespace-nowrap ${
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

        {/* Selection Flow */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
          
          {activeTab === 'genres' ? (
            <div className="space-y-6 pb-8">
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => (
                  <button
                    key={g}
                    onClick={() => handleGenreToggle(g as Genre)}
                    className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                      selectedGenres.includes(g as Genre)
                        ? 'bg-cinema-red/10 border-cinema-red/50 text-bone'
                        : 'bg-surface/50 border-border text-muted hover:text-bone'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              
              {selectedGenres.length > 0 && (
                <div className="pt-6 border-t border-border">
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Tune your preferences</p>
                  <div className="space-y-4">
                    {selectedGenres.map(genre => {
                      const val = genrePreferences[genre] || 3;
                      const percentage = ((val - 1) / 4) * 100;

                      return (
                        <div key={genre} className="bg-ink border border-border p-4 rounded-2xl flex items-center gap-6">
                          <div className="flex items-center gap-3 w-[120px] shrink-0">
                            <GenreIcon genre={genre} size={20} />
                            <span className="text-sm font-bold text-bone">{genre}</span>
                          </div>
                          <div className="flex-1 flex flex-col gap-3 relative">
                            <input 
                              type="range" min="1" max="5" step="0.01" 
                              value={val}
                              onChange={(e) => handleSliderChange(genre, parseFloat(e.target.value))}
                              className="w-full h-1 rounded-full appearance-none cursor-pointer outline-none 
                                [&::-webkit-slider-thumb]:appearance-none 
                                [&::-webkit-slider-thumb]:w-4 
                                [&::-webkit-slider-thumb]:h-4 
                                [&::-webkit-slider-thumb]:rounded-full 
                                [&::-webkit-slider-thumb]:bg-cinema-red 
                                [&::-webkit-slider-thumb]:border-2
                                [&::-webkit-slider-thumb]:border-ink
                                [&::-moz-range-thumb]:w-4 
                                [&::-moz-range-thumb]:h-4 
                                [&::-moz-range-thumb]:rounded-full 
                                [&::-moz-range-thumb]:bg-cinema-red"
                              style={{
                                background: `linear-gradient(to right, #E50914 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 sm:gap-3 pb-8">
              {currentTabData.items.map(item => {
                const isSelected = currentTabData.current.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleSelection(item, currentTabData.current, currentTabData.setter)}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all ${
                      isSelected 
                        ? 'bg-cinema-red/10 border-cinema-red/50 text-bone shadow-[0_0_30px_rgba(229,9,20,0.15)] ring-1 ring-cinema-red/30' 
                        : 'bg-surface/50 border-border text-muted hover:border-border-strong hover:text-bone'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border mt-auto shrink-0">
          <button 
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 py-4 bg-ink border border-border text-bone font-bold rounded-2xl hover:bg-surface transition-all btn-press text-sm flex items-center justify-center gap-2"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isExporting ? 'Generating...' : 'Download Poster'}
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-[2] py-4 bg-cinema-red text-bone font-bold rounded-2xl hover:bg-cinema-red/90 transition-all btn-press shadow-lg shadow-cinema-red/20 text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Save Preferences'}
          </button>
        </div>

        {/* Hidden Poster For Export */}
        <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none">
          {currentUser && (
            <TasteProfilePoster 
              ref={posterRef}
              displayName={currentUser.displayName}
              archetypes={selectedTraits.length ? selectedTraits : ['Comfort Watch Expert']}
              genrePreferences={genrePreferences}
              vibes={selectedMoods.slice(0, 3)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

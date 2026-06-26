'use client';

import { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, X } from 'lucide-react';
import type { JournalEntry } from '@/lib/types';
import { useApp } from '@/lib/context';

interface ShareVerdictCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry;
}

export default function ShareVerdictCardModal({ isOpen, onClose, entry }: ShareVerdictCardModalProps) {
  const { currentUser } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDataUrl(null);
      // Automatically generate the preview when opened
      setTimeout(generateImage, 500); 
    }
  }, [isOpen]);

  const generateImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const url = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2, // High res for IG
        // cacheBust is removed because TMDB CDN sometimes blocks or fails on random query params
      });
      setDataUrl(url);
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `recd-verdict-${entry.tmdbId}.png`;
    link.href = dataUrl;
    link.click();
  };

  if (!isOpen) return null;

  const firstName = currentUser?.displayName?.split(' ')[0] || 'YOU';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
      {/* Hidden Card Template (9:16 aspect ratio - 1080x1920 logical size) */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div 
          ref={cardRef}
          className="w-[1080px] h-[1920px] bg-[#0a0a0a] relative overflow-hidden flex flex-col items-center justify-between p-[80px] font-sans"
        >
          {/* Ambient red glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cinema-red/15 blur-[150px] rounded-full pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col items-center w-full relative z-10">
            <div className="flex items-center gap-6 mb-6 text-white">
              <span className="text-cinema-red text-3xl">✦</span>
              <span className="text-[50px] font-bold font-editorial tracking-tight">Rec'd Club</span>
              <span className="text-cinema-red text-3xl">✦</span>
            </div>
            <div className="flex items-center gap-4 text-[22px] tracking-[0.3em] uppercase font-bold text-white/50">
              <span className="text-cinema-red">{firstName}</span> WATCHED
            </div>
          </div>

          {/* Poster */}
          <div className="relative w-[720px] h-[1080px] rounded-[40px] overflow-hidden shadow-[0_0_80px_rgba(234,51,51,0.25)] border-[3px] border-cinema-red/20 z-10 mt-6 mb-6 shrink-0">
            {(entry.posterPath || entry.backdropPath) ? (
              <img 
                crossOrigin="anonymous"
                src={`/api/proxy-image?url=${encodeURIComponent(entry.posterPath || entry.backdropPath)}`}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-white/20 text-4xl font-editorial">
                {entry.title}
              </div>
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[40px] pointer-events-none" />
          </div>

          {/* Title & Stars */}
          <div className="flex flex-col items-center z-10 w-full px-10 mb-6">
            <h1 className="text-[70px] font-bold text-white leading-tight font-editorial text-center line-clamp-1 mb-4 drop-shadow-lg">
              {entry.title.toUpperCase()}
            </h1>
            <div className="flex items-center gap-8">
              <div className="flex gap-4">
                 {[1, 2, 3, 4, 5].map(star => {
                   const isFilled = entry.rating && star <= entry.rating;
                   return (
                     <span 
                       key={star} 
                       className={`text-[50px] leading-none ${isFilled ? 'text-cinema-red drop-shadow-[0_0_15px_rgba(234,51,51,0.6)]' : 'text-white/10'}`}
                     >
                       ★
                     </span>
                   );
                 })}
              </div>
              {entry.rating && (
                <span className="text-[40px] text-white/80 font-light tracking-wide leading-none mt-2">
                  {entry.rating.toFixed(1)} <span className="text-white/30">/ 5</span>
                </span>
              )}
            </div>
          </div>

          {/* Verdict Section (Only if Stamp or Verdict exists) */}
          {(entry.stamp || entry.shortVerdict) && (
            <div className="w-[900px] p-4 flex flex-col items-center relative z-10 mb-6 shrink-0">
               {/* Stamp text pill */}
               {entry.stamp && (
                 <div className="px-8 py-3 rounded-full border border-cinema-red/30 bg-cinema-red/10 text-cinema-red text-[22px] font-black uppercase tracking-[0.15em] mb-6 shadow-[0_0_30px_rgba(234,51,51,0.15)] flex items-center justify-center">
                   {entry.stamp}
                 </div>
               )}
               
               {/* Verdict text */}
               {entry.shortVerdict && (
                 <div className="text-center px-12 mb-8 w-full">
                   <p className="text-[40px] text-white/90 font-editorial italic leading-snug">
                     <span className="text-cinema-red text-[48px] mr-2">“</span>
                     {entry.shortVerdict}
                     <span className="text-cinema-red text-[48px] ml-2">”</span>
                   </p>
                 </div>
               )}
               
               {/* Divider & Logged in */}
               <div className="w-full h-px bg-white/10 mb-5" />
               <div className="flex items-center gap-4 text-white/40 text-[20px]">
                 <span>📱</span>
                 <span>Logged in Verdict Journal</span>
               </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-8 text-white/20 text-[22px] tracking-[0.5em] mt-auto z-10 pb-6 font-semibold">
            <span className="text-cinema-red">✦</span>
            RECDCLUB.IN
            <span className="text-cinema-red">✦</span>
          </div>

        </div>
      </div>

      {/* Visible UI */}
      <div className="relative w-full max-w-sm flex flex-col items-center">
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="w-full aspect-[9/16] bg-ink rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-white/10">
          {isExporting && !dataUrl ? (
            <div className="animate-spin w-8 h-8 border-4 border-cinema-red/30 border-t-cinema-red rounded-full" />
          ) : dataUrl ? (
            <img src={dataUrl} alt="Verdict Card" className="w-full h-full object-contain" />
          ) : (
            <span className="text-white/50">Preparing card...</span>
          )}
        </div>

        <button 
          onClick={handleDownload}
          disabled={!dataUrl}
          className="mt-6 w-full py-4 bg-bone text-ink font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all btn-press"
        >
          <Download size={20} />
          Save to Camera Roll
        </button>
        <p className="mt-4 text-center text-xs text-white/40">
          Share to Instagram Story or your favorite app.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, X } from 'lucide-react';
import type { JournalEntry } from '@/lib/types';
import StampBadge from '@/components/StampBadge';

interface ShareVerdictCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry;
}

export default function ShareVerdictCardModal({ isOpen, onClose, entry }: ShareVerdictCardModalProps) {
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
        cacheBust: true,
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
      {/* Hidden Card Template (9:16 aspect ratio - 1080x1920 logical size) */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div 
          ref={cardRef}
          className="w-[1080px] h-[1920px] bg-ink relative overflow-hidden flex flex-col justify-end p-16 font-sans"
        >
          {/* Background image */}
          {(entry.posterPath || entry.backdropPath) && (
            <img 
              src={entry.posterPath || entry.backdropPath} 
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Content */}
          <div className="relative z-10 w-full max-w-[800px] mx-auto bg-black/40 backdrop-blur-3xl rounded-[60px] p-16 border-[3px] border-white/20 shadow-2xl">
            <h1 className="text-[90px] font-bold text-white leading-tight font-editorial mb-4">
              {entry.title}
            </h1>
            
            <div className="flex items-center gap-6 mb-12">
              <div className="px-6 py-2 bg-white/10 rounded-full text-3xl font-bold text-white/80 uppercase tracking-widest">
                {entry.releaseYear}
              </div>
              {entry.rating && (
                <div className="px-6 py-2 bg-cinema-red rounded-full text-3xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  ★ {entry.rating.toFixed(1)}
                </div>
              )}
            </div>

            {entry.stamp && (
              <div className="mb-12">
                 <div className="inline-block px-10 py-5 rounded-full border-[4px] border-cinema-red bg-cinema-red/20 text-cinema-red text-[40px] font-black uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(234,51,51,0.5)]">
                   {entry.stamp}
                 </div>
              </div>
            )}

            {entry.shortVerdict && (
              <div className="mb-16">
                <p className="text-[50px] text-white/90 italic font-medium leading-relaxed border-l-[8px] border-cinema-red pl-10">
                  "{entry.shortVerdict}"
                </p>
              </div>
            )}

            <div className="mt-16 flex items-center gap-6">
              <div className="w-24 h-24 bg-cinema-red rounded-full flex items-center justify-center text-white text-5xl font-bold font-editorial">
                R
              </div>
              <div>
                <p className="text-[30px] font-bold text-white uppercase tracking-widest">Rec'd Club</p>
                <p className="text-[24px] text-white/50 uppercase tracking-widest">My Verdict Journal</p>
              </div>
            </div>
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

'use client';

import React from 'react';

interface PlatformLogoProps {
  platformName: string;
  logoUrl?: string;
}

const PLATFORM_ASSETS: Record<string, string> = {
  'Netflix': '/logos/platforms/netflix.svg',
  'Prime Video': '/logos/platforms/prime-video.svg',
  'Apple TV+': '/logos/platforms/apple-tv-plus.svg',
  'Apple TV': '/logos/platforms/apple-tv-plus.svg',
  'Disney+': '/logos/platforms/disney-plus.svg',
  'MUBI': '/logos/platforms/mubi.svg',
  'YouTube': '/logos/platforms/youtube.svg',
};

export default function PlatformLogo({ platformName, logoUrl }: PlatformLogoProps) {
  const assetPath = logoUrl || PLATFORM_ASSETS[platformName];

  if (assetPath) {
    return (
      <div className="flex items-center group/logo">
        <img 
          src={assetPath} 
          alt={platformName} 
          className={`h-7 w-auto rounded-md object-contain transition-transform group-hover/logo:scale-110 ${(!logoUrl && platformName.includes('Apple')) ? 'brightness-0 invert' : ''}`} 
        />
      </div>
    );
  }

  // Fallback text pill
  return (
    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-bone/60 hover:text-bone hover:border-white/20 transition-all cursor-default">
      {platformName}
    </span>
  );
}

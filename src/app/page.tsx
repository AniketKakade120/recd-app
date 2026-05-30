'use client';

import { useRouter } from 'next/navigation';
import { useScroll, useSpring } from 'framer-motion';
import { useApp } from '@/lib/context';

import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import EmotionalSection from '@/components/landing/EmotionalSection';
import TasteMatchSection from '@/components/landing/TasteMatchSection';
import StampsSection from '@/components/landing/StampsSection';
import TasteScoreSection from '@/components/landing/TasteScoreSection';
import CrewsSection from '@/components/landing/CrewsSection';
import ListsSection from '@/components/landing/ListsSection';
import FinalCTASection from '@/components/landing/FinalCTASection';
import GlobalRedStamp from '@/components/landing/GlobalRedStamp';

// --- AUDIO UTILITY ---
const playStampSound = () => {
  try {
    const audio = new Audio('/stamp.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch (e) {}
};

export default function LandingPage() {
  const { isAuthenticated, loading } = useApp();
  const router = useRouter();
  
  // Global scroll progress
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001
  });

  const handleGetStarted = () => {
    if (loading) return;
    playStampSound();
    router.push(isAuthenticated ? '/home' : '/login');
  };

  return (
    <div className="bg-ink text-bone font-sans selection:bg-cinema-red selection:text-bone relative overflow-hidden">
      
      {/* Global Background Motion - Deep Black & Red Gradients & Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        {/* Animated Noise */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay z-10"
          style={{ backgroundImage: 'url("/noise.png")', backgroundSize: '100px 100px' }}
        />
        {/* Dark Red Orbiting Core */}
        <div
          className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] bg-gradient-to-br from-cinema-red/10 to-black rounded-full blur-[150px] animate-[spin_20s_linear_infinite]"
        />
        {/* Pitch Black Void Orbiting */}
        <div
          className="absolute -bottom-[20%] -left-[10%] w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-black/80 rounded-full blur-[100px] z-0 animate-[spin_25s_linear_infinite_reverse]"
        />
      </div>

      <GlobalRedStamp progress={smoothProgress} />

      <LandingNav onGetStarted={handleGetStarted} />

      <main className="relative z-10">
        <HeroSection onGetStarted={handleGetStarted} />
        <ProblemSection />
        <HowItWorksSection />
        <EmotionalSection />
        <TasteMatchSection />
        <StampsSection />
        <TasteScoreSection />
        <CrewsSection />
        <ListsSection />
        <FinalCTASection onGetStarted={handleGetStarted} />
      </main>
    </div>
  );
}

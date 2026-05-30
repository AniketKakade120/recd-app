'use client';

import { motion } from 'framer-motion';
import HeroProductMockup from './HeroProductMockup';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center pt-24 pb-16 px-6 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-cinema-red/8 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto w-full">
        {/* Hero copy */}
        <div className="text-center mb-12 md:mb-16 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold font-editorial leading-[0.95] tracking-tight mb-6"
          >
            Every movie rec{' '}
            <br className="hidden sm:block" />
            gets a <span className="italic text-cinema-red">verdict.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-bone/50 max-w-xl mx-auto leading-relaxed mb-8"
          >
            Recommend movies and shows to the people they were meant for. They watch, rate, stamp, and tell you how it landed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={onGetStarted}
              className="px-10 py-4 bg-cinema-red text-bone text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-cinema-red/90 transition-all duration-300 shadow-[0_0_40px_rgba(234,51,51,0.2)] hover:shadow-[0_0_60px_rgba(234,51,51,0.35)] btn-press"
            >
              Get Started
            </button>
          </motion.div>
        </div>

        {/* Product mockup */}
        <HeroProductMockup />
      </div>
    </section>
  );
}

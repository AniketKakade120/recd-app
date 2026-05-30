'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function ListsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px' });

  return (
    <section ref={ref} className="relative py-28 md:py-36 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        
        {/* Left: Interactive List Visual */}
        <div className="lg:w-1/2 relative w-full h-[400px] sm:h-[450px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: -3 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-10 left-0 sm:left-10 w-[260px] sm:w-[300px] bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl z-10"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-bone font-editorial leading-tight">Rainy Day Comfort</h3>
                <p className="text-[10px] text-bone/40 uppercase tracking-widest mt-1">4 titles</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-cinema-red/10 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea3333" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="h-32 bg-ink rounded-lg overflow-hidden border border-white/5 relative">
                <img src="https://image.tmdb.org/t/p/w200/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg" alt="Past Lives" className="absolute inset-0 w-full h-full object-cover opacity-80" />
              </div>
              <div className="h-32 bg-ink rounded-lg overflow-hidden border border-white/5 relative">
                <img src="https://media.themoviedb.org/t/p/w200/aKCvdFFF5n80P2VdS7d8YBwbCjh.jpg" alt="Perks" className="absolute inset-0 w-full h-full object-cover opacity-80" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: 4 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-24 right-0 sm:right-10 w-[240px] sm:w-[260px] bg-ink/90 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-xl z-0"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-bone/80 font-editorial leading-tight">Mindbenders</h3>
                <p className="text-[10px] text-bone/30 uppercase tracking-widest mt-1">12 titles</p>
              </div>
            </div>
            <div className="h-24 bg-surface/50 rounded-lg border border-white/5 mb-2" />
            <div className="h-12 bg-surface/50 rounded-lg border border-white/5" />
          </motion.div>
        </div>

        {/* Right: Copy */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-1/2 space-y-6"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-editorial leading-[1.05] tracking-tight">
            Build lists worth
            <br />
            coming back to.
          </h2>
          <p className="text-lg text-bone/50 leading-relaxed max-w-md">
            Save picks, create your own watchlists, and share curation with people who get the vibe.
          </p>
        </motion.div>

      </div>
    </section>
  );
}

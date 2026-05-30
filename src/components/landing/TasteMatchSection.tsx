'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import UserAvatar from '@/components/UserAvatar';

export default function TasteMatchSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px' });

  return (
    <section ref={ref} className="relative py-28 md:py-36 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-editorial leading-tight tracking-tight mb-5">
            A great movie can still
            <br />
            be a bad rec.
          </h2>
          <p className="text-base text-bone/40 max-w-lg mx-auto leading-relaxed">
            Taste Match shows how likely a recommendation is to land with a specific person.
          </p>
        </motion.div>

        {/* Split cards */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">
          
          {/* High match: Maya */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[280px]"
          >
            {/* Avatar + match badge */}
            <div className="flex flex-col items-center gap-3 mb-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
              >
                <UserAvatar name="Maya" size="lg" />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : {}}
                transition={{ delay: 0.6 }}
                className="px-5 py-2 bg-cinema-red text-bone text-sm font-black uppercase tracking-widest rounded-xl shadow-[0_0_25px_rgba(234,51,51,0.4)] border border-white/20"
              >
                92% Match
              </motion.div>
            </div>

            {/* Movie card */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-ink shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <div className="relative h-[160px]">
                <img
                  src="https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg"
                  alt="Past Lives"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <p className="text-sm font-bold text-bone font-editorial">Past Lives</p>
                  <p className="text-[10px] text-bone/40">2023 · Drama</p>
                </div>
              </div>
              <div className="p-4">
                {/* Stars */}
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.svg
                      key={star}
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ delay: 0.8 + star * 0.08, type: 'spring', stiffness: 300, damping: 15 }}
                      width="16" height="16" viewBox="0 0 24 24"
                      fill="#ea3333" stroke="#ea3333" strokeWidth="1.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </motion.svg>
                  ))}
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ delay: 1.2, type: 'spring', stiffness: 200, damping: 12 }}
                  className="inline-flex px-3 py-1 bg-cinema-red text-bone text-[9px] font-black uppercase tracking-wider rounded"
                >
                  Good Call
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Low match: Josh */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[280px] grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
          >
            {/* Avatar + match badge */}
            <div className="flex flex-col items-center gap-3 mb-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 15 }}
              >
                <UserAvatar name="Josh" size="lg" />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : {}}
                transition={{ delay: 0.8 }}
                className="px-5 py-2 bg-surface text-bone/50 text-sm font-black uppercase tracking-widest rounded-xl shadow-xl border border-white/10"
              >
                48% Match
              </motion.div>
            </div>

            {/* Movie card */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-ink shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <div className="relative h-[160px]">
                <img
                  src="https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg"
                  alt="Past Lives"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <p className="text-sm font-bold text-bone font-editorial">Past Lives</p>
                  <p className="text-[10px] text-bone/40">2023 · Drama</p>
                </div>
              </div>
              <div className="p-4">
                {/* Stars - only 2 lit */}
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      width="16" height="16" viewBox="0 0 24 24"
                      fill={star <= 2 ? 'rgba(255,255,255,0.3)' : 'none'}
                      stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <div className="inline-flex px-3 py-1 bg-white/5 text-bone/40 text-[9px] font-black uppercase tracking-wider rounded border border-white/5">
                  Not For Everyone
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

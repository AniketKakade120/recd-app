'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import UserAvatar from '@/components/UserAvatar';

const crews = [
  {
    name: 'Film Chaos Club',
    count: 24,
    stamp: 'Crew Pick',
    lastPick: 'Dune: Part Two',
    delay: 0.2
  },
  {
    name: 'Slow Burn Club',
    count: 12,
    stamp: 'Worth It',
    lastPick: 'Anatomy of a Fall',
    delay: 0.4
  },
  {
    name: 'Trash TV Tuesdays',
    count: 48,
    stamp: 'Risky But Worth It',
    lastPick: 'Love Is Blind',
    delay: 0.6
  }
];

export default function CrewsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px' });

  return (
    <section ref={ref} id="crews" className="relative py-28 md:py-36 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-editorial leading-tight tracking-tight mb-5">
            Your group chat,
            <br />
            but with better memory.
          </h2>
          <p className="text-base text-bone/40 max-w-lg mx-auto leading-relaxed">
            Create crews, send picks, collect verdicts, and remember who actually has taste.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {crews.map((crew, i) => (
            <motion.div
              key={crew.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: crew.delay, ease: [0.16, 1, 0.3, 1] }}
              className="bg-surface/40 border border-white/5 rounded-3xl p-8 text-left hover:border-cinema-red/20 transition-colors duration-500 group relative overflow-hidden"
            >
              {/* Subtle hover glow */}
              <div className="absolute -inset-20 bg-cinema-red/0 group-hover:bg-cinema-red/5 blur-3xl transition-colors duration-500 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex -space-x-3 mb-8">
                  <UserAvatar name="A" size="sm" className="border-2 border-surface" />
                  <UserAvatar name="B" size="sm" className="border-2 border-surface" />
                  <UserAvatar name="C" size="sm" className="border-2 border-surface" />
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-ink flex items-center justify-center text-[10px] font-bold text-bone/50 z-10">
                    +4
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-bone mb-2 font-editorial group-hover:text-cinema-red transition-colors">{crew.name}</h3>
                <p className="text-[10px] text-bone/40 mb-8 uppercase tracking-widest font-bold">
                  {crew.count} verdicts
                </p>

                <div className="pt-6 border-t border-white/5">
                  <p className="text-[10px] text-bone/30 uppercase tracking-widest font-bold mb-2">Recent Pick</p>
                  <p className="text-sm font-bold text-bone mb-3">{crew.lastPick}</p>
                  <div className="inline-flex px-3 py-1 bg-white/5 text-bone/60 text-[9px] font-black uppercase tracking-wider rounded border border-white/10">
                    {crew.stamp}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

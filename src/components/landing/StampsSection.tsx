'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const stamps = [
  { label: 'Good Call', type: 'positive', rotate: -6, delay: 0.1 },
  { label: 'Worth It', type: 'positive', rotate: 4, delay: 0.2 },
  { label: 'Risky But Worth It', type: 'neutral', rotate: -3, delay: 0.3 },
  { label: 'Not For Everyone', type: 'neutral', rotate: 8, delay: 0.4 },
  { label: 'Missed The Mark', type: 'negative', rotate: -5, delay: 0.5 },
  { label: 'Certified Good Call', type: 'positive', rotate: 2, delay: 0.6 },
];

export default function StampsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px' });

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cinema-red/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* Left: Copy */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-5/12 space-y-6"
        >
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold font-editorial leading-[0.95] tracking-tight">
            Say less.<br />
            Stamp it.
          </h2>
          <p className="text-lg text-bone/50 leading-relaxed max-w-sm">
            Sometimes a number isn&apos;t enough. Every verdict carries personality. Good Call. Worth It. Missed The Mark.
          </p>
        </motion.div>

        {/* Right: Stamps slam area */}
        <div className="lg:w-7/12 relative h-[400px] sm:h-[500px] w-full border border-white/5 bg-surface/30 rounded-3xl overflow-hidden flex flex-wrap items-center justify-center p-8 gap-6 shadow-2xl">
          {stamps.map((stamp, i) => {
            const isPositive = stamp.type === 'positive';
            const isNeutral = stamp.type === 'neutral';
            
            let colorClasses = '';
            if (isPositive) {
              colorClasses = 'bg-cinema-red text-bone shadow-[0_10px_30px_rgba(234,51,51,0.4)] border-none';
            } else if (isNeutral) {
              colorClasses = 'bg-ink border-2 border-white/20 text-bone';
            } else {
              colorClasses = 'bg-ink border-2 border-white/10 text-bone/50';
            }

            return (
              <motion.div
                key={stamp.label}
                initial={{ opacity: 0, scale: 3, filter: 'blur(20px)' }}
                animate={isInView ? { 
                  opacity: 1, 
                  scale: 1, 
                  filter: 'blur(0px)',
                  rotate: stamp.rotate 
                } : {}}
                transition={{ 
                  duration: 0.6, 
                  delay: stamp.delay, 
                  type: 'spring', 
                  stiffness: 150, 
                  damping: 15 
                }}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-black uppercase tracking-[0.2em] relative z-10 ${colorClasses}`}
              >
                {/* Slam impact effect */}
                {isInView && (
                  <motion.div
                    initial={{ opacity: 0.8, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 0.5, delay: stamp.delay + 0.1 }}
                    className={`absolute inset-0 rounded-xl ${isPositive ? 'border-2 border-cinema-red' : 'border-2 border-white/30'}`}
                  />
                )}
                
                {stamp.label}
              </motion.div>
            );
          })}

          {/* Random ink splatters in background */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 0.6 } : {}}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="absolute w-1.5 h-1.5 bg-cinema-red/30 rounded-full blur-[1px]"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

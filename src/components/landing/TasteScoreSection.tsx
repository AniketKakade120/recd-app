'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export default function TasteScoreSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px' });
  
  const [score, setScore] = useState(0);

  // Animate the number counting up
  useEffect(() => {
    if (isInView) {
      const duration = 2000; // 2 seconds
      const targetScore = 86;
      const startTime = performance.now();
      
      const animateCount = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing out function for natural slow-down
        const easeOutQuad = (t: number) => t * (2 - t);
        const currentScore = Math.floor(targetScore * easeOutQuad(progress));
        
        setScore(currentScore);
        
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        }
      };
      
      requestAnimationFrame(animateCount);
    }
  }, [isInView]);

  return (
    <section ref={ref} id="taste-score" className="relative py-28 md:py-36 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        
        {/* Left: Copy */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-1/2 space-y-6 text-center lg:text-left"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-editorial leading-[1.05] tracking-tight">
            Taste Score is built,
            <br className="hidden lg:block" />
            not claimed.
          </h2>
          <p className="text-lg text-bone/50 leading-relaxed max-w-md mx-auto lg:mx-0">
            Every verdict shapes your reputation. A high score means your recommendations actually land.
          </p>
        </motion.div>

        {/* Right: Score Visual */}
        <div className="lg:w-1/2 relative w-full flex justify-center">
          
          <div className="relative w-[320px] h-[320px] flex items-center justify-center">
            {/* The Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(234,51,51,0.3)]">
              {/* Background Track */}
              <circle cx="160" cy="160" r="140" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
              
              {/* Animated Progress Ring (86%) */}
              <motion.circle 
                cx="160" cy="160" r="140" 
                stroke="#ea3333" 
                strokeWidth="10" 
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 0.86 } : {}}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              />
            </svg>

            {/* Inner Content */}
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[110px] font-editorial font-bold text-bone leading-[0.8] tracking-tighter">
                {score}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cinema-red mt-4 bg-cinema-red/10 px-3 py-1 rounded">
                Great Taste
              </span>
            </div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="absolute -right-8 top-12 bg-surface/80 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl"
            >
              <p className="text-[10px] text-bone/40 uppercase tracking-widest font-bold mb-1">Top Stamp</p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-bone">
                <span className="w-2 h-2 rounded-full bg-cinema-red" />
                Good Call
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 1.7 }}
              className="absolute -left-12 bottom-16 bg-surface/80 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl"
            >
              <p className="text-[10px] text-bone/40 uppercase tracking-widest font-bold mb-1">Hit Rate</p>
              <p className="text-xl font-editorial font-bold text-bone">24 / 28</p>
              <p className="text-[9px] text-bone/40">recs landed</p>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}

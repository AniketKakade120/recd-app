'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function ProblemSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px' });

  const bubbles = [
    { text: 'bro you HAVE to watch this', x: '10%', y: '5%', rotate: -3 },
    { text: 'its on netflix i think??', x: '55%', y: '12%', rotate: 2 },
    { text: 'wait which one was it', x: '25%', y: '30%', rotate: -1 },
    { text: 'the one with the time loops', x: '60%', y: '38%', rotate: 3 },
    { text: 'ill watch it tmrw', x: '15%', y: '55%', rotate: -2 },
    { text: '📸 *screenshot of letterboxd*', x: '50%', y: '60%', rotate: 1 },
    { text: 'nvm i forgot what it was called', x: '30%', y: '78%', rotate: -4 },
  ];

  return (
    <section ref={ref} className="relative py-28 md:py-36 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-editorial leading-[1.05] tracking-tight">
              &ldquo;Trust me, bro&rdquo; is not a recommendation system.
            </h2>
            <p className="text-base sm:text-lg text-bone/45 leading-relaxed max-w-lg">
              Your group chats are full of movie suggestions, screenshots, and forgotten recs.
              Rec&apos;d Club turns loose picks into real verdicts.
            </p>
          </motion.div>

          {/* Right: Chaotic chat → structured card */}
          <div className="relative h-[400px] sm:h-[450px]">
            {/* Chaotic bubbles */}
            {bubbles.map((bubble, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="absolute"
                style={{ left: bubble.x, top: bubble.y, transform: `rotate(${bubble.rotate}deg)` }}
              >
                <div className="bg-surface/80 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl rounded-bl-md text-[11px] sm:text-xs text-bone/70 shadow-lg whitespace-nowrap">
                  {bubble.text}
                </div>
              </motion.div>
            ))}

            {/* Structured card that appears */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-4 right-0 left-0 mx-auto w-[280px] bg-ink border border-cinema-red/20 rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(234,51,51,0.1)]"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-cinema-red/20 flex items-center justify-center text-[8px] font-bold text-cinema-red">AK</div>
                <div>
                  <p className="text-[10px] font-bold text-bone">Dark</p>
                  <p className="text-[8px] text-bone/30">Rec&apos;d by Aniket</p>
                </div>
              </div>
              <p className="text-[10px] text-bone/50 italic mb-3">&ldquo;Mind-bending time loops. Best sci-fi in years.&rdquo;</p>
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-bold text-cinema-red uppercase tracking-wider">92% match</span>
                <div className="px-3 py-1 bg-cinema-red text-bone text-[8px] font-bold uppercase tracking-wider rounded">Give Verdict</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

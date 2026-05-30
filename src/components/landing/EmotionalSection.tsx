'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import UserAvatar from '@/components/UserAvatar';

export default function EmotionalSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px' });

  return (
    <section ref={ref} className="relative py-28 md:py-36 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cinema-red/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-editorial leading-tight tracking-tight mb-5">
            Some stories are meant
            <br />
            for specific people.
          </h2>
          <p className="text-base text-bone/40 max-w-lg mx-auto leading-relaxed">
            Sometimes you recommend a movie because it reminded you of someone.
            Rec&apos;d Club helps you send the pick and see how it landed.
          </p>
        </motion.div>

        {/* The emotional exchange */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 md:scale-125 md:mt-16 mb-8 origin-top">
          
          {/* Recommendation note */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[340px] bg-surface/60 border border-white/8 rounded-2xl p-6 relative"
          >
            <div className="absolute -top-3 left-6 px-3 py-1 bg-ink border border-white/10 rounded-lg text-[9px] font-bold text-bone/40 uppercase tracking-wider">
              Recommendation
            </div>

            <div className="flex items-center gap-3 mb-5 mt-2">
              <UserAvatar name="Maya" size="sm" />
              <div>
                <p className="text-xs font-bold text-bone">Maya</p>
                <p className="text-[10px] text-bone/30">sent to you</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://image.tmdb.org/t/p/w200/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg"
                alt="Past Lives"
                className="w-12 h-16 rounded-lg object-cover border border-white/10"
              />
              <div>
                <p className="text-sm font-bold text-bone font-editorial">Past Lives</p>
                <p className="text-[10px] text-bone/30">2023 · Drama · Romance</p>
              </div>
            </div>

            <div className="bg-ink/60 border border-white/5 rounded-xl px-4 py-3">
              <p className="text-xs text-bone/60 italic leading-relaxed">
                &ldquo;This felt like your exact kind of slow-burn heartbreak. You&apos;ll understand why I thought of you.&rdquo;
              </p>
            </div>
          </motion.div>

          {/* Arrow / connection */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-bone/15 rotate-90 md:rotate-0"
          >
            <svg width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M0 12h36m0 0l-6-6m6 6l-6 6" />
            </svg>
          </motion.div>

          {/* Verdict response */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[340px] bg-surface/60 border border-cinema-red/15 rounded-2xl p-6 relative shadow-[0_0_40px_rgba(234,51,51,0.06)]"
          >
            <div className="absolute -top-3 left-6 px-3 py-1 bg-ink border border-cinema-red/20 rounded-lg text-[9px] font-bold text-cinema-red uppercase tracking-wider">
              Verdict
            </div>

            <div className="flex items-center gap-3 mb-5 mt-2">
              <UserAvatar name="You" size="sm" />
              <div>
                <p className="text-xs font-bold text-bone">You</p>
                <p className="text-[10px] text-bone/30">gave a verdict</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.svg
                    key={star}
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ delay: 1 + star * 0.08, type: 'spring', stiffness: 300, damping: 15 }}
                    width="18" height="18" viewBox="0 0 24 24"
                    fill={star <= 4 ? '#ea3333' : 'none'}
                    stroke={star <= 4 ? '#ea3333' : 'rgba(255,255,255,0.1)'}
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </motion.svg>
                ))}
              </div>
              <span className="text-lg font-bold text-bone font-editorial">4.5</span>
            </div>

            {/* Accuracy */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.3 }}
              className="text-sm text-bone/50 mb-4"
            >
              &ldquo;Nailed it.&rdquo;
            </motion.p>

            {/* Stamp */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={isInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ delay: 1.5, type: 'spring', stiffness: 200, damping: 12 }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-cinema-red text-bone text-[10px] font-black uppercase tracking-[0.12em] rounded-lg shadow-[0_0_20px_rgba(234,51,51,0.3)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Good Call
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

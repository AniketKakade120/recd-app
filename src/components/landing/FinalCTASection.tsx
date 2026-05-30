'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface FinalCTASectionProps {
  onGetStarted: () => void;
}

export default function FinalCTASection({ onGetStarted }: FinalCTASectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px' });

  return (
    <section ref={ref} className="relative py-32 md:py-48 px-6 overflow-hidden border-t border-white/5 bg-ink">
      {/* Cinematic Red Glow Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 2, ease: "easeOut" }}
          className="w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-cinema-red/15 rounded-full blur-[150px] md:blur-[200px]"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-8xl font-bold font-editorial text-bone leading-[0.95] tracking-tight mb-6"
        >
          Start the club.<br />
          Send the first rec.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-bone/50 max-w-xl mx-auto mb-12"
        >
          Your next great watch needs a witness.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={onGetStarted}
            className="px-12 py-5 bg-cinema-red text-bone text-sm font-black uppercase tracking-[0.2em] rounded-xl hover:bg-cinema-red/90 transition-all duration-300 shadow-[0_0_40px_rgba(234,51,51,0.3)] hover:shadow-[0_0_60px_rgba(234,51,51,0.5)] btn-press"
          >
            Get Started
          </button>
        </motion.div>
      </div>

      {/* Footer minimal links */}
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <p className="text-[10px] text-bone/20 uppercase tracking-widest font-bold">
          © {new Date().getFullYear()} Rec&apos;d Club
        </p>
      </div>
    </section>
  );
}

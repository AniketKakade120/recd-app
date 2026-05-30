'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    num: '01',
    title: 'Recommend',
    desc: 'Send a title with your reason and why it belongs with them.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'They Watch',
    desc: 'It lands in their queue. Trusted. Prioritized.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'The Verdict',
    desc: 'They rate it, stamp it, and tell you how it landed.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Score Updates',
    desc: 'Your Taste Score grows. Your reputation as a recommender builds.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
];

export default function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-15% 0px' });

  return (
    <section ref={ref} id="how-it-works" className="relative py-28 md:py-36 px-6 overflow-hidden">
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
            Send the pick.
            <br />
            See how it lands.
          </h2>
          <p className="text-base text-bone/40">A recommendation becomes a social moment.</p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {/* Connecting line (desktop) */}
          <div className="absolute top-14 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-cinema-red/0 via-cinema-red/20 to-cinema-red/0 hidden lg:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-surface/50 border border-white/5 rounded-2xl p-7 group hover:border-cinema-red/20 transition-all duration-500"
            >
              {/* Step number */}
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cinema-red mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-cinema-red/10 flex items-center justify-center text-[9px]">{step.num}</span>
                <span>Step {step.num}</span>
              </div>

              {/* Icon */}
              <div className="relative w-fit mb-5">
                <div className="absolute inset-0 bg-cinema-red/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative text-cinema-red drop-shadow-[0_0_12px_rgba(234,51,51,0.4)]">
                  {step.icon}
                </div>
              </div>

              <h3 className="text-lg font-bold text-bone mb-2 font-editorial">{step.title}</h3>
              <p className="text-sm text-bone/40 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

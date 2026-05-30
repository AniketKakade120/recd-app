'use client';

import { motion } from 'framer-motion';
import UserAvatar from '@/components/UserAvatar';

export default function HeroProductMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[920px] mx-auto perspective-[1200px]"
    >
      {/* Glow behind mockup */}
      <div className="absolute -inset-20 bg-cinema-red/8 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -inset-10 bg-cinema-red/5 blur-[60px] rounded-full pointer-events-none" />

      {/* Main mockup frame */}
      <div className="relative bg-ink rounded-2xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6),0_0_60px_rgba(234,51,51,0.08)] overflow-hidden">
        
        {/* Window chrome / top bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-ink/80">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-white/5 text-[10px] text-bone/30 font-medium">recdclub.in</div>
          </div>
        </div>

        {/* Product nav */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
          <span className="font-editorial font-bold text-bone text-sm tracking-tight">
            Rec<span className="text-cinema-red">&apos;</span>d Club
          </span>
          <div className="hidden sm:flex items-center gap-6">
            {['Home', 'Explore', 'Groups', 'Watchlist'].map((item, i) => (
              <span key={item} className={`text-[10px] font-bold uppercase tracking-widest ${i === 0 ? 'text-bone border-b border-bone' : 'text-bone/40'}`}>
                {item}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-bone/40">✦ Invite</span>
          </div>
        </div>

        {/* Content area */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-0">
          
          {/* Main column */}
          <div className="p-6 space-y-5">
            
            {/* Search bar */}
            <div className="bg-surface/60 border border-white/5 rounded-xl p-4">
              <p className="text-xs font-bold text-bone mb-0.5">Know what you want to recommend?</p>
              <p className="text-[10px] text-bone/40 mb-2">Search movies, shows, or people you trust.</p>
              <div className="flex items-center gap-2 bg-ink/60 border border-white/5 rounded-lg px-3 py-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-bone/30">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <span className="text-[11px] text-bone/25">Search titles or people...</span>
              </div>
            </div>

            {/* Pending Verdicts */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold text-bone/60 uppercase tracking-widest mb-1">Pending Verdicts</p>
                  <p className="text-xl font-bold text-bone font-editorial">3 verdicts pending.</p>
                  <p className="text-[10px] text-bone/40">Your crew is waiting. Time to close the loop.</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-cinema-red/10 text-cinema-red border border-cinema-red/20 uppercase tracking-wider">
                  Requires Action
                </span>
              </div>

              {/* Large recommendation card */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative rounded-2xl overflow-hidden border border-white/10 bg-ink"
              >
                {/* Movie poster background */}
                <div className="relative h-[220px] sm:h-[260px]">
                  <img
                    src="https://media.themoviedb.org/t/p/w1280/aKCvdFFF5n80P2VdS7d8YBwbCjh.jpg"
                    alt="The Perks of Being a Wallflower"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-2 py-0.5 bg-cinema-red text-bone text-[8px] font-black uppercase tracking-wider rounded">
                      Aniket&apos;s Pick
                    </span>
                    <span className="px-2 py-0.5 bg-white/10 text-bone/70 text-[8px] font-bold uppercase tracking-wider rounded backdrop-blur-sm">
                      Verdict Pending
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-2xl sm:text-3xl font-bold text-bone font-editorial tracking-tight mb-1">
                      The Perks of Being a Wallflower
                    </h3>
                    <p className="text-[10px] text-bone/50 mb-2">2012 · Movie · Drama · 103 min</p>
                    <p className="text-xs text-bone/60 italic">&ldquo;You&apos;re a Wallflower.&rdquo;</p>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="px-5 py-4 flex items-center justify-between border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <UserAvatar name="Aniket" size="sm" />
                    <div>
                      <p className="text-xs font-bold text-bone">Rec&apos;d by <span className="text-cinema-red">Aniket Kakade</span></p>
                      <p className="text-[10px] text-bone/40">92% taste match ✦</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      animate={{ boxShadow: ['0 0 0px rgba(234,51,51,0)', '0 0 20px rgba(234,51,51,0.4)', '0 0 0px rgba(234,51,51,0)'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="px-4 py-2 bg-cinema-red text-bone text-[10px] font-black uppercase tracking-widest rounded-lg"
                    >
                      Give Verdict
                    </motion.button>
                    <button className="px-4 py-2 bg-white/5 border border-white/10 text-bone text-[10px] font-bold uppercase tracking-widest rounded-lg">
                      Save
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block border-l border-white/5 p-4 space-y-4">
            
            {/* Taste Score card */}
            <div className="bg-surface/50 border border-white/5 rounded-xl p-4 text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-bone/40 mb-3">Your Taste Score</p>
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
                  <motion.circle
                    cx="40" cy="40" r="34"
                    stroke="#ea3333"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 0.98 }}
                    transition={{ duration: 2, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-editorial font-bold text-bone leading-none">98</span>
                  <span className="text-[7px] font-bold text-cinema-red uppercase tracking-wider">Taste</span>
                </div>
              </div>
              <p className="text-[9px] font-bold text-bone/60">Top 11% of Rec&apos;d</p>
              <p className="text-[8px] text-bone/30 mt-1">Your recommendations carry weight.</p>
            </div>

            {/* Expand crew card */}
            <div className="bg-surface/50 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-bone/40">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <p className="text-xs font-bold text-bone">Expand your crew</p>
              </div>
              <p className="text-[9px] text-bone/40 mb-3 leading-relaxed">Invite friends to start sharing recommendations that actually feel personal.</p>
              <div className="w-full py-2 bg-cinema-red/10 border border-cinema-red/20 text-cinema-red text-[9px] font-bold uppercase tracking-wider rounded-lg text-center">
                + Invite friends
              </div>
            </div>

            {/* Your Crew mini */}
            <div className="bg-surface/50 border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-bone/40">Your Crew</p>
                <span className="w-4 h-4 rounded bg-cinema-red/10 text-cinema-red text-[8px] font-bold flex items-center justify-center">1</span>
              </div>
              <div className="flex items-center gap-2">
                <UserAvatar name="Maya" size="sm" />
                <div>
                  <p className="text-[10px] font-bold text-bone">Maya</p>
                  <p className="text-[8px] text-bone/30">2 recs sent</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom progress */}
        <div className="flex items-center justify-between px-6 py-2 border-t border-white/5">
          <div className="flex gap-1">
            <div className="w-8 h-1 rounded-full bg-cinema-red" />
            <div className="w-8 h-1 rounded-full bg-white/10" />
            <div className="w-8 h-1 rounded-full bg-white/10" />
          </div>
          <span className="text-[9px] font-bold text-bone/30 uppercase tracking-wider">1 of 3 <span className="text-cinema-red">Pending</span></span>
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Users, UserPlus } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

export default function HeroDashboardMockup() {
  return (
    <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative select-none">
      
      {/* Top Navigation Mockup */}
      <div className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/5">
        <div className="font-editorial font-bold text-xl text-bone">Rec&apos;d Club</div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <div className="text-bone relative">
            Home
            <div className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-cinema-red" />
          </div>
          <div className="text-bone/50">Explore</div>
          <div className="text-bone/50">Groups</div>
          <div className="text-bone/50">Watchlist</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-bone/50 text-xs font-semibold mr-2">
            <UserPlus size={14} />
            Invite
          </div>
          <div className="px-4 py-1.5 bg-cinema-red text-bone text-xs font-bold rounded-full">
            + Recommend
          </div>
          <UserAvatar name="Aniket Kakade" size="sm" />
        </div>
      </div>

      {/* Main Content Mockup */}
      <div className="p-6 md:p-10 flex-grow bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cinema-red/5 via-transparent to-transparent">
        
        {/* Search Area */}
        <div className="mb-12">
          <h2 className="text-bone font-bold text-lg mb-1">Know what you want to recommend?</h2>
          <p className="text-bone/50 text-sm mb-4">Search movies, shows, or people you trust.</p>
          <div className="w-full max-w-3xl bg-surface border border-white/10 h-12 rounded-xl flex items-center px-4 gap-3 text-bone/30">
            <Search size={18} />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-sm font-medium"
            >
              Search titles or people...
            </motion.span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Area (Pending Verdicts) */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-bone font-bold text-sm">Pending Verdicts</span>
                <span className="px-2 py-0.5 bg-cinema-red/20 text-cinema-red text-[9px] font-black tracking-widest uppercase rounded">
                  Requires Action
                  <span className="inline-block w-1.5 h-1.5 bg-cinema-red rounded-full ml-1.5 animate-pulse" />
                </span>
              </div>
              <span className="text-cinema-red text-xs font-bold">View all</span>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-editorial font-bold text-bone mb-1">3 verdicts pending.</h1>
              <p className="text-bone/50 text-sm">Your crew is waiting. Time to close the loop.</p>
            </div>

            {/* Movie Card Mockup */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full bg-surface border border-white/5 rounded-2xl overflow-hidden relative"
            >
              <div className="absolute inset-0">
                <img 
                  src="https://image.tmdb.org/t/p/w1280/x2IqsMlXpw2RkXWwX5oQ88P2FhJ.jpg" 
                  alt="Perks of being a wallflower" 
                  className="w-full h-full object-cover opacity-30 object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/80 to-transparent" />
              </div>
              
              <div className="relative p-6 h-full flex flex-col justify-end min-h-[300px]">
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-cinema-red text-bone text-[9px] font-black uppercase tracking-widest rounded-sm">
                    Aniket Kakade's Pick
                  </span>
                  <span className="px-2 py-1 bg-white/10 text-bone/50 border border-white/10 text-[9px] font-black uppercase tracking-widest rounded-sm">
                    Verdict Pending
                  </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-editorial font-bold text-bone mb-2">The Perks of Being a Wallflower</h2>
                <div className="flex items-center gap-3 text-bone/50 text-xs font-semibold mb-6">
                  <span>2012</span>
                  <span>Movie</span>
                  <span>Drama</span>
                  <span>103 min</span>
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <ChevronLeft size={16} className="text-bone" />
                  </div>
                  <p className="text-bone/70 italic text-sm font-medium">"You're a Wallflower"</p>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <ChevronRight size={16} className="text-bone" />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-5 mt-auto">
                  <div className="flex items-center gap-3">
                    <UserAvatar name="Aniket Kakade" size="sm" />
                    <div>
                      <div className="text-bone/70 text-xs font-semibold">Rec'd by <span className="text-bone">Aniket Kakade</span></div>
                      <div className="text-cinema-red text-[10px] font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full border border-cinema-red/50 flex items-center justify-center">
                          <span className="w-1 h-1 bg-cinema-red rounded-full" />
                        </span>
                        % Taste match
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="px-6 py-2.5 bg-cinema-red text-bone text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(234,51,51,0.3)]">Give Verdict</button>
                    <button className="px-6 py-2.5 bg-white/5 border border-white/10 text-bone text-xs font-bold rounded-xl">Save</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6">
            
            {/* Taste Score Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-surface border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center"
            >
              <div className="text-[10px] font-black uppercase tracking-widest text-bone/50 mb-8">Your Taste Score</div>
              
              <div className="relative w-32 h-32 mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#ea3333" 
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: 283, strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (283 * 0.98) }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    style={{ dropShadow: '0 0 10px rgba(234,51,51,0.5)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 }}
                    className="text-4xl font-editorial font-bold text-bone"
                  >
                    98
                  </motion.span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-bone/50">Taste</span>
                </div>
              </div>

              <h3 className="text-bone font-bold text-sm mb-1">Top 11% of Rec'd</h3>
              <p className="text-bone/50 text-xs mb-4">Your recommendations carry weight.</p>
              <div className="text-cinema-red text-xs font-bold hover:underline cursor-pointer">
                View score breakdown 
              </div>
            </motion.div>

            {/* Expand Crew Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-surface border border-white/5 rounded-2xl p-6"
            >
              <div className="w-8 h-8 rounded-full bg-cinema-red/10 flex items-center justify-center mb-4">
                <Users size={14} className="text-cinema-red" />
              </div>
              <h3 className="text-bone font-bold text-sm mb-2">Expand your crew</h3>
              <p className="text-bone/50 text-xs mb-6">Invite friends to start sharing recommendations that actually feel personal.</p>
              <button className="w-full py-3 bg-white/5 border border-white/10 text-bone text-xs font-bold rounded-xl">
                + Invite friends
              </button>
            </motion.div>

          </div>

        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useSpring, MotionValue, useInView } from 'framer-motion';
import Logo from '@/components/Logo';
import { useApp } from '@/lib/context';
import MovieCard from '@/components/MovieCard';
import EmptyStateMessage from '@/components/EmptyStateMessage';
import HeaderWrapper from '@/components/HeaderWrapper';
import UserAvatar from '@/components/UserAvatar';
import type { Title } from '@/lib/types';
import EmotionalSection from '@/components/landing/EmotionalSection';
import { Star, Share2, Play, ShieldCheck, MessageCircle, Send, Eye, Target, Users, Bookmark, Rocket } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_TITLES: Record<string, Title> = {
  perks: {
    id: 'l-1', tmdbId: 84892, title: 'The Perks of Being a Wallflower', type: 'movie' as const,
    posterUrl: 'https://media.themoviedb.org/t/p/w500/aKCvdFFF5n80P2VdS7d8YBwbCjh.jpg',
    posterGradient: 2, releaseYear: 2012, format: 'Movie',
    genres: ['Drama', 'Romance'], overview: 'A shy freshman is taken under the wings of two senior students.', externalRating: 8.0, cast: [], directorOrCreatorProfile: { id: '', name: 'Stephen Chbosky', role: 'Director' }
  },
  dark: {
    id: 'l-dark', tmdbId: 70523, title: 'Dark', type: 'series' as const,
    posterUrl: 'https://image.tmdb.org/t/p/w1280/eSVvx8xys2NuFhl8fevXt41wX7v.jpg',
    posterGradient: 3, releaseYear: 2017, format: 'Series',
    genres: ['Sci-Fi', 'Mystery'], overview: 'A family saga with a supernatural twist.', externalRating: 8.8, cast: [], directorOrCreatorProfile: { id: '', name: 'Baran bo Odar', role: 'Creator' }
  },
  tamasha: {
    id: 'l-tamasha', tmdbId: 344331, title: 'Tamasha', type: 'movie' as const,
    posterUrl: '/tamasha.jpg',
    posterGradient: 2, releaseYear: 2015, format: 'Movie',
    genres: ['Drama', 'Romance'], overview: 'A journey of self-discovery.', externalRating: 7.3, cast: [], directorOrCreatorProfile: { id: '', name: 'Imtiaz Ali', role: 'Director' }
  },
  severance: {
    id: 'l-2', tmdbId: 114682, title: 'Severance', type: 'series' as const,
    posterUrl: 'https://image.tmdb.org/t/p/w500/u3Ccb87Yp6pXU6SNo62z99v9972.jpg',
    posterGradient: 6, releaseYear: 2022, format: 'Series',
    genres: ['Sci-Fi', 'Drama'], overview: 'A mystery at the workplace.', externalRating: 8.7, cast: [], directorOrCreatorProfile: { id: '', name: 'Dan Erickson', role: 'Creator' }
  },
  pastLives: {
    id: 'l-3', tmdbId: 666277, title: 'Past Lives', type: 'movie' as const,
    posterUrl: 'https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg',
    posterGradient: 8, releaseYear: 2023, format: 'Movie',
    genres: ['Drama', 'Romance'], overview: 'Nora and Hae Sung, two deeply connected childhood friends.', externalRating: 7.9, cast: [], directorOrCreatorProfile: { id: '', name: 'Celine Song', role: 'Director' }
  },
  eeao: {
    id: 'l-4', tmdbId: 601796, title: 'Everything Everywhere All at Once', type: 'movie' as const,
    posterUrl: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    posterGradient: 2, releaseYear: 2022, format: 'Movie',
    genres: ['Action', 'Adventure', 'Sci-Fi'], overview: 'An aging Chinese immigrant is swept up in an insane adventure.', externalRating: 7.8, cast: [], directorOrCreatorProfile: { id: '', name: 'Daniels', role: 'Director' }
  },
  spiderman: {
    id: 'l-5', tmdbId: 569094, title: 'Spider-Man: Across the Spider-Verse', type: 'movie' as const,
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    posterGradient: 1, releaseYear: 2023, format: 'Movie',
    genres: ['Animation', 'Action', 'Adventure'], overview: 'Miles Morales catapults across the Multiverse.', externalRating: 8.7, cast: [], directorOrCreatorProfile: { id: '', name: 'Joaquim Dos Santos', role: 'Director' }
  }
};

// --- AUDIO UTILITY ---
const playStampSound = () => {
  try {
    const audio = new Audio('/stamp.mp3'); // Assumes user adds stamp.mp3 to public/
    audio.volume = 0.4;
    audio.play().catch(() => {}); // Catch autoplay restrictions
  } catch (e) {}
};

// --- GLOBAL FLOATING STORY BUTTON ---
function GlobalRedStamp({ progress }: { progress: MotionValue<number> }) {
  // Mapping global scroll progress to position
  const x = useTransform(progress, 
    [0, 0.08, 0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88, 1], 
    ["50vw", "50vw", "75vw", "20vw", "50vw", "50vw", "70vw", "30vw", "50vw", "80vw", "50vw"]
  );

  const y = useTransform(progress,
    [0, 0.08, 0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88, 1],
    ["10vh", "65vh", "50vh", "50vh", "50vh", "50vh", "50vh", "50vh", "40vh", "30vh", "65vh"]
  );

  const scale = useTransform(progress,
    [0, 0.08, 0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88, 0.95, 1],
    [0, 1, 1.1, 1, 1.2, 1, 1.1, 1.2, 1.1, 1, 1.3, 2]
  );

  const opacity = useTransform(progress, [0, 0.9, 0.98, 1], [1, 1, 0.5, 0]);

  const [storyStage, setStoryStage] = useState({ label: "Watch This", icon: Play });
  
  useEffect(() => {
    const unsub = progress.on("change", (v) => {
      if (v < 0.15) setStoryStage({ label: "Watch This", icon: Play });
      else if (v < 0.28) setStoryStage({ label: "Group Chat", icon: MessageCircle });
      else if (v < 0.42) setStoryStage({ label: "Send Rec", icon: Send });
      else if (v < 0.56) setStoryStage({ label: "The Verdict", icon: ShieldCheck });
      else if (v < 0.70) setStoryStage({ label: "Taste Match", icon: Target });
      else if (v < 0.82) setStoryStage({ label: "Score Up", icon: Star });
      else if (v < 0.94) setStoryStage({ label: "Crew Memory", icon: Users });
      else setStoryStage({ label: "Join Club", icon: Rocket });
    });
    return unsub;
  }, [progress]);

  const CurrentIcon = storyStage.icon;

  return (
    <motion.div 
      style={{ x, y, scale, opacity, originX: "50%", originY: "50%" }}
      className="fixed top-0 left-0 z-50 pointer-events-none -ml-[75px] -mt-[24px]"
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-cinema-red/50 blur-xl rounded-full" />
        <div className="relative flex items-center gap-3 px-6 py-3 bg-cinema-red rounded-full shadow-[0_0_40px_rgba(234,51,51,0.8)] border border-white/20">
           <CurrentIcon size={18} className="text-bone" />
           <span className="font-bold text-xs uppercase tracking-widest text-bone whitespace-nowrap">
             {storyStage.label}
           </span>
        </div>
      </div>
    </motion.div>
  );
}

// --- MAIN PAGE ---
export default function LandingPage() {
  const { isAuthenticated, loading } = useApp();
  const router = useRouter();
  const [panelsTriggered, setPanelsTriggered] = useState(false);
  
  // Global scroll progress (0 to 1 across the whole page)
  const { scrollYProgress } = useScroll();
  
  // Apply a spring to the scroll progress to completely eliminate friction/jitter
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001
  });

  const heroY = useTransform(smoothProgress, [0, 0.2], [0, -200]);
  const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 0.95]);

  // Use intersection observer for precise triggering when the section is in the middle of the screen
  const panelsRef = useRef<HTMLElement>(null);
  const isPanelsInView = useInView(panelsRef, { margin: "-40% 0px -40% 0px" });

  useEffect(() => {
    setPanelsTriggered(isPanelsInView);
  }, [isPanelsInView]);

  // Taste Match intersection
  const matchRef = useRef<HTMLElement>(null);
  const isMatchInView = useInView(matchRef, { margin: "-30% 0px -30% 0px" });

  // Taste Score intersection
  const scoreRef = useRef<HTMLElement>(null);
  const isScoreInView = useInView(scoreRef, { margin: "-30% 0px -30% 0px" });

  const handleGetStarted = () => {
    if (loading) return;
    playStampSound();
    router.push(isAuthenticated ? '/home' : '/login');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-ink text-bone font-sans selection:bg-cinema-red selection:text-bone relative overflow-hidden">
      
      {/* Global Background Motion - Deep Black & Red Gradients & Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        {/* Animated Noise */}
        <motion.div 
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay z-10"
          style={{ backgroundImage: 'url("/noise.png")', backgroundSize: '100px 100px' }}
        />
        {/* Particle Flair */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: ["100vh", "-20vh"],
              x: [Math.random() * 100 + "vw", Math.random() * 100 + "vw"],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.5, 0.5]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              ease: "linear",
              repeat: Infinity,
              delay: Math.random() * 10
            }}
            className="absolute w-1 h-1 bg-cinema-red rounded-full shadow-[0_0_10px_rgba(234,51,51,1)] blur-[1px]"
          />
        ))}
        {/* Deep Red Pulse Center */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px] bg-cinema-red/20 rounded-full blur-[200px]"
        />
        {/* Dark Red Orbiting Core */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] bg-gradient-to-br from-cinema-red/30 to-black rounded-full blur-[150px]"
        />
        {/* Pitch Black Void Orbiting */}
        <motion.div
          animate={{ 
            rotate: [360, 0],
            x: ["0%", "-10%", "0%"]
          }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          className="absolute -bottom-[20%] -left-[10%] w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-black/80 rounded-full blur-[100px] z-0"
        />
      </div>

      {/* Global Animated Stamp Journey */}
      <GlobalRedStamp progress={smoothProgress} />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-ink/80 backdrop-blur-xl border-b border-white/5 safe-area-top">
        <div className="max-w-[1440px] mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <Logo variant="horizontal" size="sm" />
          
          <div className="hidden md:flex items-center gap-8">
            {['How it works', 'Taste Score', 'Crews'].map((item) => (
              <button 
                key={item} 
                onClick={() => scrollToSection(item.toLowerCase().replace(/ /g, '-'))}
                className="text-xs font-bold uppercase tracking-widest text-muted hover:text-bone transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          <button 
            onMouseEnter={playStampSound}
            onClick={handleGetStarted}
            className="px-6 py-2.5 bg-cinema-red text-bone text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-cinema-red/90 transition-all btn-press shadow-[0_0_20px_rgba(234,51,51,0.2)]"
          >
            Get Started
          </button>
        </div>
      </nav>

      <main className="relative pt-20">
        
        {/* SEC 1: HERO */}
        <section className="relative min-h-[100dvh] flex flex-col justify-start pt-12 pb-16 px-6 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none -z-10">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-cinema-red/8 rounded-full blur-[180px]" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>

          <div className="relative z-10 max-w-[1440px] mx-auto w-full">
            {/* Hero copy */}
            <div className="text-center mb-12 max-w-4xl mx-auto mt-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold font-editorial leading-[0.95] tracking-tight mb-6"
              >
                Every movie rec{' '}
                <br className="hidden sm:block" />
                gets a <span className="italic text-cinema-red pr-2">verdict.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-bone/50 max-w-xl mx-auto leading-relaxed mb-8"
              >
                Recommend movies and shows to the people they were meant for. They watch, rate, stamp, and tell you how it landed.
              </motion.p>
            </div>

            {/* Cinematic Product Image Mockup */}
            <motion.div 
              style={{ y: heroY, scale: heroScale }}
              className="relative w-full max-w-[1200px] mx-auto z-20 perspective-[2000px]"
            >
              <motion.div
                animate={{ y: [0, -15, 0], rotateX: [0, 2, -2, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-full"
              >
                <div className="absolute inset-0 bg-cinema-red/20 blur-[100px] scale-90" />
                <div className="absolute -inset-1 bg-gradient-to-t from-cinema-red/40 to-transparent rounded-[32px] blur-sm opacity-50" />
                
                <img 
                  src="/app_mockup.png" 
                  alt="Rec'd Club App" 
                  className="relative w-full h-auto rounded-[24px] md:rounded-[32px] border border-white/10 shadow-[0_20px_100px_rgba(0,0,0,0.8)] object-cover" 
                />

                {/* Cinematic highlights on the image edge */}
                <div className="absolute inset-0 rounded-[24px] md:rounded-[32px] ring-1 ring-inset ring-white/20 pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SEC 2: PROBLEM */}
        <section className="pt-32 pb-24 px-6 relative">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 space-y-6 z-20 lg:pr-10">
              <h2 className="text-4xl md:text-6xl font-bold font-editorial leading-[1.1]">
                “Trust me, bro”<br />
                is not a recommendation<br />
                system.
              </h2>
            </div>
            <div className="lg:w-1/2 relative h-[500px] w-full flex items-center justify-center">
              <div className="absolute inset-0 z-30 opacity-90 scale-110 pointer-events-none">
                <ChatBubble delay={0} text="Mind-bending time loops." x={200} y={40} />
                <ChatBubble delay={0.2} text="The end is the beginning." x={250} y={140} />
                <ChatBubble delay={0.4} text="Best sci-fi since Interstellar." x={180} y={240} />
                <ChatBubble delay={0.6} text="Everything is connected." x={240} y={340} />
                <ChatBubble delay={0.8} text="Needs 100% of your attention." x={120} y={420} />
              </div>
              <div className="w-full max-w-[520px] z-20">
                <MovieCard title={MOCK_TITLES.dark} />
              </div>
            </div>
          </div>
        </section>

        {/* SEC 3: HOW IT WORKS */}
        <section id="how-it-works" className="py-24 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="mb-20 text-center max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-bold font-editorial mb-6">Send the pick.<br/>Wait for the stamp.</h2>
              <p className="text-xl text-muted">A recommendation becomes a social moment.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-6 relative">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />
              {[
                { step: '01', title: 'Recommend', desc: 'Send a title with your reason.', icon: Share2, anim: { rotate: [-10, 10, -10] } },
                { step: '02', title: 'They Watch', desc: 'Added to their trusted watchlist.', icon: Play, anim: { scale: [1, 1.2, 1] } },
                { step: '03', title: 'The Verdict', desc: 'They rate it and stamp it.', icon: ShieldCheck, anim: { y: [-5, 5, -5] } },
                { step: '04', title: 'Score Updates', desc: 'Your reputation grows.', icon: Star, anim: { rotate: [0, 360] } },
              ].map((item, i) => (
                <div key={i} className="flex-1 bg-surface border border-white/5 p-8 rounded-3xl relative z-10 group hover:border-cinema-red/30 transition-colors">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cinema-red mb-8 bg-cinema-red/10 w-fit px-3 py-1 rounded-lg">Step {item.step}</div>
                  
                  <motion.div
                    animate={item.anim}
                    transition={{ 
                      duration: item.step === '04' ? 10 : 3, 
                      repeat: Infinity, 
                      ease: item.step === '04' ? "linear" : "easeInOut" 
                    }}
                    className="relative w-fit mb-6"
                  >
                    <div className="absolute inset-0 bg-cinema-red/30 blur-lg rounded-full scale-150 transition-transform group-hover:scale-110" />
                    <item.icon size={32} strokeWidth={1.5} className="relative z-10 text-cinema-red drop-shadow-[0_0_20px_rgba(234,51,51,0.8)] group-hover:scale-110 transition-transform" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-bone mb-3 font-editorial">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEC 4: PANELS */}
        <section ref={panelsRef} className="py-24 px-6 relative">
          <div className="max-w-[1440px] mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-bold font-editorial mb-20">Recommendations<br/>with receipts.</h2>
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center opacity-90 scale-95">
              
              {/* Left Card: Recommender */}
              <div className="w-[300px] h-[400px] bg-surface border border-white/10 rounded-[32px] p-8 shadow-2xl flex flex-col justify-end relative">
                <div className="h-10 bg-white/5 rounded-xl w-full mb-4" />
                
                <motion.div 
                  animate={panelsTriggered ? { scale: [1, 0.9, 1.05, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className={`relative h-12 border rounded-xl w-full flex items-center justify-center transition-colors duration-500 ${panelsTriggered ? 'bg-cinema-red/30 border-cinema-red/50' : 'bg-cinema-red/10 border-cinema-red/20'}`}
                >
                   <span className="text-xs font-black uppercase tracking-widest text-cinema-red">
                     {panelsTriggered ? 'Sent!' : 'Send Rec'}
                   </span>
                   
                   {/* Confetti Burst */}
                   {panelsTriggered && [...Array(25)].map((_, i) => (
                     <motion.div
                       key={i}
                       initial={{ x: 0, y: 0, scale: Math.random() * 0.5 + 0.5, opacity: 1 }}
                       animate={{ 
                         x: (Math.random() - 0.5) * 300, 
                         y: (Math.random() - 1) * 300 - 50, 
                         scale: 0, 
                         opacity: 0,
                         rotate: Math.random() * 360
                       }}
                       transition={{ duration: 0.8, ease: "easeOut" }}
                       className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-sm pointer-events-none ${Math.random() > 0.5 ? 'bg-cinema-red' : 'bg-bone'}`}
                     />
                   ))}
                </motion.div>
              </div>

              {/* Right Card: Receiver */}
              <div className="w-[300px] h-[400px] bg-surface border border-white/10 rounded-[32px] p-8 shadow-2xl relative z-10 flex flex-col items-center">
                 <h4 className="text-sm font-bold text-bone mb-8 uppercase tracking-widest">Give Verdict</h4>
                 <div className="flex gap-2 mb-auto">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <motion.div
                       key={star}
                       animate={{ 
                         scale: panelsTriggered && star <= 4 ? [1, 1.4, 1] : 1,
                         y: panelsTriggered && star <= 4 ? [0, -10, 0] : 0
                       }}
                       transition={{ duration: 0.4, delay: panelsTriggered ? 0.3 + (star * 0.1) : 0 }}
                     >
                       <Star 
                         size={28}
                         className={`transition-colors duration-300 ${panelsTriggered && star <= 4 ? "text-cinema-red fill-cinema-red" : "text-white/10 fill-white/10"}`} 
                       />
                     </motion.div>
                   ))}
                 </div>
                 <div className="w-full space-y-4">
                    <div className="h-12 bg-white/5 rounded-xl w-full" />
                    <div className="h-12 bg-white/5 rounded-xl w-full" />
                 </div>
              </div>

            </div>
          </div>
        </section>

        <EmotionalSection />

        {/* SEC 5: TASTE MATCH */}
        <section ref={matchRef} className="py-24 px-6 relative">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-bold font-editorial mb-6">A great movie can still be a bad rec.</h2>
            <p className="text-lg text-muted max-w-2xl mx-auto mb-32">Taste Match shows how likely a title is to land.</p>
            <div className="relative flex flex-col md:flex-row items-center justify-center gap-24 md:gap-40">
              
              {/* Left Card: High Match */}
              <motion.div 
                animate={isMatchInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-[300px]"
              >
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30">
                  <motion.div animate={isMatchInView ? { scale: [0, 1.2, 1] } : { scale: 0 }} transition={{ delay: 0.4 }}>
                    <UserAvatar name="Maya" size="lg" />
                  </motion.div>
                  <motion.div 
                    animate={isMatchInView ? { y: [20, 0], opacity: [0, 1] } : { opacity: 0 }}
                    transition={{ delay: 0.6 }}
                    className="px-5 py-2 bg-cinema-red text-bone text-sm font-black uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(234,51,51,0.5)] border border-white/20 whitespace-nowrap"
                  >
                    92% Match
                  </motion.div>
                </div>
                
                {/* 5 Stars pop up */}
                <div className="absolute -left-16 top-1/4 flex flex-col gap-3 z-30">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.div
                      key={star}
                      initial={{ scale: 0, x: -20 }}
                      animate={isMatchInView ? { scale: 1, x: 0 } : { scale: 0, x: -20 }}
                      transition={{ delay: 0.8 + (star * 0.1), type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Star size={32} className="text-cinema-red fill-cinema-red drop-shadow-[0_0_15px_rgba(234,51,51,0.8)]" />
                    </motion.div>
                  ))}
                </div>

                <div className="pointer-events-none mt-4 relative z-20">
                  <MovieCard title={MOCK_TITLES.tamasha} stamp="Good Call" />
                </div>
              </motion.div>

              {/* Right Card: Low Match */}
              <motion.div 
                animate={isMatchInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="relative w-[300px] grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              >
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30">
                  <motion.div animate={isMatchInView ? { scale: [0, 1.2, 1] } : { scale: 0 }} transition={{ delay: 0.6 }}>
                    <UserAvatar name="Josh" size="lg" />
                  </motion.div>
                  <motion.div 
                    animate={isMatchInView ? { y: [20, 0], opacity: [0, 1] } : { opacity: 0 }}
                    transition={{ delay: 0.8 }}
                    className="px-5 py-2 bg-surface text-muted text-sm font-black uppercase tracking-widest rounded-xl shadow-xl border border-white/10 whitespace-nowrap"
                  >
                    48% Match
                  </motion.div>
                </div>

                {/* 3 Stars pop up */}
                <div className="absolute -right-16 top-1/4 flex flex-col gap-3 z-30">
                  {[1, 2, 3].map((star) => (
                    <motion.div
                      key={star}
                      initial={{ scale: 0, x: 20 }}
                      animate={isMatchInView ? { scale: 1, x: 0 } : { scale: 0, x: 20 }}
                      transition={{ delay: 1.0 + (star * 0.1), type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Star size={32} className="text-muted fill-muted" />
                    </motion.div>
                  ))}
                </div>

                <div className="pointer-events-none mt-4 relative z-20">
                  <MovieCard title={MOCK_TITLES.tamasha} stamp="Not For Everyone" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SEC 6: TASTE SCORE */}
        <section ref={scoreRef} id="taste-score" className="py-24 px-6 relative">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-5xl md:text-7xl font-bold font-editorial leading-tight">Taste Score is built, not claimed.</h2>
              <p className="text-lg text-muted leading-relaxed">Every verdict updates your reputation as a recommender.</p>
            </div>
            <div className="md:w-1/2 flex justify-center relative">
              <div className="w-80 h-80 rounded-full flex flex-col items-center justify-center bg-surface/50 shadow-[0_0_100px_rgba(234,51,51,0.1)] backdrop-blur-xl relative">
                
                {/* SVG Animated Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none drop-shadow-[0_0_15px_rgba(234,51,51,0.5)]">
                  {/* Background Track */}
                  <circle cx="160" cy="160" r="150" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                  
                  {/* Animated Progress Ring (86%) */}
                  <motion.circle 
                    cx="160" cy="160" r="150" 
                    stroke="#ea3333" 
                    strokeWidth="8" 
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: isScoreInView ? 0.86 : 0 }}
                    transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  />
                </svg>

                <span className="text-[120px] font-editorial font-bold text-bone tracking-tighter leading-none z-10">86</span>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-cinema-red mt-4 z-10">Great Taste</span>
              </div>
            </div>
          </div>
        </section>

        {/* SEC 7: CREWS */}
        <section id="crews" className="py-24 px-6 relative">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-bold font-editorial mb-6">Your group chat, but with better memory.</h2>
            <div className="flex flex-wrap justify-center gap-6 mt-20">
              {[
                { name: 'Film Chaos Club', count: 24, privacy: 'private', vibe: 'Movie chaos', description: 'We watch weird movies and debate them endlessly.', gradient: 3, avatarGradient: 5 },
                { name: 'Slow Burn Club', count: 12, privacy: 'public', vibe: 'Prestige drama', description: 'Only movies over 2.5 hours allowed.', gradient: 8, avatarGradient: 2 },
              ].map((crew, i) => (
                <div key={crew.name} className="w-[340px] text-left group">
                  <div className="rounded-[32px] bg-surface/80 backdrop-blur-md border border-white/5 hover:border-white/20 h-[380px] flex flex-col relative overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer">
                    
                    {/* Cover Image Banner */}
                    <div className={`h-32 w-full relative poster-gradient-${crew.gradient}`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
                    </div>

                    {/* Card Content Area */}
                    <div className="px-6 pb-6 pt-0 flex flex-col flex-1 relative z-10 -mt-12">
                      <div className="flex items-end justify-between mb-4">
                        <div className={`w-20 h-20 rounded-[24px] shadow-2xl border-4 border-surface poster-gradient-${crew.avatarGradient} shrink-0`} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/10 bg-ink text-muted/60">
                          {crew.privacy}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-xl text-bone tracking-tight group-hover:text-cinema-red transition-colors duration-300">{crew.name}</h3>
                      <p className="text-[10px] text-cinema-red font-black tracking-[0.2em] uppercase mt-2">{crew.vibe}</p>

                      <p className="text-sm text-bone/60 mt-4 mb-5 line-clamp-2 leading-relaxed flex-1 italic">&ldquo;{crew.description}&rdquo;</p>

                      <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                             <UserAvatar name="A" size="sm" className="border-2 border-surface" />
                             <UserAvatar name="B" size="sm" className="border-2 border-surface" />
                             <UserAvatar name="C" size="sm" className="border-2 border-surface" />
                          </div>
                          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{crew.count} members</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* SEC 8: FINAL CTA */}
        <section className="relative min-h-[60vh] py-32 px-6 bg-gradient-to-b from-ink to-cinema-red/10 overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cinema-red/20 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute top-10 left-10 opacity-20 hidden lg:block scale-75 pointer-events-none"><MovieCard title={MOCK_TITLES.eeao} /></div>
          <div className="absolute bottom-10 right-10 opacity-20 hidden lg:block scale-75 pointer-events-none"><MovieCard title={MOCK_TITLES.spiderman} /></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-bold font-editorial text-bone leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto">
              Send your first recommendation.
            </h2>
            <button 
              onMouseEnter={playStampSound}
              onClick={handleGetStarted}
              className="mt-12 px-12 py-6 bg-cinema-red text-bone text-lg font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-cinema-red/90 transition-all btn-press shadow-[0_0_40px_rgba(234,51,51,0.4)]"
            >
              Get Started
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}

function ChatBubble({ text, delay, x, y }: { text: string, delay: number, x: number, y: number }) {
  return (
    <div
      className="absolute bg-surface/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl text-sm font-medium text-bone shadow-xl whitespace-nowrap"
      style={{ marginLeft: x, marginTop: y }}
    >
      {text}
    </div>
  );
}

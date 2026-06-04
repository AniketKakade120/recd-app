'use client';

import { motion } from 'framer-motion';
import { Search, Users, Bookmark, Play, MessageSquare, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/context';
import Link from 'next/link';
import { useState } from 'react';
import InviteModal from './InviteModal';

interface HubCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  actionLabel: string;
  onClick?: () => void;
  href?: string;
  primary?: boolean;
}

function HubCard({ title, subtitle, icon, actionLabel, onClick, href, primary = false }: HubCardProps) {
  const CardWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="flex-1 min-w-[280px] rounded-3xl bg-[#111] border border-border p-8 flex flex-col items-start group relative overflow-hidden"
    >
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cinema-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {children}
    </motion.div>
  );

  const content = (
    <>
      <div className="w-16 h-16 rounded-2xl bg-cinema-red/10 flex items-center justify-center mb-6 text-cinema-red relative z-10 shadow-[0_0_20px_rgba(234,51,51,0.1)] group-hover:shadow-[0_0_30px_rgba(234,51,51,0.2)] transition-shadow">
        {icon}
      </div>
      <div className="relative z-10 flex-1">
        <h3 className="text-xl font-bold text-bone mb-2 font-editorial tracking-tight">{title}</h3>
        <p className="text-sm text-muted leading-relaxed mb-8">{subtitle}</p>
      </div>
      {href ? (
        <Link href={href} className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all btn-press text-center relative z-10 ${
          primary 
            ? 'bg-cinema-red text-bone shadow-lg shadow-cinema-red/20 hover:bg-cinema-red/90' 
            : 'bg-transparent border border-border text-bone hover:border-border-strong hover:bg-white/5'
        }`}>
          {actionLabel}
        </Link>
      ) : (
        <button onClick={onClick} className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all btn-press relative z-10 ${
          primary 
            ? 'bg-cinema-red text-bone shadow-lg shadow-cinema-red/20 hover:bg-cinema-red/90' 
            : 'bg-transparent border border-border text-bone hover:border-border-strong hover:bg-white/5'
        }`}>
          {actionLabel}
        </button>
      )}
    </>
  );

  return <CardWrapper>{content}</CardWrapper>;
}

export default function StarterActivationHub() {
  const { openRecommendModal } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full rounded-[40px] bg-ink border border-border p-10 sm:p-14 relative overflow-hidden mb-12 shadow-2xl"
    >
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-cinema-red/5 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-brick/5 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none" />

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-12 relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cinema-red">Start Here</span>
          <div className="h-[1px] w-8 bg-cinema-red/30" />
        </div>
        <div className="flex items-center gap-4">
          <h2 className="text-4xl sm:text-6xl font-bold text-bone font-editorial tracking-tight">
            Start your Rec&apos;d Club.
          </h2>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-cinema-red"
          >
            <Sparkles size={40} strokeWidth={1.5} />
          </motion.div>
        </div>
        <p className="text-xl text-muted/80 mt-4 font-medium">
          Every rec gets a verdict. Make your first move.
        </p>
      </motion.div>

      {/* Main Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative z-10">
        <HubCard
          title="Build your crew"
          subtitle="Add people whose taste you trust. Your feed is only as good as your crew."
          icon={<Users size={28} strokeWidth={1.5} />}
          actionLabel="Invite your crew"
          onClick={() => setInviteOpen(true)}
          primary
        />
        <HubCard
          title="Recommend your first pick"
          subtitle="Share a movie or show with your crew and get the conversation rolling."
          icon={<Search size={28} strokeWidth={1.5} />}
          actionLabel="Recommend something"
          onClick={() => openRecommendModal()}
        />
        <HubCard
          title="Start your watchlist"
          subtitle="Save picks worth coming back to. Never ask 'what should we watch' again."
          icon={<Bookmark size={28} strokeWidth={1.5} />}
          actionLabel="Explore picks"
          href="/explore"
        />
      </motion.div>

      {/* How It Works Stepper */}
      <motion.div variants={itemVariants} className="pt-12 border-t border-border/60 relative z-10">
        <div className="flex items-center gap-2 mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">How it works</span>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {[
            { icon: <Search size={20} />, label: 'Recommend', desc: 'Share a pick.' },
            { icon: <Play size={20} />, label: 'Watch', desc: 'Your crew watches.' },
            { icon: <MessageSquare size={20} />, label: 'Verdict', desc: 'They rate & share thoughts.' },
            { icon: <TrendingUp size={20} />, label: 'Taste Score', desc: 'Your score grows with every rec.' },
          ].map((step, idx) => (
            <div key={idx} className="flex items-center gap-10 w-full lg:w-auto">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-5 group"
              >
                <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center text-bone/60 group-hover:text-cinema-red group-hover:border-cinema-red/30 transition-all duration-300">
                  {step.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-bone mb-0.5">{step.label}</h4>
                  <p className="text-xs text-muted font-medium">{step.desc}</p>
                </div>
              </motion.div>
              
              {idx < 3 && (
                <div className="hidden lg:flex items-center text-muted/30">
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight size={20} />
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </motion.section>
  );
}

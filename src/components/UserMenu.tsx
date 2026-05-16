'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useApp } from '@/lib/context';
import UserAvatar from './UserAvatar';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useApp();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-surface/80 transition-all border border-transparent hover:border-border group"
      >
        <UserAvatar name={currentUser.displayName} size="sm" className="ring-2 ring-transparent group-hover:ring-cinema-red/20 transition-all" />
        <ChevronDown size={14} className={`text-muted group-hover:text-bone transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 mt-3 w-56 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-border bg-ink/20">
              <p className="text-xs font-black text-bone truncate">{currentUser.displayName}</p>
              <p className="text-[10px] text-muted truncate mt-0.5">@{currentUser.username}</p>
            </div>

            <div className="p-2">
              <Link 
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-bone hover:bg-white/5 transition-all group"
              >
                <div className="p-1.5 rounded-lg bg-surface border border-border group-hover:border-cinema-red/30 transition-colors">
                  <User size={14} className="group-hover:text-cinema-red transition-colors" />
                </div>
                View Profile
              </Link>

              <button 
                onClick={() => {
                  setIsOpen(false);
                  logout();
                  router.push('/');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-cinema-red hover:bg-cinema-red/5 transition-all group"
              >
                <div className="p-1.5 rounded-lg bg-surface border border-border group-hover:border-cinema-red/20 transition-colors">
                  <LogOut size={14} className="group-hover:text-cinema-red transition-colors" />
                </div>
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

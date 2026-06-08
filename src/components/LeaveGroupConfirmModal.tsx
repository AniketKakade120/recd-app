'use client';

import { useApp } from '@/lib/context';
import type { Group } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import ModalBase from './ModalBase';

interface LeaveGroupConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
}

export default function LeaveGroupConfirmModal({ isOpen, onClose, group }: LeaveGroupConfirmModalProps) {
  const { leaveGroup, addToast } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  if (!isOpen) return null;

  const handleLeave = () => {
    leaveGroup(group.id);
    addToast(`You left ${group.name}.`);
    
    // If the user is inside the group details page, route them back to /groups
    if (pathname.includes(`/groups/${group.id}`)) {
      router.push('/groups');
    }
    onClose();
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-sm"
      hideHeader={true}
    >
      <div className="text-center pt-4">
        <div className="w-16 h-16 bg-cinema-red/10 text-cinema-red rounded-full flex items-center justify-center mx-auto mb-6">
          <LogOut size={28} />
        </div>
        
        <h2 className="text-2xl font-bold font-editorial text-bone mb-3">Leave this group?</h2>
        <p className="text-sm text-muted leading-relaxed mb-10">
          Are you sure you want to leave <span className="text-bone font-bold">{group.name}</span>? You will lose access to its recommendations and discussions.
        </p>

        <div className="space-y-3">
          <button 
            onClick={handleLeave}
            className="w-full py-4 bg-cinema-red text-bone font-black uppercase tracking-widest rounded-xl hover:bg-cinema-red/90 transition-all btn-press text-xs shadow-lg shadow-cinema-red/20"
          >
            Yes, leave group
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white/5 text-bone font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all btn-press text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

'use client';

import { ReactNode } from 'react';
import GlassCard from './GlassCard';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string | ReactNode;
  action?: ReactNode;
  inviteCta?: boolean;
  className?: string;
}

export default function EmptyState({ title, description, icon = '👻', action, inviteCta = false, className = '' }: EmptyStateProps) {
  return (
    <GlassCard className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
      <div className="text-4xl mb-4 opacity-60">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-bone font-editorial">{title}</h3>
      <p className="text-muted text-sm max-w-sm mb-6">
        {description}
      </p>
      {inviteCta && !action && (
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-cinema-red text-bone font-semibold rounded-lg hover:bg-cinema-red/90 transition-colors btn-press text-sm">
            Invite friends
          </button>
          <button className="px-5 py-2.5 bg-surface border border-border text-bone font-medium rounded-lg hover:bg-surface-hover transition-colors btn-press text-sm">
            Copy link
          </button>
        </div>
      )}
      {action && (
        <div>{action}</div>
      )}
    </GlassCard>
  );
}

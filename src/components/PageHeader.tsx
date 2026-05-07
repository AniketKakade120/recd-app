'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backButton?: boolean;
}

export default function PageHeader({ title, subtitle, action, backButton = false }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-center gap-3">
        {backButton && (
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-muted hover:text-bone hover:bg-surface-hover hover:border-bone/20 transition-colors btn-press"
            aria-label="Go back"
          >
            ←
          </button>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-bone font-editorial">{title}</h1>
          {subtitle && <p className="text-muted mt-1 text-sm">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

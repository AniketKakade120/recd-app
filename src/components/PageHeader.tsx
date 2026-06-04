'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';
import MobileBackLink from './MobileBackLink';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  backButton?: boolean;
  breadcrumbItems?: BreadcrumbItem[];
  mobileBackLabel?: string;
  mobileBackHref?: string;
}

export default function PageHeader({ 
  title, subtitle, action, backButton = false, 
  breadcrumbItems, mobileBackLabel, mobileBackHref 
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      {/* Navigation Layer */}
      {(breadcrumbItems || mobileBackLabel) && (
        <div className="mb-4">
          {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} />}
          {mobileBackLabel && <MobileBackLink label={mobileBackLabel} href={mobileBackHref} />}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {backButton && !breadcrumbItems && !mobileBackLabel && (
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-muted hover:text-bone hover:bg-surface-hover hover:border-bone/20 transition-colors btn-press"
              aria-label="Go back"
            >
              ←
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-bone font-editorial leading-tight">{title}</h1>
            {subtitle && <p className="text-muted mt-1 text-sm">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

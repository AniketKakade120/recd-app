'use client';

import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.href && !item.isCurrent ? (
            <Link 
              href={item.href}
              className="text-muted hover:text-cinema-red transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-bone">
              {item.label}
            </span>
          )}
          
          {index < items.length - 1 && (
            <span className="text-muted/30 select-none">/</span>
          )}
        </div>
      ))}
    </nav>
  );
}

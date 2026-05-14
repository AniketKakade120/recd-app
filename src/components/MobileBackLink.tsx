'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MobileBackLinkProps {
  label: string;
  href?: string;
  className?: string;
}

export default function MobileBackLink({ label, href, className = '' }: MobileBackLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (!href) {
      e.preventDefault();
      router.back();
    }
  };

  const content = (
    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-cinema-red transition-colors duration-200 ${className}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>Back to {label}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="md:hidden block">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className="md:hidden block">
      {content}
    </button>
  );
}

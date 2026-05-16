'use client';

import Link from 'next/link';

interface LogoProps {
  className?: string;
  variant?: 'horizontal' | 'square';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', variant = 'horizontal', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: variant === 'horizontal' ? 'text-lg' : 'text-xl',
    md: variant === 'horizontal' ? 'text-2xl' : 'text-3xl',
    lg: variant === 'horizontal' ? 'text-3xl' : 'text-5xl',
    xl: variant === 'horizontal' ? 'text-5xl' : 'text-7xl',
  };

  const LogoText = () => (
    <span className={`font-editorial font-bold tracking-tight text-bone leading-none ${sizeClasses[size]} ${className}`}>
      {variant === 'horizontal' ? (
        <span className="flex items-center gap-[0.2em]">
          <span>Rec<span className="text-cinema-red">&apos;</span>d</span>
          <span>Club</span>
        </span>
      ) : (
        <span className="flex flex-col items-center">
          <span>Rec<span className="text-cinema-red">&apos;</span>d</span>
          <span className="mt-[0.1em]">Club</span>
        </span>
      )}
    </span>
  );

  return (
    <div className="inline-block">
      <LogoText />
    </div>
  );
}

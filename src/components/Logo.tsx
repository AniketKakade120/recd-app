'use client';

import Link from 'next/link';

interface LogoProps {
  className?: string;
  variant?: 'horizontal' | 'square';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', variant = 'horizontal', size = 'md' }: LogoProps) {
  // Map sizes to Tailwind widths for images instead of text sizes
  const sizeClasses = {
    sm: variant === 'horizontal' ? 'w-24' : 'w-12',
    md: variant === 'horizontal' ? 'w-32' : 'w-16',
    lg: variant === 'horizontal' ? 'w-48' : 'w-32',
    xl: variant === 'horizontal' ? 'w-64' : 'w-48',
  };

  const imageSrc = variant === 'horizontal' ? '/main-logo.png' : '/stacked-logo.png';

  return (
    <div className={`inline-block ${className}`}>
      <img 
        src={imageSrc} 
        alt="Rec'd Club Logo" 
        className={`${sizeClasses[size]} h-auto object-contain`} 
      />
    </div>
  );
}

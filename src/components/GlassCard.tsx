'use client';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'red' | 'subtle' | 'none';
  variant?: 'default' | 'elevated' | 'cinematic';
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', hover = false, glow = 'none', variant = 'default', onClick }: GlassCardProps) {
  const variantClass = variant === 'elevated' ? 'glass-elevated' : variant === 'cinematic' ? 'glass-cinematic' : 'glass';
  const glowClass = glow === 'red' ? 'glow-red' : glow === 'subtle' ? 'glow-subtle' : '';
  const hoverClass = hover ? 'card-hover cursor-pointer' : '';

  return (
    <div
      className={`${variantClass} rounded-xl p-5 ${glowClass} ${hoverClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
}

import React from 'react';

export interface BadgeProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  text1?: string;
  text2?: string;
}

// 1. GOOD CALL
export function BadgeGoodCall({ className = '', text1 = 'GOOD', text2 = 'CALL', ...props }: BadgeProps) {
  return (
    <svg viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <rect x="2" y="2" width="156" height="56" rx="10" fill="var(--ink)" stroke="currentColor" strokeWidth="2" />
      <circle cx="30" cy="30" r="12" stroke="currentColor" strokeWidth="2" />
      <path d="M24 30L28 34L36 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="56" y="27" fill="currentColor" fontFamily="monospace" fontSize="14" fontWeight="bold" letterSpacing="1">{text1}</text>
      <text x="56" y="45" fill="currentColor" fontFamily="monospace" fontSize="14" fontWeight="bold" letterSpacing="1">{text2}</text>
    </svg>
  );
}

// 2. WORTH IT
export function BadgeWorthIt({ className = '', text1 = 'WORTH', text2 = 'IT', ...props }: BadgeProps) {
  return (
    <svg viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {/* Ticket stub path */}
      <path d="M 12 2 L 148 2 A 4 4 0 0 1 152 6 L 152 20 A 10 10 0 0 0 152 40 L 152 54 A 4 4 0 0 1 148 58 L 12 58 A 4 4 0 0 1 8 54 L 8 40 A 10 10 0 0 0 8 20 L 8 6 A 4 4 0 0 1 12 2 Z" 
            fill="var(--ink)" stroke="var(--cinema-red)" strokeWidth="2" />
      <path d="M 30 20 L 33 26 L 40 27 L 35 32 L 36 39 L 30 36 L 24 39 L 25 32 L 20 27 L 27 26 Z" stroke="var(--cinema-red)" strokeWidth="2" strokeLinejoin="round"/>
      <text x="58" y="27" fill="currentColor" fontFamily="monospace" fontSize="14" fontWeight="bold" letterSpacing="1">{text1}</text>
      <text x="58" y="45" fill="currentColor" fontFamily="monospace" fontSize="14" fontWeight="bold" letterSpacing="1">{text2}</text>
    </svg>
  );
}

// 3. CREW PICK
export function BadgeCrewPick({ className = '', text1 = 'CREW', text2 = 'PICK', ...props }: BadgeProps) {
  return (
    <svg viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <rect x="2" y="2" width="156" height="56" rx="10" fill="var(--ink)" stroke="currentColor" strokeWidth="2" />
      <path d="M22 40C22 35 26 31 31 31C36 31 40 35 40 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="31" cy="22" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M40 36C42.5 33.5 45 33 47 33C50 33 53 36 53 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="45" cy="24" r="4" stroke="currentColor" strokeWidth="2" />
      <text x="64" y="27" fill="currentColor" fontFamily="monospace" fontSize="14" fontWeight="bold" letterSpacing="1">{text1}</text>
      <text x="64" y="45" fill="currentColor" fontFamily="monospace" fontSize="14" fontWeight="bold" letterSpacing="1">{text2}</text>
    </svg>
  );
}

// 4. CULT PICK
export function BadgeCultPick({ className = '', text1 = 'CULT', text2 = 'PICK', ...props }: BadgeProps) {
  return (
    <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="45" cy="45" r="43" fill="var(--ink)" stroke="currentColor" strokeWidth="2" />
      <path d="M45 16C45 25 54 34 63 34C54 34 45 43 45 52C45 43 36 34 27 34C36 34 45 25 45 16Z" stroke="var(--cinema-red)" strokeWidth="2" strokeLinejoin="round"/>
      <text x="45" y="60" fill="currentColor" fontFamily="monospace" fontSize="12" fontWeight="bold" letterSpacing="1" textAnchor="middle">{text1}</text>
      <text x="45" y="74" fill="currentColor" fontFamily="monospace" fontSize="12" fontWeight="bold" letterSpacing="1" textAnchor="middle">{text2}</text>
    </svg>
  );
}

// 5. RISKY BUT WORTH IT
export function BadgeRisky({ className = '', text1 = 'RISKY', text2 = 'BUT WORTH IT', ...props }: BadgeProps) {
  return (
    <svg viewBox="0 0 170 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {/* Ticket stub path */}
      <path d="M 12 2 L 158 2 A 4 4 0 0 1 162 6 L 162 20 A 10 10 0 0 0 162 40 L 162 54 A 4 4 0 0 1 158 58 L 12 58 A 4 4 0 0 1 8 54 L 8 40 A 10 10 0 0 0 8 20 L 8 6 A 4 4 0 0 1 12 2 Z" 
            fill="var(--ink)" stroke="currentColor" strokeWidth="2" />
      {/* Gauge icon */}
      <path d="M22 36 A 12 12 0 0 1 46 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 36 L21 36 M34 23 L34 19 M43 36 L47 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M34 36 L42 26" stroke="var(--cinema-red)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="34" cy="36" r="2" fill="var(--cinema-red)" />
      
      <text x="58" y="28" fill="currentColor" fontFamily="monospace" fontSize="16" fontWeight="bold" letterSpacing="1">{text1}</text>
      <text x="58" y="46" fill="currentColor" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="1.5">{text2}</text>
    </svg>
  );
}

// 6. CERTIFIED GOOD CALL
export function BadgeCertified({ className = '', ...props }: BadgeProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="50" cy="50" r="48" fill="var(--ink)" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="50" r="26" stroke="currentColor" strokeWidth="1.5" />
      <path d="M40 50L46 56L60 42" stroke="var(--cinema-red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      
      <path id="curveTop6" d="M 16 50 A 34 34 0 1 1 84 50" fill="transparent" />
      <path id="curveBot6" d="M 84 50 A 34 34 0 1 1 16 50" fill="transparent" />
      
      <text fontSize="11" fontWeight="bold" fill="currentColor" fontFamily="monospace" letterSpacing="2">
        <textPath href="#curveTop6" startOffset="50%" textAnchor="middle">CERTIFIED</textPath>
      </text>
      <text fontSize="11" fontWeight="bold" fill="currentColor" fontFamily="monospace" letterSpacing="2">
        <textPath href="#curveBot6" startOffset="50%" textAnchor="middle">GOOD CALL</textPath>
      </text>
      <circle cx="20" cy="50" r="2" fill="var(--cinema-red)" />
      <circle cx="80" cy="50" r="2" fill="var(--cinema-red)" />
    </svg>
  );
}

// 7. FIRST STAMP
export function BadgeFirstStamp({ className = '', ...props }: BadgeProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="50" cy="50" r="46" fill="var(--ink)" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M 35 42 L 65 42 C 67 42 68 43 68 45 C 65 45 65 55 68 55 C 68 57 67 58 65 58 L 35 58 C 33 58 32 57 32 55 C 35 55 35 45 32 45 C 32 43 33 42 35 42 Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M46 52 L50 48 L54 52" stroke="var(--cinema-red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path id="curveTop7" d="M 22 50 A 28 28 0 1 1 78 50" fill="transparent" />
      <path id="curveBot7" d="M 78 50 A 28 28 0 1 1 22 50" fill="transparent" />
      <text fontSize="12" fontWeight="bold" fill="currentColor" fontFamily="monospace" letterSpacing="3">
        <textPath href="#curveTop7" startOffset="50%" textAnchor="middle">FIRST</textPath>
      </text>
      <text fontSize="12" fontWeight="bold" fill="currentColor" fontFamily="monospace" letterSpacing="3">
        <textPath href="#curveBot7" startOffset="50%" textAnchor="middle">STAMP</textPath>
      </text>
    </svg>
  );
}

// 8. TRUSTED TASTE
export function BadgeTrustedTaste({ className = '', text1 = 'TRUSTED', text2 = 'TASTE', ...props }: BadgeProps) {
  return (
    <svg viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <rect x="2" y="2" width="156" height="56" rx="8" fill="var(--ink)" stroke="currentColor" strokeWidth="2" />
      <path d="M28 16 L18 20 V30 C18 40 26 48 28 48 C30 48 38 40 38 30 V20 L28 16 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M23 30 L26 33 L33 26" stroke="var(--cinema-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="56" y="27" fill="currentColor" fontFamily="monospace" fontSize="13" fontWeight="bold" letterSpacing="1">{text1}</text>
      <text x="56" y="45" fill="currentColor" fontFamily="monospace" fontSize="13" fontWeight="bold" letterSpacing="1">{text2}</text>
    </svg>
  );
}

// 9. TOP RECOMMENDER (Ribbon)
export function BadgeTopRecommender({ className = '', text1 = 'TOP', text2 = 'RECOMMENDER', ...props }: BadgeProps) {
  return (
    <svg viewBox="0 0 180 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {/* Ribbon tails */}
      <path d="M30 18 L6 18 L16 35 L6 52 L30 52" fill="var(--ink)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M150 18 L174 18 L164 35 L174 52 L150 52" fill="var(--ink)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Main box */}
      <rect x="26" y="8" width="128" height="54" rx="4" fill="var(--ink)" stroke="currentColor" strokeWidth="2" />
      
      {/* Crown */}
      <path d="M80 24 L90 16 L100 24 L96 34 L84 34 Z" stroke="var(--cinema-red)" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="90" y="46" fill="currentColor" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="2" textAnchor="middle">{text1}</text>
      <text x="90" y="56" fill="currentColor" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="1" textAnchor="middle">{text2}</text>
    </svg>
  );
}

// 10. CONSISTENT PICKER
export function BadgeConsistent({ className = '', text1 = 'CONSISTENT', text2 = 'PICKER', ...props }: BadgeProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="50" cy="50" r="48" fill="var(--ink)" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      {/* Bar chart icon */}
      <rect x="38" y="32" width="6" height="12" stroke="var(--cinema-red)" strokeWidth="1.5" />
      <rect x="47" y="24" width="6" height="20" stroke="var(--cinema-red)" strokeWidth="1.5" />
      <rect x="56" y="16" width="6" height="28" stroke="var(--cinema-red)" strokeWidth="1.5" />
      <text x="50" y="60" fill="currentColor" fontFamily="monospace" fontSize="10" fontWeight="bold" letterSpacing="1" textAnchor="middle">{text1}</text>
      <text x="50" y="74" fill="currentColor" fontFamily="monospace" fontSize="10" fontWeight="bold" letterSpacing="1" textAnchor="middle">{text2}</text>
    </svg>
  );
}

// 11. QUESTIONABLE TASTE
export function BadgeQuestionable({ className = '', text1 = 'QUESTIONABLE', text2 = 'TASTE', ...props }: BadgeProps) {
  return (
    <svg viewBox="0 0 190 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <g transform="rotate(-3 95 35)">
        <rect x="4" y="8" width="182" height="54" rx="6" fill="var(--ink)" stroke="currentColor" strokeWidth="1.5" strokeDasharray="10 2 30 1 15 2" />
        <rect x="5" y="9" width="180" height="52" rx="5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        {/* Warning triangle */}
        <path d="M30 16 L44 44 L16 44 Z" stroke="var(--cinema-red)" strokeWidth="2" strokeLinejoin="round" />
        <line x1="30" y1="24" x2="30" y2="34" stroke="var(--cinema-red)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="30" cy="40" r="1.5" fill="var(--cinema-red)" />
        <text x="56" y="32" fill="currentColor" fontFamily="monospace" fontSize="13" fontWeight="bold" letterSpacing="1">{text1}</text>
        <text x="56" y="48" fill="currentColor" fontFamily="monospace" fontSize="13" fontWeight="bold" letterSpacing="1">{text2}</text>
      </g>
    </svg>
  );
}

// 12. BAD CALL
export function BadgeBadCall({ className = '', text1 = 'BAD', text2 = 'CALL', ...props }: BadgeProps) {
  return (
    <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="45" cy="45" r="43" fill="var(--ink)" stroke="currentColor" strokeWidth="2" strokeDasharray="20 2 40 1" />
      <circle cx="45" cy="45" r="41" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path d="M 30 30 L 60 60 M 60 30 L 30 60" stroke="var(--cinema-red)" strokeWidth="3" strokeLinecap="round" />
      <path id="curveTop12" d="M 15 45 A 30 30 0 1 1 75 45" fill="transparent" />
      <path id="curveBot12" d="M 75 45 A 30 30 0 1 1 15 45" fill="transparent" />
      <text fontSize="14" fontWeight="bold" fill="currentColor" fontFamily="monospace" letterSpacing="3">
        <textPath href="#curveTop12" startOffset="50%" textAnchor="middle">{text1}</textPath>
      </text>
      <text fontSize="14" fontWeight="bold" fill="currentColor" fontFamily="monospace" letterSpacing="3">
        <textPath href="#curveBot12" startOffset="50%" textAnchor="middle">{text2}</textPath>
      </text>
    </svg>
  );
}

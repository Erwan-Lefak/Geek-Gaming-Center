import React from 'react';

interface ProductIconProps {
  category: string;
  className?: string;
}

export default function ProductIcon({ category, className = "w-16 h-16" }: ProductIconProps) {
  const iconColor = "currentColor";

  const icons = {
    'pc-gaming': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
        <path d="M6 14h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2z" />
        <circle cx="12" cy="10" r="2" />
      </svg>
    ),
    'accessoires': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        <line x1="12" y1="13" x2="12" y2="21" />
      </svg>
    ),
    'consoles': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 12h4m-2-2v4m14-2h2" />
        <line x1="10" y1="12" x2="10.01" y2="12" />
        <circle cx="16" cy="12" r="2" />
      </svg>
    ),
    'goodies': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" x2="12.01" y1="18" y2="18" />
        <path d="M9 6h6M9 10h6M9 14h6" />
      </svg>
    ),
  };

  return icons[category as keyof typeof icons] || icons['pc-gaming'];
}

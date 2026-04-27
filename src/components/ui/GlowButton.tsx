'use client';

import type { GlowButtonProps } from '@/types';

const variants = {
  primary: {
    bg: 'bg-[#00d4aa]',
    text: 'text-[#0a0a0f]',
    glow: 'hover:shadow-[0_0_25px_rgba(0,212,170,0.5)]',
    activeShadow: 'active:shadow-[0_0_15px_rgba(0,212,170,0.3)]',
  },
  secondary: {
    bg: 'bg-[#ff6b35]',
    text: 'text-white',
    glow: 'hover:shadow-[0_0_25px_rgba(255,107,53,0.5)]',
    activeShadow: 'active:shadow-[0_0_15px_rgba(255,107,53,0.3)]',
  },
  accent: {
    bg: 'bg-[#ffd700]',
    text: 'text-[#0a0a0f]',
    glow: 'hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]',
    activeShadow: 'active:shadow-[0_0_15px_rgba(255,215,0,0.3)]',
  },
};

const sizes = {
  sm: 'px-4 py-2 text-sm min-h-10',
  md: 'px-6 py-3 text-base min-h-11',
  lg: 'px-8 py-4 text-base sm:text-lg min-h-12',
};

export default function GlowButton({
  children,
  className = '',
  onClick,
  variant = 'primary',
  size = 'md',
  type = 'button',
}: GlowButtonProps) {
  const v = variants[variant];
  const s = sizes[size];

  return (
    <button
      type={type}
      className={`
        ${v.bg} ${v.text} ${v.glow} ${v.activeShadow}
        ${s}
        rounded-full font-heading font-semibold tap-target
        transition-all duration-300 ease-out
        hover:enabled:scale-105 active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:ring-offset-2 focus:ring-offset-[#0a0a0f]
        ${className}
      `}
      onClick={onClick}
      data-cursor
    >
      {children}
    </button>
  );
}

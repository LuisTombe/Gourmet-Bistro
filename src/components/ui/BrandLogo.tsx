import React from 'react';

interface BrandLogoProps {
  variant?: 'default' | 'light';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'default',
  showText = true,
}) => {
  const isLight = variant === 'light';
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
          isLight
            ? 'bg-white/20 backdrop-blur-md border border-white/35 text-white'
            : 'bg-gradient-to-br from-[#f73b20] to-[#d92912] text-white'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Campana gastronómica (cloche) + plato */}
          <path d="M12 5a1 1 0 0 1 1 1v1h-2V6a1 1 0 0 1 1-1Z" fill="currentColor" />
          <path d="M5 15a7 7 0 0 1 14 0" />
          <path d="M3 16.5h18" />
          <path d="M6 19.5h12" />
          <path d="M9.5 11.5c.6-.9 1.5-1.5 2.5-1.5" />
        </svg>
      </div>
      {showText && (
        <span
          className={`font-semibold text-xl tracking-tight ${
            isLight ? 'text-white' : 'text-[#360802]'
          }`}
        >
          Gourmet{' '}
          <span className={isLight ? 'text-white/90 font-normal' : 'text-[#f73b20]'}>
            SysFood
          </span>
        </span>
      )}
    </div>
  );
};

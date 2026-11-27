import React, { useState } from 'react';

interface BrandLogoProps {
  variant?: 'default' | 'light';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'default',
  showText = true,
  size = 'md',
}) => {
  const isLight = variant === 'light';
  const [imgError, setImgError] = useState(false);

  const sizeDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="inline-flex items-center gap-2.5 select-none group">
      <div
        className={`${sizeDimensions[size]} rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 overflow-hidden ${
          isLight
            ? 'bg-white/20 backdrop-blur-md border border-white/35 text-white'
            : 'bg-white border border-[#E7E5E4] shadow-xs'
        }`}
      >
        {!imgError ? (
          <img
            src="/assets/mesalink-logo.png"
            alt="MesaLink"
            className="w-full h-full object-contain p-0.5"
            onError={() => setImgError(true)}
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* Campana + Link */}
            <path d="M12 4v2" stroke="#EA580C" />
            <path d="M4 14a8 8 0 0 1 16 0" fill="#991B1B" stroke="#991B1B" />
            <path d="M2 15h20" stroke="#991B1B" />
            <path d="M9 18h6" stroke="#EA580C" strokeWidth="2.5" />
          </svg>
        )}
      </div>

      {showText && (
        <span
          className={`font-black ${textSizes[size]} tracking-tight leading-none ${
            isLight ? 'text-white' : 'text-[#1C1917]'
          }`}
        >
          Mesa
          <span className={isLight ? 'text-[#FB923C]' : 'text-[#EA580C]'}>
            Link
          </span>
        </span>
      )}
    </div>
  );
};

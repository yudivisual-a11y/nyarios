import React from 'react';
import { TransparentLogo } from './TransparentLogo';

interface NyariosLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'icon' | 'wordmark' | 'hero' | 'transparent';
  className?: string;
  withTagline?: boolean;
}

export const NyariosLogo: React.FC<NyariosLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  withTagline = false,
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  const textSizes = {
    sm: 'text-sm font-extrabold tracking-tight',
    md: 'text-lg font-black tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-3xl font-black tracking-tight',
    '2xl': 'text-4xl font-black tracking-tight',
  };

  // Hero display with transparent clean logo
  if (variant === 'hero' || variant === 'transparent') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <TransparentLogo size={size === '2xl' ? '2xl' : 'hero'} />
      </div>
    );
  }

  // Icon only
  if (variant === 'icon') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-2xl bg-white p-1 shadow-sm border border-white/10 shrink-0 overflow-hidden ${iconDimensions[size]} ${className}`}
      >
        <img
          src="/nyarios-logo.png"
          alt="NYARIOS"
          className="w-full h-full object-cover object-top scale-125"
        />
      </div>
    );
  }

  // Wordmark only
  if (variant === 'wordmark') {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className={`bg-gradient-to-r from-white via-teal-300 to-emerald-400 bg-clip-text text-transparent ${textSizes[size]}`}>
          NYARIOS
        </span>
        {withTagline && (
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
            Aplikasi Percakapan Anda
          </span>
        )}
      </div>
    );
  }

  // Full header brand
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`relative flex items-center justify-center rounded-2xl bg-white p-1 shadow-sm border border-white/10 shrink-0 overflow-hidden ${iconDimensions[size]}`}
      >
        <img
          src="/nyarios-logo.png"
          alt="NYARIOS"
          className="w-full h-full object-cover object-top scale-125"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className={`bg-gradient-to-r from-white via-teal-300 to-emerald-400 bg-clip-text text-transparent font-black tracking-tight leading-none ${textSizes[size]}`}>
          NYARIOS
        </span>
        {withTagline && (
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">
            Aplikasi Percakapan Anda
          </span>
        )}
      </div>
    </div>
  );
};

import React from 'react';

interface TransparentLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero' | 'massive';
}

export const TransparentLogo: React.FC<TransparentLogoProps> = ({
  className = '',
  size = 'hero',
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16 rounded-2xl',
    md: 'w-24 h-24 rounded-3xl',
    lg: 'w-32 h-32 rounded-3xl',
    xl: 'w-48 h-48 rounded-3xl',
    '2xl': 'w-56 h-56 rounded-3xl',
    hero: 'w-40 h-40 sm:w-48 sm:h-48 rounded-[36px]',
    massive: 'w-64 h-64 rounded-[40px]',
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className={`relative ${sizeClasses[size]} overflow-hidden shadow-xl border-2 border-emerald-100/80 transition-transform duration-300 hover:scale-105 bg-white`}>
        <img
          src="/logo-nyarios.jpg"
          alt="NYARIOS"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

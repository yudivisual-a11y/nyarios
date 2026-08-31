import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { THEME_PRESETS } from '../../utils/themePresets';

interface TransparentLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero' | 'massive';
}

export const TransparentLogo: React.FC<TransparentLogoProps> = ({
  className = '',
  size = 'hero',
}) => {
  const { accentTheme } = useApp();
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const currentPreset = THEME_PRESETS.find((t) => t.id === accentTheme);
    const isLightMode = currentPreset?.isLight || !document.documentElement.classList.contains('dark');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/nyarios-logo.png';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        const avg = (r + g + b) / 3;

        // 1. Off-white background detection -> 100% transparent
        if (avg > 185 && diff < 30) {
          d[i + 3] = 0;
        }
        // 2. Text "NYARIOS" and tagline -> Adapts to Dark or Light background with crystal-clear contrast!
        else if (avg < 115 && diff < 35) {
          if (isLightMode) {
            d[i] = 15;      // Deep Slate Black for light background
            d[i + 1] = 23;
            d[i + 2] = 42;
            d[i + 3] = 255;
          } else {
            d[i] = 255;     // Pure Crisp White for dark background
            d[i + 1] = 255;
            d[i + 2] = 255;
            d[i + 3] = 255;
          }
        }
        // 3. Colored Emblem (Cyan / Teal 3D ribbon) -> Keep rich vivid colors
        else {
          if (avg > 195 && diff >= 20) {
            d[i + 3] = 255;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setDataUrl(canvas.toDataURL('image/png'));
    };
  }, [accentTheme]);

  const sizeClasses = {
    sm: 'w-20 max-w-[80px]',
    md: 'w-32 max-w-[128px]',
    lg: 'w-48 max-w-[192px]',
    xl: 'w-64 max-w-[256px]',
    '2xl': 'w-80 max-w-[320px]',
    hero: 'w-72 sm:w-84 md:w-96 max-w-[360px]',
    massive: 'w-80 sm:w-96 md:w-[420px] max-w-[420px]',
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {dataUrl ? (
        <img
          src={dataUrl}
          alt="NYARIOS"
          className={`${sizeClasses[size]} h-auto object-contain drop-shadow-[0_12px_35px_rgba(0,168,132,0.25)] transition-transform duration-300 hover:scale-105`}
        />
      ) : (
        <div className={`${sizeClasses[size]} h-40 flex items-center justify-center`}>
          <div className="w-10 h-10 rounded-full border-2 border-[#ff4b4b] border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
};

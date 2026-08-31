import React from 'react';
import { Users } from 'lucide-react';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  isGroup?: boolean;
  className?: string;
}

const colorPalette = [
  'from-[#ff4b4b] to-[#c52828]',
  'from-[#3b82f6] to-[#1d4ed8]',
  'from-[#8b5cf6] to-[#6d28d9]',
  'from-[#f59e0b] to-[#d97706]',
  'from-[#10b981] to-[#047857]',
  'from-[#ec4899] to-[#be185d]',
];

function getHashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  isOnline,
  isGroup = false,
  className = '',
}) => {
  const sizeStyles = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-2xl font-bold',
  };

  const colorClass = getHashColor(name || 'User');
  const initials = getInitials(name);

  return (
    <div
      className={`relative inline-flex shrink-0 rounded-full neu-avatar-rim p-0.5 bg-[#1e2025] ${sizeStyles[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover rounded-full"
        />
      ) : isGroup ? (
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#25282e] to-[#1c1e22] text-slate-300 flex items-center justify-center">
          <Users className="w-1/2 h-1/2 text-slate-300" />
        </div>
      ) : (
        <div className={`w-full h-full rounded-full bg-gradient-to-tr ${colorClass} text-white flex items-center justify-center font-bold`}>
          <span>{initials}</span>
        </div>
      )}

      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#18191d]" />
      )}
    </div>
  );
};

import React, { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto ${className}`}>
      {/* Icon Container with subtle glow */}
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm border border-emerald-100 dark:border-emerald-900/40 animate-pulse-subtle">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1.5 tracking-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
        {description}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {actionText && onAction && (
          <Button
            variant="primary"
            onClick={onAction}
            leftIcon={actionIcon}
            className="w-full sm:w-auto text-xs sm:text-sm font-semibold"
          >
            {actionText}
          </Button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <Button
            variant="outline"
            onClick={onSecondaryAction}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
};

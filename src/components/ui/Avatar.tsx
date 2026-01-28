import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';
import { AvatarConfig } from '../../types';

interface AvatarProps {
  config?: AvatarConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
  level?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  config,
  size = 'md',
  showLevel = false,
  level,
  className,
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-24 h-24 text-5xl',
  };

  const levelSizes = {
    sm: 'w-4 h-4 text-[8px]',
    md: 'w-5 h-5 text-[10px]',
    lg: 'w-6 h-6 text-xs',
    xl: 'w-8 h-8 text-sm',
  };

  const defaultConfig: AvatarConfig = {
    type: 'default',
    baseColor: '#6366f1',
    icon: '🦸',
  };

  const avatar = config || defaultConfig;

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          'ring-2 ring-white dark:ring-gray-800 shadow-lg',
          sizes[size]
        )}
        style={{ backgroundColor: avatar.baseColor }}
      >
        <span>{avatar.icon}</span>
        
        {/* Frame overlay */}
        {avatar.frame && (
          <div className="absolute inset-0 rounded-full border-2 border-yellow-400" />
        )}
      </div>

      {/* Level badge */}
      {showLevel && level && (
        <div
          className={cn(
            'absolute -bottom-1 -right-1 rounded-full',
            'bg-gradient-to-r from-teal-500 to-cyan-500',
            'flex items-center justify-center font-bold text-white',
            'ring-2 ring-white dark:ring-gray-800',
            levelSizes[size]
          )}
        >
          {level}
        </div>
      )}
    </div>
  );
};

interface AvatarSelectorProps {
  selected: string;
  onSelect: (icon: string) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selected,
  onSelect,
}) => {
  const avatarIcons = [
    '🦸', '🦸‍♀️', '🧙', '🧙‍♀️', '🧝', '🧝‍♀️', '🧛', '🧛‍♀️',
    '🥷', '🦹', '🦹‍♀️', '🧑‍🚀', '👨‍🚀', '👩‍🚀', '🧑‍🎤', '👨‍🎤',
    '🐉', '🦊', '🐺', '🦁', '🐯', '🐻', '🐼', '🦅',
    '🌟', '⭐', '💎', '🔮', '🎭', '👑', '🏆', '🎯',
  ];

  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316',
    '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#1e40af', '#7c3aed', '#9333ea',
  ];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Icône
        </h4>
        <div className="grid grid-cols-8 gap-2">
          {avatarIcons.map((icon) => (
            <button
              key={icon}
              onClick={() => onSelect(icon)}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
                'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                selected === icon && 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/30'
              )}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

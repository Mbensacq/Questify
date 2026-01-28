import React from 'react';
import { cn } from '../../utils/helpers';
import { AchievementRarity } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  rarity?: AchievementRarity;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  rarity,
  size = 'md',
  dot = false,
}) => {
  const variants = {
    default: 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600',
    primary: 'bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 text-primary-700 dark:text-primary-200 border border-primary-200 dark:border-primary-800',
    success: 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 text-green-700 dark:text-green-200 border border-green-200 dark:border-green-800',
    warning: 'bg-gradient-to-r from-yellow-100 to-amber-200 dark:from-yellow-900/40 dark:to-amber-800/40 text-yellow-700 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800',
    danger: 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800',
    info: 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800',
  };

  const rarityStyles: Record<AchievementRarity, string> = {
    common: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200 border border-gray-300',
    rare: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200 ring-2 ring-blue-400 border border-blue-300',
    epic: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200 ring-2 ring-purple-400 border border-purple-300',
    legendary: 'bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 text-white ring-2 ring-yellow-500 border border-yellow-400 shadow-lg',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium shadow-sm',
        sizes[size],
        rarity ? rarityStyles[rarity] : variants[variant]
      )}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'success' && 'bg-green-500',
          variant === 'warning' && 'bg-yellow-500',
          variant === 'danger' && 'bg-red-500',
          variant === 'info' && 'bg-blue-500',
          variant === 'primary' && 'bg-primary-500',
          variant === 'default' && 'bg-gray-500',
        )} />
      )}
      {children}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'critical' | 'none';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config = {
    none: { label: 'Aucune', variant: 'default' as const },
    low: { label: 'Basse', variant: 'success' as const },
    medium: { label: 'Moyenne', variant: 'warning' as const },
    high: { label: 'Haute', variant: 'danger' as const },
    critical: { label: 'Critique', variant: 'danger' as const },
  };

  const { label, variant } = config[priority];

  return (
    <Badge variant={variant} size="sm" dot>
      {label}
    </Badge>
  );
};

interface DifficultyBadgeProps {
  difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'epic' | 'legendary';
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
  const config = {
    trivial: { label: 'Trivial', rarity: 'common' as const },
    easy: { label: 'Facile', rarity: 'common' as const },
    medium: { label: 'Moyen', rarity: 'rare' as const },
    hard: { label: 'Difficile', rarity: 'rare' as const },
    epic: { label: 'Épique', rarity: 'epic' as const },
    legendary: { label: 'Légendaire', rarity: 'legendary' as const },
  };

  const { label, rarity } = config[difficulty];

  return (
    <Badge rarity={rarity} size="sm">
      {label}
    </Badge>
  );
};

interface XPBadgeProps {
  amount: number;
  bonus?: number;
}

export const XPBadge: React.FC<XPBadgeProps> = ({ amount, bonus }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
      <span>⚡</span>
      <span>{amount}</span>
      {bonus && bonus > 0 && (
        <span className="text-xs text-green-500">+{bonus}</span>
      )}
      <span className="text-xs">XP</span>
    </span>
  );
};

interface CoinBadgeProps {
  amount: number;
}

export const CoinBadge: React.FC<CoinBadgeProps> = ({ amount }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium">
      <span>🪙</span>
      <span>{amount}</span>
    </span>
  );
};

interface StreakBadgeProps {
  streak: number;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak }) => {
  if (streak === 0) return null;
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-medium">
      <span className="fire-animation">🔥</span>
      <span>{streak}</span>
    </span>
  );
};

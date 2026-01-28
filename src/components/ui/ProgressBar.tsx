import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'xp' | 'health' | 'mana' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  glow?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'primary',
  size = 'md',
  showLabel = false,
  animated = true,
  glow = false,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    primary: 'from-teal-400 via-cyan-400 to-blue-400',
    xp: 'from-green-400 via-emerald-400 to-teal-400',
    health: 'from-red-400 via-rose-400 to-pink-500',
    mana: 'from-blue-400 via-indigo-400 to-purple-400',
    gold: 'from-yellow-400 via-amber-400 to-orange-400',
  };

  const bgColors = {
    primary: 'bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30',
    xp: 'bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30',
    health: 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30',
    mana: 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30',
    gold: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30',
  };

  const sizes = {
    sm: 'h-2',
    md: 'h-3.5',
    lg: 'h-5',
  };

  return (
    <div className="w-full">
      <div className={cn(
        'w-full rounded-full overflow-hidden relative',
        bgColors[color],
        sizes[size],
        'ring-2 ring-purple-200/50 dark:ring-purple-800/30 shadow-sm'
      )}>
        <motion.div
          className={cn(
            'h-full rounded-full bg-gradient-to-r',
            colors[color],
            glow && 'shadow-lg'
          )}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {animated && (
            <div className="w-full h-full shimmer" />
          )}
        </motion.div>
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

interface XPBarProps {
  currentXP: number;
  xpToNextLevel: number;
  level: number;
  showLevel?: boolean;
}

export const XPBar: React.FC<XPBarProps> = ({
  currentXP,
  xpToNextLevel,
  level,
  showLevel = true,
}) => {
  const percentage = (currentXP / xpToNextLevel) * 100;

  return (
    <div className="w-full">
      {showLevel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Niveau {level}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {currentXP} / {xpToNextLevel} XP
          </span>
        </div>
      )}
      <div className="relative">
        <ProgressBar
          value={currentXP}
          max={xpToNextLevel}
          color="xp"
          size="md"
          animated
          glow
        />
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-lg"
          style={{ right: `${100 - percentage}%` }}
          animate={{
            boxShadow: [
              '0 0 10px rgba(34, 197, 94, 0.5)',
              '0 0 20px rgba(34, 197, 94, 0.8)',
              '0 0 10px rgba(34, 197, 94, 0.5)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚡
        </motion.div>
      </div>
    </div>
  );
};

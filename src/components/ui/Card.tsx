import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'game' | 'glass';
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hoverable = false,
  onClick,
}) => {
  const variants = {
    default: 'bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/50 shadow-sm',
    game: 'bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-800/90 dark:to-gray-900/60 border border-gray-100 dark:border-gray-700/50 shadow-sm',
    glass: 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-soft',
  };

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={cn(
        'rounded-2xl overflow-hidden transition-all duration-300',
        variants[variant],
        hoverable && 'hover:shadow-soft-lg hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer active:scale-[0.98]',
        onClick && 'text-left w-full',
        className
      )}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </Component>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: 'primary' | 'yellow' | 'orange' | 'purple' | 'green' | 'red' | 'blue';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  primary: 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 text-teal-600 dark:text-teal-400',
  yellow: 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 text-yellow-600 dark:text-yellow-400',
  orange: 'bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-600 dark:text-orange-400',
  purple: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400',
  green: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400',
  red: 'bg-gradient-to-br from-red-500/20 to-pink-500/20 text-red-600 dark:text-red-400',
  blue: 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400',
};

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color = 'primary',
  trend,
}) => {
  return (
    <Card className="p-3 sm:p-4 group" hoverable>
      <div className="flex items-center gap-2 sm:gap-3">
        <div 
          className={cn(
            'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
            colorClasses[color]
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate leading-tight font-medium uppercase tracking-wide">{label}</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
        </div>
        {trend && (
          <div className={cn(
            'px-2 py-1 rounded-lg text-xs font-semibold hidden sm:block',
            trend.isPositive 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
    </Card>
  );
};

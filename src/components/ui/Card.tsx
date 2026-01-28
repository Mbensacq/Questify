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
    default: 'bg-white dark:bg-gray-800/50 border-2 border-teal-100/50 dark:border-teal-900/30 backdrop-blur-sm',
    game: 'bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 dark:from-gray-800/50 dark:via-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-100/50 dark:border-teal-900/30 backdrop-blur-sm',
    glass: 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-2 border-teal-200/30 dark:border-teal-700/30',
  };

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={cn(
        'rounded-3xl shadow-soft overflow-hidden',
        variants[variant],
        hoverable && 'hover:shadow-soft-lg transition-shadow duration-200 cursor-pointer',
        onClick && 'text-left w-full',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color = 'primary',
  trend,
}) => {
  return (
    <Card className="p-3 sm:p-4 hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1" hoverable>
      <div className="flex items-center gap-2 sm:gap-2 sm:gap-4">
        <div 
          className={cn(
            'w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft',
            `bg-${color}-100 dark:bg-${color}-900/30`
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{label}</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
        </div>
        {trend && (
          <div className={cn(
            'px-2 py-1 rounded-full text-sm font-medium shadow-sm',
            trend.isPositive 
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400'
              : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-400'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
    </Card>
  );
};

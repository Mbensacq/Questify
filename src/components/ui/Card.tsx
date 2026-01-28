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
    default: 'bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/50',
    game: 'bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/90 dark:to-gray-900/50 border border-gray-100 dark:border-gray-700/50',
    glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/30',
  };

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={cn(
        'rounded-2xl shadow-sm overflow-hidden',
        variants[variant],
        hoverable && 'hover:shadow-md transition-shadow duration-200 cursor-pointer',
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
    <Card className="p-3 sm:p-4 hover:shadow-md transition-all duration-200" hoverable>
      <div className="flex items-center gap-2 sm:gap-3">
        <div 
          className={cn(
            'w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0',
            `bg-${color}-100 dark:bg-${color}-900/30`
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate leading-tight">{label}</p>
          <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">{value}</p>
        </div>
        {trend && (
          <div className={cn(
            'px-2 py-1 rounded-lg text-xs font-medium hidden sm:block',
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

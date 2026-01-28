import { XP_PER_LEVEL_BASE, XP_LEVEL_MULTIPLIER, STREAK_BONUSES } from '../types';

// Calcul de l'XP nécessaire pour un niveau
export const calculateXPForLevel = (level: number): number => {
  return Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_LEVEL_MULTIPLIER, level - 1));
};

// Calcul du niveau à partir de l'XP total
export const calculateLevelFromXP = (totalXP: number): { 
  level: number; 
  currentXP: number; 
  xpToNextLevel: number;
  progress: number;
} => {
  let level = 1;
  let xpForCurrentLevel = XP_PER_LEVEL_BASE;
  let xpAccumulated = 0;

  while (xpAccumulated + xpForCurrentLevel <= totalXP) {
    xpAccumulated += xpForCurrentLevel;
    level++;
    xpForCurrentLevel = calculateXPForLevel(level);
  }

  const currentXP = totalXP - xpAccumulated;
  const progress = (currentXP / xpForCurrentLevel) * 100;

  return {
    level,
    currentXP,
    xpToNextLevel: xpForCurrentLevel,
    progress,
  };
};

// Calcul du bonus de streak
export const calculateStreakBonus = (streak: number): number => {
  let bonus = 0;
  
  for (const { days, bonus: b } of STREAK_BONUSES) {
    if (streak >= days) {
      bonus = b;
    }
  }
  
  return bonus;
};

// Formatage du temps
export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
};

// Formatage des nombres grands
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Formatage de la date relative
export const formatRelativeDate = (date: Date | string): string => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < -1) {
    return `Il y a ${Math.abs(diffDays)} jours`;
  }
  if (diffDays === -1) {
    return 'Hier';
  }
  if (diffDays === 0) {
    return "Aujourd'hui";
  }
  if (diffDays === 1) {
    return 'Demain';
  }
  if (diffDays <= 7) {
    return `Dans ${diffDays} jours`;
  }
  
  return target.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  });
};

// Génération de couleurs aléatoires pour les catégories
export const generateRandomColor = (): string => {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Calcul du titre de niveau
export const getLevelTitle = (level: number): string => {
  if (level < 5) return 'Novice';
  if (level < 10) return 'Apprenti';
  if (level < 15) return 'Initié';
  if (level < 20) return 'Adepte';
  if (level < 25) return 'Aventurier';
  if (level < 30) return 'Explorateur';
  if (level < 40) return 'Vétéran';
  if (level < 50) return 'Expert';
  if (level < 60) return 'Maître';
  if (level < 75) return 'Grand Maître';
  if (level < 90) return 'Champion';
  if (level < 100) return 'Héros';
  return 'Légende';
};

// Calcul de la couleur selon la rareté
export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return '#9ca3af';
    case 'rare': return '#3b82f6';
    case 'epic': return '#8b5cf6';
    case 'legendary': return '#f59e0b';
    default: return '#9ca3af';
  }
};

// Calcul de la couleur selon la priorité
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'low': return '#22c55e';
    case 'medium': return '#f59e0b';
    case 'high': return '#f97316';
    case 'critical': return '#ef4444';
    default: return '#9ca3af';
  }
};

// Calcul de la couleur selon la difficulté
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'trivial': return '#9ca3af';
    case 'easy': return '#22c55e';
    case 'medium': return '#3b82f6';
    case 'hard': return '#f59e0b';
    case 'epic': return '#8b5cf6';
    case 'legendary': return '#f59e0b';
    default: return '#9ca3af';
  }
};

// Calcul du temps restant
export const getTimeRemaining = (endDate: Date | string): string => {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Expiré';
  }
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays}j ${diffHours % 24}h`;
  }
  
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHours}h ${diffMins}m`;
};

// Vérification si une date est aujourd'hui
export const isToday = (date: Date | string): boolean => {
  const today = new Date();
  const target = new Date(date);
  return today.toDateString() === target.toDateString();
};

// Vérification si une date est passée
export const isPast = (date: Date | string): boolean => {
  const now = new Date();
  const target = new Date(date);
  return target < now;
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Classe utilitaire pour combiner les classes CSS
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

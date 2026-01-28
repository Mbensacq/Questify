import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Star, Gift, Check, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { useAuthStore } from '../../stores/authStore';
import { ACHIEVEMENTS, getAchievementById, RARITY_COLORS, RARITY_LABELS } from '../../config/achievements';
import { Achievement, AchievementRarity } from '../../types';
import { cn } from '../../utils/helpers';

// Couleurs par rareté
const RARITY_GRADIENTS = {
  common: 'from-slate-400 to-slate-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 via-yellow-400 to-orange-500',
};

const RARITY_BG = {
  common: 'bg-slate-500/10 border-slate-400/30',
  rare: 'bg-blue-500/10 border-blue-400/30',
  epic: 'bg-purple-500/10 border-purple-400/30',
  legendary: 'bg-amber-500/10 border-amber-400/30',
};

const RARITY_TEXT = {
  common: 'text-slate-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
};

interface AchievementCardProps {
  achievement: Omit<Achievement, 'unlockedAt'>;
  isUnlocked: boolean;
  progress?: number;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked,
  progress = 0,
}) => {
  const progressPercentage = Math.min((progress / achievement.requirement.value) * 100, 100);
  const rarity = achievement.rarity;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl transition-all duration-300',
        'border-2',
        isUnlocked 
          ? `${RARITY_BG[rarity]} hover:scale-[1.02]` 
          : 'bg-gray-800/40 border-gray-700/50 hover:border-gray-600/50'
      )}
    >
      {/* Animated glow effect for unlocked legendary */}
      {isUnlocked && rarity === 'legendary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 animate-pulse" />
      )}

      <div className="relative p-4">
        <div className="flex items-center gap-4">
          {/* Icon container */}
          <div className="relative flex-shrink-0">
            {/* Background glow */}
            {isUnlocked && (
              <div className={cn(
                'absolute inset-0 rounded-2xl blur-lg opacity-50',
                `bg-gradient-to-br ${RARITY_GRADIENTS[rarity]}`
              )} />
            )}
            
            {/* Icon box */}
            <div
              className={cn(
                'relative w-16 h-16 rounded-2xl flex items-center justify-center',
                'transition-all duration-300',
                isUnlocked 
                  ? `bg-gradient-to-br ${RARITY_GRADIENTS[rarity]} shadow-lg` 
                  : 'bg-gray-700/80 border border-gray-600/50'
              )}
            >
              {isUnlocked ? (
                <span className="text-3xl drop-shadow-lg">{achievement.icon}</span>
              ) : (
                <Lock className="w-7 h-7 text-gray-500" />
              )}
            </div>

            {/* Unlocked badge */}
            {isUnlocked && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-gray-900 flex items-center justify-center shadow-lg">
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title with rarity indicator */}
            <div className="flex items-center gap-2">
              <h3 className={cn(
                'font-bold truncate',
                isUnlocked ? 'text-white' : 'text-gray-400'
              )}>
                {achievement.secret && !isUnlocked ? '???' : achievement.name}
              </h3>
              {rarity === 'legendary' && (
                <Sparkles className={cn('w-4 h-4', isUnlocked ? 'text-amber-400' : 'text-gray-600')} />
              )}
              {rarity === 'epic' && (
                <Star className={cn('w-4 h-4', isUnlocked ? 'text-purple-400' : 'text-gray-600')} />
              )}
            </div>

            {/* Description */}
            <p className={cn(
              'text-sm mt-1 line-clamp-1',
              isUnlocked ? 'text-gray-300' : 'text-gray-500'
            )}>
              {achievement.secret && !isUnlocked 
                ? 'Achievement secret' 
                : achievement.description}
            </p>

            {/* Progress bar for locked */}
            {!isUnlocked && !achievement.secret && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Progression</span>
                  <span className={RARITY_TEXT[rarity]}>{progress}/{achievement.requirement.value}</span>
                </div>
                <div className="h-2 bg-gray-700/80 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      `bg-gradient-to-r ${RARITY_GRADIENTS[rarity]}`
                    )}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Rewards */}
            <div className="flex items-center gap-4 mt-3">
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold',
                isUnlocked 
                  ? 'bg-teal-500/20 text-teal-300' 
                  : 'bg-gray-700/50 text-gray-400'
              )}>
                <span className="text-teal-400">⚡</span>
                {achievement.xpReward} XP
              </div>
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold',
                isUnlocked 
                  ? 'bg-amber-500/20 text-amber-300' 
                  : 'bg-gray-700/50 text-gray-400'
              )}>
                <span>🪙</span>
                {achievement.coinReward}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AchievementListProps {
  category?: string;
  showLocked?: boolean;
}

export const AchievementList: React.FC<AchievementListProps> = ({
  category,
  showLocked = true,
}) => {
  const { gameStats } = useAuthStore();
  const unlockedIds = gameStats?.achievementsUnlocked || [];

  let achievements = category
    ? ACHIEVEMENTS.filter(a => a.category === category)
    : ACHIEVEMENTS;

  if (!showLocked) {
    achievements = achievements.filter(a => unlockedIds.includes(a.id) || !a.secret);
  }

  // Trier: débloqués en premier, puis par rareté
  const sortedAchievements = [...achievements].sort((a, b) => {
    const aUnlocked = unlockedIds.includes(a.id);
    const bUnlocked = unlockedIds.includes(b.id);
    if (aUnlocked !== bUnlocked) return bUnlocked ? 1 : -1;
    
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  const getProgress = (achievement: Omit<Achievement, 'unlockedAt'>): number => {
    if (!gameStats) return 0;
    
    switch (achievement.requirement.type) {
      case 'tasks_completed':
        return gameStats.tasksCompleted;
      case 'streak':
        return gameStats.currentStreak;
      case 'level':
        return gameStats.level;
      case 'total_xp':
        return gameStats.totalXP;
      case 'achievements':
        return unlockedIds.length;
      default:
        return 0;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnimatePresence>
        {sortedAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <AchievementCard
              achievement={achievement}
              isUnlocked={unlockedIds.includes(achievement.id)}
              progress={getProgress(achievement)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Stats d'achievements
export const AchievementStats: React.FC = () => {
  const { gameStats } = useAuthStore();
  const unlockedIds = gameStats?.achievementsUnlocked || [];
  
  const stats = {
    total: ACHIEVEMENTS.length,
    unlocked: unlockedIds.length,
    common: ACHIEVEMENTS.filter(a => a.rarity === 'common' && unlockedIds.includes(a.id)).length,
    commonTotal: ACHIEVEMENTS.filter(a => a.rarity === 'common').length,
    rare: ACHIEVEMENTS.filter(a => a.rarity === 'rare' && unlockedIds.includes(a.id)).length,
    rareTotal: ACHIEVEMENTS.filter(a => a.rarity === 'rare').length,
    epic: ACHIEVEMENTS.filter(a => a.rarity === 'epic' && unlockedIds.includes(a.id)).length,
    epicTotal: ACHIEVEMENTS.filter(a => a.rarity === 'epic').length,
    legendary: ACHIEVEMENTS.filter(a => a.rarity === 'legendary' && unlockedIds.includes(a.id)).length,
    legendaryTotal: ACHIEVEMENTS.filter(a => a.rarity === 'legendary').length,
  };

  return (
    <Card className="p-4">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Progression des Achievements
      </h3>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Total</span>
            <span className="font-medium">{stats.unlocked} / {stats.total}</span>
          </div>
          <ProgressBar value={stats.unlocked} max={stats.total} color="gold" />
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-sm">Commun: {stats.common}/{stats.commonTotal}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm">Rare: {stats.rare}/{stats.rareTotal}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm">Épique: {stats.epic}/{stats.epicTotal}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-sm">Légendaire: {stats.legendary}/{stats.legendaryTotal}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

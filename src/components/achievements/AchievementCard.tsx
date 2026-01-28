import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Star, Gift } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { useAuthStore } from '../../stores/authStore';
import { ACHIEVEMENTS, getAchievementById, RARITY_COLORS, RARITY_LABELS } from '../../config/achievements';
import { Achievement, AchievementRarity } from '../../types';
import { cn } from '../../utils/helpers';

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

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl transition-all duration-200',
        'bg-white dark:bg-gray-800/90 border',
        isUnlocked
          ? 'border-yellow-400/50 shadow-lg shadow-yellow-400/10'
          : 'border-gray-200 dark:border-gray-700/50 opacity-75 hover:opacity-90'
      )}
    >
      {/* Rarity glow for unlocked */}
      {isUnlocked && (
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundColor: RARITY_COLORS[achievement.rarity] }}
        />
      )}

      <div className="relative flex items-center gap-4 p-4">
        {/* Icon - centered vertically */}
        <div
          className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0',
            isUnlocked 
              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-md' 
              : 'bg-gray-100 dark:bg-gray-700/80'
          )}
        >
          {isUnlocked ? (
            <span>{achievement.icon}</span>
          ) : (
            <Lock className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={cn(
                'font-semibold truncate',
                isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              )}>
                {achievement.secret && !isUnlocked ? '???' : achievement.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                {achievement.secret && !isUnlocked 
                  ? 'Achievement secret' 
                  : achievement.description}
              </p>
            </div>
          </div>

          {/* Progress bar for locked achievements */}
          {!isUnlocked && !achievement.secret && (
            <div className="mt-2">
              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400">
              +{achievement.xpReward} XP
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              +{achievement.coinReward} 🪙
            </span>
          </div>
        </div>

        {/* Unlocked checkmark */}
        {isUnlocked && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md">
              <Trophy className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
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

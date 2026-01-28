import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Lock,
  Sparkles,
  Filter,
  Search,
  Star,
  Zap,
  Flame,
  Target,
  Clock,
  Crown
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, AchievementRarity } from '../config/achievements';
import { Card, StatCard } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';
import { cn, formatNumber } from '../utils/helpers';

export const AchievementsPage: React.FC = () => {
  const { gameStats } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<AchievementRarity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!gameStats) return null;

  // Filter achievements
  const filteredAchievements = ACHIEVEMENTS.filter((achievement) => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
    if (selectedRarity !== 'all' && achievement.rarity !== selectedRarity) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !achievement.name.toLowerCase().includes(query) &&
        !achievement.description.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  });

  // Calculate stats
  const unlockedAchievements = ACHIEVEMENTS.filter((a) =>
    gameStats.achievementsUnlocked.includes(a.id)
  );
  const totalXPFromAchievements = unlockedAchievements.reduce((sum, a) => sum + a.xpReward, 0);
  const completionPercentage = Math.round(
    (unlockedAchievements.length / ACHIEVEMENTS.length) * 100
  );

  // Count by rarity
  const rarityStats = {
    common: unlockedAchievements.filter((a) => a.rarity === 'common').length,
    rare: unlockedAchievements.filter((a) => a.rarity === 'rare').length,
    epic: unlockedAchievements.filter((a) => a.rarity === 'epic').length,
    legendary: unlockedAchievements.filter((a) => a.rarity === 'legendary').length,
  };

  const rarityColors = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-blue-500',
    epic: 'from-purple-400 to-purple-500',
    legendary: 'from-yellow-400 to-orange-500',
  };

  const rarityBorderColors = {
    common: 'border-gray-300 dark:border-gray-600',
    rare: 'border-blue-400 dark:border-blue-500',
    epic: 'border-purple-400 dark:border-purple-500',
    legendary: 'border-yellow-400 dark:border-yellow-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-7 h-7 text-yellow-500" />
          Achievements
        </h1>
        <p className="text-gray-500 mt-1">
          {unlockedAchievements.length} / {ACHIEVEMENTS.length} débloqués ({completionPercentage}%)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Trophy className="w-6 h-6" />}
          label="Total débloqué"
          value={`${unlockedAchievements.length}/${ACHIEVEMENTS.length}`}
          color="yellow"
        />
        <StatCard
          icon={<Zap className="w-6 h-6" />}
          label="XP Gagnée"
          value={formatNumber(totalXPFromAchievements)}
          color="primary"
        />
        <StatCard
          icon={<Crown className="w-6 h-6" />}
          label="Légendaires"
          value={`${rarityStats.legendary}/5`}
          color="orange"
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          label="Progression"
          value={`${completionPercentage}%`}
          color="green"
        />
      </div>

      {/* Progress by Rarity */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          Progression par rareté
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(['common', 'rare', 'epic', 'legendary'] as const).map((rarity) => {
            const total = ACHIEVEMENTS.filter((a) => a.rarity === rarity).length;
            const unlocked = rarityStats[rarity];
            const percentage = Math.round((unlocked / total) * 100);

            return (
              <div key={rarity} className="text-center">
                <div
                  className={cn(
                    'w-16 h-16 mx-auto rounded-full bg-gradient-to-br flex items-center justify-center mb-2',
                    rarityColors[rarity]
                  )}
                >
                  <span className="text-2xl font-bold text-white">{unlocked}</span>
                </div>
                <p className="font-medium capitalize">{rarity}</p>
                <p className="text-sm text-gray-500">{percentage}%</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un achievement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        >
          <option value="all">Toutes les catégories</option>
          {ACHIEVEMENT_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        <select
          value={selectedRarity}
          onChange={(e) => setSelectedRarity(e.target.value as AchievementRarity | 'all')}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        >
          <option value="all">Toutes raretés</option>
          <option value="common">Commun</option>
          <option value="rare">Rare</option>
          <option value="epic">Épique</option>
          <option value="legendary">Légendaire</option>
        </select>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, index) => {
          const isUnlocked = gameStats.achievementsUnlocked.includes(achievement.id);
          const progress = isUnlocked ? 100 : 0;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  'relative overflow-hidden border-2 transition-all',
                  isUnlocked
                    ? rarityBorderColors[achievement.rarity]
                    : 'border-gray-200 dark:border-gray-700 opacity-75',
                  isUnlocked && 'hover:shadow-lg'
                )}
              >
                {/* Rarity indicator */}
                <div
                  className={cn(
                    'absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full bg-gradient-to-br opacity-20',
                    rarityColors[achievement.rarity]
                  )}
                />

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0',
                      isUnlocked
                        ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} shadow-lg`
                        : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  >
                    {isUnlocked ? (
                      achievement.icon
                    ) : (
                      <Lock className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        'font-semibold truncate',
                        !isUnlocked && 'text-gray-500'
                      )}>
                        {achievement.name}
                      </h3>
                      {achievement.rarity === 'legendary' && (
                        <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {achievement.description}
                    </p>

                    {/* XP Reward */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        isUnlocked
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      )}>
                        +{achievement.xpReward} XP
                      </span>
                      {achievement.coinReward && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600">
                          +{achievement.coinReward} 🪙
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    {!isUnlocked && progress > 0 && (
                      <div className="mt-3">
                        <ProgressBar
                          value={progress}
                          max={100}
                          size="sm"
                          color="primary"
                          showLabel
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun achievement trouvé</p>
        </div>
      )}
    </div>
  );
};

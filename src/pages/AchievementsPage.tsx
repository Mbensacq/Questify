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
import { AchievementCard } from '../components/achievements/AchievementCard';
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, index) => {
          const isUnlocked = gameStats.achievementsUnlocked.includes(achievement.id);
          
          // Calculate progress based on requirement type
          let progress = 0;
          switch (achievement.requirement.type) {
            case 'tasks_completed':
              progress = gameStats.tasksCompleted;
              break;
            case 'streak':
              progress = gameStats.currentStreak;
              break;
            case 'level':
              progress = gameStats.level;
              break;
            case 'total_xp':
              progress = gameStats.totalXP;
              break;
            case 'achievements':
              progress = gameStats.achievementsUnlocked.length;
              break;
            default:
              progress = 0;
          }

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <AchievementCard
                achievement={achievement}
                isUnlocked={isUnlocked}
                progress={progress}
              />
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

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Target, 
  Trophy, 
  Zap, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Card, StatCard } from '../ui/Card';
import { XPBar, ProgressBar } from '../ui/ProgressBar';
import { Avatar } from '../ui/Avatar';
import { Badge, StreakBadge } from '../ui/Badge';
import { useAuthStore } from '../../stores/authStore';
import { useTaskStore } from '../../stores/taskStore';
import { formatNumber, getLevelTitle, formatTime } from '../../utils/helpers';

export const PlayerStats: React.FC = () => {
  const { user, gameStats } = useAuthStore();
  const { tasks } = useTaskStore();

  if (!user || !gameStats) return null;

  const todayTasks = tasks.filter(t => {
    const today = new Date();
    return t.completedAt && new Date(t.completedAt).toDateString() === today.toDateString();
  }).length;

  const stats = [
    {
      icon: <Target className="w-6 h-6 text-blue-500" />,
      label: 'Tâches complétées',
      value: formatNumber(gameStats.tasksCompleted),
    },
    {
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      label: 'Streak actuel',
      value: gameStats.currentStreak,
      suffix: 'jours',
    },
    {
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      label: 'Achievements',
      value: gameStats.achievementsUnlocked.length,
    },
    {
      icon: <Zap className="w-6 h-6 text-green-500" />,
      label: 'XP Total',
      value: formatNumber(gameStats.totalXP),
    },
  ];

  return (
    <Card className="p-6">
      {/* Header avec avatar et niveau */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar
          config={user.avatar}
          size="xl"
          showLevel
          level={gameStats.level}
        />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user.username}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {getLevelTitle(gameStats.level)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <StreakBadge streak={gameStats.currentStreak} />
            <Badge variant="primary">
              🪙 {formatNumber(gameStats.coins)}
            </Badge>
            <Badge variant="info">
              💎 {gameStats.gems}
            </Badge>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-6">
        <XPBar
          currentXP={gameStats.currentXP}
          xpToNextLevel={gameStats.xpToNextLevel}
          level={gameStats.level}
          showLevel
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 text-center">
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
                {stat.suffix && (
                  <span className="text-sm font-normal text-gray-500"> {stat.suffix}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Daily Progress */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Progression du jour
          </h3>
          <span className="text-sm text-gray-500">
            {todayTasks} tâches aujourd'hui
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">XP aujourd'hui</span>
              <span className="font-medium">{gameStats.dailyXP}</span>
            </div>
            <ProgressBar value={gameStats.dailyXP} max={200} color="xp" size="sm" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Tâches</span>
              <span className="font-medium">{gameStats.dailyTasksCompleted}</span>
            </div>
            <ProgressBar value={gameStats.dailyTasksCompleted} max={10} color="primary" size="sm" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export const QuickStats: React.FC = () => {
  const { gameStats } = useAuthStore();
  const { getTodayTasks, getOverdueTasks } = useTaskStore();

  if (!gameStats) return null;

  const todayTasks = getTodayTasks();
  const overdueTasks = getOverdueTasks();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon="📅"
        label="Tâches du jour"
        value={todayTasks.length}
        color="blue"
      />
      <StatCard
        icon="⚠️"
        label="En retard"
        value={overdueTasks.length}
        color="red"
      />
      <StatCard
        icon="🔥"
        label="Streak"
        value={`${gameStats.currentStreak}j`}
        color="orange"
      />
      <StatCard
        icon="⚡"
        label="XP aujourd'hui"
        value={gameStats.dailyXP}
        color="green"
      />
    </div>
  );
};

export const WeeklyProgress: React.FC = () => {
  const { gameStats } = useAuthStore();

  if (!gameStats) return null;

  // Simuler les données de la semaine
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1; // Lundi = 0

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Cette semaine
      </h3>
      
      <div className="flex justify-between items-end h-24">
        {weekDays.map((day, index) => {
          const isToday = index === adjustedToday;
          const isPast = index < adjustedToday;
          const hasActivity = isPast || isToday; // Simulé
          
          return (
            <div key={day} className="flex flex-col items-center gap-2">
              <div
                className={`w-8 rounded-full transition-all ${
                  isToday
                    ? 'bg-primary-500 h-16'
                    : hasActivity
                    ? 'bg-primary-300 dark:bg-primary-700 h-12'
                    : 'bg-gray-200 dark:bg-gray-700 h-4'
                }`}
              />
              <span className={`text-xs ${isToday ? 'font-bold text-primary-500' : 'text-gray-500'}`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-sm text-gray-500">XP cette semaine</p>
          <p className="text-xl font-bold">{formatNumber(gameStats.weeklyXP)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Tâches</p>
          <p className="text-xl font-bold">{gameStats.weeklyTasksCompleted}</p>
        </div>
      </div>
    </Card>
  );
};

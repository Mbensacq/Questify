import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  Flame,
  Target,
  Plus,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Clock,
  CalendarOff,
  ListTodo
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useTaskStore } from '../stores/taskStore';
import { useQuestStore } from '../stores/questStore';
import { useUIStore } from '../stores/uiStore';
import { Card, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { XPBar } from '../components/ui/ProgressBar';
import { StreakBadge } from '../components/ui/Badge';
import { TaskCard } from '../components/tasks/TaskCard';
import { QuestCard } from '../components/quests/QuestCard';
import { PlayerStats, WeeklyProgress } from '../components/game/PlayerStats';
import { formatNumber, getLevelTitle } from '../utils/helpers';
import { Link } from 'react-router-dom';
import { format, isToday, isTomorrow, isPast, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  const { user, gameStats } = useAuthStore();
  const { tasks } = useTaskStore();
  const { getDailyQuests, getWeeklyQuests } = useQuestStore();
  const { openTaskModal } = useUIStore();

  const dailyQuests = getDailyQuests();
  const weeklyQuests = getWeeklyQuests();

  if (!user || !gameStats) return null;

  // Get today's tasks (with due date today or tomorrow)
  const todayTasks = tasks.filter((task) => {
    if (task.status === 'completed') return false;
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return isToday(dueDate) || isTomorrow(dueDate);
  });

  // Get tasks without due date
  const undatedTasks = tasks.filter((task) => {
    if (task.status === 'completed') return false;
    return !task.dueDate;
  });

  // Get overdue tasks
  const overdueTasks = tasks.filter((task) => {
    if (task.status === 'completed') return false;
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return isPast(dueDate) && !isToday(dueDate);
  });

  // Get active quests - show until rewards are claimed
  const activeQuests = [...dailyQuests, ...weeklyQuests]
    .filter((q) => !q.claimed)
    .sort((a, b) => {
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      return 0;
    })
    .slice(0, 3);

  // Calculate stats
  const completedToday = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt && isToday(new Date(t.completedAt))
  ).length;

  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden px-1 sm:px-0">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 p-4 sm:p-6 text-white shadow-lg"
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold truncate">
                Bonjour, {user.username}! 👋
              </h1>
              <p className="mt-1 text-white/80 text-xs sm:text-sm">
                {format(new Date(), "EEEE d MMMM", { locale: fr })}
              </p>
            </div>
            <Avatar config={user.avatar} size="md" showLevel level={gameStats.level} className="flex-shrink-0" />
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
              <span className="text-xs sm:text-sm font-medium">Niveau {gameStats.level}</span>
              <span className="text-xs sm:text-sm text-white/70 truncate">{getLevelTitle(gameStats.level)}</span>
            </div>
            <XPBar
              currentXP={gameStats.currentXP}
              xpToNextLevel={gameStats.xpToNextLevel}
              level={gameStats.level}
              showLevel={false}
            />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full" />
        <div className="absolute -right-5 -bottom-5 w-20 sm:w-28 h-20 sm:h-28 bg-white/10 rounded-full" />
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          icon={<CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />}
          label="Complétées"
          value={completedToday}
          color="primary"
        />
        <StatCard
          icon={<Target className="w-4 h-4 sm:w-6 sm:h-6" />}
          label="En attente"
          value={pendingTasks}
          color="yellow"
        />
        <StatCard
          icon={<Flame className="w-4 h-4 sm:w-6 sm:h-6" />}
          label="Streak"
          value={`${gameStats.currentStreak}j`}
          color="orange"
        />
        <StatCard
          icon={<Trophy className="w-4 h-4 sm:w-6 sm:h-6" />}
          label="XP Total"
          value={formatNumber(gameStats.totalXP)}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Tasks Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {/* Active Quests Section - Mobile visible */}
          <Card className="p-3 sm:p-4 lg:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                <h2 className="font-semibold text-sm sm:text-base">Quêtes actives</h2>
              </div>
              <Link
                to="/quests"
                className="text-xs sm:text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                Tout voir
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            {activeQuests.length > 0 ? (
              <div className="space-y-2">
                {activeQuests.slice(0, 2).map((quest) => (
                  <QuestCard key={quest.id} quest={quest} compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Toutes les quêtes complétées!</p>
              </div>
            )}
          </Card>

          {/* Overdue Tasks - If any */}
          {overdueTasks.length > 0 && (
            <Card className="p-3 sm:p-4 border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <h2 className="font-semibold text-sm sm:text-base text-red-600 dark:text-red-400">
                    En retard ({overdueTasks.length})
                  </h2>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {overdueTasks.slice(0, 3).map((task) => (
                  <TaskCard key={task.id} task={task} compact />
                ))}
                {overdueTasks.length > 3 && (
                  <Link
                    to="/tasks"
                    className="block text-center text-xs sm:text-sm text-red-500 hover:text-red-600 py-2"
                  >
                    +{overdueTasks.length - 3} autres tâches en retard
                  </Link>
                )}
              </div>
            </Card>
          )}

          {/* Today's Tasks */}
          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                <h2 className="font-semibold text-sm sm:text-base">Tâches du jour</h2>
                {todayTasks.length > 0 && (
                  <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 px-2 py-0.5 rounded-full">
                    {todayTasks.length}
                  </span>
                )}
              </div>
              <Link
                to="/tasks"
                className="text-xs sm:text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                Tout voir
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            {todayTasks.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {todayTasks.slice(0, 4).map((task) => (
                  <TaskCard key={task.id} task={task} compact />
                ))}
                {todayTasks.length > 4 && (
                  <Link
                    to="/tasks"
                    className="block text-center text-xs sm:text-sm text-primary-500 hover:text-primary-600 py-2"
                  >
                    +{todayTasks.length - 4} autres tâches
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-3 text-sm">Aucune tâche planifiée</p>
                <Button variant="primary" size="sm" onClick={openTaskModal}>
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            )}
          </Card>

          {/* Undated Tasks */}
          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <CalendarOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <h2 className="font-semibold text-sm sm:text-base">Sans date</h2>
                {undatedTasks.length > 0 && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 px-2 py-0.5 rounded-full">
                    {undatedTasks.length}
                  </span>
                )}
              </div>
              <Link
                to="/tasks"
                className="text-xs sm:text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                Tout voir
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            {undatedTasks.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {undatedTasks.slice(0, 4).map((task) => (
                  <TaskCard key={task.id} task={task} compact />
                ))}
                {undatedTasks.length > 4 && (
                  <Link
                    to="/tasks"
                    className="block text-center text-xs sm:text-sm text-primary-500 hover:text-primary-600 py-2"
                  >
                    +{undatedTasks.length - 4} autres tâches
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-4 sm:py-6 text-gray-500 text-sm">
                <ListTodo className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 opacity-50" />
                <p>Toutes vos tâches ont une date!</p>
              </div>
            )}
          </Card>

          {/* Weekly Progress */}
          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
              <h2 className="font-semibold text-sm sm:text-base">Progression hebdomadaire</h2>
            </div>
            <WeeklyProgress />
          </Card>
        </div>

        {/* Quests & Stats Column - Desktop only */}
        <div className="hidden lg:block space-y-6">
          {/* Active Quests */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-500" />
                <h2 className="font-semibold">Quêtes actives</h2>
              </div>
              <Link
                to="/quests"
                className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {activeQuests.length > 0 ? (
              <div className="space-y-3">
                {activeQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Toutes les quêtes sont complétées!</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

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
  CheckCircle2
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
import { format, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  const { user, gameStats } = useAuthStore();
  const { tasks } = useTaskStore();
  const { getDailyQuests, getWeeklyQuests } = useQuestStore();
  const { openTaskModal } = useUIStore();

  const dailyQuests = getDailyQuests();
  const weeklyQuests = getWeeklyQuests();

  if (!user || !gameStats) return null;

  // Get today's tasks
  const todayTasks = tasks.filter((task) => {
    if (task.status === 'completed') return false;
    if (!task.dueDate) return false;
    return isToday(new Date(task.dueDate)) || isTomorrow(new Date(task.dueDate));
  }).slice(0, 4);

  // Get active quests - show until rewards are claimed
  const activeQuests = [...dailyQuests, ...weeklyQuests]
    .filter((q) => !q.claimed) // Montrer tant que non réclamé
    .sort((a, b) => {
      // Quêtes complétées (à réclamer) en premier
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      return 0;
    })
    .slice(0, 3);

  // Calculate stats
  const completedToday = tasks.filter(
    (t) => t.status === 'completed' && isToday(new Date(t.completedAt!))
  ).length;

  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 p-4 sm:p-6 text-white shadow-soft-lg"
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold truncate">
                Bonjour, {user.username}! 👋✨
              </h1>
              <p className="mt-1 text-white/80 text-sm sm:text-base">
                {format(new Date(), "EEEE d MMMM", { locale: fr })}
              </p>
            </div>
            <Avatar config={user.avatar} size="lg" showLevel level={gameStats.level} />
          </div>

          <div className="mt-4 sm:mt-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium">Niveau {gameStats.level}</span>
              <span className="text-sm text-white/60">{getLevelTitle(gameStats.level)}</span>
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
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full hidden sm:block" />
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full hidden sm:block" />
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />}
          label="Complétées aujourd'hui"
          value={completedToday}
          color="primary"
        />
        <StatCard
          icon={<Target className="w-5 h-5 sm:w-6 sm:h-6" />}
          label="Tâches en attente"
          value={pendingTasks}
          color="yellow"
        />
        <StatCard
          icon={<Flame className="w-5 h-5 sm:w-6 sm:h-6" />}
          label="Streak actuel"
          value={`${gameStats.currentStreak} jours`}
          color="orange"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5 sm:w-6 sm:h-6" />}
          label="XP Total"
          value={formatNumber(gameStats.totalXP)}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Tasks Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                <h2 className="font-semibold">Tâches du jour</h2>
              </div>
              <Link
                to="/tasks"
                className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {todayTasks.length > 0 ? (
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <TaskCard key={task.id} task={task} compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-3">Aucune tâche pour aujourd'hui</p>
                <Button variant="primary" size="sm" onClick={openTaskModal}>
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter une tâche
                </Button>
              </div>
            )}
          </Card>

          {/* Weekly Progress */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <h2 className="font-semibold">Progression hebdomadaire</h2>
            </div>
            <WeeklyProgress />
          </Card>
        </div>

        {/* Quests & Stats Column */}
        <div className="space-y-6">
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

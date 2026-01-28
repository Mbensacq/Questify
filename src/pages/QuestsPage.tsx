import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Scroll,
  Clock,
  CheckCircle2,
  Gift,
  Sparkles,
  Target,
  RefreshCw
} from 'lucide-react';
import { useQuestStore } from '../stores/questStore';
import { useAuthStore } from '../stores/authStore';
import { QuestCard } from '../components/quests/QuestCard';
import { Card, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn, formatNumber } from '../utils/helpers';
import { differenceInHours, differenceInMinutes } from 'date-fns';
import { Quest } from '../types';

type TabType = 'daily' | 'weekly';

export const QuestsPage: React.FC = () => {
  const { getDailyQuests, getWeeklyQuests, refreshQuests, claimQuestReward } = useQuestStore();
  const { gameStats } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('daily');

  const dailyQuests = getDailyQuests();
  const weeklyQuests = getWeeklyQuests();

  if (!gameStats) return null;

  const currentQuests = activeTab === 'daily' ? dailyQuests : weeklyQuests;
  
  // Calculate stats
  const completedDaily = dailyQuests.filter((q: Quest) => q.completed).length;
  const completedWeekly = weeklyQuests.filter((q: Quest) => q.completed).length;
  const claimableDaily = dailyQuests.filter((q: Quest) => q.completed && !q.claimed).length;
  const claimableWeekly = weeklyQuests.filter((q: Quest) => q.completed && !q.claimed).length;

  // Time until reset
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const hoursUntilDailyReset = differenceInHours(tomorrow, now);
  const minutesUntilDailyReset = differenceInMinutes(tomorrow, now) % 60;

  // Weekly reset (Monday)
  const nextMonday = new Date(now);
  nextMonday.setDate(nextMonday.getDate() + ((7 - nextMonday.getDay() + 1) % 7 || 7));
  nextMonday.setHours(0, 0, 0, 0);
  const daysUntilWeeklyReset = Math.ceil((nextMonday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scroll className="w-7 h-7 text-primary-500" />
            Quêtes
          </h1>
          <p className="text-gray-500 mt-1">
            Complétez des quêtes pour gagner des récompenses bonus!
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-6 h-6" />}
          label="Quêtes quotidiennes"
          value={`${completedDaily}/${dailyQuests.length}`}
          color="primary"
        />
        <StatCard
          icon={<Sparkles className="w-6 h-6" />}
          label="Quêtes hebdomadaires"
          value={`${completedWeekly}/${weeklyQuests.length}`}
          color="purple"
        />
        <StatCard
          icon={<Gift className="w-6 h-6" />}
          label="Récompenses à réclamer"
          value={claimableDaily + claimableWeekly}
          color="yellow"
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6" />}
          label="Total complétées"
          value={formatNumber(gameStats.questsCompleted || 0)}
          color="green"
        />
      </div>

      {/* Reset Timer */}
      <Card className="bg-gradient-to-r from-primary-500/10 to-cyan-500/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="font-medium">Prochaine réinitialisation</p>
              <p className="text-sm text-gray-500">
                Quotidienne: {hoursUntilDailyReset}h {minutesUntilDailyReset}m | 
                Hebdomadaire: {daysUntilWeeklyReset} jour{daysUntilWeeklyReset > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refreshQuests()}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualiser
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('daily')}
          className={cn(
            'flex-1 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2',
            activeTab === 'daily'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500'
          )}
        >
          <Target className="w-5 h-5" />
          Quotidiennes
          {claimableDaily > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
              {claimableDaily}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={cn(
            'flex-1 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2',
            activeTab === 'weekly'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500'
          )}
        >
          <Sparkles className="w-5 h-5" />
          Hebdomadaires
          {claimableWeekly > 0 && (
            <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">
              {claimableWeekly}
            </span>
          )}
        </button>
      </div>

      {/* Quest List */}
      <div className="space-y-4">
        {currentQuests.map((quest: Quest, index: number) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <QuestCard quest={quest} />
          </motion.div>
        ))}
      </div>

      {currentQuests.length === 0 && (
        <div className="text-center py-16">
          <Scroll className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucune quête disponible pour le moment</p>
          <p className="text-sm text-gray-400 mt-2">
            Les nouvelles quêtes seront disponibles à la prochaine réinitialisation
          </p>
        </div>
      )}

      {/* Tips */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            💡
          </div>
          <div>
            <h4 className="font-medium">Astuce du jour</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Complétez toutes vos quêtes quotidiennes pour maximiser vos gains d'XP. 
              Les quêtes hebdomadaires offrent des récompenses plus importantes mais 
              demandent plus d'efforts!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Flame,
  Trophy,
  Clock,
  CheckCircle2,
  Zap
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useAuthStore } from '../stores/authStore';
import { useTaskStore } from '../stores/taskStore';
import { Card, StatCard } from '../components/ui/Card';
import { cn, formatNumber } from '../utils/helpers';
import { format, subDays, startOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TimeRange = '7days' | '30days' | '90days';

export const StatsPage: React.FC = () => {
  const { user, gameStats } = useAuthStore();
  const { tasks, categories } = useTaskStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');

  if (!user || !gameStats) return null;

  // Calculate date range
  const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
  const startDate = subDays(new Date(), days - 1);
  const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });

  // Tasks completed per day
  const completedTasksByDay = dateRange.map((date) => {
    return tasks.filter(
      (t) => t.status === 'completed' && t.completedAt && isSameDay(new Date(t.completedAt), date)
    ).length;
  });

  // XP gained per day (calculated from completed tasks' xpReward)
  const xpByDay = dateRange.map((date) => {
    return tasks
      .filter(
        (t) => t.status === 'completed' && t.completedAt && isSameDay(new Date(t.completedAt), date)
      )
      .reduce((total, task) => total + (task.xpReward || 0), 0);
  });

  // Tasks by category
  const tasksByCategory = categories.map((cat) => ({
    name: cat.name,
    count: tasks.filter((t) => t.categoryId === cat.id).length,
    color: cat.color,
  }));

  // Tasks by priority
  const tasksByPriority = {
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  };

  // Calculate statistics from persisted gameStats (not from tasks array)
  // This ensures stats persist even after tasks are deleted
  const totalCompleted = gameStats.tasksCompleted;
  const totalTasks = gameStats.tasksCreated;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  const avgTasksPerDay = days > 0 ? Math.round(totalCompleted / days) : 0;

  // Chart configurations
  const lineChartData = {
    labels: dateRange.map((d) => format(d, 'dd/MM')),
    datasets: [
      {
        label: 'Tâches complétées',
        data: completedTasksByDay,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const xpChartData = {
    labels: dateRange.map((d) => format(d, 'dd/MM')),
    datasets: [
      {
        label: 'XP gagnée',
        data: xpByDay,
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const categoryChartData = {
    labels: tasksByCategory.map((c) => c.name),
    datasets: [
      {
        data: tasksByCategory.map((c) => c.count),
        backgroundColor: tasksByCategory.map((c) => c.color),
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary-500" />
            Statistiques
          </h1>
          <p className="text-gray-500 mt-1">
            Suivez votre progression et vos performances
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { value: '7days', label: '7 jours' },
            { value: '30days', label: '30 jours' },
            { value: '90days', label: '90 jours' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value as TimeRange)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                timeRange === value
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'text-gray-500'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6" />}
          label="Total complétées"
          value={formatNumber(totalCompleted)}
          color="primary"
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          label="Taux de complétion"
          value={`${completionRate}%`}
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Moyenne par jour"
          value={avgTasksPerDay}
          color="purple"
        />
        <StatCard
          icon={<Flame className="w-6 h-6" />}
          label="Plus long streak"
          value={`${gameStats.longestStreak} jours`}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tasks Over Time */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              Tâches complétées
            </h3>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </Card>

        {/* XP Gained */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              XP gagnée
            </h3>
          </div>
          <div className="h-64">
            <Bar data={xpChartData} options={chartOptions} />
          </div>
        </Card>

        {/* Tasks by Category */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Répartition par catégorie
          </h3>
          <div className="flex items-center gap-6">
            <div className="w-48 h-48">
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  cutout: '60%',
                }}
              />
            </div>
            <div className="flex-1 space-y-2">
              {tasksByCategory.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Tasks by Priority */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-500" />
            Répartition par priorité
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Haute', value: tasksByPriority.high, color: 'bg-red-500' },
              { label: 'Moyenne', value: tasksByPriority.medium, color: 'bg-yellow-500' },
              { label: 'Basse', value: tasksByPriority.low, color: 'bg-green-500' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', color)}
                    style={{ width: `${totalTasks > 0 ? (value / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Game Stats */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Statistiques de jeu
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-3xl font-bold gradient-text">{gameStats.level}</div>
            <p className="text-sm text-gray-500 mt-1">Niveau actuel</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-3xl font-bold text-purple-500">
              {formatNumber(gameStats.totalXP)}
            </div>
            <p className="text-sm text-gray-500 mt-1">XP Total</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-3xl font-bold text-yellow-500">
              {gameStats.achievementsUnlocked.length}
            </div>
            <p className="text-sm text-gray-500 mt-1">Achievements</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-3xl font-bold text-orange-500">
              {formatNumber(gameStats.coins)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Pièces</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

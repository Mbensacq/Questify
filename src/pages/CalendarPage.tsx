import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  Flag,
  CheckCircle2,
  Circle,
  Sparkles
} from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { useAuthStore } from '../stores/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/ui/PageTransition';
import { cn } from '../utils/helpers';
import { Task, TaskPriority } from '../types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { QuickTaskModal } from '../components/tasks/QuickTaskModal';

const priorityColors: Record<TaskPriority, string> = {
  none: 'bg-gray-400',
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const priorityBorderColors: Record<TaskPriority, string> = {
  none: 'border-l-gray-400',
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500',
};

interface DayTasksModalProps {
  date: Date;
  tasks: Task[];
  onClose: () => void;
  onAddTask: () => void;
  onToggleTask: (taskId: string) => void;
}

const isTaskCompleted = (task: Task): boolean => {
  return task.status === 'completed';
};

const DayTasksModal: React.FC<DayTasksModalProps> = ({ date, tasks, onClose, onAddTask, onToggleTask }) => {
  const completedTasks = tasks.filter(t => isTaskCompleted(t));
  const pendingTasks = tasks.filter(t => !isTaskCompleted(t));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-primary-500/10 to-cyan-500/10">
          <div>
            <h2 className="text-lg font-bold capitalize">
              {format(date, 'EEEE d MMMM', { locale: fr })}
            </h2>
            <p className="text-sm text-gray-500">
              {tasks.length} tâche{tasks.length > 1 ? 's' : ''} • {completedTasks.length} terminée{completedTasks.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tasks List */}
        <div className="p-4 overflow-y-auto max-h-[50vh] space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune tâche pour ce jour</p>
            </div>
          ) : (
            <>
              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">À faire</p>
                  {pendingTasks.map(task => (
                    <div
                      key={task.id}
                      className={cn(
                        "p-3 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-700/50",
                        priorityBorderColors[task.priority]
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="mt-0.5 text-gray-400 hover:text-primary-500 transition-colors"
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-gray-500 truncate">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span className={cn("px-1.5 py-0.5 rounded text-white text-[10px]", priorityColors[task.priority])}>
                              {task.priority}
                            </span>
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {task.xpReward} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Terminées</p>
                  {completedTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 opacity-60"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="mt-0.5 text-green-500"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate line-through">{task.title}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Add Task Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onAddTask} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une tâche
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const CalendarPage: React.FC = () => {
  const { tasks, completeTask } = useTaskStore();
  const { user } = useAuthStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showQuickTask, setShowQuickTask] = useState(false);
  const [quickTaskDate, setQuickTaskDate] = useState<Date | null>(null);

  // Get tasks grouped by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddTaskForDate = (date: Date) => {
    setQuickTaskDate(date);
    setShowQuickTask(true);
    setSelectedDate(null);
  };

  const handleToggleTask = async (taskId: string) => {
    if (user) {
      await completeTask(taskId);
    }
  };

  const getTasksForDate = (date: Date): Task[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return tasksByDate[dateKey] || [];
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <PageTransition className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-primary-500" />
            Calendrier
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Organisez vos tâches par date
          </p>
        </div>
      </div>

      {/* Calendar Card */}
      <Card className="p-4 sm:p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <h2 className="text-lg sm:text-xl font-bold capitalize ml-2">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </h2>
          </div>
          <Button variant="secondary" size="sm" onClick={handleToday}>
            Aujourd'hui
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const dayTasks = getTasksForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            const completedCount = dayTasks.filter(t => isTaskCompleted(t)).length;
            const pendingCount = dayTasks.length - completedCount;

            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 rounded-lg border border-transparent transition-all cursor-pointer group relative",
                  isCurrentMonth
                    ? "bg-gray-50 dark:bg-gray-800/50 hover:border-primary-500/50"
                    : "bg-gray-100/50 dark:bg-gray-900/30 opacity-50",
                  isCurrentDay && "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20"
                )}
                onClick={() => handleDayClick(day)}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                      isCurrentDay && "bg-primary-500 text-white"
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-gray-500 hidden sm:block">
                      {pendingCount > 0 && `${pendingCount} à faire`}
                    </span>
                  )}
                </div>

                {/* Tasks Preview */}
                <div className="space-y-0.5 overflow-hidden">
                  {dayTasks.slice(0, 3).map((task, taskIdx) => (
                    <div
                      key={task.id}
                      className={cn(
                        "text-[10px] sm:text-xs px-1.5 py-0.5 rounded truncate",
                        isTaskCompleted(task)
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-500 line-through"
                          : cn(
                              priorityColors[task.priority],
                              "text-white"
                            )
                      )}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-gray-500 px-1">
                      +{dayTasks.length - 3} autres
                    </div>
                  )}
                </div>

                {/* Add Task Button (visible on hover) */}
                {isCurrentMonth && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddTaskForDate(day);
                    }}
                    className="absolute bottom-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-primary-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-primary-600"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-500">Priorités:</span>
          {Object.entries(priorityColors).map(([priority, color]) => (
            <div key={priority} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded", color)} />
              <span className="text-xs capitalize text-gray-600 dark:text-gray-400">{priority}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{tasks.filter(t => !isTaskCompleted(t)).length}</p>
          <p className="text-sm text-gray-500">Tâches en cours</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{tasks.filter(t => isTaskCompleted(t)).length}</p>
          <p className="text-sm text-gray-500">Terminées</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">
            {tasks.filter(t => !isTaskCompleted(t) && t.dueDate && new Date(t.dueDate) < new Date()).length}
          </p>
          <p className="text-sm text-gray-500">En retard</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-cyan-500">
            {getTasksForDate(new Date()).filter(t => !isTaskCompleted(t)).length}
          </p>
          <p className="text-sm text-gray-500">Aujourd'hui</p>
        </Card>
      </div>

      {/* Day Tasks Modal */}
      <AnimatePresence>
        {selectedDate && (
          <DayTasksModal
            date={selectedDate}
            tasks={getTasksForDate(selectedDate)}
            onClose={() => setSelectedDate(null)}
            onAddTask={() => handleAddTaskForDate(selectedDate)}
            onToggleTask={handleToggleTask}
          />
        )}
      </AnimatePresence>

      {/* Quick Task Modal */}
      {showQuickTask && quickTaskDate && (
        <QuickTaskModal
          onClose={() => {
            setShowQuickTask(false);
            setQuickTaskDate(null);
          }}
          defaultDate={quickTaskDate}
        />
      )}
    </PageTransition>
  );
};

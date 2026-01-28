import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Archive,
  Flag,
  Zap,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Task, Subtask } from '../../types';
import { Card } from '../ui/Card';
import { Badge, PriorityBadge, DifficultyBadge, XPBadge, CoinBadge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { cn, formatRelativeDate, getPriorityColor } from '../../utils/helpers';
import { useTaskStore } from '../../stores/taskStore';
import { useUIStore } from '../../stores/uiStore';
import { playSoundIfEnabled } from '../../utils/sounds';

interface TaskCardProps {
  task: Task;
  onComplete?: () => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onComplete,
  compact = false 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const { completeTask, deleteTask, archiveTask, toggleSubtask, selectTask } = useTaskStore();
  const { showXPGain, showCoinsGain, showLevelUp } = useUIStore();

  const handleComplete = async () => {
    const result = await completeTask(task.id);
    playSoundIfEnabled('taskComplete');
    showXPGain(result.xpGained);
    showCoinsGain(result.coinsGained);
    
    if ((result as any).leveledUp) {
      setTimeout(() => {
        showLevelUp((result as any).newLevel);
        playSoundIfEnabled('levelUp');
      }, 500);
    }
    
    onComplete?.();
  };

  const handleSubtaskToggle = async (subtaskId: string) => {
    await toggleSubtask(task.id, subtaskId);
    playSoundIfEnabled('click');
  };

  const isCompleted = task.status === 'completed';
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        variant="game"
        className={cn(
          'p-3 sm:p-4 relative overflow-hidden transition-shadow duration-200 hover:shadow-soft-lg',
          isCompleted && 'opacity-60',
          isOverdue && 'border-l-4 border-l-red-500'
        )}
      >
        {/* Priority indicator */}
        <div
          className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 -mr-6 sm:-mr-8 -mt-6 sm:-mt-8 rounded-full opacity-20"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        />

        <div className="flex items-start gap-2 sm:gap-3">
          {/* Checkbox */}
          <button
            onClick={handleComplete}
            disabled={isCompleted}
            className={cn(
              'flex-shrink-0 mt-0.5 transition-colors touch-manipulation',
              isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Circle className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 
                className={cn(
                  'font-medium text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2',
                  isCompleted && 'line-through text-gray-500'
                )}
              >
                {task.title}
              </h3>
              
              {/* Menu */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
                
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 w-36 sm:w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
                    >
                      <button
                        onClick={() => { selectTask(task); setShowMenu(false); }}
                        className="w-full px-3 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 touch-manipulation"
                      >
                        <Edit2 className="w-4 h-4" /> Modifier
                      </button>
                      <button
                        onClick={() => { archiveTask(task.id); setShowMenu(false); }}
                        className="w-full px-3 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 touch-manipulation"
                      >
                        <Archive className="w-4 h-4" /> Archiver
                      </button>
                      <button
                        onClick={() => { deleteTask(task.id); setShowMenu(false); }}
                        className="w-full px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 touch-manipulation"
                      >
                        <Trash2 className="w-4 h-4" /> Supprimer
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Description */}
            {task.description && !compact && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
              <PriorityBadge priority={task.priority} />
              {!compact && <DifficultyBadge difficulty={task.difficulty} />}
              
              {task.category && !compact && (
                <Badge variant="default" size="sm">
                  {task.category}
                </Badge>
              )}
            </div>

            {/* Subtasks */}
            {task.subtasks.length > 0 && !compact && (
              <div className="mt-2 sm:mt-3">
                <button
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 touch-manipulation"
                >
                  {showSubtasks ? (
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span>{completedSubtasks}/{task.subtasks.length} sous-tâches</span>
                </button>
                
                {!showSubtasks && task.subtasks.length > 0 && (
                  <ProgressBar
                    value={completedSubtasks}
                    max={task.subtasks.length}
                    color="primary"
                    size="sm"
                  />
                )}

                <AnimatePresence>
                  {showSubtasks && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 space-y-1 overflow-hidden"
                    >
                      {task.subtasks.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center gap-2 text-xs sm:text-sm"
                        >
                          <button
                            onClick={() => handleSubtaskToggle(subtask.id)}
                            className={cn(
                              'flex-shrink-0 touch-manipulation',
                              subtask.completed ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
                            )}
                          >
                            {subtask.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                          </button>
                          <span className={cn(
                            'truncate',
                            subtask.completed && 'line-through text-gray-400'
                          )}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 min-w-0">
                {task.dueDate && (
                  <span className={cn(
                    'flex items-center gap-1 truncate',
                    isOverdue && 'text-red-500'
                  )}>
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{formatRelativeDate(task.dueDate)}</span>
                  </span>
                )}
                {task.estimatedTime && !compact && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    {task.estimatedTime}m
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <XPBadge amount={task.xpReward} />
                {!compact && <CoinBadge amount={task.coinReward} />}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

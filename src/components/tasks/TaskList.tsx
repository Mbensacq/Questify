import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { useTaskStore } from '../../stores/taskStore';
import { FileX } from 'lucide-react';

interface TaskListProps {
  status?: TaskStatus;
  emptyMessage?: string;
}

export const TaskList: React.FC<TaskListProps> = ({ 
  status,
  emptyMessage = 'Aucune tâche à afficher'
}) => {
  const { getFilteredTasks, getTasksByStatus } = useTaskStore();
  
  const tasks = status ? getTasksByStatus(status) : getFilteredTasks();
  const activeTasks = tasks.filter(t => t.status !== 'archived' && t.status !== 'completed');

  if (activeTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <FileX className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Créez une nouvelle tâche pour commencer !
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {activeTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface GroupedTaskListProps {
  groupBy: 'category' | 'priority' | 'dueDate';
}

export const GroupedTaskList: React.FC<GroupedTaskListProps> = ({ groupBy }) => {
  const { getFilteredTasks, categories } = useTaskStore();
  const tasks = getFilteredTasks().filter(t => t.status !== 'archived' && t.status !== 'completed');

  const groupTasks = () => {
    const groups: Record<string, Task[]> = {};

    if (groupBy === 'category') {
      categories.forEach(cat => {
        groups[cat.name] = [];
      });
      tasks.forEach(task => {
        const categoryName = task.category || 'Autre';
        if (groups[categoryName]) {
          groups[categoryName].push(task);
        } else {
          groups['Autre'] = groups['Autre'] || [];
          groups['Autre'].push(task);
        }
      });
    } else if (groupBy === 'priority') {
      const priorities = ['critical', 'high', 'medium', 'low'];
      const labels = { critical: '🔴 Critique', high: '🟠 Haute', medium: '🟡 Moyenne', low: '🟢 Basse' };
      priorities.forEach(p => {
        groups[labels[p as keyof typeof labels]] = tasks.filter(t => t.priority === p);
      });
    } else if (groupBy === 'dueDate') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      groups['En retard'] = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today);
      groups["Aujourd'hui"] = tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < tomorrow
      );
      groups['Cette semaine'] = tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) >= tomorrow && new Date(t.dueDate) < nextWeek
      );
      groups['Plus tard'] = tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) >= nextWeek
      );
      groups['Sans date'] = tasks.filter(t => !t.dueDate);
    }

    return groups;
  };

  const groups = groupTasks();

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([groupName, groupTasks]) => {
        if (groupTasks.length === 0) return null;
        
        return (
          <div key={groupName}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              {groupName}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({groupTasks.length})
              </span>
            </h3>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {groupTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
};

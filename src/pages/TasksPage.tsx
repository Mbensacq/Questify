import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListTodo,
  Filter,
  Plus,
  Search,
  FolderOpen,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { useUIStore } from '../stores/uiStore';
import { TaskCard } from '../components/tasks/TaskCard';
import { BulkDeleteModal } from '../components/tasks/BulkDeleteModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../utils/helpers';
import { Task } from '../types';

type GroupBy = 'none' | 'category' | 'priority' | 'dueDate';

export const TasksPage: React.FC = () => {
  const { tasks, categories, filter, setFilter, updateTask, deleteTask } = useTaskStore();
  const { openTaskModal, setEditingTask } = useUIStore();
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Apply status filter
    if (filter.status !== 'all') {
      result = result.filter((t) => t.status === filter.status);
    }

    // Apply priority filter
    if (filter.priority) {
      result = result.filter((t) => t.priority === filter.priority);
    }

    // Apply category filter
    if (filter.categoryId) {
      result = result.filter((t) => t.categoryId === filter.categoryId);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (filter.sortBy) {
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    if (filter.sortDirection === 'desc') {
      result.reverse();
    }

    return result;
  }, [tasks, filter, searchQuery]);

  // Group tasks
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') return { 'Toutes les tâches': filteredTasks };

    const groups: Record<string, Task[]> = {};

    filteredTasks.forEach((task) => {
      let key: string;
      switch (groupBy) {
        case 'category':
          const category = categories.find((c) => c.id === task.categoryId);
          key = category?.name || 'Sans catégorie';
          break;
        case 'priority':
          const priorityLabels: Record<string, string> = {
            critical: '🔥 Critique',
            high: '🔴 Haute priorité',
            medium: '🟡 Priorité moyenne',
            low: '🟢 Basse priorité',
            none: '⚪ Sans priorité',
          };
          key = priorityLabels[task.priority] || 'Sans priorité';
          break;
        case 'dueDate':
          if (!task.dueDate) {
            key = 'Sans date';
          } else {
            const date = new Date(task.dueDate);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            if (date.toDateString() === today.toDateString()) {
              key = "Aujourd'hui";
            } else if (date.toDateString() === tomorrow.toDateString()) {
              key = 'Demain';
            } else if (date < today) {
              key = '⚠️ En retard';
            } else {
              key = 'À venir';
            }
          }
          break;
        default:
          key = 'Autres';
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    return groups;
  }, [filteredTasks, groupBy, categories]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    openTaskModal();
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ListTodo className="w-6 h-6 sm:w-7 sm:h-7 text-primary-500" />
            Mes Tâches
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="game" onClick={openTaskModal} className="flex-1 sm:flex-none">
            <Plus className="w-5 h-5 mr-1" />
            Nouvelle tâche
          </Button>
          <Button 
            variant="danger" 
            onClick={() => setShowBulkDelete(true)} 
            className="px-3"
            title="Suppression en masse"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 sm:flex-none"
          >
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="sm:hidden ml-2">Filtres</span>
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Status Filter */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2 block">
                  Statut
                </label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ status: e.target.value as any })}
                  className="w-full px-2 sm:px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="all">Toutes</option>
                  <option value="pending">En attente</option>
                  <option value="in-progress">En cours</option>
                  <option value="completed">Complétées</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2 block">
                  Priorité
                </label>
                <select
                  value={filter.priority || ''}
                  onChange={(e) => setFilter({ priority: e.target.value as any || undefined })}
                  className="w-full px-2 sm:px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="">Toutes</option>
                  <option value="high">Haute</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Basse</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2 block">
                  Catégorie
                </label>
                <select
                  value={filter.categoryId || ''}
                  onChange={(e) => setFilter({ categoryId: e.target.value || undefined })}
                  className="w-full px-2 sm:px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="">Toutes</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group By */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2 block">
                  Grouper par
                </label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                  className="w-full px-2 sm:px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="none">Aucun</option>
                  <option value="category">Catégorie</option>
                  <option value="priority">Priorité</option>
                  <option value="dueDate">Date</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(groupedTasks).map(([group, tasks]) => (
            <div key={group}>
              {groupBy !== 'none' && (
                <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <FolderOpen className="w-4 h-4" />
                  {group}
                  <span className="text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {tasks.length}
                  </span>
                </h3>
              )}
              <div className="space-y-2 sm:space-y-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 sm:py-16"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-medium mb-2">Aucune tâche trouvée</h3>
          <p className="text-gray-500 mb-4 text-sm sm:text-base px-4">
            {searchQuery
              ? 'Essayez de modifier votre recherche'
              : 'Créez votre première tâche pour commencer!'}
          </p>
          <Button variant="game" onClick={openTaskModal}>
            <Plus className="w-5 h-5 mr-1" />
            Nouvelle tâche
          </Button>
        </motion.div>
      )}

      {/* Bulk Delete Modal */}
      <BulkDeleteModal 
        isOpen={showBulkDelete} 
        onClose={() => setShowBulkDelete(false)} 
      />
    </div>
  );
};

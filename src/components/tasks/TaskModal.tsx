import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { XPBadge, CoinBadge } from '../ui/Badge';
import { useTaskStore } from '../../stores/taskStore';
import { useAuthStore } from '../../stores/authStore';
import { Task, TaskPriority, TaskDifficulty, RecurrenceType } from '../../types';
import { playSoundIfEnabled } from '../../utils/sounds';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  editTask,
}) => {
  const { addTask, updateTask, categories, calculateTaskRewards } = useTaskStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: editTask?.title || '',
    description: editTask?.description || '',
    category: editTask?.category || categories[0]?.name || 'Travail',
    priority: editTask?.priority || 'medium' as TaskPriority,
    difficulty: editTask?.difficulty || 'medium' as TaskDifficulty,
    dueDate: editTask?.dueDate ? new Date(editTask.dueDate).toISOString().slice(0, 16) : '',
    estimatedTime: editTask?.estimatedTime?.toString() || '',
    recurrence: editTask?.recurrence || 'none' as RecurrenceType,
    subtasks: editTask?.subtasks.map(s => s.title) || [] as string[],
    tags: editTask?.tags.join(', ') || '',
  });

  const [newSubtask, setNewSubtask] = useState('');

  const rewards = calculateTaskRewards(formData.difficulty, formData.priority);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !user) return;

    setIsLoading(true);

    try {
      const taskData = {
        userId: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        priority: formData.priority,
        difficulty: formData.difficulty,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
        recurrence: formData.recurrence,
        subtasks: formData.subtasks.map((title, index) => ({
          id: `subtask-${index}-${Date.now()}`,
          title,
          completed: false,
        })),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: 'pending' as const,
        progress: 0,
      };

      if (editTask) {
        await updateTask(editTask.id, taskData);
      } else {
        await addTask(taskData);
        playSoundIfEnabled('click');
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: categories[0]?.name || 'Travail',
      priority: 'medium',
      difficulty: 'medium',
      dueDate: '',
      estimatedTime: '',
      recurrence: 'none',
      subtasks: [],
      tags: '',
    });
    setNewSubtask('');
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, newSubtask.trim()],
      }));
      setNewSubtask('');
    }
  };

  const removeSubtask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const priorityOptions = [
    { value: 'low', label: '🟢 Basse' },
    { value: 'medium', label: '🟡 Moyenne' },
    { value: 'high', label: '🟠 Haute' },
    { value: 'critical', label: '🔴 Critique' },
  ];

  const difficultyOptions = [
    { value: 'trivial', label: '⚪ Trivial (5 XP)' },
    { value: 'easy', label: '🟢 Facile (10 XP)' },
    { value: 'medium', label: '🔵 Moyen (25 XP)' },
    { value: 'hard', label: '🟠 Difficile (50 XP)' },
    { value: 'epic', label: '🟣 Épique (100 XP)' },
    { value: 'legendary', label: '🟡 Légendaire (200 XP)' },
  ];

  const recurrenceOptions = [
    { value: 'none', label: 'Aucune' },
    { value: 'daily', label: 'Quotidien' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          label="Titre *"
          placeholder="Que devez-vous faire ?"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          autoFocus
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Détails supplémentaires..."
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        {/* Category & Due Date */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Catégorie"
            options={categories.map(c => ({ value: c.name, label: `${c.icon || '📁'} ${c.name}` }))}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <Input
            label="Date d'échéance"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        {/* Priority & Difficulty */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priorité"
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
          />
          <Select
            label="Difficulté"
            options={difficultyOptions}
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as TaskDifficulty })}
          />
        </div>

        {/* Rewards Preview */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Récompenses estimées :</p>
          <div className="flex items-center gap-3">
            <XPBadge amount={rewards.xp} />
            <CoinBadge amount={rewards.coins} />
          </div>
        </div>

        {/* Estimated Time & Recurrence */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Temps estimé (minutes)"
            type="number"
            placeholder="30"
            min="1"
            value={formData.estimatedTime}
            onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
          />
          <Select
            label="Récurrence"
            options={recurrenceOptions}
            value={formData.recurrence}
            onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as RecurrenceType })}
          />
        </div>

        {/* Subtasks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sous-tâches
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Ajouter une sous-tâche..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
            />
            <Button type="button" variant="secondary" onClick={addSubtask}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {formData.subtasks.length > 0 && (
            <ul className="space-y-1">
              {formData.subtasks.map((subtask, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded"
                >
                  <span className="text-sm">{subtask}</span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        {/* Tags */}
        <Input
          label="Tags"
          placeholder="travail, urgent, projet... (séparés par des virgules)"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="game" isLoading={isLoading}>
            {editTask ? 'Enregistrer' : 'Créer la tâche'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

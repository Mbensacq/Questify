import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { XPBadge, CoinBadge } from '../ui/Badge';
import { useTaskStore } from '../../stores/taskStore';
import { useAuthStore } from '../../stores/authStore';
import { Task, TaskPriority, TaskDifficulty, RecurrenceType, DEFAULT_CATEGORIES } from '../../types';
import { playSoundIfEnabled } from '../../utils/sounds';

// Catégories par défaut avec emojis
const CATEGORY_OPTIONS = [
  { value: 'Travail', label: '💼 Travail', color: '#3b82f6' },
  { value: 'Personnel', label: '👤 Personnel', color: '#22c55e' },
  { value: 'Santé', label: '❤️ Santé', color: '#ef4444' },
  { value: 'Études', label: '📚 Études', color: '#8b5cf6' },
  { value: 'Finances', label: '💰 Finances', color: '#f59e0b' },
  { value: 'Social', label: '👥 Social', color: '#ec4899' },
  { value: 'Loisirs', label: '🎮 Loisirs', color: '#06b6d4' },
  { value: 'Maison', label: '🏠 Maison', color: '#84cc16' },
];

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: Task | null;
}

interface FormErrors {
  title?: string;
  general?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  editTask,
}) => {
  const { addTask, updateTask, categories, calculateTaskRewards } = useTaskStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    title: editTask?.title || '',
    description: editTask?.description || '',
    category: editTask?.category || 'Personnel',
    priority: editTask?.priority || 'medium' as TaskPriority,
    difficulty: editTask?.difficulty || 'medium' as TaskDifficulty,
    dueDate: editTask?.dueDate ? new Date(editTask.dueDate).toISOString().slice(0, 16) : '',
    estimatedTime: editTask?.estimatedTime?.toString() || '',
    recurrence: editTask?.recurrence || 'none' as RecurrenceType,
    subtasks: editTask?.subtasks.map(s => s.title) || [] as string[],
    tags: editTask?.tags.join(', ') || '',
  });

  const [newSubtask, setNewSubtask] = useState('');

  // Reset form when modal opens with new task
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: editTask?.title || '',
        description: editTask?.description || '',
        category: editTask?.category || 'Personnel',
        priority: editTask?.priority || 'medium' as TaskPriority,
        difficulty: editTask?.difficulty || 'medium' as TaskDifficulty,
        dueDate: editTask?.dueDate ? new Date(editTask.dueDate).toISOString().slice(0, 16) : '',
        estimatedTime: editTask?.estimatedTime?.toString() || '',
        recurrence: editTask?.recurrence || 'none' as RecurrenceType,
        subtasks: editTask?.subtasks?.map(s => s.title) || [],
        tags: editTask?.tags?.join(', ') || '',
      });
      setErrors({});
      setTouched({});
    }
  }, [isOpen, editTask]);

  const rewards = calculateTaskRewards(formData.difficulty, formData.priority);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Le titre doit faire au moins 2 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ title: true });
    
    if (!validateForm()) {
      return;
    }
    
    if (!user) {
      setErrors({ general: 'Vous devez être connecté pour créer une tâche' });
      return;
    }

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
      setErrors({ general: 'Une erreur est survenue lors de la création de la tâche' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Personnel',
      priority: 'medium',
      difficulty: 'medium',
      dueDate: '',
      estimatedTime: '',
      recurrence: 'none',
      subtasks: [],
      tags: '',
    });
    setNewSubtask('');
    setErrors({});
    setTouched({});
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, title: e.target.value });
    if (touched.title) {
      if (!e.target.value.trim()) {
        setErrors(prev => ({ ...prev, title: 'Le titre est obligatoire' }));
      } else {
        setErrors(prev => ({ ...prev, title: undefined }));
      }
    }
  };

  const handleTitleBlur = () => {
    setTouched(prev => ({ ...prev, title: true }));
    if (!formData.title.trim()) {
      setErrors(prev => ({ ...prev, title: 'Le titre est obligatoire' }));
    }
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
      size="xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Error Banner */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{errors.general}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title - Full width */}
        <div>
          <Input
            label="Titre de la tâche *"
            placeholder="Que devez-vous accomplir ?"
            value={formData.title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            error={touched.title ? errors.title : undefined}
            autoFocus
          />
        </div>

        {/* Description */}
        <Textarea
          label="Description (optionnel)"
          placeholder="Ajoutez des détails ou des notes..."
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        {/* Category & Priority - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Catégorie"
            options={CATEGORY_OPTIONS}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <Select
            label="Priorité"
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
          />
        </div>

        {/* Difficulty & Due Date - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Difficulté"
            options={difficultyOptions}
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as TaskDifficulty })}
          />
          <Input
            label="Date d'échéance (optionnel)"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required={false}
          />
        </div>

        {/* Rewards Preview - Styled */}
        <div className="p-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">🎁 Récompenses estimées :</p>
          <div className="flex items-center gap-3">
            <XPBadge amount={rewards.xp} />
            <CoinBadge amount={rewards.coins} />
          </div>
        </div>

        {/* Time & Recurrence - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Temps estimé (minutes)"
            type="number"
            placeholder="Ex: 30"
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
            Sous-tâches (optionnel)
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Ajouter une étape..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
            />
            <Button type="button" variant="secondary" onClick={addSubtask} className="flex-shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {formData.subtasks.length > 0 && (
            <ul className="space-y-2 max-h-32 overflow-y-auto">
              {formData.subtasks.map((subtask, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2.5 bg-gray-100 dark:bg-gray-900 rounded-lg"
                >
                  <span className="text-sm truncate flex-1 mr-2">{subtask}</span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(index)}
                    className="text-red-500 hover:text-red-600 p-1 flex-shrink-0"
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
          label="Tags (optionnel)"
          placeholder="projet, urgent, idée... (séparés par des virgules)"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
        />

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Annuler
          </Button>
          <Button type="submit" variant="game" isLoading={isLoading} className="w-full sm:w-auto">
            {editTask ? 'Enregistrer' : 'Créer la tâche'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

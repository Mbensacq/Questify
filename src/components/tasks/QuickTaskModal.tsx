import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { useTaskStore } from '../../stores/taskStore';
import { TaskPriority, TaskDifficulty } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface QuickTaskModalProps {
  onClose: () => void;
  defaultDate: Date;
}

const PRIORITY_OPTIONS = [
  { value: 'none', label: '⚪ Aucune', color: 'bg-gray-400' },
  { value: 'low', label: '🟢 Basse', color: 'bg-green-500' },
  { value: 'medium', label: '🟡 Moyenne', color: 'bg-yellow-500' },
  { value: 'high', label: '🟠 Haute', color: 'bg-orange-500' },
  { value: 'critical', label: '🔴 Critique', color: 'bg-red-500' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'trivial', label: '⭐ Trivial' },
  { value: 'easy', label: '⭐⭐ Facile' },
  { value: 'medium', label: '⭐⭐⭐ Moyen' },
  { value: 'hard', label: '⭐⭐⭐⭐ Difficile' },
  { value: 'epic', label: '⭐⭐⭐⭐⭐ Épique' },
];

const CATEGORY_OPTIONS = [
  { value: 'Travail', label: '💼 Travail' },
  { value: 'Personnel', label: '👤 Personnel' },
  { value: 'Santé', label: '❤️ Santé' },
  { value: 'Études', label: '📚 Études' },
  { value: 'Finances', label: '💰 Finances' },
  { value: 'Social', label: '👥 Social' },
  { value: 'Loisirs', label: '🎮 Loisirs' },
  { value: 'Maison', label: '🏠 Maison' },
];

export const QuickTaskModal: React.FC<QuickTaskModalProps> = ({ onClose, defaultDate }) => {
  const { addTask, calculateTaskRewards } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Personnel',
    priority: 'medium' as TaskPriority,
    difficulty: 'medium' as TaskDifficulty,
    dueDate: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
  });

  const rewards = calculateTaskRewards(formData.difficulty, formData.priority);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsLoading(true);
    try {
      await addTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        difficulty: formData.difficulty,
        dueDate: new Date(formData.dueDate),
        estimatedTime: undefined,
        recurrence: 'none',
        subtasks: [],
        tags: [],
        userId: '', // Will be set by addTask
        status: 'pending',
        progress: 0,
      });
      onClose();
    } catch (error) {
      console.error('Error adding task:', error);
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500/10 to-cyan-500/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                Nouvelle tâche
              </h2>
              <p className="text-sm text-gray-500 capitalize">
                {format(defaultDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <Input
            label="Titre de la tâche"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Qu'avez-vous à faire ?"
            autoFocus
            required
          />

          {/* Description */}
          <Textarea
            label="Description (optionnel)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ajoutez des détails..."
            rows={2}
          />

          {/* Category & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Catégorie"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={CATEGORY_OPTIONS}
            />
            <Select
              label="Priorité"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              options={PRIORITY_OPTIONS}
            />
          </div>

          {/* Difficulty */}
          <Select
            label="Difficulté"
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as TaskDifficulty })}
            options={DIFFICULTY_OPTIONS}
          />

          {/* Date & Time */}
          <Input
            type="datetime-local"
            label="Date et heure"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />

          {/* Rewards Preview */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-2">Récompenses</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-yellow-600">{rewards.xp} XP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-[10px]">💰</div>
                <span className="font-semibold text-yellow-600">{rewards.coins} pièces</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !formData.title.trim()} className="flex-1">
              {isLoading ? 'Création...' : 'Créer la tâche'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

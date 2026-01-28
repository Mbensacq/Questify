// Configuration des quêtes
import { Quest, QuestType } from '../types';

export interface QuestTemplate {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  icon: string;
  objectives: {
    description: string;
    type: 'complete_tasks' | 'complete_category' | 'earn_xp' | 'maintain_streak' | 'focus_time' | 'complete_priority';
    target: number;
    category?: string;
    priority?: string;
  }[];
  rewards: {
    xp: number;
    coins: number;
    gems?: number;
  };
}

// Quêtes journalières
export const DAILY_QUESTS: QuestTemplate[] = [
  {
    id: 'daily_complete_3',
    type: 'daily',
    title: 'Mise en Route',
    description: 'Complétez 3 tâches aujourd\'hui',
    icon: '🎯',
    objectives: [
      { description: 'Compléter 3 tâches', type: 'complete_tasks', target: 3 }
    ],
    rewards: { xp: 50, coins: 20 }
  },
  {
    id: 'daily_complete_5',
    type: 'daily',
    title: 'Productivité',
    description: 'Complétez 5 tâches aujourd\'hui',
    icon: '⚡',
    objectives: [
      { description: 'Compléter 5 tâches', type: 'complete_tasks', target: 5 }
    ],
    rewards: { xp: 100, coins: 40 }
  },
  {
    id: 'daily_xp_100',
    type: 'daily',
    title: 'Chasseur d\'XP',
    description: 'Gagnez 100 XP aujourd\'hui',
    icon: '✨',
    objectives: [
      { description: 'Gagner 100 XP', type: 'earn_xp', target: 100 }
    ],
    rewards: { xp: 25, coins: 30 }
  },
  {
    id: 'daily_high_priority',
    type: 'daily',
    title: 'Priorités',
    description: 'Complétez 2 tâches haute priorité',
    icon: '🔥',
    objectives: [
      { description: 'Compléter 2 tâches haute priorité', type: 'complete_priority', target: 2, priority: 'high' }
    ],
    rewards: { xp: 75, coins: 35 }
  },
  {
    id: 'daily_work',
    type: 'daily',
    title: 'Boss du Boulot',
    description: 'Complétez 3 tâches de travail',
    icon: '💼',
    objectives: [
      { description: 'Compléter 3 tâches de travail', type: 'complete_category', target: 3, category: 'Travail' }
    ],
    rewards: { xp: 75, coins: 30 }
  },
  {
    id: 'daily_personal',
    type: 'daily',
    title: 'Temps Personnel',
    description: 'Complétez 2 tâches personnelles',
    icon: '🧘',
    objectives: [
      { description: 'Compléter 2 tâches personnelles', type: 'complete_category', target: 2, category: 'Personnel' }
    ],
    rewards: { xp: 50, coins: 25 }
  },
  {
    id: 'daily_health',
    type: 'daily',
    title: 'Vie Saine',
    description: 'Complétez 2 tâches santé',
    icon: '❤️',
    objectives: [
      { description: 'Compléter 2 tâches santé', type: 'complete_category', target: 2, category: 'Santé' }
    ],
    rewards: { xp: 50, coins: 25 }
  },
  {
    id: 'daily_variety',
    type: 'daily',
    title: 'Diversité',
    description: 'Complétez des tâches dans 3 catégories différentes',
    icon: '🌈',
    objectives: [
      { description: 'Tâche de travail', type: 'complete_category', target: 1, category: 'Travail' },
      { description: 'Tâche personnelle', type: 'complete_category', target: 1, category: 'Personnel' },
      { description: 'Tâche santé', type: 'complete_category', target: 1, category: 'Santé' }
    ],
    rewards: { xp: 100, coins: 50 }
  },
];

// Quêtes hebdomadaires
export const WEEKLY_QUESTS: QuestTemplate[] = [
  {
    id: 'weekly_complete_20',
    type: 'weekly',
    title: 'Travailleur Acharné',
    description: 'Complétez 20 tâches cette semaine',
    icon: '🏋️',
    objectives: [
      { description: 'Compléter 20 tâches', type: 'complete_tasks', target: 20 }
    ],
    rewards: { xp: 300, coins: 150, gems: 5 }
  },
  {
    id: 'weekly_complete_35',
    type: 'weekly',
    title: 'Machine de Productivité',
    description: 'Complétez 35 tâches cette semaine',
    icon: '🤖',
    objectives: [
      { description: 'Compléter 35 tâches', type: 'complete_tasks', target: 35 }
    ],
    rewards: { xp: 500, coins: 250, gems: 10 }
  },
  {
    id: 'weekly_xp_500',
    type: 'weekly',
    title: 'Accumulateur d\'XP',
    description: 'Gagnez 500 XP cette semaine',
    icon: '💫',
    objectives: [
      { description: 'Gagner 500 XP', type: 'earn_xp', target: 500 }
    ],
    rewards: { xp: 100, coins: 100, gems: 3 }
  },
  {
    id: 'weekly_streak_7',
    type: 'weekly',
    title: 'Constance',
    description: 'Maintenez un streak de 7 jours',
    icon: '🔥',
    objectives: [
      { description: 'Streak de 7 jours', type: 'maintain_streak', target: 7 }
    ],
    rewards: { xp: 250, coins: 125, gems: 5 }
  },
  {
    id: 'weekly_all_categories',
    type: 'weekly',
    title: 'Équilibre de Vie',
    description: 'Complétez des tâches dans toutes les catégories',
    icon: '⚖️',
    objectives: [
      { description: 'Tâche de travail', type: 'complete_category', target: 3, category: 'Travail' },
      { description: 'Tâche personnelle', type: 'complete_category', target: 3, category: 'Personnel' },
      { description: 'Tâche santé', type: 'complete_category', target: 2, category: 'Santé' },
      { description: 'Tâche études', type: 'complete_category', target: 2, category: 'Études' },
      { description: 'Tâche loisirs', type: 'complete_category', target: 2, category: 'Loisirs' }
    ],
    rewards: { xp: 400, coins: 200, gems: 8 }
  },
  {
    id: 'weekly_critical',
    type: 'weekly',
    title: 'Gestion de Crise',
    description: 'Complétez 5 tâches critiques',
    icon: '🚨',
    objectives: [
      { description: 'Compléter 5 tâches critiques', type: 'complete_priority', target: 5, priority: 'critical' }
    ],
    rewards: { xp: 350, coins: 175, gems: 7 }
  },
];

// Quêtes spéciales (événements, saisons, etc.)
export const SPECIAL_QUESTS: QuestTemplate[] = [
  {
    id: 'special_new_year',
    type: 'special',
    title: 'Nouvelles Résolutions',
    description: 'Commencez l\'année du bon pied!',
    icon: '🎆',
    objectives: [
      { description: 'Compléter 10 tâches', type: 'complete_tasks', target: 10 },
      { description: 'Gagner 200 XP', type: 'earn_xp', target: 200 }
    ],
    rewards: { xp: 500, coins: 250, gems: 15 }
  },
  {
    id: 'special_productivity_week',
    type: 'special',
    title: 'Semaine de Productivité',
    description: 'Événement spécial: double XP!',
    icon: '🚀',
    objectives: [
      { description: 'Compléter 50 tâches', type: 'complete_tasks', target: 50 }
    ],
    rewards: { xp: 1000, coins: 500, gems: 25 }
  },
];

// Helper pour sélectionner des quêtes aléatoires
export const selectRandomQuests = (templates: QuestTemplate[], count: number): QuestTemplate[] => {
  const shuffled = [...templates].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Générer les quêtes journalières
export const generateDailyQuests = (): QuestTemplate[] => {
  return selectRandomQuests(DAILY_QUESTS, 3);
};

// Générer les quêtes hebdomadaires
export const generateWeeklyQuests = (): QuestTemplate[] => {
  return selectRandomQuests(WEEKLY_QUESTS, 2);
};

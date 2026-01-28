// Types principaux de l'application Questify

// ============ USER & PROFILE ============
export interface User {
  id: string;
  email: string;
  username: string;
  avatar: AvatarConfig;
  createdAt: Date;
  lastLoginAt: Date;
  settings: UserSettings;
}

export interface AvatarConfig {
  type: 'default' | 'custom' | 'pixel';
  baseColor: string;
  accessory?: string;
  background?: string;
  frame?: string;
  icon: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  notifications: NotificationSettings;
  sound: SoundSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string;
  achievementUnlock: boolean;
  streakWarning: boolean;
  weeklyReport: boolean;
}

export interface SoundSettings {
  enabled: boolean;
  volume: number;
  taskComplete: boolean;
  levelUp: boolean;
  achievementUnlock: boolean;
}

export interface PrivacySettings {
  publicProfile: boolean;
  showStats: boolean;
  showAchievements: boolean;
}

// ============ GAME STATS ============
export interface GameStats {
  userId: string;
  odUserId?: string;
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  
  // Task stats
  tasksCompleted: number;
  tasksCreated: number;
  tasksFailed: number;
  questsCompleted?: number;
  
  // Time stats
  totalFocusTime: number; // en minutes
  averageTaskTime: number;
  
  // Category stats
  categoryStats: Record<string, CategoryStat>;
  
  // Achievement progress
  achievementPoints: number;
  achievementsUnlocked: string[];
  
  // Rewards
  coins: number;
  gems: number;
  
  // Weekly/Daily
  dailyXP: number;
  weeklyXP: number;
  dailyTasksCompleted: number;
  weeklyTasksCompleted: number;
  
  // Timestamps
  lastDailyReset: string;
  lastWeeklyReset: string;
}

export interface CategoryStat {
  tasksCompleted: number;
  totalXP: number;
  averageTime: number;
}

// ============ TASKS ============
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical' | 'none';
export type TaskStatus = 'pending' | 'in_progress' | 'in-progress' | 'completed' | 'failed' | 'archived';
export type TaskDifficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'epic' | 'legendary';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Task {
  id: string;
  userId: string;
  
  // Basic info
  title: string;
  description?: string;
  
  // Categorization
  category?: string;
  categoryId?: string;
  tags: string[];
  
  // Priority & Difficulty
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  
  // Status
  status: TaskStatus;
  progress: number; // 0-100 pour les tâches avec sous-tâches
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  startedAt?: Date;
  
  // Recurrence
  recurrence: RecurrenceType;
  recurrenceConfig?: RecurrenceConfig;
  
  // Subtasks
  subtasks: Subtask[];
  
  // Time tracking
  estimatedTime?: number; // en minutes
  actualTime?: number;
  
  // Rewards
  xpReward: number;
  coinReward: number;
  bonusXP?: number;
  
  // Misc
  notes?: string;
  attachments?: string[];
  reminders?: Reminder[];
  isQuest?: boolean;
  questId?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface RecurrenceConfig {
  interval: number;
  daysOfWeek?: number[]; // 0-6 pour weekly
  dayOfMonth?: number; // pour monthly
  endDate?: Date;
  occurrences?: number;
}

export interface Reminder {
  id: string;
  type: 'notification' | 'email';
  time: Date;
  sent: boolean;
}

// ============ CATEGORIES ============
export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  isDefault: boolean;
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'userId'>[] = [
  { name: 'Travail', color: '#3b82f6', icon: 'briefcase', order: 0, isDefault: true },
  { name: 'Personnel', color: '#22c55e', icon: 'user', order: 1, isDefault: true },
  { name: 'Santé', color: '#ef4444', icon: 'heart', order: 2, isDefault: true },
  { name: 'Études', color: '#8b5cf6', icon: 'book', order: 3, isDefault: true },
  { name: 'Finances', color: '#f59e0b', icon: 'wallet', order: 4, isDefault: true },
  { name: 'Social', color: '#ec4899', icon: 'users', order: 5, isDefault: true },
  { name: 'Loisirs', color: '#06b6d4', icon: 'gamepad-2', order: 6, isDefault: true },
  { name: 'Maison', color: '#84cc16', icon: 'home', order: 7, isDefault: true },
];

// ============ ACHIEVEMENTS ============
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AchievementCategory = 
  | 'tasks' 
  | 'streaks' 
  | 'xp' 
  | 'social' 
  | 'special' 
  | 'collection'
  | 'time'
  | 'categories';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: AchievementCategory;
  xpReward: number;
  coinReward: number;
  requirement: AchievementRequirement;
  secret?: boolean;
  unlockedAt?: Date;
}

export interface AchievementRequirement {
  type: string;
  value: number;
  current?: number;
}

// ============ QUESTS ============
export type QuestType = 'daily' | 'weekly' | 'special' | 'story';

export interface Quest {
  id: string;
  userId: string;
  type: QuestType;
  title: string;
  description: string;
  icon: string;
  objectives: QuestObjective[];
  rewards: QuestRewards;
  startDate: Date;
  endDate: Date;
  completed: boolean;
  completedAt?: Date;
  claimed: boolean;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'complete_tasks' | 'complete_category' | 'earn_xp' | 'maintain_streak' | 'focus_time' | 'custom' | 'complete_priority';
  target: number;
  current: number;
  completed: boolean;
  category?: string; // Pour complete_category
  priority?: string; // Pour complete_priority
}

export interface QuestRewards {
  xp: number;
  coins: number;
  gems?: number;
  items?: string[];
  achievement?: string;
}

// ============ SHOP & ITEMS ============
export type ItemType = 'avatar' | 'frame' | 'theme' | 'badge' | 'powerup' | 'cosmetic';
export type Currency = 'coins' | 'gems';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  icon: string;
  preview?: string;
  price: number;
  currency: Currency;
  rarity: AchievementRarity;
  available: boolean;
  limitedTime?: boolean;
  endDate?: Date;
}

export interface InventoryItem {
  itemId: string;
  purchasedAt: Date;
  equipped: boolean;
}

// ============ LEADERBOARD ============
export interface LeaderboardEntry {
  rank: number;
  odUserId: string;
  username: string;
  avatar: AvatarConfig;
  level: number;
  totalXP: number;
  weeklyXP: number;
  streak: number;
}

// ============ NOTIFICATIONS ============
export type NotificationType = 
  | 'achievement' 
  | 'level_up' 
  | 'quest_complete' 
  | 'streak_warning' 
  | 'daily_reminder'
  | 'reward'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, unknown>;
}

// ============ FILTERS & SORTING ============
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: string[];
  tags?: string[];
  dueDate?: 'today' | 'week' | 'month' | 'overdue' | 'no_date';
  search?: string;
}

export interface TaskFilter {
  status: 'all' | TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
  sortBy: 'dueDate' | 'priority' | 'createdAt';
  sortDirection: 'asc' | 'desc';
}

export type TaskSortBy = 'dueDate' | 'priority' | 'createdAt' | 'xpReward' | 'title' | 'difficulty';
export type SortOrder = 'asc' | 'desc';

export interface TaskSort {
  by: TaskSortBy;
  order: SortOrder;
}

// ============ XP & LEVEL SYSTEM ============
export const XP_PER_LEVEL_BASE = 100;
export const XP_LEVEL_MULTIPLIER = 1.5;

export const DIFFICULTY_XP: Record<TaskDifficulty, number> = {
  trivial: 5,
  easy: 10,
  medium: 25,
  hard: 50,
  epic: 100,
  legendary: 200,
};

export const PRIORITY_XP_BONUS: Record<TaskPriority, number> = {
  none: 0,
  low: 0,
  medium: 5,
  high: 10,
  critical: 20,
};

export const STREAK_BONUSES = [
  { days: 3, bonus: 0.1 },
  { days: 7, bonus: 0.25 },
  { days: 14, bonus: 0.5 },
  { days: 30, bonus: 0.75 },
  { days: 60, bonus: 1.0 },
  { days: 100, bonus: 1.5 },
  { days: 365, bonus: 2.0 },
];

// ============ UTILITY TYPES ============
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: AsyncStatus;
  error: string | null;
}

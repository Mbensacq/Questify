import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  TaskDifficulty,
  Subtask,
  TaskFilters,
  TaskSort,
  TaskFilter,
  DIFFICULTY_XP,
  PRIORITY_XP_BONUS,
  Category,
  DEFAULT_CATEGORIES
} from '../types';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from './authStore';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  filters: TaskFilters;
  sort: TaskSort;
  isLoading: boolean;
  selectedTask: Task | null;
  
  // Task CRUD
  loadTasks: (userId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'xpReward' | 'coinReward'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<{ xpGained: number; coinsGained: number }>;
  failTask: (id: string) => Promise<void>;
  archiveTask: (id: string) => Promise<void>;
  
  // Subtasks
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  removeSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  
  // Categories
  loadCategories: (userId: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Filters & Sort
  setFilters: (filters: TaskFilters) => void;
  clearFilters: () => void;
  setSort: (sort: TaskSort) => void;
  
  // Selection
  selectTask: (task: Task | null) => void;
  
  // Helpers
  getFilteredTasks: () => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByCategory: (category: string) => Task[];
  getTodayTasks: () => Task[];
  getOverdueTasks: () => Task[];
  calculateTaskRewards: (difficulty: TaskDifficulty, priority: TaskPriority) => { xp: number; coins: number };
  
  // Data management
  exportData: () => { tasks: Task[]; categories: Category[]; exportedAt: string; version: string };
  importData: (data: { tasks: Task[]; categories: Category[] }) => void;
  clearAllData: () => void;
  
  // Subtask management
  updateSubTask: (taskId: string, subtaskId: string, updates: { completed?: boolean; title?: string }) => void;
  
  // Filter alias
  filter: TaskFilter;
  setFilter: (filter: Partial<TaskFilter>) => void;
}

const calculateXPReward = (difficulty: TaskDifficulty, priority: TaskPriority): number => {
  return DIFFICULTY_XP[difficulty] + PRIORITY_XP_BONUS[priority];
};

const calculateCoinReward = (difficulty: TaskDifficulty): number => {
  return Math.floor(DIFFICULTY_XP[difficulty] / 2);
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      categories: [],
      filters: {},
      filter: { status: 'all' as const, sortBy: 'dueDate' as const, sortDirection: 'asc' as const },
      sort: { by: 'dueDate', order: 'asc' },
      isLoading: false,
      selectedTask: null,

      setFilter: (newFilter) => {
        set((state) => ({
          filter: { ...state.filter, ...newFilter },
        }));
      },

      updateSubTask: (taskId, subtaskId, updates) => {
        const { tasks } = get();
        const task = tasks.find((t) => t.id === taskId);
        if (!task || !task.subtasks) return;

        const updatedSubtasks = task.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, ...updates } : st
        );

        set({
          tasks: tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t
          ),
        });
      },

      loadTasks: async (userId) => {
        set({ isLoading: true });
        const isDemo = useAuthStore.getState().isDemo;
        
        if (isDemo) {
          // In demo mode, tasks are already in persisted state (localStorage)
          set({ isLoading: false });
          return;
        }
        
        // Firebase = source of truth for multi-device sync
        try {
          const tasksRef = collection(db, 'tasks');
          const q = query(tasksRef, where('userId', '==', userId));
          const snapshot = await getDocs(q);
          
          const tasks = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            dueDate: doc.data().dueDate?.toDate(),
            completedAt: doc.data().completedAt?.toDate(),
            startedAt: doc.data().startedAt?.toDate(),
          })) as Task[];
          
          set({ tasks, isLoading: false });
        } catch (error) {
          console.error('Error loading tasks from Firebase:', error);
          set({ isLoading: false });
          throw new Error('Impossible de charger les tâches. Vérifiez votre connexion.');
        }
      },

      addTask: async (taskData) => {
        const authState = useAuthStore.getState();
        const userId = authState.user?.id;
        const isDemo = authState.isDemo;
        if (!userId) throw new Error('User not authenticated');

        const { xp, coins } = get().calculateTaskRewards(taskData.difficulty, taskData.priority);
        
        const newTask: Omit<Task, 'id'> = {
          ...taskData,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          xpReward: xp,
          coinReward: coins,
          subtasks: taskData.subtasks || [],
          tags: taskData.tags || [],
          progress: 0,
        };

        let task: Task;
        
        if (isDemo) {
          task = { ...newTask, id: uuidv4() } as Task;
        } else {
          // Must save to Firebase for multi-device sync
          const docRef = await addDoc(collection(db, 'tasks'), newTask);
          task = { ...newTask, id: docRef.id } as Task;
        }
        
        set(state => ({ tasks: [...state.tasks, task] }));
        
        // Incrémenter le compteur de tâches créées (ignore errors)
        try {
          await useAuthStore.getState().incrementStat('tasksCreated');
        } catch (e) {
          console.warn('Could not increment stat:', e);
        }
        
        return task;
      },

      updateTask: async (id, updates) => {
        const isDemo = useAuthStore.getState().isDemo;
        const updatedData = { ...updates, updatedAt: new Date() };
        
        if (!isDemo) {
          await updateDoc(doc(db, 'tasks', id), updatedData);
        }
        
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === id ? { ...task, ...updatedData } : task
          )
        }));
      },

      deleteTask: async (id) => {
        const isDemo = useAuthStore.getState().isDemo;
        
        if (!isDemo) {
          try {
            await deleteDoc(doc(db, 'tasks', id));
          } catch (e) {
            console.warn('Firebase delete failed:', e);
          }
        }
        
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id),
          selectedTask: state.selectedTask?.id === id ? null : state.selectedTask
        }));
      },

      completeTask: async (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return { xpGained: 0, coinsGained: 0 };

        const isDemo = useAuthStore.getState().isDemo;
        const completedAt = new Date();
        const updates: Partial<Task> = {
          status: 'completed',
          completedAt,
          progress: 100,
        };

        // Update Firebase if not in demo mode (but don't fail if it errors)
        if (!isDemo) {
          try {
            await updateDoc(doc(db, 'tasks', id), updates);
          } catch (e) {
            console.warn('Firebase update failed, continuing locally:', e);
          }
        }
        
        set(state => ({
          tasks: state.tasks.map(t => 
            t.id === id ? { ...t, ...updates } : t
          )
        }));

        // Ajouter les récompenses (wrap in try-catch to prevent failures)
        try {
          const authStore = useAuthStore.getState();
          const { leveledUp, newLevel } = await authStore.addXP(task.xpReward);
          await authStore.addCoins(task.coinReward);
          await authStore.incrementStat('tasksCompleted');
          await authStore.incrementStat('dailyTasksCompleted');
          await authStore.incrementStat('weeklyTasksCompleted');
          await authStore.updateStreak();

          // Vérifier les achievements liés aux tâches
          const { ACHIEVEMENTS } = await import('../config/achievements');
          const gameStats = useAuthStore.getState().gameStats;
          
          if (gameStats) {
            const tasksCompleted = gameStats.tasksCompleted;
            
            // Vérifier chaque achievement de type tasks_completed
            for (const achievement of ACHIEVEMENTS) {
              if (achievement.requirement.type === 'tasks_completed' &&
                  tasksCompleted >= achievement.requirement.value &&
                  !gameStats.achievementsUnlocked.includes(achievement.id)) {
                await authStore.unlockAchievement(achievement.id);
              }
            }
          }

          // Mettre à jour les quêtes
          const { useQuestStore } = await import('./questStore');
          await useQuestStore.getState().checkAndUpdateQuests('task_completed', {
            category: task.category,
            priority: task.priority,
            difficulty: task.difficulty,
          });

          return { 
            xpGained: task.xpReward, 
            coinsGained: task.coinReward,
            leveledUp,
            newLevel
          };
        } catch (e) {
          console.warn('Error updating stats:', e);
          return { xpGained: task.xpReward, coinsGained: task.coinReward };
        }
      },

      failTask: async (id) => {
        const isDemo = useAuthStore.getState().isDemo;
        const updates: Partial<Task> = {
          status: 'failed',
          updatedAt: new Date(),
        };

        if (!isDemo) {
          try {
            await updateDoc(doc(db, 'tasks', id), updates);
          } catch (e) {
            console.warn('Firebase update failed:', e);
          }
        }
        
        set(state => ({
          tasks: state.tasks.map(t => 
            t.id === id ? { ...t, ...updates } : t
          )
        }));

        try {
          await useAuthStore.getState().incrementStat('tasksFailed');
        } catch (e) {
          console.warn('Could not increment stat:', e);
        }
      },

      archiveTask: async (id) => {
        const isDemo = useAuthStore.getState().isDemo;
        const updates: Partial<Task> = {
          status: 'archived',
          updatedAt: new Date(),
        };

        if (!isDemo) {
          await updateDoc(doc(db, 'tasks', id), updates);
        }
        
        set(state => ({
          tasks: state.tasks.map(t => 
            t.id === id ? { ...t, ...updates } : t
          )
        }));
      },

      addSubtask: async (taskId, title) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;

        const newSubtask: Subtask = {
          id: uuidv4(),
          title,
          completed: false,
        };

        const subtasks = [...task.subtasks, newSubtask];
        await get().updateTask(taskId, { subtasks });
      },

      toggleSubtask: async (taskId, subtaskId) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;

        const subtasks = task.subtasks.map(st => 
          st.id === subtaskId 
            ? { ...st, completed: !st.completed, completedAt: !st.completed ? new Date() : undefined }
            : st
        );

        const completedCount = subtasks.filter(st => st.completed).length;
        const progress = Math.round((completedCount / subtasks.length) * 100);

        await get().updateTask(taskId, { subtasks, progress });
      },

      removeSubtask: async (taskId, subtaskId) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;

        const subtasks = task.subtasks.filter(st => st.id !== subtaskId);
        const completedCount = subtasks.filter(st => st.completed).length;
        const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

        await get().updateTask(taskId, { subtasks, progress });
      },

      loadCategories: async (userId) => {
        const isDemo = useAuthStore.getState().isDemo;
        
        // Check if we already have categories (from persisted state in demo mode)
        const existingCategories = get().categories;
        if (isDemo && existingCategories.length > 0) {
          return;
        }
        
        if (isDemo) {
          // In demo mode, initialize with default categories
          const defaultCats: Category[] = DEFAULT_CATEGORIES.map((cat, index) => ({
            ...cat,
            id: uuidv4(),
            userId,
            order: index,
          }));
          set({ categories: defaultCats });
          return;
        }
        
        try {
          const categoriesRef = collection(db, 'categories');
          const q = query(categoriesRef, where('userId', '==', userId), orderBy('order'));
          const snapshot = await getDocs(q);
          
          if (snapshot.empty) {
            // Créer les catégories par défaut
            const batch = writeBatch(db);
            const defaultCats: Category[] = DEFAULT_CATEGORIES.map((cat, index) => ({
              ...cat,
              id: uuidv4(),
              userId,
              order: index,
            }));

            for (const cat of defaultCats) {
              const docRef = doc(collection(db, 'categories'));
              batch.set(docRef, { ...cat, id: docRef.id });
              cat.id = docRef.id;
            }

            await batch.commit();
            set({ categories: defaultCats });
          } else {
            const categories = snapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id,
            })) as Category[];
            set({ categories });
          }
        } catch (error) {
          console.error('Error loading categories:', error);
        }
      },

      addCategory: async (categoryData) => {
        const isDemo = useAuthStore.getState().isDemo;
        
        if (isDemo) {
          const category = { ...categoryData, id: uuidv4() };
          set(state => ({ categories: [...state.categories, category] }));
          return;
        }
        
        const docRef = await addDoc(collection(db, 'categories'), categoryData);
        const category = { ...categoryData, id: docRef.id };
        set(state => ({ categories: [...state.categories, category] }));
      },

      updateCategory: async (id, updates) => {
        const isDemo = useAuthStore.getState().isDemo;
        
        if (!isDemo) {
          await updateDoc(doc(db, 'categories', id), updates);
        }
        
        set(state => ({
          categories: state.categories.map(cat => 
            cat.id === id ? { ...cat, ...updates } : cat
          )
        }));
      },

      deleteCategory: async (id) => {
        const isDemo = useAuthStore.getState().isDemo;
        
        if (!isDemo) {
          await deleteDoc(doc(db, 'categories', id));
        }
        
        set(state => ({
          categories: state.categories.filter(cat => cat.id !== id)
        }));
      },

      setFilters: (filters) => {
        set({ filters });
      },

      clearFilters: () => {
        set({ filters: {} });
      },

      setSort: (sort) => {
        set({ sort });
      },

      selectTask: (task) => {
        set({ selectedTask: task });
      },

      getFilteredTasks: () => {
        const { tasks, filters, sort } = get();
        let filtered = [...tasks];

        // Appliquer les filtres
        if (filters.status?.length) {
          filtered = filtered.filter(t => filters.status!.includes(t.status));
        }
        if (filters.priority?.length) {
          filtered = filtered.filter(t => filters.priority!.includes(t.priority));
        }
        if (filters.category?.length) {
          filtered = filtered.filter(t => t.category && filters.category!.includes(t.category));
        }
        if (filters.tags?.length) {
          filtered = filtered.filter(t => 
            t.tags.some(tag => filters.tags!.includes(tag))
          );
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(search) ||
            t.description?.toLowerCase().includes(search)
          );
        }
        if (filters.dueDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(today);
          endOfWeek.setDate(endOfWeek.getDate() + 7);
          const endOfMonth = new Date(today);
          endOfMonth.setMonth(endOfMonth.getMonth() + 1);

          switch (filters.dueDate) {
            case 'today':
              filtered = filtered.filter(t => 
                t.dueDate && new Date(t.dueDate).toDateString() === today.toDateString()
              );
              break;
            case 'week':
              filtered = filtered.filter(t => 
                t.dueDate && new Date(t.dueDate) <= endOfWeek
              );
              break;
            case 'month':
              filtered = filtered.filter(t => 
                t.dueDate && new Date(t.dueDate) <= endOfMonth
              );
              break;
            case 'overdue':
              filtered = filtered.filter(t => 
                t.dueDate && new Date(t.dueDate) < today && t.status !== 'completed'
              );
              break;
            case 'no_date':
              filtered = filtered.filter(t => !t.dueDate);
              break;
          }
        }

        // Appliquer le tri
        filtered.sort((a, b) => {
          let comparison = 0;
          
          switch (sort.by) {
            case 'dueDate':
              if (!a.dueDate && !b.dueDate) comparison = 0;
              else if (!a.dueDate) comparison = 1;
              else if (!b.dueDate) comparison = -1;
              else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
              break;
            case 'priority':
              const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
              comparison = (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
              break;
            case 'createdAt':
              comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              break;
            case 'xpReward':
              comparison = a.xpReward - b.xpReward;
              break;
            case 'title':
              comparison = a.title.localeCompare(b.title);
              break;
            case 'difficulty':
              const difficultyOrder = { trivial: 0, easy: 1, medium: 2, hard: 3, epic: 4, legendary: 5 };
              comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
              break;
          }

          return sort.order === 'asc' ? comparison : -comparison;
        });

        return filtered;
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter(t => t.status === status);
      },

      getTasksByCategory: (category) => {
        return get().tasks.filter(t => t.category === category);
      },

      getTodayTasks: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return get().tasks.filter(t => 
          t.dueDate && 
          new Date(t.dueDate) >= today && 
          new Date(t.dueDate) < tomorrow &&
          t.status !== 'completed' &&
          t.status !== 'archived'
        );
      },

      getOverdueTasks: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return get().tasks.filter(t => 
          t.dueDate && 
          new Date(t.dueDate) < today &&
          t.status !== 'completed' &&
          t.status !== 'archived'
        );
      },

      calculateTaskRewards: (difficulty, priority) => ({
        xp: calculateXPReward(difficulty, priority),
        coins: calculateCoinReward(difficulty),
      }),

      // Data management
      exportData: () => {
        const { tasks, categories } = get();
        return {
          tasks,
          categories,
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
        };
      },

      importData: (data: { tasks: Task[]; categories: Category[] }) => {
        if (data.tasks && Array.isArray(data.tasks)) {
          set({ tasks: data.tasks });
        }
        if (data.categories && Array.isArray(data.categories)) {
          set({ categories: data.categories });
        }
      },

      clearAllData: () => {
        set({ 
          tasks: [], 
          categories: DEFAULT_CATEGORIES.map((cat, index) => ({
            ...cat,
            id: `default-${index}`,
            userId: '',
            createdAt: new Date().toISOString(),
          }))
        });
      },
    }),
    {
      name: 'questify-tasks',
      partialize: (state) => ({
        // Always persist filters and sort
        filters: state.filters,
        sort: state.sort,
        // Persist tasks and categories for demo mode
        tasks: state.tasks,
        categories: state.categories,
      }),
    }
  )
);

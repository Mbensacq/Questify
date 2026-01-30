import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  UserSettings, 
  AvatarConfig,
  GameStats,
  XP_PER_LEVEL_BASE,
  XP_LEVEL_MULTIPLIER,
  STREAK_BONUSES
} from '../types';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, githubProvider } from '../config/firebase';

// Store unsubscribe functions for real-time listeners
let userUnsubscribe: (() => void) | null = null;
let statsUnsubscribe: (() => void) | null = null;

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  gameStats: GameStats | null;
  isLoading: boolean;
  isInitialized: boolean;
  isDemo: boolean;
  error: string | null;

  // Auth actions
  initializeAuth: () => Promise<void>;
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  
  // Profile actions
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateAvatar: (avatar: AvatarConfig) => Promise<void>;
  
  // Game stats actions
  addXP: (amount: number) => Promise<{ leveledUp: boolean; newLevel: number }>;
  updateStreak: () => Promise<void>;
  incrementStat: (stat: keyof GameStats, amount?: number) => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  addGems: (amount: number) => Promise<void>;
  spendCoins: (amount: number) => Promise<boolean>;
  spendGems: (amount: number) => Promise<boolean>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  checkAllAchievements: () => Promise<void>;
  checkLoginAchievements: () => Promise<void>;
  
  // Helpers
  calculateXPForLevel: (level: number) => number;
  calculateLevel: (totalXP: number) => { level: number; currentXP: number; xpToNextLevel: number };
  getStreakBonus: () => number;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'fr',
  notifications: {
    enabled: true,
    dailyReminder: true,
    dailyReminderTime: '09:00',
    achievementUnlock: true,
    streakWarning: true,
    weeklyReport: true,
  },
  sound: {
    enabled: true,
    volume: 0.7,
    taskComplete: true,
    levelUp: true,
    achievementUnlock: true,
  },
  privacy: {
    publicProfile: false,
    showStats: true,
    showAchievements: true,
  },
};

const defaultAvatar: AvatarConfig = {
  type: 'default',
  baseColor: '#6366f1',
  icon: '🦸',
};

const createDefaultGameStats = (userId: string): GameStats => ({
  userId: userId,
  level: 1,
  currentXP: 0,
  totalXP: 0,
  xpToNextLevel: XP_PER_LEVEL_BASE,
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: null,
  tasksCompleted: 0,
  tasksCreated: 0,
  tasksFailed: 0,
  totalFocusTime: 0,
  averageTaskTime: 0,
  categoryStats: {},
  achievementPoints: 0,
  achievementsUnlocked: [],
  coins: 100,
  gems: 10,
  dailyXP: 0,
  weeklyXP: 0,
  dailyTasksCompleted: 0,
  weeklyTasksCompleted: 0,
  lastDailyReset: new Date().toISOString(),
  lastWeeklyReset: new Date().toISOString(),
  // New fields for achievements
  epicTasksCompleted: 0,
  legendaryTasksCompleted: 0,
  hardTasksCompleted: 0,
  highPriorityTasksCompleted: 0,
  earlyCompletions: 0,
  lateCompletions: 0,
  perfectDays: 0,
  weekendTasks: 0,
  dailyQuestsCompleted: 0,
  perfectTasksCompleted: 0,
  subtasksCreated: 0,
  streakRecoveries: 0,
  lastLoginDate: new Date().toISOString(),
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      gameStats: null,
      isLoading: true,
      isInitialized: false,
      isDemo: false,
      error: null,

      initializeAuth: async () => {
        return get().initialize();
      },

      initialize: async () => {
        // Check if we have a demo user stored
        const state = get();
        if (state.isDemo && state.user) {
          set({ isLoading: false, isInitialized: true });
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          try {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
              // Clean up previous listeners
              if (userUnsubscribe) {
                userUnsubscribe();
                userUnsubscribe = null;
              }
              if (statsUnsubscribe) {
                statsUnsubscribe();
                statsUnsubscribe = null;
              }

              if (firebaseUser) {
                try {
                  // First, do a one-time fetch to check if user exists
                  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                  const statsDoc = await getDoc(doc(db, 'gameStats', firebaseUser.uid));

                  if (!userDoc.exists()) {
                    // Créer un nouveau profil
                    const newUser: User = {
                      id: firebaseUser.uid,
                      email: firebaseUser.email || '',
                      username: firebaseUser.displayName || `User_${firebaseUser.uid.slice(0, 6)}`,
                      avatar: defaultAvatar,
                      createdAt: new Date(),
                      lastLoginAt: new Date(),
                      settings: defaultSettings,
                    };
                    const newStats = createDefaultGameStats(firebaseUser.uid);
                    
                    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
                    await setDoc(doc(db, 'gameStats', firebaseUser.uid), newStats);
                  }

                  // Set up real-time listeners for user data
                  userUnsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), 
                    (doc) => {
                      if (doc.exists()) {
                        console.log('[Auth] User data updated in real-time');
                        set({ user: doc.data() as User });
                      }
                    },
                    (error) => console.error('[Auth] User listener error:', error)
                  );

                  // Set up real-time listener for game stats
                  statsUnsubscribe = onSnapshot(doc(db, 'gameStats', firebaseUser.uid),
                    (doc) => {
                      if (doc.exists()) {
                        console.log('[Auth] GameStats updated in real-time');
                        set({ gameStats: doc.data() as GameStats });
                      }
                    },
                    (error) => console.error('[Auth] GameStats listener error:', error)
                  );

                  // Initial state
                  set({ 
                    user: userDoc.exists() ? userDoc.data() as User : null,
                    gameStats: statsDoc.exists() ? statsDoc.data() as GameStats : createDefaultGameStats(firebaseUser.uid),
                    firebaseUser,
                    isLoading: false,
                    isInitialized: true,
                  });
                } catch (error) {
                  console.error('Error loading user data:', error);
                  set({ isLoading: false, isInitialized: true, error: 'Failed to load user data' });
                }
              } else {
                set({ 
                  user: null, 
                  gameStats: null,
                  firebaseUser: null,
                  isLoading: false,
                  isInitialized: true,
                });
              }
              resolve();
            });
            // Store unsubscribe if needed
            void unsubscribe;
          } catch (error) {
            // Firebase not configured - allow demo mode
            console.warn('Firebase auth not configured, demo mode available');
            set({ isLoading: false, isInitialized: true });
            resolve();
          }
        });
      },

      signInWithEmail: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      signUpWithEmail: async (email, password, username) => {
        set({ isLoading: true, error: null });
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password);
          
          const newUser: User = {
            id: result.user.uid,
            email,
            username,
            avatar: defaultAvatar,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            settings: defaultSettings,
          };
          const newStats = createDefaultGameStats(result.user.uid);
          
          await setDoc(doc(db, 'users', result.user.uid), newUser);
          await setDoc(doc(db, 'gameStats', result.user.uid), newStats);
          
          set({ user: newUser, gameStats: newStats, firebaseUser: result.user });
          
          // Check for founder achievement
          setTimeout(async () => {
            await get().checkAllAchievements();
          }, 500);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          await signInWithPopup(auth, googleProvider);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Google sign in failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      signInWithGithub: async () => {
        set({ isLoading: true, error: null });
        try {
          await signInWithPopup(auth, githubProvider);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'GitHub sign in failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      signInDemo: async () => {
        set({ isLoading: true, error: null });
        
        const demoUserId = `demo_${uuidv4()}`;
        const demoUser: User = {
          id: demoUserId,
          email: 'demo@questify.app',
          username: 'DemoHero',
          avatar: defaultAvatar,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          settings: defaultSettings,
        };
        const demoStats = createDefaultGameStats(demoUserId);
        // Give demo user some starting resources
        demoStats.coins = 500;
        demoStats.gems = 50;
        
        set({
          user: demoUser,
          gameStats: demoStats,
          firebaseUser: null,
          isLoading: false,
          isInitialized: true,
          isDemo: true,
        });
        
        // Check for founder achievement after demo sign in
        setTimeout(async () => {
          await get().checkAllAchievements();
        }, 500);
      },

      signOut: async () => {
        const { isDemo } = get();
        try {
          // Clean up real-time listeners
          if (userUnsubscribe) {
            userUnsubscribe();
            userUnsubscribe = null;
          }
          if (statsUnsubscribe) {
            statsUnsubscribe();
            statsUnsubscribe = null;
          }
          
          // Also clean up task and quest listeners
          const { useTaskStore } = await import('./taskStore');
          const { useQuestStore } = await import('./questStore');
          useTaskStore.getState().unsubscribeFromTasks();
          useQuestStore.getState().unsubscribeFromQuests();
          
          if (!isDemo) {
            await firebaseSignOut(auth);
          }
          set({ user: null, gameStats: null, firebaseUser: null, isDemo: false });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
          set({ error: errorMessage });
          throw error;
        }
      },

      deleteAccount: async () => {
        const { firebaseUser, user, isDemo } = get();
        if (!user) return;

        if (isDemo) {
          set({ user: null, gameStats: null, firebaseUser: null, isDemo: false });
          return;
        }

        if (!firebaseUser) return;

        try {
          // Delete user data from Firestore
          await Promise.all([
            updateDoc(doc(db, 'users', user.id), { deleted: true }),
            updateDoc(doc(db, 'gameStats', user.id), { deleted: true }),
          ]);
          
          // Delete Firebase auth user
          await firebaseUser.delete();
          set({ user: null, gameStats: null, firebaseUser: null });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Delete account failed';
          set({ error: errorMessage });
          throw error;
        }
      },

      updateProfile: async (updates) => {
        const { user, isDemo } = get();
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        if (!isDemo) {
          await updateDoc(doc(db, 'users', user.id), updates);
        }
        set({ user: updatedUser });
      },

      updateSettings: async (settings) => {
        const { user, isDemo } = get();
        if (!user) return;

        const updatedSettings = { ...user.settings, ...settings };
        if (!isDemo) {
          await updateDoc(doc(db, 'users', user.id), { settings: updatedSettings });
        }
        set({ user: { ...user, settings: updatedSettings } });
      },

      updateAvatar: async (avatar) => {
        const { user, isDemo } = get();
        if (!user) return;

        if (!isDemo) {
          await updateDoc(doc(db, 'users', user.id), { avatar });
        }
        set({ user: { ...user, avatar } });
      },

      calculateXPForLevel: (level) => {
        return Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_LEVEL_MULTIPLIER, level - 1));
      },

      calculateLevel: (totalXP) => {
        let level = 1;
        let xpForCurrentLevel = XP_PER_LEVEL_BASE;
        let xpAccumulated = 0;

        while (xpAccumulated + xpForCurrentLevel <= totalXP) {
          xpAccumulated += xpForCurrentLevel;
          level++;
          xpForCurrentLevel = get().calculateXPForLevel(level);
        }

        return {
          level,
          currentXP: totalXP - xpAccumulated,
          xpToNextLevel: xpForCurrentLevel,
        };
      },

      getStreakBonus: () => {
        const { gameStats } = get();
        if (!gameStats) return 0;

        const streak = gameStats.currentStreak;
        let bonus = 0;
        
        for (const { days, bonus: b } of STREAK_BONUSES) {
          if (streak >= days) {
            bonus = b;
          }
        }
        
        return bonus;
      },

      addXP: async (amount) => {
        const { gameStats, user, isDemo, getStreakBonus, calculateLevel } = get();
        if (!gameStats || !user) return { leveledUp: false, newLevel: 0 };

        const streakBonus = getStreakBonus();
        const bonusXP = Math.floor(amount * streakBonus);
        const totalXPGained = amount + bonusXP;
        
        const newTotalXP = gameStats.totalXP + totalXPGained;
        const { level: newLevel, currentXP, xpToNextLevel } = calculateLevel(newTotalXP);
        const leveledUp = newLevel > gameStats.level;

        const updates: Partial<GameStats> = {
          totalXP: newTotalXP,
          level: newLevel,
          currentXP,
          xpToNextLevel,
          dailyXP: gameStats.dailyXP + totalXPGained,
          weeklyXP: gameStats.weeklyXP + totalXPGained,
        };

        if (!isDemo) {
          await updateDoc(doc(db, 'gameStats', user.id), updates);
        }
        set({ gameStats: { ...gameStats, ...updates } });

        // Vérifier les achievements liés au niveau
        if (leveledUp) {
          const { ACHIEVEMENTS } = await import('../config/achievements');
          const updatedGameStats = get().gameStats;
          
          if (updatedGameStats) {
            for (const achievement of ACHIEVEMENTS) {
              if (achievement.requirement.type === 'level' &&
                  newLevel >= achievement.requirement.value &&
                  !updatedGameStats.achievementsUnlocked.includes(achievement.id)) {
                await get().unlockAchievement(achievement.id);
              }
            }
          }
        }

        // Mettre à jour les quêtes liées à l'XP
        const { useQuestStore } = await import('./questStore');
        await useQuestStore.getState().checkAndUpdateQuests('xp_gained', {
          amount: totalXPGained,
        });

        return { leveledUp, newLevel };
      },

      updateStreak: async () => {
        const { gameStats, user, isDemo } = get();
        if (!gameStats || !user) return;

        const today = new Date().toISOString().split('T')[0];
        const lastCompleted = gameStats.lastCompletedDate;

        let newStreak = gameStats.currentStreak;
        let streakWasLost = false;
        
        if (!lastCompleted) {
          newStreak = 1;
        } else {
          const lastDate = new Date(lastCompleted);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 0) {
            // Même jour, pas de changement
          } else if (diffDays === 1) {
            newStreak += 1;
          } else {
            // Streak cassé - track for recovery achievement
            if (gameStats.currentStreak > 0) {
              streakWasLost = true;
            }
            newStreak = 1;
          }
        }

        const updates: Partial<GameStats> = {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, gameStats.longestStreak),
          lastCompletedDate: today,
        };

        if (!isDemo) {
          await updateDoc(doc(db, 'gameStats', user.id), updates);
        }
        set({ gameStats: { ...gameStats, ...updates } });

        // Vérifier les achievements liés aux streaks
        const { ACHIEVEMENTS } = await import('../config/achievements');
        const updatedGameStats = get().gameStats;
        
        if (updatedGameStats) {
          for (const achievement of ACHIEVEMENTS) {
            if (achievement.requirement.type === 'streak' &&
                newStreak >= achievement.requirement.value &&
                !updatedGameStats.achievementsUnlocked.includes(achievement.id)) {
              await get().unlockAchievement(achievement.id);
            }
          }
        }

        // Track streak recovery if streak was lost and now starting again
        if (streakWasLost) {
          await get().incrementStat('streakRecoveries');
          await get().checkAllAchievements();
        }

        // Mettre à jour les quêtes liées au streak
        const { useQuestStore } = await import('./questStore');
        await useQuestStore.getState().checkAndUpdateQuests('streak_updated', {
          streak: newStreak,
        });
      },

      incrementStat: async (stat, amount = 1) => {
        const { gameStats, user, isDemo } = get();
        if (!gameStats || !user) return;

        const currentValue = gameStats[stat];
        if (typeof currentValue !== 'number') return;

        const updates = { [stat]: currentValue + amount };
        if (!isDemo) {
          await updateDoc(doc(db, 'gameStats', user.id), updates);
        }
        set({ gameStats: { ...gameStats, ...updates } });
      },

      addCoins: async (amount) => {
        const { gameStats, user, isDemo } = get();
        if (!gameStats || !user) return;

        const updates = { coins: gameStats.coins + amount };
        if (!isDemo) {
          await updateDoc(doc(db, 'gameStats', user.id), updates);
        }
        set({ gameStats: { ...gameStats, ...updates } });
      },

      addGems: async (amount) => {
        const { gameStats, user, isDemo } = get();
        if (!gameStats || !user) return;

        const updates = { gems: gameStats.gems + amount };
        if (!isDemo) {
          await updateDoc(doc(db, 'gameStats', user.id), updates);
        }
        set({ gameStats: { ...gameStats, ...updates } });
      },

      spendCoins: async (amount) => {
        const { gameStats, user, isDemo } = get();
        if (!gameStats || !user) return false;
        if (gameStats.coins < amount) return false;

        const updates = { coins: gameStats.coins - amount };
        if (!isDemo) {
          await updateDoc(doc(db, 'gameStats', user.id), updates);
        }
        set({ gameStats: { ...gameStats, ...updates } });
        return true;
      },

      spendGems: async (amount) => {
        const { gameStats, user, isDemo } = get();
        if (!gameStats || !user) return false;
        if (gameStats.gems < amount) return false;

        const updates = { gems: gameStats.gems - amount };
        if (!isDemo) {
          await updateDoc(doc(db, 'gameStats', user.id), updates);
        }
        set({ gameStats: { ...gameStats, ...updates } });
        return true;
      },

      unlockAchievement: async (achievementId) => {
        const { gameStats, user, isDemo } = get();
        if (!gameStats || !user) return;
        if (gameStats.achievementsUnlocked.includes(achievementId)) return;

        // Get achievement rewards
        const { ACHIEVEMENTS } = await import('../config/achievements');
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        
        const updates = {
          achievementsUnlocked: [...gameStats.achievementsUnlocked, achievementId],
          // Add achievement rewards
          ...(achievement ? {
            totalXP: gameStats.totalXP + achievement.xpReward,
            coins: gameStats.coins + achievement.coinReward,
            achievementPoints: gameStats.achievementPoints + achievement.xpReward,
          } : {}),
        };
        
        if (!isDemo) {
          await updateDoc(doc(db, 'gameStats', user.id), updates);
        }
        set({ gameStats: { ...gameStats, ...updates } });
      },

      // Comprehensive achievement checking function
      checkAllAchievements: async () => {
        const { gameStats, user } = get();
        if (!gameStats || !user) return;

        const { ACHIEVEMENTS } = await import('../config/achievements');
        const unlockedIds = gameStats.achievementsUnlocked;

        // Get max category tasks
        const maxCategoryTasks = Object.values(gameStats.categoryStats || {}).reduce(
          (max, cat) => Math.max(max, cat?.tasksCompleted || 0), 0
        );

        // Check if all categories have minimum tasks
        const categories = ['work', 'personal', 'health', 'learning', 'finance', 'social', 'other'];
        const allCategoriesMin = (minValue: number): boolean => {
          return categories.every(cat => {
            const catStats = gameStats.categoryStats?.[cat];
            return (catStats?.tasksCompleted || 0) >= minValue;
          });
        };

        for (const achievement of ACHIEVEMENTS) {
          if (unlockedIds.includes(achievement.id)) continue;

          let shouldUnlock = false;
          const { type, value } = achievement.requirement;

          switch (type) {
            case 'tasks_completed':
              shouldUnlock = gameStats.tasksCompleted >= value;
              break;
            case 'streak':
              shouldUnlock = gameStats.currentStreak >= value;
              break;
            case 'level':
              shouldUnlock = gameStats.level >= value;
              break;
            case 'total_xp':
              shouldUnlock = gameStats.totalXP >= value;
              break;
            case 'daily_xp':
              shouldUnlock = gameStats.dailyXP >= value;
              break;
            case 'daily_tasks':
              shouldUnlock = gameStats.dailyTasksCompleted >= value;
              break;
            case 'achievements':
              shouldUnlock = gameStats.achievementsUnlocked.length >= value;
              break;
            case 'quests_completed':
              shouldUnlock = (gameStats.questsCompleted || 0) >= value;
              break;
            case 'daily_quests':
              shouldUnlock = (gameStats.dailyQuestsCompleted || 0) >= value;
              break;
            case 'epic_tasks':
              shouldUnlock = (gameStats.epicTasksCompleted || 0) >= value;
              break;
            case 'legendary_tasks':
              shouldUnlock = (gameStats.legendaryTasksCompleted || 0) >= value;
              break;
            case 'hard_tasks':
              shouldUnlock = (gameStats.hardTasksCompleted || 0) >= value;
              break;
            case 'high_priority_tasks':
              shouldUnlock = (gameStats.highPriorityTasksCompleted || 0) >= value;
              break;
            case 'early_completion':
              shouldUnlock = (gameStats.earlyCompletions || 0) >= value;
              break;
            case 'late_completion':
              shouldUnlock = (gameStats.lateCompletions || 0) >= value;
              break;
            case 'perfect_day':
              shouldUnlock = (gameStats.perfectDays || 0) >= value;
              break;
            case 'weekend_tasks':
              shouldUnlock = (gameStats.weekendTasks || 0) >= value;
              break;
            case 'category_tasks':
              shouldUnlock = maxCategoryTasks >= value;
              break;
            case 'all_categories':
              shouldUnlock = allCategoriesMin(value);
              break;
            case 'perfect_tasks':
              shouldUnlock = (gameStats.perfectTasksCompleted || 0) >= value;
              break;
            case 'coins':
              shouldUnlock = gameStats.coins >= value;
              break;
            case 'streak_recovered':
              shouldUnlock = (gameStats.streakRecoveries || 0) >= value;
              break;
            case 'subtasks_created':
              shouldUnlock = (gameStats.subtasksCreated || 0) >= value;
              break;
            case 'account_created':
              // This is always true once account exists
              shouldUnlock = true;
              break;
          }

          if (shouldUnlock) {
            await get().unlockAchievement(achievement.id);
          }
        }
      },

      // Check login-specific achievements (comeback)
      checkLoginAchievements: async () => {
        const { gameStats, user, isDemo } = get();
        if (!gameStats || !user) return;

        const today = new Date().toISOString().split('T')[0];
        const lastLogin = gameStats.lastLoginDate;

        if (lastLogin) {
          const lastDate = new Date(lastLogin);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          // Check for comeback achievements
          const { ACHIEVEMENTS } = await import('../config/achievements');
          for (const achievement of ACHIEVEMENTS) {
            if (achievement.requirement.type === 'comeback' &&
                diffDays >= achievement.requirement.value &&
                !gameStats.achievementsUnlocked.includes(achievement.id)) {
              await get().unlockAchievement(achievement.id);
            }
          }
        }

        // Update last login date
        const updates = { lastLoginDate: today };
        if (!isDemo) {
          await updateDoc(doc(db, 'gameStats', user.id), updates);
        }
        set({ gameStats: { ...gameStats, ...updates } });
      },
    }),
    {
      name: 'questify-auth',
      partialize: (state) => ({ 
        // Persist user and game stats for demo mode
        user: state.user,
        gameStats: state.gameStats,
        isDemo: state.isDemo,
      }),
    }
  )
);

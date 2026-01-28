import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Quest, QuestObjective } from '../types';
import { QuestTemplate, generateDailyQuests, generateWeeklyQuests } from '../config/quests';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from './authStore';

interface QuestState {
  quests: Quest[];
  isLoading: boolean;
  
  // Computed properties
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  
  // Quest management
  loadQuests: (userId: string) => Promise<void>;
  generateNewQuests: (userId: string) => Promise<void>;
  updateQuestProgress: (questId: string, objectiveId: string, progress: number) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  claimQuestRewards: (questId: string) => Promise<{ xp: number; coins: number; gems?: number }>;
  claimQuestReward: (questId: string) => Promise<{ xp: number; coins: number; gems?: number }>;
  refreshQuests: () => Promise<void>;
  
  // Helpers
  getDailyQuests: () => Quest[];
  getWeeklyQuests: () => Quest[];
  getActiveQuests: () => Quest[];
  getCompletedQuests: () => Quest[];
  checkAndUpdateQuests: (action: string, data?: Record<string, unknown>) => Promise<void>;
}

const createQuestFromTemplate = (template: QuestTemplate, userId: string): Quest => {
  const now = new Date();
  const endDate = new Date();
  
  if (template.type === 'daily') {
    endDate.setHours(23, 59, 59, 999);
  } else if (template.type === 'weekly') {
    endDate.setDate(endDate.getDate() + (7 - endDate.getDay()));
    endDate.setHours(23, 59, 59, 999);
  } else {
    endDate.setDate(endDate.getDate() + 30);
  }

  return {
    id: uuidv4(),
    userId: userId,
    type: template.type,
    title: template.title,
    description: template.description,
    icon: template.icon,
    objectives: template.objectives.map(obj => ({
      id: uuidv4(),
      description: obj.description,
      type: obj.type,
      target: obj.target,
      current: 0,
      completed: false,
      category: obj.category, // Transférer category si présent
      priority: obj.priority, // Transférer priority si présent
    })),
    rewards: template.rewards,
    startDate: now,
    endDate,
    completed: false,
    claimed: false,
  };
};

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      quests: [],
      isLoading: false,
      
      // Computed - these are dynamically derived from quests
      get dailyQuests() {
        return get().getDailyQuests();
      },
      get weeklyQuests() {
        return get().getWeeklyQuests();
      },

      loadQuests: async (userId) => {
        set({ isLoading: true });
        const isDemo = useAuthStore.getState().isDemo;
        
        if (isDemo) {
          // In demo mode, check if we need to generate quests
          const existingQuests = get().quests;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const hasValidDailyQuests = existingQuests.some(q => 
            q.type === 'daily' && 
            q.userId === userId &&
            new Date(q.startDate).toDateString() === today.toDateString()
          );
          
          const startOfWeek = new Date(today);
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          
          const hasValidWeeklyQuests = existingQuests.some(q => 
            q.type === 'weekly' && 
            q.userId === userId &&
            new Date(q.startDate) >= startOfWeek
          );
          
          set({ isLoading: false });
          
          if (!hasValidDailyQuests || !hasValidWeeklyQuests) {
            await get().generateNewQuests(userId);
          }
          return;
        }
        
        try {
          const questsRef = collection(db, 'quests');
          const q = query(questsRef, where('userId', '==', userId));
          const snapshot = await getDocs(q);
          
          const quests = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            startDate: doc.data().startDate?.toDate() || new Date(),
            endDate: doc.data().endDate?.toDate() || new Date(),
            completedAt: doc.data().completedAt?.toDate(),
          })) as Quest[];
          
          // Vérifier si on doit générer de nouvelles quêtes
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const hasValidDailyQuests = quests.some(q => 
            q.type === 'daily' && 
            new Date(q.startDate).toDateString() === today.toDateString()
          );
          
          const startOfWeek = new Date(today);
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          
          const hasValidWeeklyQuests = quests.some(q => 
            q.type === 'weekly' && 
            new Date(q.startDate) >= startOfWeek
          );
          
          set({ quests, isLoading: false });
          
          // Générer de nouvelles quêtes si nécessaire
          if (!hasValidDailyQuests || !hasValidWeeklyQuests) {
            await get().generateNewQuests(userId);
          }
        } catch (error) {
          console.error('Error loading quests:', error);
          set({ isLoading: false });
        }
      },

      generateNewQuests: async (userId) => {
        const { quests } = get();
        const isDemo = useAuthStore.getState().isDemo;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Supprimer les anciennes quêtes expirées
        const expiredQuests = quests.filter(q => new Date(q.endDate) < today);
        if (!isDemo) {
          for (const quest of expiredQuests) {
            await deleteDoc(doc(db, 'quests', quest.id));
          }
        }
        
        // Garder les quêtes valides
        const validQuests = quests.filter(q => new Date(q.endDate) >= today);
        
        // Générer de nouvelles quêtes journalières
        const hasTodayDailies = validQuests.some(q => 
          q.type === 'daily' && 
          new Date(q.startDate).toDateString() === today.toDateString()
        );
        
        if (!hasTodayDailies) {
          const dailyTemplates = generateDailyQuests();
          for (const template of dailyTemplates) {
            const quest = createQuestFromTemplate(template, userId);
            if (!isDemo) {
              await setDoc(doc(db, 'quests', quest.id), quest);
            }
            validQuests.push(quest);
          }
        }
        
        // Générer de nouvelles quêtes hebdomadaires
        const startOfWeek = new Date(today);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        
        const hasWeeklies = validQuests.some(q => 
          q.type === 'weekly' && 
          new Date(q.startDate) >= startOfWeek
        );
        
        if (!hasWeeklies) {
          const weeklyTemplates = generateWeeklyQuests();
          for (const template of weeklyTemplates) {
            const quest = createQuestFromTemplate(template, userId);
            if (!isDemo) {
              await setDoc(doc(db, 'quests', quest.id), quest);
            }
            validQuests.push(quest);
          }
        }
        
        set({ quests: validQuests });
      },

      updateQuestProgress: async (questId, objectiveId, progress) => {
        const quest = get().quests.find(q => q.id === questId);
        if (!quest) return;

        const isDemo = useAuthStore.getState().isDemo;
        const objectives = quest.objectives.map(obj => {
          if (obj.id === objectiveId) {
            const newCurrent = Math.min(obj.current + progress, obj.target);
            return {
              ...obj,
              current: newCurrent,
              completed: newCurrent >= obj.target,
            };
          }
          return obj;
        });

        const allCompleted = objectives.every(obj => obj.completed);
        
        const updates: Partial<Quest> = {
          objectives,
          completed: allCompleted,
          completedAt: allCompleted ? new Date() : undefined,
        };

        if (!isDemo) {
          await updateDoc(doc(db, 'quests', questId), updates);
        }
        
        set(state => ({
          quests: state.quests.map(q => 
            q.id === questId ? { ...q, ...updates } : q
          )
        }));
      },

      completeQuest: async (questId) => {
        const isDemo = useAuthStore.getState().isDemo;
        const updates: Partial<Quest> = {
          completed: true,
          completedAt: new Date(),
        };

        if (!isDemo) {
          await updateDoc(doc(db, 'quests', questId), updates);
        }
        
        set(state => ({
          quests: state.quests.map(q => 
            q.id === questId ? { ...q, ...updates } : q
          )
        }));
      },

      claimQuestRewards: async (questId) => {
        const quest = get().quests.find(q => q.id === questId);
        if (!quest || !quest.completed || quest.claimed) {
          return { xp: 0, coins: 0 };
        }

        const isDemo = useAuthStore.getState().isDemo;
        const { rewards } = quest;
        const authStore = useAuthStore.getState();
        
        await authStore.addXP(rewards.xp);
        await authStore.addCoins(rewards.coins);
        if (rewards.gems) {
          await authStore.addGems(rewards.gems);
        }
        
        if (!isDemo) {
          await updateDoc(doc(db, 'quests', questId), { claimed: true });
        }
        
        set(state => ({
          quests: state.quests.map(q => 
            q.id === questId ? { ...q, claimed: true } : q
          )
        }));

        return rewards;
      },

      getDailyQuests: () => {
        return get().quests.filter(q => q.type === 'daily');
      },

      getWeeklyQuests: () => {
        return get().quests.filter(q => q.type === 'weekly');
      },
      
      // Alias for claimQuestRewards
      claimQuestReward: async (questId) => {
        return get().claimQuestRewards(questId);
      },
      
      refreshQuests: async () => {
        const user = useAuthStore.getState().user;
        if (user) {
          await get().loadQuests(user.id);
        }
      },

      getActiveQuests: () => {
        const now = new Date();
        return get().quests.filter(q => 
          !q.completed && new Date(q.endDate) >= now
        );
      },

      getCompletedQuests: () => {
        return get().quests.filter(q => q.completed);
      },

      checkAndUpdateQuests: async (action, data) => {
        const { quests } = get();
        const activeQuests = quests.filter(q => !q.completed);

        console.log('[Quest Update] Action:', action, 'Data:', data);
        console.log('[Quest Update] Active quests:', activeQuests.length);

        for (const quest of activeQuests) {
          for (const objective of quest.objectives) {
            if (objective.completed) continue;

            let progress = 0;

            switch (objective.type) {
              case 'complete_tasks':
                if (action === 'task_completed') {
                  progress = 1;
                  console.log('[Quest Update] Task completed, progress +1 for quest:', quest.title);
                }
                break;
              case 'complete_category':
                if (action === 'task_completed' && data?.category === objective.category) {
                  progress = 1;
                  console.log('[Quest Update] Category task completed:', data?.category, '(expected:', objective.category, ')');
                }
                break;
              case 'earn_xp':
                if (action === 'xp_gained' && typeof data?.amount === 'number') {
                  progress = data.amount;
                  console.log('[Quest Update] XP gained:', data.amount);
                }
                break;
              case 'complete_priority':
                if (action === 'task_completed' && data?.priority === objective.priority) {
                  progress = 1;
                  console.log('[Quest Update] Priority task completed:', data?.priority, '(expected:', objective.priority, ')');
                }
                break;
              case 'maintain_streak':
                if (action === 'streak_updated' && typeof data?.streak === 'number') {
                  // La progression du streak est mise à jour automatiquement
                  const newCurrent = Math.min(data.streak, objective.target);
                  if (newCurrent > objective.current) {
                    progress = newCurrent - objective.current;
                    console.log('[Quest Update] Streak updated:', data.streak);
                  }
                }
                break;
            }

            if (progress > 0) {
              console.log('[Quest Update] Updating objective progress:', objective.description, '+', progress);
              await get().updateQuestProgress(quest.id, objective.id, progress);
            }
          }
        }
      },
    }),
    {
      name: 'questify-quests',
    }
  )
);

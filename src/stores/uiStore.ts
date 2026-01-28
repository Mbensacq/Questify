import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task } from '../types';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Modals
  isTaskModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isProfileModalOpen: boolean;
  isAchievementModalOpen: boolean;
  isLevelUpModalOpen: boolean;
  newLevel: number;
  
  openTaskModal: () => void;
  closeTaskModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  openAchievementModal: () => void;
  closeAchievementModal: () => void;
  showLevelUp: (level: number) => void;
  hideLevelUp: () => void;
  
  // Editing task
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  
  // Toast/Notifications
  xpGained: number | null;
  coinsGained: number | null;
  showXPGain: (amount: number) => void;
  showCoinsGain: (amount: number) => void;
  hideGains: () => void;
  
  // Achievement unlock
  unlockedAchievement: string | null;
  showAchievementUnlock: (achievementId: string) => void;
  hideAchievementUnlock: () => void;
  
  // View mode
  viewMode: 'list' | 'board' | 'calendar';
  setViewMode: (mode: 'list' | 'board' | 'calendar') => void;
  
  // Mobile
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Accent Color
  accentColor: 'teal' | 'blue' | 'purple' | 'green' | 'orange';
  setAccentColor: (color: 'teal' | 'blue' | 'purple' | 'green' | 'orange') => void;
  
  // Sound
  soundEnabled: boolean;
  toggleSound: () => void;
  
  // Notifications
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Modals
      isTaskModalOpen: false,
      isSettingsModalOpen: false,
      isProfileModalOpen: false,
      isAchievementModalOpen: false,
      isLevelUpModalOpen: false,
      newLevel: 0,
      
      openTaskModal: () => set({ isTaskModalOpen: true }),
      closeTaskModal: () => set({ isTaskModalOpen: false, editingTask: null }),
      openSettingsModal: () => set({ isSettingsModalOpen: true }),
      closeSettingsModal: () => set({ isSettingsModalOpen: false }),
      openProfileModal: () => set({ isProfileModalOpen: true }),
      closeProfileModal: () => set({ isProfileModalOpen: false }),
      openAchievementModal: () => set({ isAchievementModalOpen: true }),
      closeAchievementModal: () => set({ isAchievementModalOpen: false }),
      showLevelUp: (level) => set({ isLevelUpModalOpen: true, newLevel: level }),
      hideLevelUp: () => set({ isLevelUpModalOpen: false }),
      
      // Editing task
      editingTask: null,
      setEditingTask: (task) => set({ editingTask: task }),
      
      // XP/Coins gain
      xpGained: null,
      coinsGained: null,
      showXPGain: (amount) => set({ xpGained: amount }),
      showCoinsGain: (amount) => set({ coinsGained: amount }),
      hideGains: () => set({ xpGained: null, coinsGained: null }),
      
      // Achievement unlock
      unlockedAchievement: null,
      showAchievementUnlock: (achievementId) => set({ unlockedAchievement: achievementId }),
      hideAchievementUnlock: () => set({ unlockedAchievement: null }),
      
      // View mode
      viewMode: 'list',
      setViewMode: (mode) => set({ viewMode: mode }),
      
      // Mobile
      isMobile: false,
      setIsMobile: (isMobile) => set({ isMobile }),
      
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      
      // Accent Color
      accentColor: 'teal',
      setAccentColor: (color) => set({ accentColor: color }),
      
      // Sound
      soundEnabled: true,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      
      // Notifications
      notificationsEnabled: true,
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
    }),
    {
      name: 'questify-ui',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        viewMode: state.viewMode,
        theme: state.theme,
        accentColor: state.accentColor,
        soundEnabled: state.soundEnabled,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);

import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { useTaskStore } from './stores/taskStore';
import { useUIStore } from './stores/uiStore';
import { useQuestStore } from './stores/questStore';
import { AuthForm } from './components/auth/AuthForm';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { QuestsPage } from './pages/QuestsPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { StatsPage } from './pages/StatsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { Sparkles } from 'lucide-react';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Loading Screen
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div className="text-center">
      <div className="w-20 h-20 rounded-2xl bg-accent-gradient-br flex items-center justify-center mx-auto mb-4 animate-pulse">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-white">Questify</h1>
      <p className="text-gray-400 mt-2">Chargement...</p>
    </div>
  </div>
);

function App() {
  const { initializeAuth, user } = useAuthStore();
  const { theme, accentColor, setIsMobile } = useUIStore();
  const { loadQuests } = useQuestStore();
  const { loadTasks, loadCategories } = useTaskStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth on mount
  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      setIsInitialized(true);
    };
    init();
  }, [initializeAuth]);

  // Load user data when user is available
  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        await loadCategories(user.id);
        await loadTasks(user.id);
        await loadQuests(user.id);
      };
      loadUserData();
    }
  }, [user, loadCategories, loadTasks, loadQuests]);

  // Auto-refresh quests on focus and at midnight
  useEffect(() => {
    if (!user) return;

    // Refresh quests when window regains focus
    const handleFocus = () => {
      loadQuests(user.id);
    };

    // Calculate time until midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    // Set timeout for midnight refresh
    const midnightTimeout = setTimeout(() => {
      loadQuests(user.id);
      // Then set interval for subsequent days
      const dailyInterval = setInterval(() => {
        loadQuests(user.id);
      }, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearTimeout(midnightTimeout);
    };
  }, [user, loadQuests]);

  // Handle theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  // Handle accent color changes
  useEffect(() => {
    const root = document.documentElement;
    // Remove all accent classes
    root.classList.remove('accent-teal', 'accent-blue', 'accent-purple', 'accent-green', 'accent-orange');
    // Add new accent class
    root.classList.add(`accent-${accentColor}`);
  }, [accentColor]);

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          console.log('SW registration failed');
        });
      });
    }
  }, []);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <HashRouter>
      <Routes>
        {/* Auth Route */}
        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : <AuthForm />}
        />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/quests" element={<QuestsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </HashRouter>
  );
}

export default App;

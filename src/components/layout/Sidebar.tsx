import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ListTodo,
  Trophy,
  Scroll,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  User,
  ChevronLeft
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Avatar } from '../ui/Avatar';
import { XPBar } from '../ui/ProgressBar';
import { StreakBadge } from '../ui/Badge';
import { cn } from '../../utils/helpers';

const navItems = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/tasks', icon: ListTodo, label: 'Tâches' },
  { path: '/quests', icon: Scroll, label: 'Quêtes' },
  { path: '/achievements', icon: Trophy, label: 'Achievements' },
  { path: '/stats', icon: BarChart3, label: 'Statistiques' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, gameStats, signOut } = useAuthStore();
  const { sidebarOpen, toggleSidebar, isMobile } = useUIStore();

  if (!user || !gameStats) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80,
          x: isMobile && !sidebarOpen ? -280 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
        style={{ width: sidebarOpen ? '280px' : '80px' }}
        className={cn(
          'fixed left-0 top-0 h-screen z-50',
          'bg-gradient-to-b from-white via-teal-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-teal-900/10 dark:to-cyan-900/10',
          'border-r-2 border-teal-100 dark:border-teal-900/30',
          'overflow-hidden backdrop-blur-sm',
          // On mobile: show only when open
          // On desktop: always show
          isMobile && !sidebarOpen ? 'hidden' : 'flex flex-col',
          isMobile && sidebarOpen && 'shadow-soft-lg'
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b-2 border-teal-100 dark:border-teal-900/30 flex-shrink-0">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-400 flex items-center justify-center shadow-soft">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl gradient-text">Questify ✨</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-2xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20 transition-all duration-200"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* User Section */}
        <div className={cn(
          'p-4 border-b-2 border-teal-100 dark:border-teal-900/30 flex-shrink-0',
          !sidebarOpen && 'flex justify-center'
        )}>
          <div className={cn(
            'flex items-center gap-3',
            !sidebarOpen && 'flex-col'
          )}>
            <Avatar
              config={user.avatar}
              size={sidebarOpen ? 'md' : 'sm'}
              showLevel
              level={gameStats.level}
            />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StreakBadge streak={gameStats.currentStreak} />
                </div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <div className="mt-3">
              <XPBar
                currentXP={gameStats.currentXP}
                xpToNextLevel={gameStats.xpToNextLevel}
                level={gameStats.level}
                showLevel={false}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200',
                  'hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20',
                  isActive && 'bg-gradient-to-r from-primary-100 to-cyan-100 dark:from-primary-900/30 dark:to-cyan-900/30 text-primary-600 dark:text-primary-400 shadow-sm',
                  !sidebarOpen && 'justify-center'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1 flex-shrink-0">
          <NavLink
            to="/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              !sidebarOpen && 'justify-center'
            )}
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span>Paramètres</span>}
          </NavLink>
          <button
            onClick={handleSignOut}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
              'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400',
              !sidebarOpen && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

// Mobile Bottom Navigation
export const BottomNav: React.FC = () => {
  const { isMobile } = useUIStore();

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-800 backdrop-blur-lg safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2 pb-safe">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 h-full py-2 rounded-xl mx-0.5 transition-all duration-200 touch-manipulation',
                'text-gray-500 dark:text-gray-400',
                isActive && 'text-primary-500 bg-primary-50 dark:bg-primary-900/20'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Sidebar, BottomNav } from './Sidebar';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { GameAnimations } from '../game/GameAnimations';
import { TaskModal } from '../tasks/TaskModal';
import { cn } from '../../utils/helpers';

export const Layout: React.FC = () => {
  const { sidebarOpen, isMobile, isTaskModalOpen, editingTask, openTaskModal, closeTaskModal } = useUIStore();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300 overflow-x-hidden',
          !isMobile && sidebarOpen ? 'ml-[280px]' : '',
          !isMobile && !sidebarOpen ? 'ml-20' : '',
          isMobile ? 'ml-0 pb-24' : ''
        )}
      >
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'fixed z-40',
          isMobile ? 'bottom-[88px] right-4' : 'bottom-8 right-8'
        )}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openTaskModal}
          className="relative w-14 h-14 rounded-2xl bg-accent-gradient-br text-white shadow-lg shadow-accent flex items-center justify-center group"
        >
          {/* Pulse effect */}
          <span className="absolute inset-0 rounded-2xl bg-accent-gradient-br animate-ping opacity-20" />
          <Plus className="w-6 h-6 relative z-10 transition-transform group-hover:rotate-90" />
        </motion.button>
      </motion.div>

      {/* Task Modal */}
      <TaskModal isOpen={isTaskModalOpen} onClose={closeTaskModal} editTask={editingTask} />

      {/* Game Animations */}
      <GameAnimations />
    </div>
  );
};

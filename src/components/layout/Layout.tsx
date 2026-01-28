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
  const { sidebarOpen, isMobile, isTaskModalOpen, openTaskModal, closeTaskModal } = useUIStore();
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
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          'fixed z-40',
          isMobile ? 'bottom-24 right-4' : 'bottom-8 right-8'
        )}
      >
        <Button
          variant="game"
          className="w-14 h-14 rounded-full shadow-xl"
          onClick={openTaskModal}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Task Modal */}
      <TaskModal isOpen={isTaskModalOpen} onClose={closeTaskModal} />

      {/* Game Animations */}
      <GameAnimations />
    </div>
  );
};

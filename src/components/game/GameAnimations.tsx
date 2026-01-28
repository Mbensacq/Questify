import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { Trophy, Star, Zap, ArrowUp } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { getAchievementById, RARITY_COLORS } from '../../config/achievements';
import { getLevelTitle } from '../../utils/helpers';

// Composant pour afficher le gain d'XP flottant
export const XPGainPopup: React.FC = () => {
  const { xpGained, hideGains } = useUIStore();

  React.useEffect(() => {
    if (xpGained) {
      const timer = setTimeout(hideGains, 2000);
      return () => clearTimeout(timer);
    }
  }, [xpGained, hideGains]);

  return (
    <AnimatePresence>
      {xpGained && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed bottom-20 right-4 z-50 pointer-events-none"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full shadow-lg">
            <Zap className="w-5 h-5" />
            <span className="font-bold text-lg">+{xpGained} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Composant pour l'animation de level up
export const LevelUpAnimation: React.FC = () => {
  const { isLevelUpModalOpen, newLevel, hideLevelUp } = useUIStore();
  const { gameStats } = useAuthStore();
  const [showConfetti, setShowConfetti] = React.useState(false);

  React.useEffect(() => {
    if (isLevelUpModalOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        hideLevelUp();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isLevelUpModalOpen, hideLevelUp]);

  return (
    <AnimatePresence>
      {isLevelUpModalOpen && (
        <>
          {showConfetti && (
            <ReactConfetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={200}
              gravity={0.3}
            />
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={hideLevelUp}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(251, 191, 36, 0.5)',
                    '0 0 60px rgba(251, 191, 36, 0.8)',
                    '0 0 20px rgba(251, 191, 36, 0.5)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center"
              >
                <ArrowUp className="w-16 h-16 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-white mb-2"
              >
                LEVEL UP!
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-6xl font-black gradient-text mb-4"
              >
                {newLevel}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xl text-gray-300"
              >
                {getLevelTitle(newLevel)}
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-full"
                onClick={hideLevelUp}
              >
                Continuer l'aventure !
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Composant pour l'animation de déblocage d'achievement
export const AchievementUnlockAnimation: React.FC = () => {
  const { unlockedAchievement, hideAchievementUnlock } = useUIStore();
  const achievement = unlockedAchievement ? getAchievementById(unlockedAchievement) : null;

  React.useEffect(() => {
    if (unlockedAchievement) {
      const timer = setTimeout(hideAchievementUnlock, 4000);
      return () => clearTimeout(timer);
    }
  }, [unlockedAchievement, hideAchievementUnlock]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="fixed top-4 right-4 z-50"
        >
          <div
            className="p-4 rounded-xl shadow-2xl bg-white dark:bg-gray-800 border-2"
            style={{ borderColor: RARITY_COLORS[achievement.rarity] }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: RARITY_COLORS[achievement.rarity] + '20' }}
              >
                {achievement.icon}
              </motion.div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    Achievement Débloqué !
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {achievement.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {achievement.description}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Star className="w-3 h-3" />
                    +{achievement.xpReward} XP
                  </span>
                  <span className="text-xs text-yellow-600">
                    +{achievement.coinReward} 🪙
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Composant wrapper pour toutes les animations de jeu
export const GameAnimations: React.FC = () => {
  return (
    <>
      <XPGainPopup />
      <LevelUpAnimation />
      <AchievementUnlockAnimation />
    </>
  );
};

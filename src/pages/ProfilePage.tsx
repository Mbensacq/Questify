import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Flame,
  Zap,
  Star,
  Edit3,
  Camera,
  Save,
  Crown,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useTaskStore } from '../stores/taskStore';
import { Card, StatCard } from '../components/ui/Card';
import { Avatar, AvatarSelector } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { XPBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { ACHIEVEMENTS } from '../config/achievements';
import { formatNumber, getLevelTitle } from '../utils/helpers';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AvatarConfig } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, gameStats, updateProfile, updateAvatar } = useAuthStore();
  const { tasks } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
  });

  if (!user || !gameStats) return null;

  // Calculate stats
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const unlockedAchievements = ACHIEVEMENTS.filter((a) =>
    gameStats.achievementsUnlocked.includes(a.id)
  );

  const handleSaveProfile = async () => {
    await updateProfile(editForm);
    setIsEditing(false);
  };

  const handleAvatarSelect = async (icon: string) => {
    await updateAvatar({ 
      icon, 
      type: 'default',
      baseColor: user.avatar?.baseColor || '#6366f1' 
    });
    setShowAvatarModal(false);
  };

  // Recent achievements
  const recentAchievements = unlockedAchievements.slice(-4).reverse();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 p-6 text-white"
      >
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <Avatar config={user.avatar} size="xl" showLevel level={gameStats.level} />
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-8 h-8" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder-white/50"
                    placeholder="Nom d'utilisateur"
                  />
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
                      Annuler
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSaveProfile}>
                      <Save className="w-4 h-4 mr-1" />
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl font-bold">{user.username}</h1>
                    {gameStats.level >= 50 && <Crown className="w-6 h-6 text-yellow-400" />}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white/80 mt-1">{getLevelTitle(gameStats.level)}</p>
                  <p className="text-white/60 text-sm mt-2 flex items-center justify-center sm:justify-start gap-1">
                    <Calendar className="w-4 h-4" />
                    Membre depuis {format(new Date(user.createdAt), 'MMMM yyyy', { locale: fr })}
                  </p>
                </>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{gameStats.level}</div>
                <p className="text-sm text-white/70">Niveau</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 text-orange-300" />
                  {gameStats.currentStreak}
                </div>
                <p className="text-sm text-white/70">Streak</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
                <p className="text-sm text-white/70">Trophées</p>
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Niveau {gameStats.level}</span>
              <span>
                {formatNumber(gameStats.currentXP)} / {formatNumber(gameStats.xpToNextLevel)} XP
              </span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(gameStats.currentXP / gameStats.xpToNextLevel) * 100}%`,
                }}
                className="h-full bg-white rounded-full"
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap className="w-6 h-6" />}
          label="XP Total"
          value={formatNumber(gameStats.totalXP)}
          color="primary"
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6" />}
          label="Tâches complétées"
          value={completedTasks}
          color="green"
        />
        <StatCard
          icon={<Flame className="w-6 h-6" />}
          label="Plus long streak"
          value={`${gameStats.longestStreak} jours`}
          color="orange"
        />
        <StatCard
          icon={<Trophy className="w-6 h-6" />}
          label="Achievements"
          value={`${unlockedAchievements.length}/${ACHIEVEMENTS.length}`}
          color="yellow"
        />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements récents
          </h3>
          {recentAchievements.length > 0 ? (
            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{achievement.name}</p>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                  </div>
                  <span className="text-sm text-primary-500">+{achievement.xpReward} XP</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucun achievement débloqué</p>
            </div>
          )}
        </Card>

        {/* Game Stats */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary-500" />
            Statistiques de jeu
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Pièces</span>
              <span className="font-medium flex items-center gap-1">
                🪙 {formatNumber(gameStats.coins)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Gemmes</span>
              <span className="font-medium flex items-center gap-1">
                💎 {formatNumber(gameStats.gems)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Quêtes complétées</span>
              <span className="font-medium">{gameStats.questsCompleted || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Streak actuel</span>
              <span className="font-medium flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                {gameStats.currentStreak} jours
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Meilleur streak</span>
              <span className="font-medium">{gameStats.longestStreak} jours</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Avatar Selector Modal */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Personnaliser l'avatar"
        size="lg"
      >
        <AvatarSelector
          selected={user.avatar?.icon || '🦸'}
          onSelect={handleAvatarSelect}
        />
      </Modal>
    </div>
  );
};

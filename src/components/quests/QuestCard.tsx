import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, Gift, ChevronRight, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge, XPBadge, CoinBadge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { Quest, QuestObjective } from '../../types';
import { useQuestStore } from '../../stores/questStore';
import { cn, getTimeRemaining } from '../../utils/helpers';
import { playSoundIfEnabled } from '../../utils/sounds';

interface QuestCardProps {
  quest: Quest;
  compact?: boolean;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, compact = false }) => {
  const { claimQuestRewards } = useQuestStore();
  const [isClaiming, setIsClaiming] = React.useState(false);

  const completedObjectives = quest.objectives.filter(o => o.completed).length;
  const totalObjectives = quest.objectives.length;
  
  // Calculer la progression totale basée sur les valeurs current/target de chaque objectif
  const totalProgress = quest.objectives.reduce((sum, obj) => sum + obj.current, 0);
  const totalTarget = quest.objectives.reduce((sum, obj) => sum + obj.target, 0);
  const progressPercent = totalTarget > 0 ? Math.min((totalProgress / totalTarget) * 100, 100) : 0;
  
  const timeRemaining = getTimeRemaining(quest.endDate);
  
  // Formater l'affichage de la progression
  const getProgressDisplay = () => {
    if (quest.completed) {
      return 'Terminé ✓';
    }
    // Si un seul objectif, montrer current/target
    if (totalObjectives === 1) {
      const obj = quest.objectives[0];
      return `${obj.current}/${obj.target}`;
    }
    // Si plusieurs objectifs avec targets variés, montrer la progression globale
    if (totalTarget > totalObjectives) {
      return `${totalProgress}/${totalTarget}`;
    }
    // Sinon montrer objectifs complétés sur total
    return `${completedObjectives}/${totalObjectives}`;
  };

  const handleClaimRewards = async () => {
    setIsClaiming(true);
    try {
      await claimQuestRewards(quest.id);
      playSoundIfEnabled('questComplete');
    } finally {
      setIsClaiming(false);
    }
  };

  const questTypeColors = {
    daily: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10',
    weekly: 'border-l-cyan-500 bg-cyan-50 dark:bg-cyan-900/10',
    special: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
    story: 'border-l-green-500 bg-green-50 dark:bg-green-900/10',
  };

  const questTypeLabels = {
    daily: 'Quotidienne',
    weekly: 'Hebdomadaire',
    special: 'Spéciale',
    story: 'Histoire',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        className={cn(
          'p-4 border-l-4 transition-shadow duration-200 hover:shadow-soft-lg',
          questTypeColors[quest.type],
          quest.completed && !quest.claimed && 'ring-2 ring-yellow-400 ring-opacity-50'
        )}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl',
            'bg-gradient-to-br from-white to-teal-50 dark:from-gray-800 dark:to-teal-900/20 shadow-soft border-2 border-teal-100 dark:border-teal-900/30'
          )}>
            {quest.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {quest.title}
                  </h3>
                  <Badge
                    variant={quest.type === 'daily' ? 'info' : quest.type === 'weekly' ? 'primary' : 'warning'}
                    size="sm"
                  >
                    {questTypeLabels[quest.type]}
                  </Badge>
                  {/* Time remaining - moved next to badge */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeRemaining}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {quest.description}
                </p>
                
                {/* Compact mode - show inline progress */}
                {compact && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1">
                      <ProgressBar
                        value={quest.completed ? 100 : totalProgress}
                        max={quest.completed ? 100 : totalTarget}
                        color={quest.completed ? 'gold' : 'primary'}
                        size="sm"
                      />
                    </div>
                    <span className={cn(
                      'text-xs font-medium whitespace-nowrap',
                      quest.completed 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    )}>
                      {getProgressDisplay()}
                    </span>
                    {quest.completed && !quest.claimed && (
                      <Button
                        variant="game"
                        size="sm"
                        onClick={handleClaimRewards}
                        isLoading={isClaiming}
                        className="ml-1 text-xs py-1 px-2"
                      >
                        <Gift className="w-3 h-3 mr-1" />
                        Réclamer
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Objectives - Non compact mode only */}
            {!compact && (
              <div className="mt-3 space-y-2">
                {quest.objectives.map((objective) => (
                  <QuestObjectiveItem key={objective.id} objective={objective} />
                ))}
              </div>
            )}

            {/* Progress bar - Non compact mode only */}
            {!compact && (
            <div className="mt-3">
              <div className="flex justify-between text-xs font-medium mb-2">
                <span className="text-gray-600 dark:text-gray-300">
                  {quest.completed ? '🎉 Quête terminée !' : 'Progression'}
                </span>
                <span className={cn(
                  'font-semibold',
                  quest.completed 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-900 dark:text-white'
                )}>
                  {getProgressDisplay()}
                </span>
              </div>
              <ProgressBar
                value={quest.completed ? 100 : totalProgress}
                max={quest.completed ? 100 : totalTarget}
                color={quest.completed ? 'gold' : 'primary'}
                size="md"
              />
            </div>
            )}

            {/* Rewards & Claim - Non compact mode only */}
            {!compact && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Récompenses:</span>
                <XPBadge amount={quest.rewards.xp} />
                <CoinBadge amount={quest.rewards.coins} />
                {quest.rewards.gems && (
                  <Badge variant="primary" size="sm">
                    💎 {quest.rewards.gems}
                  </Badge>
                )}
              </div>

              {quest.completed && !quest.claimed && (
                <Button
                  variant="game"
                  size="sm"
                  onClick={handleClaimRewards}
                  isLoading={isClaiming}
                  leftIcon={<Gift className="w-4 h-4" />}
                >
                  Récupérer
                </Button>
              )}

              {quest.claimed && (
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Récupéré
                </Badge>
              )}
            </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

interface QuestObjectiveItemProps {
  objective: QuestObjective;
}

const QuestObjectiveItem: React.FC<QuestObjectiveItemProps> = ({ objective }) => {
  const progress = Math.min((objective.current / objective.target) * 100, 100);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn(
        'w-5 h-5 rounded-full flex items-center justify-center',
        objective.completed
          ? 'bg-green-500 text-white'
          : 'bg-gray-200 dark:bg-gray-700'
      )}>
        {objective.completed ? (
          <CheckCircle2 className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3 text-gray-400" />
        )}
      </div>
      <span className={cn(
        'flex-1',
        objective.completed && 'line-through text-gray-400'
      )}>
        {objective.description}
      </span>
      <span className="text-xs text-gray-500">
        {objective.current}/{objective.target}
      </span>
    </div>
  );
};

interface QuestListProps {
  type?: 'daily' | 'weekly' | 'all';
}

export const QuestList: React.FC<QuestListProps> = ({ type = 'all' }) => {
  const { getDailyQuests, getWeeklyQuests, quests, getActiveQuests } = useQuestStore();

  let questsToShow: Quest[];
  
  switch (type) {
    case 'daily':
      questsToShow = getDailyQuests();
      break;
    case 'weekly':
      questsToShow = getWeeklyQuests();
      break;
    default:
      questsToShow = getActiveQuests();
  }

  // Trier: non réclamés en premier, puis complétés
  questsToShow = [...questsToShow].sort((a, b) => {
    if (a.completed && !a.claimed && (!b.completed || b.claimed)) return -1;
    if (b.completed && !b.claimed && (!a.completed || a.claimed)) return 1;
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return 0;
  });

  if (questsToShow.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Aucune quête disponible</p>
        <p className="text-sm mt-1">Revenez plus tard pour de nouvelles quêtes !</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {questsToShow.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </AnimatePresence>
    </div>
  );
};

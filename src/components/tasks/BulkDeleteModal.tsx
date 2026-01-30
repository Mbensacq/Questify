import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  Calendar,
  CalendarDays,
  CalendarRange,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useTaskStore } from '../../stores/taskStore';

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DeleteMode = 'day' | 'week' | 'month' | 'year' | 'all';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({ isOpen, onClose }) => {
  const { tasks, bulkDeleteTasks, deleteTasksByDateRange, getTasksCountByDateRange } = useTaskStore();
  
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteResult, setDeleteResult] = useState<number | null>(null);

  // Calculate date range based on mode
  const getDateRange = useMemo(() => {
    const start = new Date();
    const end = new Date();

    switch (deleteMode) {
      case 'day':
        start.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        end.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        break;
      case 'week':
        const dayOfWeek = selectedDate.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + diffToMonday);
        end.setFullYear(start.getFullYear(), start.getMonth(), start.getDate() + 6);
        break;
      case 'month':
        start.setFullYear(selectedYear, selectedMonth, 1);
        end.setFullYear(selectedYear, selectedMonth + 1, 0);
        break;
      case 'year':
        start.setFullYear(selectedYear, 0, 1);
        end.setFullYear(selectedYear, 11, 31);
        break;
      case 'all':
        start.setFullYear(2000, 0, 1);
        end.setFullYear(2100, 11, 31);
        break;
    }

    return { start, end };
  }, [deleteMode, selectedDate, selectedMonth, selectedYear]);

  // Count tasks to delete
  const tasksCount = useMemo(() => {
    if (deleteMode === 'all') {
      return tasks.length;
    }
    return getTasksCountByDateRange(getDateRange.start, getDateRange.end);
  }, [deleteMode, getDateRange, tasks.length, getTasksCountByDateRange]);

  // Format date range for display
  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    
    switch (deleteMode) {
      case 'day':
        return selectedDate.toLocaleDateString('fr-FR', options);
      case 'week':
        return `${getDateRange.start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${getDateRange.end.toLocaleDateString('fr-FR', options)}`;
      case 'month':
        return `${MONTHS[selectedMonth]} ${selectedYear}`;
      case 'year':
        return `Année ${selectedYear}`;
      case 'all':
        return 'Toutes les tâches';
    }
  };

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [selectedDate]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      let count = 0;
      if (deleteMode === 'all') {
        const allTaskIds = tasks.map(t => t.id);
        count = await bulkDeleteTasks(allTaskIds);
      } else {
        count = await deleteTasksByDateRange(getDateRange.start, getDateRange.end);
      }
      setDeleteResult(count);
      setShowConfirm(false);
      
      // Auto-close after showing result
      setTimeout(() => {
        setDeleteResult(null);
        onClose();
      }, 2000);
    } catch (e) {
      console.error('Error deleting tasks:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  const navigateMonth = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const navigateYear = (delta: number) => {
    setSelectedYear(prev => prev + delta);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold flex items-center gap-2 text-red-600">
              <Trash2 className="w-6 h-6" />
              Suppression en masse
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
            {/* Delete Result */}
            {deleteResult !== null && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-4 rounded-xl text-center"
              >
                <p className="text-lg font-semibold">
                  ✅ {deleteResult} tâche{deleteResult > 1 ? 's' : ''} supprimée{deleteResult > 1 ? 's' : ''}
                </p>
              </motion.div>
            )}

            {deleteResult === null && (
              <>
                {/* Mode Selection */}
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { mode: 'day' as DeleteMode, label: 'Jour', icon: Calendar },
                    { mode: 'week' as DeleteMode, label: 'Semaine', icon: CalendarDays },
                    { mode: 'month' as DeleteMode, label: 'Mois', icon: CalendarRange },
                    { mode: 'year' as DeleteMode, label: 'Année', icon: CalendarRange },
                    { mode: 'all' as DeleteMode, label: 'Tout', icon: Trash2 },
                  ].map(({ mode, label, icon: Icon }) => (
                    <button
                      key={mode}
                      onClick={() => setDeleteMode(mode)}
                      className={`p-2 sm:p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                        deleteMode === mode
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Date Selection based on mode */}
                {deleteMode === 'day' && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h3 className="font-semibold">
                        {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                      </h3>
                      <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {DAYS.map(day => (
                        <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => day && setSelectedDate(day)}
                          disabled={!day}
                          className={`p-2 text-sm rounded-lg transition-colors ${
                            !day
                              ? 'invisible'
                              : day.toDateString() === selectedDate.toDateString()
                              ? 'bg-red-500 text-white font-bold'
                              : day.toDateString() === new Date().toDateString()
                              ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {day?.getDate()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {deleteMode === 'week' && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h3 className="font-semibold">
                        {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                      </h3>
                      <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {DAYS.map(day => (
                        <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar grid with week selection */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, index) => {
                        const isInSelectedWeek = day && (() => {
                          const dayOfWeek = selectedDate.getDay();
                          const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                          const weekStart = new Date(selectedDate);
                          weekStart.setDate(selectedDate.getDate() + diffToMonday);
                          const weekEnd = new Date(weekStart);
                          weekEnd.setDate(weekStart.getDate() + 6);
                          return day >= weekStart && day <= weekEnd;
                        })();

                        return (
                          <button
                            key={index}
                            onClick={() => day && setSelectedDate(day)}
                            disabled={!day}
                            className={`p-2 text-sm rounded-lg transition-colors ${
                              !day
                                ? 'invisible'
                                : isInSelectedWeek
                                ? 'bg-red-500 text-white font-bold'
                                : day.toDateString() === new Date().toDateString()
                                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {day?.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {deleteMode === 'month' && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    {/* Year Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => navigateYear(-1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h3 className="font-semibold text-lg">{selectedYear}</h3>
                      <button
                        onClick={() => navigateYear(1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Month grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {MONTHS.map((month, index) => (
                        <button
                          key={month}
                          onClick={() => setSelectedMonth(index)}
                          className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                            selectedMonth === index
                              ? 'bg-red-500 text-white shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {deleteMode === 'year' && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => navigateYear(-5)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h3 className="font-semibold text-lg">Sélectionner une année</h3>
                      <button
                        onClick={() => navigateYear(5)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Year grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 9 }, (_, i) => selectedYear - 4 + i).map(year => (
                        <button
                          key={year}
                          onClick={() => setSelectedYear(year)}
                          className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                            selectedYear === year
                              ? 'bg-red-500 text-white shadow-lg'
                              : year === new Date().getFullYear()
                              ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {deleteMode === 'all' && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="text-red-700 dark:text-red-300 font-semibold">
                      Attention : Cette action supprimera TOUTES vos tâches !
                    </p>
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      Cette action est irréversible.
                    </p>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-center">
                    <span className="text-gray-600 dark:text-gray-300">Période : </span>
                    <span className="font-semibold">{formatDateRange()}</span>
                  </p>
                  <p className="text-center mt-2">
                    <span className={`text-2xl font-bold ${tasksCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {tasksCount}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 ml-2">
                      tâche{tasksCount > 1 ? 's' : ''} à supprimer
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {deleteResult === null && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              {!showConfirm ? (
                <>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onClose}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => setShowConfirm(true)}
                    disabled={tasksCount === 0}
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Supprimer ({tasksCount})
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowConfirm(false)}
                    disabled={isDeleting}
                  >
                    Non, annuler
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Suppression...
                      </span>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Oui, supprimer !
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

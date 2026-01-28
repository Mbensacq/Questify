import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Volume2,
  VolumeX,
  Globe,
  Download,
  Upload,
  Trash2,
  LogOut,
  ChevronRight,
  Palette,
  Shield,
  Info
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { useTaskStore } from '../stores/taskStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { cn } from '../utils/helpers';

type Theme = 'light' | 'dark' | 'system';
type Language = 'fr' | 'en';

export const SettingsPage: React.FC = () => {
  const { user, signOut, deleteAccount } = useAuthStore();
  const { theme, setTheme, soundEnabled, toggleSound, notificationsEnabled, toggleNotifications } = useUIStore();
  const { tasks, categories, exportData, importData, clearAllData } = useTaskStore();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questify-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importData(data);
        alert('Données importées avec succès!');
      } catch (error) {
        alert('Erreur lors de l\'importation des données');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'SUPPRIMER') return;
    await deleteAccount();
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearDataModal(false);
  };

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <Card className="overflow-hidden">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <div className="space-y-1">{children}</div>
    </Card>
  );

  const SettingItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    description?: string;
    action?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
  }> = ({ icon, label, description, action, onClick, danger }) => (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-3 -mx-3 rounded-lg transition-colors',
        onClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
        danger && 'text-red-600 dark:text-red-400'
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center',
        danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {action}
      {onClick && !action && <ChevronRight className="w-5 h-5 text-gray-400" />}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary-500" />
          Paramètres
        </h1>
        <p className="text-gray-500 mt-1">Personnalisez votre expérience</p>
      </div>

      {/* Appearance */}
      <SettingSection title="Apparence">
        <SettingItem
          icon={theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          label="Thème"
          description="Choisissez votre thème préféré"
          action={
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="system">Système</option>
            </select>
          }
        />
        <SettingItem
          icon={<Palette className="w-5 h-5" />}
          label="Couleur d'accent"
          description="Personnalisez la couleur principale"
          action={
            <div className="flex gap-2">
              {['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'].map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          }
        />
      </SettingSection>

      {/* Notifications & Sound */}
      <SettingSection title="Notifications & Sons">
        <SettingItem
          icon={<Bell className="w-5 h-5" />}
          label="Notifications"
          description="Recevoir des rappels et alertes"
          action={
            <button
              onClick={toggleNotifications}
              className={cn(
                'w-12 h-6 rounded-full transition-colors',
                notificationsEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 bg-white rounded-full shadow-sm transition-transform',
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                )}
              />
            </button>
          }
        />
        <SettingItem
          icon={soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          label="Effets sonores"
          description="Sons lors des actions"
          action={
            <button
              onClick={toggleSound}
              className={cn(
                'w-12 h-6 rounded-full transition-colors',
                soundEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 bg-white rounded-full shadow-sm transition-transform',
                  soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                )}
              />
            </button>
          }
        />
      </SettingSection>

      {/* Data Management */}
      <SettingSection title="Données">
        <SettingItem
          icon={<Download className="w-5 h-5" />}
          label="Exporter les données"
          description="Télécharger une sauvegarde de vos données"
          onClick={handleExportData}
        />
        <SettingItem
          icon={<Upload className="w-5 h-5" />}
          label="Importer des données"
          description="Restaurer depuis une sauvegarde"
          action={
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              <span className="text-primary-500 hover:underline">Choisir un fichier</span>
            </label>
          }
        />
        <SettingItem
          icon={<Trash2 className="w-5 h-5" />}
          label="Effacer les données"
          description="Supprimer toutes les tâches et catégories"
          onClick={() => setShowClearDataModal(true)}
          danger
        />
      </SettingSection>

      {/* Account */}
      <SettingSection title="Compte">
        <SettingItem
          icon={<Shield className="w-5 h-5" />}
          label="Sécurité"
          description="Gérer les options de sécurité"
          onClick={() => {}}
        />
        <SettingItem
          icon={<LogOut className="w-5 h-5" />}
          label="Se déconnecter"
          description="Vous serez déconnecté de ce compte"
          onClick={signOut}
        />
        <SettingItem
          icon={<Trash2 className="w-5 h-5" />}
          label="Supprimer le compte"
          description="Cette action est irréversible"
          onClick={() => setShowDeleteModal(true)}
          danger
        />
      </SettingSection>

      {/* About */}
      <SettingSection title="À propos">
        <SettingItem
          icon={<Info className="w-5 h-5" />}
          label="Version"
          description="Questify v1.0.0"
        />
      </SettingSection>

      {/* Clear Data Modal */}
      <Modal
        isOpen={showClearDataModal}
        onClose={() => setShowClearDataModal(false)}
        title="Effacer les données"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Êtes-vous sûr de vouloir effacer toutes vos données? Cette action supprimera:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
            <li>{tasks.length} tâches</li>
            <li>{categories.length} catégories</li>
          </ul>
          <p className="text-red-500 font-medium">Cette action est irréversible!</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowClearDataModal(false)}>
              Annuler
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleClearData}>
              Effacer tout
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer le compte"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Cette action supprimera définitivement votre compte et toutes vos données.
            Cette action est <strong>irréversible</strong>.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Pour confirmer, tapez <strong>SUPPRIMER</strong> ci-dessous:
          </p>
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="SUPPRIMER"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirm('');
              }}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              disabled={deleteConfirm !== 'SUPPRIMER'}
              onClick={handleDeleteAccount}
            >
              Supprimer le compte
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Trash2,
  Shield,
  LogOut,
  UserX,
  ChevronRight,
  Palette,
  Info,
  Check,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useTaskStore } from '../stores/taskStore';
import { useUIStore } from '../stores/uiStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';

// Accent colors available
const ACCENT_COLORS = [
  { name: 'Teal', value: 'teal', class: 'bg-teal-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Green', value: 'green', class: 'bg-emerald-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
];

export const SettingsPage: React.FC = () => {
  const { user, signOut, deleteAccount, updateSettings } = useAuthStore();
  const { exportData, importData, clearAllData } = useTaskStore();
  const { theme, setTheme, soundEnabled, toggleSound, notificationsEnabled, toggleNotifications } = useUIStore();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [selectedAccentColor, setSelectedAccentColor] = useState('teal');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  // Handle theme change
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    toast.success(`Thème ${newTheme === 'dark' ? 'sombre' : newTheme === 'light' ? 'clair' : 'système'} activé`);
  };

  // Handle notifications toggle
  const handleNotificationsToggle = () => {
    toggleNotifications();
    toast.success(notificationsEnabled ? 'Notifications désactivées' : 'Notifications activées');
  };

  // Handle sound toggle
  const handleSoundToggle = () => {
    toggleSound();
    toast.success(soundEnabled ? 'Sons désactivés' : 'Sons activés');
  };

  // Handle data export
  const handleExportData = () => {
    try {
      const data = exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questify-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Données exportées avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'export des données');
    }
  };

  // Handle data import
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.tasks || data.categories) {
          importData(data);
          toast.success('Données importées avec succès !');
        } else {
          toast.error('Format de fichier invalide');
        }
      } catch (error) {
        toast.error('Erreur lors de l\'import des données');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle clear all data
  const handleClearAllData = () => {
    clearAllData();
    setShowClearDataModal(false);
    toast.success('Toutes les données ont été supprimées');
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') {
      toast.error('Veuillez taper SUPPRIMER pour confirmer');
      return;
    }
    
    try {
      await deleteAccount();
      toast.success('Compte supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
          <p className="text-gray-500 dark:text-gray-400">Personnalisez votre expérience</p>
        </div>
      </div>

      {/* Appearance Section */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-teal-500" />
            Apparence
          </h2>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {/* Theme */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-gray-500" />
              ) : theme === 'light' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Monitor className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Thème</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choisissez votre thème préféré</p>
              </div>
            </div>
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="system">Système</option>
            </select>
          </div>

          {/* Accent Color */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Couleur d'accent</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Personnalisez la couleur principale</p>
              </div>
            </div>
            <div className="flex gap-2">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    setSelectedAccentColor(color.value);
                    toast.success(`Couleur ${color.name} sélectionnée`);
                  }}
                  className={`w-8 h-8 rounded-full ${color.class} transition-all hover:scale-110 ${
                    selectedAccentColor === color.value 
                      ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' 
                      : ''
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications & Sound Section */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-500" />
            Notifications & Sons
          </h2>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {/* Notifications */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {notificationsEnabled ? (
                <Bell className="w-5 h-5 text-teal-500" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recevoir des rappels et alertes</p>
              </div>
            </div>
            <button
              onClick={handleNotificationsToggle}
              className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                notificationsEnabled ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound Effects */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-teal-500" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Effets sonores</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sons lors des actions</p>
              </div>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                soundEnabled ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Data Management Section */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-teal-500" />
            Données
          </h2>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {/* Export */}
          <button
            onClick={handleExportData}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-gray-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Exporter les données</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Télécharger une sauvegarde de vos données</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Import */}
          <label className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-gray-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Importer des données</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Restaurer depuis une sauvegarde</p>
              </div>
            </div>
            <span className="text-sm text-teal-500 font-medium">Choisir un fichier</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>

          {/* Clear Data */}
          <button
            onClick={() => setShowClearDataModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              <div className="text-left">
                <p className="font-medium text-red-600 dark:text-red-400">Effacer les données</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Supprimer toutes les tâches et catégories</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </Card>

      {/* Account Section */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-500" />
            Compte
          </h2>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {/* Security */}
          <button
            onClick={() => setShowSecurityModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Sécurité</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gérer les options de sécurité</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-gray-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Se déconnecter</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vous serez déconnecté de ce compte</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <UserX className="w-5 h-5 text-red-500" />
              <div className="text-left">
                <p className="font-medium text-red-600 dark:text-red-400">Supprimer le compte</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cette action est irréversible</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </Card>

      {/* About Section */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-teal-500" />
            À propos
          </h2>
        </div>
        
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Version</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Questify v1.0.0</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Clear Data Confirmation Modal */}
      <Modal
        isOpen={showClearDataModal}
        onClose={() => setShowClearDataModal(false)}
        title="Effacer toutes les données"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Cette action supprimera toutes vos tâches et catégories. Cette action est irréversible.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowClearDataModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleClearAllData}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Effacer tout
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmText('');
        }}
        title="Supprimer le compte"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">
              Cette action est permanente et irréversible. Toutes vos données seront supprimées.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tapez <span className="font-bold text-red-500">SUPPRIMER</span> pour confirmer
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="SUPPRIMER"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText('');
              }}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'SUPPRIMER'}
            >
              <UserX className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Security Modal */}
      <Modal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        title="Sécurité"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Check className="w-5 h-5 text-green-500" />
              <p className="font-medium text-gray-900 dark:text-white">Connexion sécurisée</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">
              Votre compte est protégé par l'authentification Google.
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-teal-500" />
              <p className="font-medium text-gray-900 dark:text-white">Données chiffrées</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">
              Vos données sont stockées de manière sécurisée dans Firebase.
            </p>
          </div>
          
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setShowSecurityModal(false)}
          >
            Fermer
          </Button>
        </div>
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Settings,
  Bell,
  Palette,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    theme,
    setTheme,
    exportDataJSON,
    importDataJSON,
    clearAllData,
    loadDemoData,
    addToast,
    resetChallenge,
  } = useApp();

  // Profile Form state
  const [username, setUsername] = useState(profile.username);
  const [tagline, setTagline] = useState(profile.tagline);
  const [productivityGoal, setProductivityGoal] = useState(profile.productivityGoal);
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor || '#6366f1');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(profile.timeFormat || '12h');
  const [weekStartDay, setWeekStartDay] = useState<0 | 1>(profile.weekStartDay);

  // Reminders state
  const [reminders, setReminders] = useState(profile.reminders);

  // Modals & File upload
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = username
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AM';

    updateProfile({
      username,
      tagline,
      initials,
      productivityGoal,
      avatarColor,
      timeFormat,
      weekStartDay,
      reminders,
    });
  };

  const handleExport = () => {
    const dataStr = exportDataJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weekly-100-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Backup Downloaded', 'Full JSON data exported successfully.', 'success');
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const res = importDataJSON(importJsonText);
    if (res.success) {
      setShowImportModal(false);
      setImportJsonText('');
    } else {
      addToast('Import Failed', res.message, 'error');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Profile & Settings
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize user identity, reminder preferences, theme mode, and data backup
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Check className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Profile Form */}
        <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <User className="w-5 h-5 text-brand-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              User Identity
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-md shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {profile.initials || 'AM'}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Avatar Color</label>
              <div className="flex items-center gap-2">
                {['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${avatarColor === c ? 'scale-125 ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name / Alias
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-surface-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tagline / Primary Field
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-surface-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Core Productivity North Star
              </label>
              <textarea
                rows={2}
                value={productivityGoal}
                onChange={(e) => setProductivityGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-surface-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Display & App Preferences */}
        <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Palette className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Application Preferences
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Theme Palette</span>
                <span className="text-[11px] text-slate-400">Toggle dark / light application skin</span>
              </div>
              <div className="flex bg-slate-100 dark:bg-surface-850 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 rounded-lg ${theme === 'dark' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400'}`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 rounded-lg ${theme === 'light' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400'}`}
                >
                  Light
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Time Notation</span>
                <span className="text-[11px] text-slate-400">12-Hour (AM/PM) vs 24-Hour Military format</span>
              </div>
              <div className="flex bg-slate-100 dark:bg-surface-850 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTimeFormat('12h')}
                  className={`px-3 py-1 rounded-lg ${timeFormat === '12h' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400'}`}
                >
                  12h
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFormat('24h')}
                  className={`px-3 py-1 rounded-lg ${timeFormat === '24h' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400'}`}
                >
                  24h
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Week Starting Day</span>
                <span className="text-[11px] text-slate-400">Determines weekly challenge bounds</span>
              </div>
              <div className="flex bg-slate-100 dark:bg-surface-850 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setWeekStartDay(1)}
                  className={`px-3 py-1 rounded-lg ${weekStartDay === 1 ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400'}`}
                >
                  Monday
                </button>
                <button
                  type="button"
                  onClick={() => setWeekStartDay(0)}
                  className={`px-3 py-1 rounded-lg ${weekStartDay === 0 ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400'}`}
                >
                  Sunday
                </button>
              </div>
            </div>
          </div>

          {/* Notifications & Reminders */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                In-App Reminders & Sound
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminders.dailyPlanning}
                  onChange={(e) => setReminders((prev) => ({ ...prev, dailyPlanning: e.target.checked }))}
                  className="rounded border-slate-700 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Daily planning prompt reminder (08:00 AM)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminders.sessionBreakReminder}
                  onChange={(e) => setReminders((prev) => ({ ...prev, sessionBreakReminder: e.target.checked }))}
                  className="rounded border-slate-700 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Timer interval chimes and break cues</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminders.weeklyReview}
                  onChange={(e) => setReminders((prev) => ({ ...prev, weeklyReview: e.target.checked }))}
                  className="rounded border-slate-700 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-slate-700 dark:text-slate-300">End-of-week challenge summary alert</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management & Backups */}
      <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Data Management & Portability
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Own your data with 100% offline JSON export, import, and reset capabilities
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-surface-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-brand-500" /> Export JSON Backup
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-surface-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-500" /> Import Backup
          </button>

          <button
            onClick={loadDemoData}
            className="px-4 py-2.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/30 flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Load Demo Dataset
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-semibold border border-rose-500/20 flex items-center gap-2 ml-auto transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear All Data
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-lg font-bold">Wipe Application Data?</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              This will permanently delete all stored time sessions, custom categories, tasks, and achievements from LocalStorage. Are you certain?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllData();
                  setShowClearConfirm(false);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
              >
                Yes, Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Import Weekly 100 JSON Backup
            </h4>
            <p className="text-xs text-slate-400">
              Paste your exported JSON structure below to restore all sessions, challenges, and settings.
            </p>

            <textarea
              rows={8}
              placeholder="Paste JSON content here..."
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl resize-none"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow"
              >
                Restore Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


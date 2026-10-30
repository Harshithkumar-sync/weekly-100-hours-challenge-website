import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { FocusModeOverlay } from './components/timer/FocusModeOverlay';
import { ManualTimeEntryModal } from './components/timer/ManualTimeEntryModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { WeeklyChallengeManager } from './components/challenge/WeeklyChallengeManager';
import { DailyScheduler } from './components/scheduler/DailyScheduler';
import { TaskManager } from './components/tasks/TaskManager';
import { SmartTimeTracker } from './components/timer/SmartTimeTracker';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { AchievementsView } from './components/achievements/AchievementsView';
import { HistoryView } from './components/history/HistoryView';
import { RestWellnessView } from './components/wellness/RestWellnessView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { currentTab } = useApp();

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'challenge':
        return <WeeklyChallengeManager />;
      case 'schedule':
        return <DailyScheduler />;
      case 'tasks':
        return <TaskManager />;
      case 'timer':
        return <SmartTimeTracker />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'achievements':
        return <AchievementsView />;
      case 'history':
        return <HistoryView />;
      case 'wellness':
        return <RestWellnessView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Desktop Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Navbar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Overlays & Modals */}
      <FocusModeOverlay />
      <ManualTimeEntryModal />
      <OnboardingModal />
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;


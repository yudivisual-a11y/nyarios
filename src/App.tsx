import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { BeresHome } from './components/views/BeresHome';
import { BeresWorkspace } from './components/views/BeresWorkspace';
import { BeresDocumentView } from './components/views/BeresDocumentView';
import { BeresDataView } from './components/views/BeresDataView';
import { BeresFinanceView } from './components/views/BeresFinanceView';
import { BeresScheduleView } from './components/views/BeresScheduleView';
import { BeresFileView } from './components/views/BeresFileView';
import { BeresProfileView } from './components/views/BeresProfileView';

// Features / Modals
import { ActivityTasksView } from './components/views/ActivityTasksView';
import { ScheduleAgendaView } from './components/views/ScheduleAgendaView';
import { ProfileSettingsView } from './components/views/ProfileSettingsView';
import { SavedMessagesView } from './components/features/SavedMessagesView';
import { FileCenterView } from './components/features/FileCenterView';
import { SmartSearchModal } from './components/features/SmartSearchModal';
import { TaskModal } from './components/features/TaskModal';
import { ScheduleModal } from './components/features/ScheduleModal';
import { QuickAskCreationModal } from './components/features/QuickAskCreationModal';
import { PollCreationModal } from './components/features/PollCreationModal';
import { FolderManagerModal } from './components/features/FolderManagerModal';
import { GroupDetailDrawer } from './components/features/GroupDetailDrawer';
import { LoginView } from './components/auth/LoginView';
import { Message } from './types';
import { useHistoryBack } from './utils/useHistoryBack';

export const App: React.FC = () => {
  const {
    isLoggedIn,
    activeNavTab,
      } = useApp();

  const [isSmartSearchOpen, setIsSmartSearchOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);

  
  if (!isLoggedIn) {
    return <LoginView />;
  }

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#F8FAFC] dark:bg-[#0B141A] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/30">
      
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0B141A] relative z-0 overflow-hidden">
        <>
            {activeNavTab === 'home' && <BeresHome />}
            {activeNavTab === 'workspace' && <BeresWorkspace />}
            {activeNavTab === 'docs' && <BeresDocumentView />}
            {activeNavTab === 'data' && <BeresDataView />}
            {activeNavTab === 'finance' && <BeresFinanceView />}
            {activeNavTab === 'schedule' && <BeresScheduleView />}
            {activeNavTab === 'files' && <BeresFileView />}
            {activeNavTab === 'profile' && <BeresProfileView />}
          </>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />

      {/* GLOBAL MODALS */}
      <SmartSearchModal
        isOpen={isSmartSearchOpen}
        onClose={() => setIsSmartSearchOpen(false)}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
              />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />

      <FolderManagerModal
        isOpen={isFolderManagerOpen}
        onClose={() => setIsFolderManagerOpen(false)}
      />

    </div>
  );
};

export default App;

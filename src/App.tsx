import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { ChatList } from './components/chat/ChatList';
import { ChatCanvas } from './components/chat/ChatCanvas';
import { CommunityView } from './components/views/CommunityView';
import { StatusView } from './components/views/StatusView';
import { VideoLiveView } from './components/views/VideoLiveView';
import { CallsView } from './components/views/CallsView';
import { ActiveCallModal } from './components/views/ActiveCallModal';
import { ActivityTasksView } from './components/views/ActivityTasksView';
import { ScheduleAgendaView } from './components/views/ScheduleAgendaView';
import { ProfileSettingsView } from './components/views/ProfileSettingsView';
import { SavedMessagesView } from './components/features/SavedMessagesView';
import { FileCenterView } from './components/features/FileCenterView';
import { NewChatModal } from './components/chat/NewChatModal';
import { NewGroupModal } from './components/chat/NewGroupModal';
import { SmartSearchModal } from './components/features/SmartSearchModal';
import { TaskModal } from './components/features/TaskModal';
import { ScheduleModal } from './components/features/ScheduleModal';
import { QuickAskCreationModal } from './components/features/QuickAskCreationModal';
import { PollCreationModal } from './components/features/PollCreationModal';
import { FolderManagerModal } from './components/features/FolderManagerModal';
import { GroupDetailDrawer } from './components/features/GroupDetailDrawer';
import { LoginView } from './components/auth/LoginView';
import { Message } from './types';

export const App: React.FC = () => {
  const {
    isLoggedIn,
    activeNavTab,
    activeDesktopSubTab,
    activeChatId,
    setActiveChatId,
    isGroupDetailOpen,
    setIsGroupDetailOpen,
  } = useApp();

  // If user is not logged in, render the Login Screen
  if (!isLoggedIn) {
    return <LoginView />;
  }

  // Modals state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isSmartSearchOpen, setIsSmartSearchOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskSourceMessage, setTaskSourceMessage] = useState<Message | null>(null);
  const [taskPrefillTitle, setTaskPrefillTitle] = useState<string | undefined>(undefined);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleSourceMessage, setScheduleSourceMessage] = useState<Message | null>(null);
  const [isQuickAskOpen, setIsQuickAskOpen] = useState(false);
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);

  const handleOpenTaskModal = (source?: Message) => {
    setTaskSourceMessage(source || null);
    setTaskPrefillTitle(undefined);
    setIsTaskModalOpen(true);
  };

  const handleOpenScheduleModal = (source?: Message) => {
    setScheduleSourceMessage(source || null);
    setIsScheduleModalOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0B141A] text-slate-800 dark:text-slate-100 font-sans">
      {/* Desktop Left Sidebar Rail */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* DESKTOP SUB-TABS (Tersimpan, Aktivitas, Jadwal, File Center, Pengaturan) */}
        {activeDesktopSubTab === 'tersimpan' && <SavedMessagesView />}
        {activeDesktopSubTab === 'aktivitas' && <ActivityTasksView />}
        {activeDesktopSubTab === 'jadwal' && <ScheduleAgendaView />}
        {activeDesktopSubTab === 'file_center' && <FileCenterView />}
        {activeDesktopSubTab === 'pengaturan' && <ProfileSettingsView />}

        {/* MAIN NAVIGATION TABS */}
        {activeDesktopSubTab === null && (
          <>
            {/* PESAN VIEW */}
            {activeNavTab === 'pesan' && (
              <div className="flex-1 flex h-full overflow-hidden">
                {/* Chat List Pane */}
                <div
                  className={`w-full md:w-80 lg:w-96 shrink-0 h-full ${
                    activeChatId ? 'hidden md:flex' : 'flex'
                  } flex-col`}
                >
                  <ChatList
                    onOpenNewChat={() => setIsNewChatOpen(true)}
                    onOpenNewGroup={() => setIsNewGroupOpen(true)}
                    onOpenSmartSearch={() => setIsSmartSearchOpen(true)}
                    onOpenFolderManager={() => setIsFolderManagerOpen(true)}
                  />
                </div>

                {/* Chat Detail Canvas Pane */}
                <div
                  className={`flex-1 h-full ${
                    activeChatId ? 'flex' : 'hidden md:flex'
                  } flex-col`}
                >
                  <ChatCanvas
                    onBackMobile={() => setActiveChatId(null)}
                    onOpenQuickAsk={() => setIsQuickAskOpen(true)}
                    onOpenPollModal={() => setIsPollOpen(true)}
                    onOpenScheduleModal={() => handleOpenScheduleModal()}
                    onOpenTaskModal={(m) => handleOpenTaskModal(m)}
                    onToggleGroupInfo={() => setIsGroupDetailOpen(!isGroupDetailOpen)}
                  />
                </div>

                {/* Right Drawer for Group Detail */}
                <GroupDetailDrawer
                  isOpen={isGroupDetailOpen}
                  onClose={() => setIsGroupDetailOpen(false)}
                />
              </div>
            )}

            {/* VIDEO & LIVE VIEW */}
            {activeNavTab === 'video' && <VideoLiveView />}

            {/* KOMUNITAS VIEW */}
            {activeNavTab === 'komunitas' && <CommunityView />}

            {/* STATUS VIEW */}
            {activeNavTab === 'status' && <StatusView />}

            {/* PANGGILAN VIEW */}
            {activeNavTab === 'panggilan' && <CallsView />}

            {/* SAYA VIEW (MOBILE) */}
            {activeNavTab === 'saya' && <ProfileSettingsView />}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation (Hidden when inside active chat on mobile) */}
      {!activeChatId && <MobileNavigation />}

      {/* GLOBAL MODALS */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
      />

      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
      />

      <SmartSearchModal
        isOpen={isSmartSearchOpen}
        onClose={() => setIsSmartSearchOpen(false)}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        sourceMessage={taskSourceMessage}
        prefillTitle={taskPrefillTitle}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        sourceMessage={scheduleSourceMessage}
      />

      <QuickAskCreationModal
        isOpen={isQuickAskOpen}
        onClose={() => setIsQuickAskOpen(false)}
      />

      <PollCreationModal
        isOpen={isPollOpen}
        onClose={() => setIsPollOpen(false)}
      />

      <FolderManagerModal
        isOpen={isFolderManagerOpen}
        onClose={() => setIsFolderManagerOpen(false)}
      />

      <ActiveCallModal />
    </div>
  );
};
export default App;

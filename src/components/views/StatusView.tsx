import React, { useState } from 'react';
import { CircleDot, Plus, Camera, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { CreateStatusModal } from './CreateStatusModal';
import { StoryViewerModal } from './StoryViewerModal';
import { StatusStory } from '../../types';

export const StatusView: React.FC = () => {
  const { statuses, currentUser, deleteStatus } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerStoryList, setViewerStoryList] = useState<StatusStory[]>([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  // 1. My Statuses (Hanya milik saya)
  const myStatuses = statuses.filter((s) => s.userId === currentUser.id);

  // 2. Contact Statuses (Hanya milik kontak / orang lain)
  const contactStatuses = statuses.filter((s) => s.userId !== currentUser.id);

  const handleOpenMyStatus = () => {
    if (myStatuses.length > 0) {
      setViewerStoryList(myStatuses);
      setSelectedStoryIndex(0);
      setIsViewerOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleOpenContactStatus = (index: number) => {
    setViewerStoryList(contactStatuses);
    setSelectedStoryIndex(index);
    setIsViewerOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18191d] p-4 sm:p-6 select-none overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Header - Only 1 primary action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl neu-raised-circle text-[#ff4b4b]">
              <CircleDot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Status
              </h1>
              <p className="text-xs text-slate-400">
                Pembaruan cerita teks, foto, dan video yang bertahan 24 jam
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Bagikan Status
          </Button>
        </div>

        {/* My Status Card (HANYA UNTUK STATUS DIRI SENDIRI) */}
        <div className="p-4 rounded-3xl bg-[#1e2025] neu-raised border border-white/5 shadow-sm flex items-center justify-between">
          <div
            onClick={handleOpenMyStatus}
            className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
          >
            <div className="relative">
              <Avatar name={currentUser.name} src={currentUser.avatar} size="lg" />
              {myStatuses.length > 0 ? (
                <span className="absolute -inset-1 rounded-full border-2 border-[#ff4b4b] animate-pulse" />
              ) : (
                <span className="absolute bottom-0 right-0 p-1 rounded-full bg-[#ff4b4b] text-white border-2 border-[#18191d]">
                  <Plus className="w-3 h-3" />
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">
                Status Saya
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {myStatuses.length > 0
                  ? `${myStatuses.length} pembaruan • Ketuk untuk melihat`
                  : 'Ketuk untuk menambahkan pembaruan status'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {myStatuses.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Hapus status terbaru Anda?')) {
                    deleteStatus(myStatuses[0].id);
                  }
                }}
                className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400"
                title="Hapus Status Saya"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="p-2.5 rounded-xl neu-raised-circle text-slate-300 hover:text-white"
              title="Buat Status Baru"
            >
              <Camera className="w-4 h-4 text-[#ff4b4b]" />
            </button>
          </div>
        </div>

        {/* Pembaruan Terkini (HANYA UNTUK STATUS DARI KONTAK / ORANG LAIN) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pembaruan Terkini ({contactStatuses.length})
          </h3>

          {contactStatuses.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center p-6 neu-flat rounded-3xl border border-white/5">
              <CircleDot className="w-8 h-8 text-slate-500 mb-2" />
              <h4 className="text-sm font-bold text-white mb-1">
                Belum ada status dari kontak
              </h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Pembaruan status dari kontak Anda akan muncul otomatis di bagian ini.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {contactStatuses.map((st, idx) => (
                <div
                  key={st.id}
                  onClick={() => handleOpenContactStatus(idx)}
                  className="p-3.5 rounded-3xl bg-[#1e2025] neu-raised border border-white/5 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#ff4b4b]/40 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative">
                      <Avatar name={st.userName} src={st.userAvatar} size="md" />
                      <span className="absolute -inset-1 rounded-full border-2 border-[#ff4b4b]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">
                        {st.userName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {st.timestamp} {st.caption ? `• ${st.caption}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateStatusModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <StoryViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        statuses={viewerStoryList}
        initialIndex={selectedStoryIndex}
      />
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { CircleDot, Plus, Camera, Trash2, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
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
  const myStatuses = useMemo(() => {
    return statuses.filter((s) => s.userId === currentUser.id || s.userName === currentUser.name);
  }, [statuses, currentUser.id, currentUser.name]);

  // 2. Contact Statuses (Hanya milik kontak / orang lain)
  const contactStatuses = useMemo(() => {
    return statuses.filter((s) => s.userId !== currentUser.id && s.userName !== currentUser.name);
  }, [statuses, currentUser.id, currentUser.name]);

  // Group contact stories by person
  const groupedContactStatuses = useMemo(() => {
    const map = new Map<string, StatusStory[]>();
    contactStatuses.forEach((st) => {
      const key = st.userId || st.userName;
      const arr = map.get(key) || [];
      arr.push(st);
      map.set(key, arr);
    });

    return Array.from(map.values()).map((stories) => {
      const sorted = [...stories].sort((a, b) => (b.rawTimestamp || 0) - (a.rawTimestamp || 0));
      return {
        latest: sorted[0],
        allStories: sorted,
        unviewedCount: sorted.filter((s) => !s.viewers?.includes(currentUser.name)).length,
      };
    });
  }, [contactStatuses, currentUser.name]);

  const handleOpenMyStatus = () => {
    if (myStatuses.length > 0) {
      setViewerStoryList(myStatuses);
      setSelectedStoryIndex(0);
      setIsViewerOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleOpenContactGroup = (groupStories: StatusStory[]) => {
    setViewerStoryList(groupStories);
    setSelectedStoryIndex(0);
    setIsViewerOpen(true);
  };

  const latestMyStatus = myStatuses[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary,#18191d)] p-4 sm:p-6 select-none overflow-y-auto transition-colors">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl neu-raised text-[var(--color-accent-primary,#ff4b4b)] flex items-center justify-center font-black shadow-sm">
              <CircleDot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[var(--text-primary,#f8fafc)] tracking-tight">
                Pembaruan Status
              </h1>
              <p className="text-xs text-[var(--text-secondary,#94a3b8)] font-medium">
                Bagikan momen teks, foto, dan video yang tayang selama 24 jam
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--color-accent-from,#ff5757)] to-[var(--color-accent-to,#e63939)] hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[var(--color-accent-shadow,rgba(255,75,75,0.3))] transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Status</span>
          </button>
        </div>

        {/* Section: Grid Status WhatsApp (Status Saya + Status Kontak Berjajar) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-[var(--text-secondary,#94a3b8)] uppercase tracking-wider">
              Status & Cerita ({myStatuses.length > 0 ? 'Status Saya' : ''}{myStatuses.length > 0 && contactStatuses.length > 0 ? ' + ' : ''}{contactStatuses.length > 0 ? `${contactStatuses.length} Kontak` : ''})
            </h3>
            {contactStatuses.length > 0 && (
              <span className="text-[11px] font-semibold text-[var(--color-accent-primary,#ff4b4b)]">
                Ketuk kotak untuk menonton
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {/* 1. KARTU STATUS SAYA (SLOT PERTAMA) */}
            <div
              onClick={handleOpenMyStatus}
              className="relative aspect-[9/14] rounded-3xl overflow-hidden cursor-pointer group neu-raised border border-[var(--border-color,rgba(255,255,255,0.06))] hover:border-[var(--color-accent-primary,#ff4b4b)]/50 transition-all shadow-md active:scale-95"
            >
              {latestMyStatus ? (
                <>
                  {/* Background Thumbnail Status Saya */}
                  {latestMyStatus.type === 'image' && (
                    <img
                      src={latestMyStatus.content}
                      alt="Status Saya"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {latestMyStatus.type === 'video' && (
                    <div className="w-full h-full relative bg-black flex items-center justify-center">
                      <video
                        src={latestMyStatus.content}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                  {latestMyStatus.type === 'text' && (
                    <div
                      className="w-full h-full p-4 flex items-center justify-center text-center font-bold text-white text-xs leading-relaxed"
                      style={{ backgroundColor: latestMyStatus.bgColor || '#ff4b4b' }}
                    >
                      <p className="line-clamp-4">{latestMyStatus.content}</p>
                    </div>
                  )}

                  {/* Top Left Avatar */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="relative">
                      <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" />
                      <span className="absolute -inset-0.5 rounded-full border-2 border-[var(--color-accent-primary,#ff4b4b)] animate-pulse" />
                    </div>
                  </div>

                  {/* Top Right Delete My Status */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Hapus pembaruan status Anda?')) {
                        deleteStatus(latestMyStatus.id);
                      }
                    }}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/60 text-slate-300 hover:text-rose-400 backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Hapus Status Saya"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Bottom Gradient Overlay Info */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 flex flex-col justify-end">
                    <span className="text-xs font-bold text-white truncate">Status Saya</span>
                    <span className="text-[10px] text-slate-300">
                      {latestMyStatus.timestamp} • {myStatuses.length} cerita
                    </span>
                  </div>
                </>
              ) : (
                /* Empty My Status Card */
                <div className="w-full h-full p-4 flex flex-col items-center justify-between text-center bg-[var(--bg-surface,#1e2025)]">
                  <div className="w-full flex justify-start">
                    <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" />
                  </div>
                  <div className="space-y-1 my-auto">
                    <div className="w-10 h-10 rounded-full neu-raised text-[var(--color-accent-primary,#ff4b4b)] mx-auto flex items-center justify-center font-bold">
                      <Plus className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[var(--text-primary,#f8fafc)]">
                      Status Saya
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary,#94a3b8)]">
                      Bagikan foto/teks
                    </p>
                  </div>
                  <span className="w-full py-1.5 rounded-xl bg-gradient-to-r from-[var(--color-accent-from,#ff5757)] to-[var(--color-accent-to,#e63939)] text-white text-[10px] font-bold shadow-sm">
                    + Tambah
                  </span>
                </div>
              )}
            </div>

            {/* 2. KARTU-KARTU STATUS KONTAK LAIN (BERJAJAR LANGSUNG DI SAMPING STATUS SAYA) */}
            {groupedContactStatuses.map((group) => {
              const st = group.latest;
              const hasUnviewed = group.unviewedCount > 0;

              return (
                <div
                  key={st.userId || st.id}
                  onClick={() => handleOpenContactGroup(group.allStories)}
                  className={`relative aspect-[9/14] rounded-3xl overflow-hidden cursor-pointer group neu-raised border transition-all shadow-md hover:scale-[1.02] active:scale-95 ${
                    hasUnviewed
                      ? 'border-[var(--color-accent-primary,#ff4b4b)] ring-2 ring-[var(--color-accent-primary,#ff4b4b)]/30'
                      : 'border-[var(--border-color,rgba(255,255,255,0.06))] opacity-85'
                  }`}
                >
                  {/* Background Content */}
                  {st.type === 'image' && (
                    <img
                      src={st.content}
                      alt={st.userName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {st.type === 'video' && (
                    <div className="w-full h-full relative bg-black flex items-center justify-center">
                      <video src={st.content} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                  {st.type === 'text' && (
                    <div
                      className="w-full h-full p-4 flex items-center justify-center text-center font-bold text-white text-xs leading-relaxed"
                      style={{ backgroundColor: st.bgColor || '#ff4b4b' }}
                    >
                      <p className="line-clamp-4">{st.content}</p>
                    </div>
                  )}

                  {/* Top Left Contact Avatar with Ring */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="relative">
                      <Avatar name={st.userName} src={st.userAvatar} size="sm" />
                      {hasUnviewed && (
                        <span className="absolute -inset-0.5 rounded-full border-2 border-[var(--color-accent-primary,#ff4b4b)]" />
                      )}
                    </div>
                  </div>

                  {/* Top Right Story Count Badge if > 1 */}
                  {group.allStories.length > 1 && (
                    <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-[10px] font-bold text-white">
                      {group.allStories.length}
                    </div>
                  )}

                  {/* Bottom Gradient Overlay with Name & Time */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 flex flex-col justify-end">
                    <span className="text-xs font-bold text-white truncate drop-shadow-md">
                      {st.userName}
                    </span>
                    <span className="text-[10px] text-slate-300 drop-shadow-sm truncate">
                      {st.timestamp} {group.allStories.length > 1 ? `• ${group.allStories.length} cerita` : (st.caption ? `• ${st.caption}` : '')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state notice if no contact statuses yet */}
          {groupedContactStatuses.length === 0 && (
            <div className="p-6 rounded-3xl neu-flat bg-[var(--bg-surface,#1e2025)] border border-[var(--border-color,rgba(255,255,255,0.05))] flex items-center gap-3.5 mt-2 shadow-sm">
              <div className="w-10 h-10 rounded-2xl neu-raised text-[var(--color-accent-primary,#ff4b4b)] flex items-center justify-center shrink-0">
                <CircleDot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary,#f8fafc)]">
                  Belum ada status dari kontak teman
                </h4>
                <p className="text-[11px] text-[var(--text-secondary,#94a3b8)]">
                  Ketika kontak atau teman Anda memposting status, kotak preview thumbnail akan muncul berjajar di samping status Anda.
                </p>
              </div>
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

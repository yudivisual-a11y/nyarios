import React, { useState } from 'react';
import {
  X,
  Users,
  Image,
  FileText,
  Bookmark,
  CheckSquare,
  Vote,
  MessageSquare,
  Pin,
  VolumeX,
  Trash2,
  Calendar,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { formatBytes, formatRelativeTime } from '../../utils/formatters';

interface GroupDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type DrawerTab = 'info' | 'media' | 'file' | 'tersimpan' | 'aktivitas' | 'polling';

export const GroupDetailDrawer: React.FC<GroupDetailDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeChat,
    currentChatMessages,
    tasks,
    updateTaskStatus,
    toggleMuteChat,
    togglePinChat,
    deleteChat,
  } = useApp();

  const [activeTab, setActiveTab] = useState<DrawerTab>('info');

  if (!isOpen || !activeChat) return null;

  // Extract media items in this chat
  const mediaItems = currentChatMessages.filter(
    (m) => (m.type === 'image' || m.type === 'video') && m.attachment
  );

  // Extract documents/files in this chat
  const fileItems = currentChatMessages.filter(
    (m) => (m.type === 'document' || m.type === 'audio') && m.attachment
  );

  // Extract saved messages in this chat
  const savedItems = currentChatMessages.filter((m) => !!m.savedCategory);

  // Extract tasks for this chat
  const groupTasks = tasks.filter(
    (t) => t.chatId === activeChat.id || currentChatMessages.some((m) => m.id === t.sourceMessageId)
  );

  // Extract polls for this chat
  const pollItems = currentChatMessages.filter(
    (m) => (m.type === 'poll' && m.poll) || (m.type === 'quick_ask' && m.quickAsk)
  );

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white dark:bg-[#111B21] shadow-2xl border-l border-slate-200/80 dark:border-slate-800 flex flex-col animate-slide-up select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
          {activeChat.isGroup ? 'Info Grup' : 'Info Kontak'}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs navigation for Group details */}
      <div className="flex items-center gap-1 px-3 pt-2 border-b border-slate-100 dark:border-slate-800/80 overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: 'info', label: 'Info' },
          { id: 'media', label: `Media (${mediaItems.length})` },
          { id: 'file', label: `File (${fileItems.length})` },
          { id: 'tersimpan', label: `Tersimpan (${savedItems.length})` },
          { id: 'aktivitas', label: `Aktivitas (${groupTasks.length})` },
          { id: 'polling', label: `Polling (${pollItems.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as DrawerTab)}
            className={`px-3 py-2 text-xs font-bold border-b-2 shrink-0 transition-colors ${
              activeTab === tab.id
                ? 'border-[#00A884] text-[#00A884] dark:text-[#34D399]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. INFO TAB */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center p-3">
              <Avatar
                name={activeChat.name}
                src={activeChat.avatar}
                isGroup={activeChat.isGroup}
                size="xl"
                className="mb-2"
              />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {activeChat.name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeChat.phone || (activeChat.isGroup ? `${activeChat.members?.length || 1} Anggota` : '')}
              </p>
            </div>

            {/* Description */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#202C33] border border-slate-200/70 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Deskripsi / Bio
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                {activeChat.groupDescription || activeChat.bio || 'Tidak ada deskripsi.'}
              </p>
            </div>

            {/* Quick toggles */}
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#202C33] border border-slate-200/70 dark:border-slate-800 space-y-1 text-xs">
              <button
                onClick={() => togglePinChat(activeChat.id)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4 text-emerald-600" />
                  <span>Sematkan Percakapan</span>
                </div>
                <span className="font-bold text-emerald-600">
                  {activeChat.isPinned ? 'Aktif' : 'Nonaktif'}
                </span>
              </button>

              <button
                onClick={() => toggleMuteChat(activeChat.id)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span>Bisukan Notifikasi</span>
                </div>
                <span className="font-bold text-slate-500">
                  {activeChat.isMuted ? 'Mati' : 'Hidup'}
                </span>
              </button>
            </div>

            {/* Group Members List if group */}
            {activeChat.isGroup && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Anggota Grup ({activeChat.members?.length || 1})</span>
                </div>
                <div className="space-y-1.5">
                  {(activeChat.members || ['Saya']).map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#202C33]"
                    >
                      <Avatar name={member} size="xs" />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {member} {member === 'Saya' && '(Pemilik)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. MEDIA TAB */}
        {activeTab === 'media' && (
          <div>
            {mediaItems.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                Belum ada foto atau video yang dibagikan dalam chat ini.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {mediaItems.map((m) => (
                  <div key={m.id} className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={m.attachment?.url}
                      alt={m.attachment?.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. FILE TAB */}
        {activeTab === 'file' && (
          <div>
            {fileItems.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                Belum ada dokumen atau audio yang dibagikan dalam chat ini.
              </div>
            ) : (
              <div className="space-y-2">
                {fileItems.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#202C33] border border-slate-200/60 dark:border-slate-800 text-xs"
                  >
                    <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-slate-800 dark:text-slate-100">
                        {m.attachment?.name}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {formatBytes(m.attachment?.size || 0)} • {formatRelativeTime(m.rawTimestamp)}
                      </span>
                    </div>
                    <a
                      href={m.attachment?.url}
                      download={m.attachment?.name}
                      className="p-1 text-slate-400 hover:text-emerald-600"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. TERSIMPAN TAB */}
        {activeTab === 'tersimpan' && (
          <div>
            {savedItems.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                Belum ada pesan yang disimpan dari chat ini.
              </div>
            ) : (
              <div className="space-y-2">
                {savedItems.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#202C33] border border-slate-200/60 dark:border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 font-bold">
                        {m.savedCategory}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatRelativeTime(m.rawTimestamp)}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                      {m.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. AKTIVITAS / TUGAS TAB */}
        {activeTab === 'aktivitas' && (
          <div>
            {groupTasks.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                Belum ada tugas yang dibuat dari percakapan ini.
              </div>
            ) : (
              <div className="space-y-2">
                {groupTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#202C33] border border-slate-200/60 dark:border-slate-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {t.title}
                      </span>
                      <button
                        onClick={() =>
                          updateTaskStatus(
                            t.id,
                            t.status === 'done' ? 'todo' : 'done'
                          )
                        }
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                          t.status === 'done'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status === 'done' ? '✓ Selesai' : 'Belum Selesai'}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      PJ: {t.assignee} • Tenggat: {t.deadline}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. POLLING TAB */}
        {activeTab === 'polling' && (
          <div>
            {pollItems.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                Belum ada polling yang dibuat dalam grup ini.
              </div>
            ) : (
              <div className="space-y-3">
                {pollItems.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#202C33] border border-slate-200/60 dark:border-slate-800 text-xs space-y-2"
                  >
                    <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <Vote className="w-4 h-4 text-emerald-600" />
                      <span>{m.poll?.question || m.quickAsk?.question}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Dibuat pada {formatRelativeTime(m.rawTimestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

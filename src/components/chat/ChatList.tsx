import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Pin,
  VolumeX,
  MessageSquarePlus,
  Users,
  MoreVertical,
  Trash2,
  Archive,
  FolderPlus,
  Camera,
  Video,
  Mic,
  FileText,
  BarChart2,
  HelpCircle,
  CheckSquare,
  Calendar,
  QrCode,
  Scan,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { EmptyState } from '../ui/EmptyState';
import { formatRelativeTime } from '../../utils/formatters';
import { UserQrModal } from '../modals/UserQrModal';
import { QrScannerModal } from '../modals/QrScannerModal';

interface ChatListProps {
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  onOpenSmartSearch: () => void;
  onOpenFolderManager: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  onOpenNewChat,
  onOpenNewGroup,
  onOpenSmartSearch,
  onOpenFolderManager,
}) => {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    activeFolderId,
    setActiveFolderId,
    customFolders,
    currentUser,
    togglePinChat,
    toggleMuteChat,
    toggleArchiveChat,
    deleteChat,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenuChatId, setContextMenuChatId] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  // Filter chats
  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      if (chat.isArchived) return false;

      if (activeFolderId === 'unread') {
        if (chat.unreadCount <= 0) return false;
      } else if (activeFolderId === 'favorite') {
        if (!chat.isPinned) return false;
      } else if (activeFolderId !== 'all') {
        if (!chat.folderIds.includes(activeFolderId)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = chat.name.toLowerCase().includes(q);
        const matchPhone = chat.phone?.toLowerCase().includes(q);
        const matchLast = chat.lastMessage?.text.toLowerCase().includes(q);
        return matchName || matchPhone || matchLast;
      }

      return true;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const timeA = a.lastMessage?.rawTimestamp || 0;
      const timeB = b.lastMessage?.rawTimestamp || 0;
      return timeB - timeA;
    });
  }, [chats, activeFolderId, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#18191d] border-r border-white/5 select-none text-slate-100">
      {/* Top Header matching reference screen */}
      <div className="px-5 pt-6 pb-3 space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* User Avatar on left */}
            <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" isOnline={true} />
            <h1 className="text-2xl font-black tracking-tight text-white">
              NYARIOS
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Scan QR Button */}
            <button
              onClick={() => setIsScannerModalOpen(true)}
              title="Pindai QR Teman"
              className="w-9 h-9 rounded-full neu-raised-circle flex items-center justify-center text-slate-300 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Scan className="w-4 h-4 text-[#ff4b4b]" />
            </button>

            {/* My QR Code Button */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              title="Kode QR Saya"
              className="w-9 h-9 rounded-full neu-raised-circle flex items-center justify-center text-slate-300 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#ff4b4b]" />
            </button>

            {/* Circular Coral Red (+) Button matching reference */}
            <button
              onClick={onOpenNewChat}
              title="Pesan Baru"
              className="w-9 h-9 rounded-full neu-coral-btn flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#ff4b4b]/30 cursor-pointer"
            >
              <Plus className="w-4 h-4 font-bold" />
            </button>
          </div>
        </div>

        {/* Sunken / Inset Search Bar matching reference screen */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full px-5 py-3 neu-sunken-bar rounded-full text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 font-medium outline-none border border-white/[0.03] focus:border-[#ff4b4b]/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Folder filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          <button
            onClick={() => setActiveFolderId('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              activeFolderId === 'all'
                ? 'bg-[#ff4b4b] text-white shadow-md shadow-[#ff4b4b]/20 font-bold'
                : 'neu-raised-circle text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveFolderId('unread')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              activeFolderId === 'unread'
                ? 'bg-[#ff4b4b] text-white shadow-md shadow-[#ff4b4b]/20 font-bold'
                : 'neu-raised-circle text-slate-400 hover:text-slate-200'
            }`}
          >
            Belum Dibaca
          </button>
          <button
            onClick={() => setActiveFolderId('favorite')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              activeFolderId === 'favorite'
                ? 'bg-[#ff4b4b] text-white shadow-md shadow-[#ff4b4b]/20 font-bold'
                : 'neu-raised-circle text-slate-400 hover:text-slate-200'
            }`}
          >
            Favorit
          </button>

          {customFolders.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFolderId(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                activeFolderId === f.id
                  ? 'bg-[#ff4b4b] text-white shadow-md shadow-[#ff4b4b]/20 font-bold'
                  : 'neu-raised-circle text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.name}
            </button>
          ))}

          <button
            onClick={onOpenFolderManager}
            className="p-1.5 rounded-full neu-raised-circle text-slate-400 hover:text-slate-200 shrink-0"
            title="Kelola Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chat List Stream matching reference layout */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] pb-24 md:pb-4">
        {filteredChats.length === 0 ? (
          <div className="h-full flex items-center justify-center p-4">
            {chats.length === 0 ? (
              <EmptyState
                icon={<MessageSquarePlus className="w-8 h-8 text-[#ff4b4b]" />}
                title="Belum ada percakapan"
                description="Mulai percakapan baru dengan teman atau keluarga."
                actionText="Pesan Baru"
                onAction={onOpenNewChat}
                actionIcon={<Plus className="w-4 h-4" />}
                secondaryActionText="Buat Grup"
                onSecondaryAction={onOpenNewGroup}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-xs text-slate-500">Tidak ada chat dalam filter ini.</p>
              </div>
            )}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = activeChatId === chat.id;
            const hasUnread = chat.unreadCount > 0;

            return (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`relative flex items-center gap-3.5 px-5 py-3.5 cursor-pointer transition-all group ${
                  isSelected
                    ? 'bg-[#212328] border-l-4 border-[#ff4b4b]'
                    : 'hover:bg-[#1e2025]'
                }`}
              >
                {/* Circular Avatar with soft extruded rim */}
                <Avatar
                  name={chat.name}
                  src={chat.avatar}
                  isGroup={chat.isGroup}
                  size="md"
                  isOnline={!chat.isGroup}
                />

                {/* Content info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-sm text-white truncate">
                        {chat.name}
                      </span>
                      {chat.isPinned && (
                        <Pin className="w-3 h-3 text-[#ff4b4b] shrink-0 fill-current" />
                      )}
                      {chat.isMuted && (
                        <VolumeX className="w-3 h-3 text-slate-500 shrink-0" />
                      )}
                    </div>

                    {/* Timestamp: Red if unread, muted gray if read */}
                    {chat.lastMessage && (
                      <span className={`text-[11px] font-semibold shrink-0 ${
                        hasUnread ? 'text-[#ff4b4b]' : 'text-slate-500'
                      }`}>
                        {formatRelativeTime(chat.lastMessage.rawTimestamp)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-400 truncate pr-2 font-normal flex items-center gap-1 min-w-0">
                      {chat.lastMessage ? (
                        <>
                          {chat.lastMessage.type === 'image' && (
                            <span className="flex items-center gap-1 text-slate-300 font-medium">
                              <Camera className="w-3.5 h-3.5 text-[#ff6b6b] shrink-0" />
                              <span>{chat.lastMessage.text && !chat.lastMessage.text.startsWith('data:') ? chat.lastMessage.text : 'Foto'}</span>
                            </span>
                          )}
                          {chat.lastMessage.type === 'video' && (
                            <span className="flex items-center gap-1 text-slate-300 font-medium">
                              <Video className="w-3.5 h-3.5 text-[#ff6b6b] shrink-0" />
                              <span>{chat.lastMessage.text && !chat.lastMessage.text.startsWith('data:') ? chat.lastMessage.text : 'Video'}</span>
                            </span>
                          )}
                          {(chat.lastMessage.type === 'voice_note' || chat.lastMessage.type === 'audio') && (
                            <span className="flex items-center gap-1 text-slate-300 font-medium">
                              <Mic className="w-3.5 h-3.5 text-[#ff6b6b] shrink-0" />
                              <span>Pesan Suara</span>
                            </span>
                          )}
                          {chat.lastMessage.type === 'document' && (
                            <span className="flex items-center gap-1 text-slate-300 font-medium">
                              <FileText className="w-3.5 h-3.5 text-[#ff6b6b] shrink-0" />
                              <span>{chat.lastMessage.text && !chat.lastMessage.text.startsWith('data:') ? chat.lastMessage.text : 'Dokumen'}</span>
                            </span>
                          )}
                          {chat.lastMessage.type === 'poll' && (
                            <span className="flex items-center gap-1 text-slate-300 font-medium">
                              <BarChart2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Polling: {chat.lastMessage.text}</span>
                            </span>
                          )}
                          {chat.lastMessage.type === 'quick_ask' && (
                            <span className="flex items-center gap-1 text-slate-300 font-medium">
                              <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Tanya Cepat</span>
                            </span>
                          )}
                          {chat.lastMessage.type === 'task_card' && (
                            <span className="flex items-center gap-1 text-slate-300 font-medium">
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>Tugas: {chat.lastMessage.text}</span>
                            </span>
                          )}
                          {chat.lastMessage.type === 'schedule_card' && (
                            <span className="flex items-center gap-1 text-slate-300 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>Jadwal: {chat.lastMessage.text}</span>
                            </span>
                          )}
                          {(!chat.lastMessage.type || chat.lastMessage.type === 'text' || chat.lastMessage.type === 'system') && (
                            <span className="truncate">{chat.lastMessage.text}</span>
                          )}
                        </>
                      ) : (
                        <span className="italic text-slate-500">Belum ada pesan</span>
                      )}
                    </div>

                    {/* Coral Red unread badge */}
                    {hasUnread && (
                      <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-[#ff4b4b] text-white text-[10px] font-black flex items-center justify-center shadow-md shadow-[#ff4b4b]/30">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick actions popup trigger on hover */}
                <div
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setContextMenuChatId(contextMenuChatId === chat.id ? null : chat.id);
                  }}
                >
                  <button className="p-1.5 rounded-full neu-raised-circle text-slate-400 hover:text-white">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Context dropdown */}
                {contextMenuChatId === chat.id && (
                  <div
                    className="absolute right-5 top-14 z-30 w-44 bg-[#23262c] rounded-2xl shadow-2xl border border-white/10 py-1.5 text-xs text-slate-200 animate-fade-in neu-flat"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        togglePinChat(chat.id);
                        setContextMenuChatId(null);
                      }}
                      className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#2c3038]"
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span>{chat.isPinned ? 'Lepas Sematan' : 'Sematkan Chat'}</span>
                    </button>
                    <button
                      onClick={() => {
                        toggleMuteChat(chat.id);
                        setContextMenuChatId(null);
                      }}
                      className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#2c3038]"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>{chat.isMuted ? 'Bunyikan Chat' : 'Bisukan Chat'}</span>
                    </button>
                    <button
                      onClick={() => {
                        toggleArchiveChat(chat.id);
                        setContextMenuChatId(null);
                      }}
                      className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#2c3038]"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Arsipkan Chat</span>
                    </button>
                    <div className="my-1 border-t border-white/5" />
                    <button
                      onClick={() => {
                        deleteChat(chat.id);
                        setContextMenuChatId(null);
                      }}
                      className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-rose-400 hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Chat</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <UserQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onOpenScanner={() => setIsScannerModalOpen(true)}
      />

      <QrScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onOpenMyQr={() => setIsQrModalOpen(true)}
      />
    </div>
  );
};

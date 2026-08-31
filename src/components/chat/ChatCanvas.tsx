import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  Search,
  Sparkles,
  MoreVertical,
  Pin,
  X,
  Info,
  Send,
  MessageSquare,
  Bot,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { MessageBubble } from './MessageBubble';
import { ChatInputBar } from './ChatInputBar';
import { Message } from '../../types';
import { formatFullDate } from '../../utils/formatters';

interface ChatCanvasProps {
  onBackMobile: () => void;
  onOpenQuickAsk: () => void;
  onOpenPollModal: () => void;
  onOpenScheduleModal: () => void;
  onOpenTaskModal: (sourceMessage?: Message) => void;
  onToggleGroupInfo: () => void;
}

export const ChatCanvas: React.FC<ChatCanvasProps> = ({
  onBackMobile,
  onOpenQuickAsk,
  onOpenPollModal,
  onOpenScheduleModal,
  onOpenTaskModal,
  onToggleGroupInfo,
}) => {
  const {
    activeChat,
    currentChatMessages,
    startCall,
  } = useApp();

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [inChatSearch, setInChatSearch] = useState('');
  const [showInChatSearch, setShowInChatSearch] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChatMessages.length]);

  if (!activeChat) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#18191d] p-8 text-center select-none text-slate-300">
        <div className="w-20 h-20 rounded-full neu-raised flex items-center justify-center mb-4 text-[#ff4b4b] shadow-2xl">
          <MessageSquare className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">
          NYARIOS Percakapan
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
          Pilih percakapan dari daftar atau buat pesan baru untuk mulai berdiskusi dan berkolaborasi.
        </p>
      </div>
    );
  }

  // Filter messages if in-chat search active
  const displayedMessages = inChatSearch.trim()
    ? currentChatMessages.filter((m) =>
        m.content.toLowerCase().includes(inChatSearch.toLowerCase())
      )
    : currentChatMessages;

  const pinnedMessage = currentChatMessages.find((m) => m.isPinned);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18191d] relative select-none">
      {/* Top Header Bar matching reference right screen */}
      <div className="px-4 py-3.5 bg-[#18191d] border-b border-white/[0.04] flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button (Red Arrow on circular dark bevel) */}
          <button
            onClick={onBackMobile}
            className="md:hidden w-10 h-10 rounded-full neu-raised-circle flex items-center justify-center text-[#ff4b4b] hover:text-[#ff6b6b] active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5 font-bold" />
          </button>

          <div
            onClick={onToggleGroupInfo}
            className="flex items-center gap-3 cursor-pointer min-w-0 group"
          >
            <Avatar
              name={activeChat.name}
              src={activeChat.avatar}
              isGroup={activeChat.isGroup}
              size="md"
              isOnline={!activeChat.isGroup}
            />
            <div className="flex flex-col min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-[#ff4b4b] transition-colors">
                {activeChat.name}
              </h2>
              <span className="text-xs text-slate-400 truncate">
                {activeChat.isGroup
                  ? `${activeChat.members?.length || 1} anggota`
                  : 'Online'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Phone call button matching reference right screen */}
        <div className="flex items-center gap-2">
          {/* Search in chat toggle */}
          <button
            onClick={() => setShowInChatSearch(!showInChatSearch)}
            title="Cari dalam chat ini"
            className="w-10 h-10 rounded-full neu-raised-circle flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Voice Call Button (Dark circular bevel with red phone icon) */}
          <button
            onClick={() => startCall(activeChat.name, activeChat.avatar, 'voice')}
            title="Panggilan Suara"
            className="w-10 h-10 rounded-full neu-raised-circle flex items-center justify-center text-[#ff4b4b] hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <Phone className="w-4 h-4 fill-current" />
          </button>

          {/* Video Call Button */}
          <button
            onClick={() => startCall(activeChat.name, activeChat.avatar, 'video')}
            title="Panggilan Video"
            className="w-10 h-10 rounded-full neu-raised-circle flex items-center justify-center text-slate-400 hover:text-white transition-all hidden sm:flex"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Info toggle */}
          <button
            onClick={onToggleGroupInfo}
            title="Info Percakapan"
            className="w-10 h-10 rounded-full neu-raised-circle flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* In-Chat Search Bar */}
      {showInChatSearch && (
        <div className="px-4 py-2.5 bg-[#1e2025] border-b border-white/5 flex items-center gap-2 animate-slide-up z-10">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={inChatSearch}
            onChange={(e) => setInChatSearch(e.target.value)}
            placeholder="Cari pesan dalam percakapan ini..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-white outline-none"
            autoFocus
          />
          {inChatSearch && (
            <span className="text-[11px] text-slate-400">
              {displayedMessages.length} hasil
            </span>
          )}
          <button
            onClick={() => {
              setInChatSearch('');
              setShowInChatSearch(false);
            }}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sticky Pinned Banner */}
      {pinnedMessage && (
        <div className="px-4 py-2 bg-[#202328] border-b border-[#ff4b4b]/20 flex items-center justify-between text-xs text-slate-200 z-10">
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-3.5 h-3.5 text-[#ff4b4b] shrink-0 fill-current" />
            <span className="font-bold shrink-0">{pinnedMessage.senderName}:</span>
            <span className="truncate text-slate-300">{pinnedMessage.content}</span>
          </div>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto py-4 px-2 sm:px-4 space-y-2 pb-24 md:pb-4">
        {displayedMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="p-4 rounded-3xl neu-flat text-xs text-slate-400 max-w-xs space-y-1">
              <p className="font-bold text-white">
                Awal percakapan dengan {activeChat.name}
              </p>
              <p className="text-[11px] text-slate-500">
                Pesan terenkripsi dan tersimpan secara lokal di perangkat Anda.
              </p>
            </div>
          </div>
        ) : (
          displayedMessages.map((msg, index) => {
            const prevMsg = displayedMessages[index - 1];
            const isDifferentDay =
              !prevMsg ||
              new Date(msg.rawTimestamp).toDateString() !==
                new Date(prevMsg.rawTimestamp).toDateString();

            return (
              <React.Fragment key={msg.id}>
                {isDifferentDay && (
                  <div className="flex justify-center my-3">
                    <span className="px-4 py-1 rounded-full bg-[#202227] text-[11px] font-semibold text-slate-400 shadow-inner">
                      {formatFullDate(msg.rawTimestamp)}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  isGroup={activeChat.isGroup}
                  onReply={(m) => setReplyingTo(m)}
                  onForward={(m) => {
                    alert(`Pesan "${m.content.slice(0, 30)}..." siap diteruskan`);
                  }}
                  onConvertToTask={(m) => onOpenTaskModal(m)}
                  onAddToSchedule={(m) => onOpenScheduleModal()}
                  onEdit={(m) => setEditingMessage(m)}
                />
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>



      {/* Chat Input Bar */}
      <ChatInputBar
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
        onOpenQuickAsk={onOpenQuickAsk}
        onOpenPollModal={onOpenPollModal}
        onOpenScheduleModal={onOpenScheduleModal}
      />
    </div>
  );
};

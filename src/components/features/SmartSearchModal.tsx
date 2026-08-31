import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Image,
  FileText,
  Calendar,
  CheckSquare,
  Clock,
  User,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { Message, MessageType } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

interface SmartSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ContentFilterType = 'all' | 'image' | 'document' | 'task_card' | 'schedule_card' | 'quick_ask';
type TimeFilterType = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month';

export const SmartSearchModal: React.FC<SmartSearchModalProps> = ({ isOpen, onClose }) => {
  const { messages, chats, setActiveChatId } = useApp();

  const [query, setQuery] = useState('');
  const [contentFilter, setContentFilter] = useState<ContentFilterType>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');

  // Flatten all messages across chats
  const allMessagesWithChat = useMemo(() => {
    const list: { message: Message; chatTitle: string }[] = [];
    Object.entries(messages).forEach(([chatId, msgList]) => {
      const chat = chats.find((c) => c.id === chatId);
      const chatTitle = chat ? chat.name : 'Percakapan';
      msgList.forEach((m) => {
        if (!m.isDeleted && m.type !== 'system') {
          list.push({ message: m, chatTitle });
        }
      });
    });
    return list;
  }, [messages, chats]);

  // Filter messages based on search parameters
  const searchResults = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;
    const thirtyDays = 30 * oneDay;

    return allMessagesWithChat.filter(({ message }) => {
      // Content filter
      if (contentFilter !== 'all') {
        if (contentFilter === 'image' && message.type !== 'image') return false;
        if (contentFilter === 'document' && message.type !== 'document') return false;
        if (contentFilter === 'task_card' && message.type !== 'task_card' && !message.taskData) return false;
        if (contentFilter === 'schedule_card' && message.type !== 'schedule_card' && !message.scheduleData) return false;
        if (contentFilter === 'quick_ask' && message.type !== 'quick_ask') return false;
      }

      // Time filter
      if (timeFilter !== 'all') {
        const diff = now - message.rawTimestamp;
        if (timeFilter === 'today' && diff > oneDay) return false;
        if (timeFilter === 'yesterday' && (diff < oneDay || diff > 2 * oneDay)) return false;
        if (timeFilter === 'this_week' && diff > sevenDays) return false;
        if (timeFilter === 'this_month' && diff > thirtyDays) return false;
      }

      // Query filter
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchText = message.content.toLowerCase().includes(q);
        const matchSender = message.senderName.toLowerCase().includes(q);
        const matchAttach = message.attachment?.name.toLowerCase().includes(q);
        const matchTask = message.taskData?.title.toLowerCase().includes(q);
        const matchSchedule = message.scheduleData?.title.toLowerCase().includes(q);
        return matchText || matchSender || matchAttach || matchTask || matchSchedule;
      }

      return true;
    }).sort((a, b) => b.message.rawTimestamp - a.message.rawTimestamp);
  }, [allMessagesWithChat, query, contentFilter, timeFilter]);

  const handleSelectResult = (chatId: string) => {
    setActiveChatId(chatId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pencarian Cerdas (Smart Search)"
      subtitle="Temukan pesan, foto, dokumen, tugas, dan jadwal berdasarkan konteks percakapan nyata"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Search input bar */}
        <div className="relative">
          <Sparkles className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 dark:text-purple-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kata kunci, nama orang, atau topik pembahasan..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />
        </div>

        {/* Filter Pills */}
        <div className="space-y-2">
          {/* Content Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Tipe:
            </span>
            {[
              { id: 'all', label: 'Semua Tipe' },
              { id: 'image', label: '📷 Foto' },
              { id: 'document', label: '📄 Dokumen' },
              { id: 'task_card', label: '✅ Tugas' },
              { id: 'schedule_card', label: '📅 Jadwal' },
              { id: 'quick_ask', label: '❓ Tanya Grup' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setContentFilter(tab.id as ContentFilterType)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  contentFilter === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Waktu:
            </span>
            {[
              { id: 'all', label: 'Semua Waktu' },
              { id: 'today', label: 'Hari ini' },
              { id: 'yesterday', label: 'Kemarin' },
              { id: 'this_week', label: 'Minggu ini' },
              { id: 'this_month', label: 'Bulan ini' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeFilter(tab.id as TimeFilterType)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  timeFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Hasil Pencarian:</span>
            <span>{searchResults.length} pesan ditemukan</span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                {allMessagesWithChat.length === 0
                  ? 'Belum ada data percakapan untuk dicari. Mulai percakapan baru untuk menggunakan fitur ini.'
                  : 'Tidak ada pesan yang sesuai dengan kriteria pencarian.'}
              </div>
            ) : (
              searchResults.map(({ message, chatTitle }) => (
                <div
                  key={message.id}
                  onClick={() => handleSelectResult(message.chatId)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#202C33] hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-[#00A884] dark:text-[#34D399]">
                        {chatTitle}
                      </span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {message.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-auto">
                        {formatRelativeTime(message.rawTimestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {message.content}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-2 mt-1.5">
                      {message.attachment && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                          {message.attachment.name}
                        </span>
                      )}
                      {message.taskData && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                          Tugas: {message.taskData.title}
                        </span>
                      )}
                      {message.scheduleData && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                          Jadwal: {message.scheduleData.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity self-center">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Search,
  ArrowRight,
  Trash2,
  Tag,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../ui/EmptyState';
import { formatRelativeTime } from '../../utils/formatters';

export const SavedMessagesView: React.FC = () => {
  const { messages, chats, setActiveChatId, setActiveDesktopSubTab, unsaveMessage } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Semua', 'Penting', 'Ide', 'Jadwal', 'Dokumen', 'Tugas'];

  // Flatten all saved messages across chats
  const savedMessagesList = useMemo(() => {
    const list: { message: any; chatTitle: string; chatId: string }[] = [];
    Object.entries(messages).forEach(([chatId, msgList]) => {
      const chat = chats.find((c) => c.id === chatId);
      const chatTitle = chat ? chat.name : 'Percakapan';
      msgList.forEach((m) => {
        if (m.savedCategory && !m.isDeleted) {
          list.push({ message: m, chatTitle, chatId });
        }
      });
    });
    return list;
  }, [messages, chats]);

  // Filter
  const filteredList = useMemo(() => {
    return savedMessagesList.filter(({ message, chatTitle }) => {
      if (selectedCategory !== 'Semua' && message.savedCategory !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText = message.content.toLowerCase().includes(q);
        const matchSender = message.senderName.toLowerCase().includes(q);
        const matchChat = chatTitle.toLowerCase().includes(q);
        return matchText || matchSender || matchChat;
      }
      return true;
    }).sort((a, b) => b.message.rawTimestamp - a.message.rawTimestamp);
  }, [savedMessagesList, selectedCategory, searchQuery]);

  const handleJumpToChat = (chatId: string) => {
    setActiveChatId(chatId);
    setActiveDesktopSubTab(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18191d] p-4 sm:p-6 select-none overflow-y-auto">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl neu-raised-circle text-[#ff4b4b]">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Pesan Tersimpan
              </h1>
              <p className="text-xs text-slate-400">
                Pesan yang kamu simpan berdasarkan kategori untuk rujukan cepat
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {savedMessagesList.length} pesan
          </span>
        </div>

        {/* Search & Category Tabs */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dalam pesan tersimpan..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#111B21] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white dark:bg-[#111B21] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of saved messages */}
        {filteredList.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={<Bookmark className="w-8 h-8" />}
              title="Belum ada pesan tersimpan"
              description="Sematkan dan simpan pesan penting, ide, jadwal, atau tugas dari chat apa pun untuk diakses cepat di sini."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {filteredList.map(({ message, chatTitle, chatId }) => (
              <div
                key={message.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 group hover:border-[#00A884] transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                      {message.savedCategory}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatRelativeTime(message.rawTimestamp)}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-[#00A884] dark:text-[#34D399]">
                    Dari: {chatTitle} ({message.senderName})
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed break-words">
                    {message.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => unsaveMessage(chatId, message.id)}
                    className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Simpanan</span>
                  </button>

                  <button
                    onClick={() => handleJumpToChat(chatId)}
                    className="text-xs text-[#00A884] dark:text-[#34D399] font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>Buka Chat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

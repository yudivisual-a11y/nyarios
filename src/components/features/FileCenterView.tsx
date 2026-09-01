import React, { useState, useMemo } from 'react';
import {
  FolderOpen,
  Image,
  Video,
  FileText,
  Music,
  Download,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatBytes, formatRelativeTime } from '../../utils/formatters';

export const FileCenterView: React.FC = () => {
  const { messages, chats, setActiveChatId, setActiveDesktopSubTab, setActiveNavTab } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'document' | 'audio'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all files (Photos, Videos, Documents, and Audio MP3) across all chats EXCLUDING Voice Notes
  const allFiles = useMemo(() => {
    const list: {
      id: string;
      name: string;
      size: number;
      type: 'image' | 'video' | 'document' | 'audio';
      url: string;
      chatId: string;
      chatTitle: string;
      senderName: string;
      rawTimestamp: number;
    }[] = [];

    Object.entries(messages).forEach(([chatId, msgList]) => {
      const chat = chats.find((c) => c.id === chatId);
      const chatTitle = chat ? chat.name : 'Percakapan';

      msgList.forEach((m) => {
        if (!m.isDeleted) {
          // 1. Explicit attachments
          if (m.attachment) {
            // Only add if not voice note
            if (m.attachment.type !== 'audio' || m.attachment.name.toLowerCase().endsWith('.mp3') || m.attachment.name.toLowerCase().endsWith('.wav')) {
              list.push({
                id: m.id,
                name: m.attachment.name,
                size: m.attachment.size,
                type: m.attachment.type as any,
                url: m.attachment.url,
                chatId,
                chatTitle,
                senderName: m.senderName,
                rawTimestamp: m.rawTimestamp,
              });
            }
          }
          // 2. Sent Image Messages
          else if (m.type === 'image') {
            list.push({
              id: m.id,
              name: m.fileName || m.caption || 'Foto_Percakapan.jpg',
              size: m.fileSize ? 150000 : 120000,
              type: 'image',
              url: m.content,
              chatId,
              chatTitle,
              senderName: m.senderName,
              rawTimestamp: m.rawTimestamp,
            });
          }
          // 2.5 Sent Video Messages
          else if (m.type === 'video') {
            list.push({
              id: m.id,
              name: m.fileName || m.caption || 'Video_Percakapan.mp4',
              size: m.fileSize ? 1200000 : 850000,
              type: 'video',
              url: m.content,
              chatId,
              chatTitle,
              senderName: m.senderName,
              rawTimestamp: m.rawTimestamp,
            });
          }
          // 3. Sent Document Messages
          else if (m.type === 'document') {
            list.push({
              id: m.id,
              name: m.fileName || 'Dokumen.pdf',
              size: 250000,
              type: 'document',
              url: m.content,
              chatId,
              chatTitle,
              senderName: m.senderName,
              rawTimestamp: m.rawTimestamp,
            });
          }
        }
      });
    });

    return list;
  }, [messages, chats]);

  const filteredFiles = useMemo(() => {
    return allFiles
      .filter((f) => {
        if (activeTab !== 'all' && f.type !== activeTab) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            f.name.toLowerCase().includes(q) ||
            f.chatTitle.toLowerCase().includes(q) ||
            f.senderName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.rawTimestamp - a.rawTimestamp);
  }, [allFiles, activeTab, searchQuery]);

  const handleJumpToChat = (chatId: string) => {
    setActiveChatId(chatId);
    setActiveNavTab('home');
    setActiveDesktopSubTab(null);
  };

  const handleDownload = (file: { name: string; url: string }) => {
    const link = document.createElement('a');
    link.href = file.url.startsWith('data:')
      ? file.url
      : `data:text/plain;charset=utf-8,${encodeURIComponent(file.url)}`;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18191d] p-4 sm:p-6 select-none overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl neu-raised-circle text-[#ff4b4b]">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                File Center
              </h1>
              <p className="text-xs text-slate-400">
                Pusat berkas media, foto, dokumen, dan audio musik MP3
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full neu-raised text-[#ff4b4b] border border-white/5">
            {allFiles.length} berkas
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama berkas, pengirim, atau chat..."
              className="w-full pl-10 pr-4 py-2.5 neu-inset border border-white/5 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff4b4b]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'Semua Berkas' },
              { id: 'image', label: '📷 Foto' },
              { id: 'video', label: '🎥 Video' },
              { id: 'document', label: '📄 Dokumen' },
              { id: 'audio', label: '🎵 Audio Musik (MP3)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                  activeTab === tab.id
                    ? 'neu-coral-btn text-white shadow-md shadow-[#ff4b4b]/30'
                    : 'neu-raised text-slate-300 hover:text-white border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of files */}
        {filteredFiles.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-8 neu-flat rounded-3xl border border-white/5">
            <div className="w-16 h-16 rounded-full neu-raised flex items-center justify-center mb-3 text-slate-500">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Belum ada berkas tersimpan
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Semua foto, video, dokumen, dan berkas audio musik yang dikirim dalam obrolan akan tersusun rapi di sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 rounded-3xl bg-[#1e2025] neu-raised border border-white/5 shadow-sm flex flex-col justify-between space-y-3 hover:border-[#ff4b4b]/40 transition-all"
              >
                {/* Thumbnail if image */}
                {file.type === 'image' && file.url !== '#' ? (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-[#18191d] mb-1">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-2xl neu-inset text-[#ff4b4b] flex items-center justify-center mb-1">
                    {file.type === 'document' && <FileText className="w-5 h-5" />}
                    {file.type === 'audio' && <Music className="w-5 h-5" />}
                    {file.type === 'video' && <Video className="w-5 h-5" />}
                  </div>
                )}

                <div className="space-y-1 min-w-0">
                  <h4
                    className="text-xs sm:text-sm font-bold text-white truncate"
                    title={file.name}
                  >
                    {file.name}
                  </h4>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span>{formatBytes(file.size)}</span>
                    <span>{formatRelativeTime(file.rawTimestamp)}</span>
                  </div>
                  <div className="text-[11px] text-[#ff6b6b] font-semibold truncate">
                    {file.chatTitle} • {file.senderName}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleDownload(file)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh</span>
                  </button>

                  <button
                    onClick={() => handleJumpToChat(file.chatId)}
                    className="text-xs text-[#ff4b4b] hover:text-[#ff6b6b] font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>Lihat di Chat</span>
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

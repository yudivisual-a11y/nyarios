import React, { useState } from 'react';
import { Users2, Plus, MessageSquare, Megaphone, ChevronRight, Hash } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const CommunityView: React.FC = () => {
  const {
    communities,
    createCommunity,
    chats,
    setActiveChatId,
    setActiveNavTab,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commName, setCommName] = useState('');
  const [commDesc, setCommDesc] = useState('');
  const [error, setError] = useState('');

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName.trim()) {
      setError('Nama komunitas wajib diisi.');
      return;
    }

    createCommunity(commName.trim(), commDesc.trim(), [
      { name: `${commName.trim()} — Informasi`, category: 'Informasi' },
      { name: `${commName.trim()} — Diskusi Umum`, category: 'Diskusi' },
      { name: `${commName.trim()} — Kegiatan & Acara`, category: 'Kegiatan' },
    ]);

    setCommName('');
    setCommDesc('');
    setError('');
    setIsModalOpen(false);
  };

  const handleOpenSubGroup = (chatId: string) => {
    setActiveChatId(chatId);
    setActiveNavTab('pesan');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18191d] p-4 sm:p-6 select-none overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-5">
        {/* Top Header - Only 1 primary action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl neu-raised-circle text-[#ff4b4b]">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Komunitas
              </h1>
              <p className="text-xs text-slate-400">
                Pusat kolaborasi untuk menghubungkan banyak grup dalam satu wadah
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Buat Komunitas
          </Button>
        </div>

        {/* Communities List or Clean Empty State without duplicate button */}
        {communities.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-8 neu-flat rounded-3xl border border-white/5">
            <div className="w-16 h-16 rounded-full neu-raised flex items-center justify-center mb-3 text-[#ff4b4b]">
              <Users2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Belum ada komunitas aktif
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Hubungkan beberapa grup dan kelola kanal pengumuman, diskusi, dan kegiatan dalam satu wadah komunitas terpadu.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {communities.map((comm) => {
              const subGroupChats = chats.filter((c) => comm.subGroupIds.includes(c.id));
              return (
                <div
                  key={comm.id}
                  className="rounded-3xl bg-[#1e2025] neu-raised border border-white/5 shadow-sm overflow-hidden"
                >
                  {/* Community Banner / Header */}
                  <div className="p-4 bg-gradient-to-r from-[#2a2d35] to-[#202227] text-white border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl neu-raised text-[#ff4b4b] flex items-center justify-center font-black text-lg border border-white/5">
                          {comm.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-base font-bold tracking-tight text-white">{comm.name}</h2>
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {comm.description || 'Komunitas terintegrasi NYARIOS'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full neu-raised text-slate-300 font-semibold border border-white/5">
                        {subGroupChats.length} Grup
                      </span>
                    </div>

                    {/* Announcement if any */}
                    {comm.announcement && (
                      <div className="mt-3 p-2.5 rounded-xl bg-[#18191d] text-xs flex items-center gap-2 border border-white/5">
                        <Megaphone className="w-4 h-4 shrink-0 text-amber-400" />
                        <span className="truncate text-slate-300">{comm.announcement}</span>
                      </div>
                    )}
                  </div>

                  {/* Sub Groups Channels List */}
                  <div className="p-2 divide-y divide-white/[0.04]">
                    {subGroupChats.map((subChat) => (
                      <div
                        key={subChat.id}
                        onClick={() => handleOpenSubGroup(subChat.id)}
                        className="p-3 rounded-2xl hover:bg-[#25282e] flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl neu-inset flex items-center justify-center text-slate-400 group-hover:text-[#ff4b4b]">
                            {subChat.groupCategory === 'Informasi' ? (
                              <Megaphone className="w-4 h-4 text-emerald-400" />
                            ) : subChat.groupCategory === 'Kegiatan' ? (
                              <Hash className="w-4 h-4 text-blue-400" />
                            ) : (
                              <MessageSquare className="w-4 h-4 text-[#ff4b4b]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-200 group-hover:text-white block truncate">
                              {subChat.name}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate block">
                              {subChat.lastMessage?.text || 'Kanal grup komunitas'}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Komunitas Baru"
        subtitle="Hubungkan grup-grup terkait di bawah satu payung komunitas"
      >
        <form onSubmit={handleCreateCommunity} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/50 text-rose-300 text-xs font-semibold border border-rose-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nama Komunitas <span className="text-[#ff4b4b]">*</span>
            </label>
            <input
              type="text"
              value={commName}
              onChange={(e) => setCommName(e.target.value)}
              placeholder="Contoh: Warga RT 05, Komunitas Developer, dll."
              className="w-full px-3.5 py-2.5 neu-inset border border-white/5 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff4b4b]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Deskripsi Komunitas
            </label>
            <textarea
              value={commDesc}
              onChange={(e) => setCommDesc(e.target.value)}
              rows={2}
              placeholder="Jelaskan tujuan atau informasi umum komunitas ini..."
              className="w-full px-3.5 py-2.5 neu-inset border border-white/5 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff4b4b] resize-none"
            />
          </div>

          <div className="p-3 rounded-2xl neu-inset border border-white/5 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Kanal otomatis yang dibuat:</span>
            <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
              <li>Kanal Informasi (Pengumuman resmi)</li>
              <li>Kanal Diskusi Umum (Obrolan anggota)</li>
              <li>Kanal Kegiatan & Acara (Koordinasi agenda)</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Buat Komunitas
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

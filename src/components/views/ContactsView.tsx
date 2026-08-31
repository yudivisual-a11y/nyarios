import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  MessageSquare,
  Phone,
  Video,
  QrCode,
  Sparkles,
  X,
  PhoneCall,
  Check,
  BookUser,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { sound } from '../../utils/sound';
import { useHistoryBack } from '../../utils/useHistoryBack';
import { ContactPerson } from '../../types';

export const ContactsView: React.FC = () => {
  const {
    chats,
    setActiveChatId,
    setActiveNavTab,
    createDirectChat,
    startCall,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactBio, setNewContactBio] = useState('Menggunakan NYARIOS');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom contacts list stored in state / synced from direct chats
  const [customContacts, setCustomContacts] = useState<ContactPerson[]>(() => {
    // Derive initial contacts from existing direct chats
    const directChats = chats.filter((c) => !c.isGroup);
    return directChats.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone || '+62 812-xxxx-xxxx',
      bio: c.bio || 'Ada di NYARIOS',
      avatar: c.avatar,
      isOnline: true,
      chatId: c.id,
    }));
  });

  useHistoryBack(isAddModalOpen, () => setIsAddModalOpen(false), 'add_contact_modal');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleStartChatWithContact = (contact: ContactPerson) => {
    sound.playTap();
    if (contact.chatId) {
      setActiveChatId(contact.chatId);
      setActiveNavTab('pesan');
    } else {
      createDirectChat(contact.name, contact.phone || '+62 812-0000-0000');
      setActiveNavTab('pesan');
    }
  };

  const handleVoiceCall = (contact: ContactPerson) => {
    sound.playVoiceTone(800);
    startCall(contact.name, contact.avatar, 'voice');
  };

  const handleVideoCall = (contact: ContactPerson) => {
    sound.playVoiceTone(800);
    startCall(contact.name, contact.avatar, 'video');
  };

  const handleAddNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const phoneFormatted = newContactPhone.trim() || '+62 812-0000-0000';
    const newPerson: ContactPerson = {
      id: `contact_${Date.now()}`,
      name: newContactName.trim(),
      phone: phoneFormatted,
      bio: newContactBio.trim() || 'Menggunakan NYARIOS',
      isOnline: true,
    };

    setCustomContacts((prev) => [newPerson, ...prev]);
    createDirectChat(newPerson.name, newPerson.phone);
    sound.playMessageSent();
    setIsAddModalOpen(false);
    setNewContactName('');
    setNewContactPhone('');
    showToast(`✓ Kontak "${newPerson.name}" berhasil disimpan!`);
  };

  const filteredContacts = customContacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.bio && c.bio.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18191d] select-none overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold shadow-2xl animate-slide-up">
          {toastMessage}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 pt-6 pb-24 md:pb-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl neu-raised-circle text-[#ff4b4b] shadow-md">
              <BookUser className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Daftar Kontak</span>
              </h1>
              <p className="text-xs text-slate-400">
                Semua teman, keluarga, dan rekan terhubung di NYARIOS
              </p>
            </div>
          </div>

          {/* Action Button: Tambah Kontak */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl neu-coral-btn flex items-center gap-2 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#ff4b4b]/30"
          >
            <UserPlus className="w-4 h-4 font-bold" />
            <span>Tambah Kontak</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau nomor HP kontak..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl neu-inset bg-[#18191d] text-xs text-white placeholder:text-slate-500 outline-none border border-white/5 focus:border-[#ff4b4b] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Menu Cards */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="p-3.5 rounded-2xl bg-[#1e2025] neu-raised border border-white/5 flex items-center gap-3 hover:scale-[1.02] transition-transform text-left"
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#ff4b4b] to-[#ff8533] text-white shadow-md">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Kontak Baru</h4>
              <p className="text-[10px] text-slate-400">Simpan nomor baru</p>
            </div>
          </button>

          <div className="p-3.5 rounded-2xl bg-[#1e2025] neu-raised border border-white/5 flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Privasi Kontak</h4>
              <p className="text-[10px] text-slate-400">Terenkripsi aman</p>
            </div>
          </div>
        </div>

        {/* Contacts List Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Semua Kontak ({filteredContacts.length})
            </h3>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#1e2025] neu-raised border border-white/5 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-full neu-inset flex items-center justify-center text-slate-500 shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  {searchQuery ? 'Kontak Tidak Ditemukan' : 'Belum Ada Kontak Tersimpan'}
                </h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  {searchQuery
                    ? `Tidak ada kontak yang cocok dengan kata kunci "${searchQuery}"`
                    : 'Tambahkan kontak teman pertama Anda untuk mulai mengobrol!'}
                </p>
              </div>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-2xl neu-coral-btn text-white text-xs font-bold shadow-lg shadow-[#ff4b4b]/30 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tambah Kontak Sekarang</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3.5 rounded-2xl bg-[#1e2025] neu-raised border border-white/5 flex items-center justify-between hover:bg-[#24272e] transition-all group shadow-sm"
                >
                  {/* Contact Info */}
                  <div
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                    onClick={() => handleStartChatWithContact(contact)}
                  >
                    <Avatar
                      name={contact.name}
                      src={contact.avatar}
                      size="md"
                      isOnline={contact.isOnline}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#ff6b6b] transition-colors truncate">
                        {contact.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {contact.phone}
                      </p>
                      {contact.bio && (
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {contact.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {/* Chat Button */}
                    <button
                      type="button"
                      onClick={() => handleStartChatWithContact(contact)}
                      className="p-2.5 rounded-xl neu-raised text-slate-300 hover:text-[#ff4b4b] hover:scale-105 active:scale-95 transition-all"
                      title="Kirim Pesan Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    {/* Voice Call Button */}
                    <button
                      type="button"
                      onClick={() => handleVoiceCall(contact)}
                      className="p-2.5 rounded-xl neu-raised text-slate-300 hover:text-emerald-400 hover:scale-105 active:scale-95 transition-all"
                      title="Panggilan Suara"
                    >
                      <Phone className="w-4 h-4" />
                    </button>

                    {/* Video Call Button */}
                    <button
                      type="button"
                      onClick={() => handleVideoCall(contact)}
                      className="p-2.5 rounded-xl neu-raised text-slate-300 hover:text-blue-400 hover:scale-105 active:scale-95 transition-all"
                      title="Panggilan Video"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: TAMBAH KONTAK BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 p-4 bg-black/80 backdrop-blur-md flex items-center justify-center select-none animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#1e2025] neu-raised border border-white/10 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg neu-coral-btn text-white">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Tambah Kontak Baru</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewContact} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full px-4 py-2.5 rounded-xl neu-inset bg-[#18191d] text-xs text-white placeholder:text-slate-500 outline-none border border-white/5 focus:border-[#ff4b4b]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Nomor HP</label>
                <input
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="Contoh: +62 812-3456-7890"
                  className="w-full px-4 py-2.5 rounded-xl neu-inset bg-[#18191d] text-xs text-white placeholder:text-slate-500 outline-none border border-white/5 focus:border-[#ff4b4b]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Info / Bio (Opsional)</label>
                <input
                  type="text"
                  value={newContactBio}
                  onChange={(e) => setNewContactBio(e.target.value)}
                  placeholder="Menggunakan NYARIOS"
                  className="w-full px-4 py-2.5 rounded-xl neu-inset bg-[#18191d] text-xs text-white placeholder:text-slate-500 outline-none border border-white/5 focus:border-[#ff4b4b]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-raised text-xs font-bold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-coral-btn text-xs font-bold text-white shadow-md"
                >
                  Simpan Kontak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

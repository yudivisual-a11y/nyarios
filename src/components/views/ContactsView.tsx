import React, { useState, useMemo } from 'react';
import {
  Users,
  User,
  Search,
  UserPlus,
  MessageSquare,
  Phone,
  Video,
  QrCode,
  X,
  Check,
  AtSign,
  Copy,
  Trash2,
  Scan,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { UserProfileModal } from './UserProfileModal';
import { sound } from '../../utils/sound';
import { useHistoryBack } from '../../utils/useHistoryBack';
import { ContactPerson } from '../../types';
import { normalizeUsername } from '../../utils/cloudSync';
import { UserQrModal } from '../modals/UserQrModal';
import { QrScannerModal } from '../modals/QrScannerModal';

export const ContactsView: React.FC = () => {
  const {
    contacts,
    addContact,
    deleteContact,
    chats,
    setActiveChatId,
    setActiveNavTab,
    createDirectChatWithUsername,
    startCall,
    currentUser,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [newContactUsername, setNewContactUsername] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactBio, setNewContactBio] = useState('Menggunakan NYARIOS');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useHistoryBack(isAddModalOpen, () => setIsAddModalOpen(false), 'add_contact_modal');
  useHistoryBack(isQrModalOpen, () => setIsQrModalOpen(false), 'qr_modal');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleStartChatWithContact = (contact: ContactPerson) => {
    sound.playTap();
    const cleanUser = contact.username ? normalizeUsername(contact.username) : '';
    const existingChat = chats.find(
      (c) =>
        (cleanUser && c.username && normalizeUsername(c.username) === cleanUser) ||
        c.id === contact.id
    );

    if (existingChat) {
      setActiveChatId(existingChat.id);
      setActiveNavTab('pesan');
    } else {
      createDirectChatWithUsername(
        contact.username || `@${contact.name.toLowerCase().replace(/\s+/g, '_')}`,
        contact.name
      );
      setActiveNavTab('pesan');
    }
  };

  const handleVoiceCall = (contact: ContactPerson) => {
    sound.playVoiceTone(800);
    startCall(contact.name, contact.avatar, 'voice', contact.username || contact.phone);
  };

  const handleVideoCall = (contact: ContactPerson) => {
    sound.playVoiceTone(800);
    startCall(contact.name, contact.avatar, 'video', contact.username || contact.phone);
  };

  const handleAddNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = newContactUsername.replace(/^@+/, '').trim().toLowerCase();
    if (!cleanUser) {
      showToast('⚠ Masukkan username teman (contoh: @acepyudi)');
      return;
    }

    const formattedUsername = `@${cleanUser}`;
    const displayName = newContactName.trim() || cleanUser;

    const newPerson: ContactPerson = {
      id: `contact_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: displayName,
      username: formattedUsername,
      bio: newContactBio.trim() || 'Teman di NYARIOS',
      isOnline: true,
    };

    addContact(newPerson);
    createDirectChatWithUsername(formattedUsername, displayName);
    sound.playMessageSent();
    setIsAddModalOpen(false);
    setNewContactUsername('');
    setNewContactName('');
    showToast(`✓ Kontak "${displayName}" (@${cleanUser}) berhasil ditambahkan!`);
  };

  const handleCopyMyUsername = () => {
    const textToCopy = currentUser.username || `@${currentUser.name.toLowerCase().replace(/\s+/g, '_')}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      showToast(`✓ Username ${textToCopy} disalin ke clipboard!`);
      sound.playTap();
    }
  };

  // Contacts are strictly isolated to the logged-in user!
  const allContactsList = useMemo(() => {
    const map = new Map<string, ContactPerson>();

    // 1. Manually added / saved contacts for this user account
    contacts.forEach((c) => {
      const key = c.username ? normalizeUsername(c.username) : c.id;
      map.set(key, c);
    });

    // 2. Direct chats present in this user account
    const directChats = chats.filter((c) => !c.isGroup);
    directChats.forEach((c) => {
      const uKey = c.username ? normalizeUsername(c.username) : c.id;
      if (!map.has(uKey)) {
        map.set(uKey, {
          id: c.id,
          name: c.name,
          username: c.username || `@${c.name.toLowerCase().replace(/\s+/g, '_')}`,
          phone: c.phone,
          bio: c.bio || 'Ada di NYARIOS',
          avatar: c.avatar,
          isOnline: true,
          chatId: c.id,
        });
      }
    });

    return Array.from(map.values());
  }, [contacts, chats]);

  const filteredContacts = allContactsList.filter((c) => {
    const q = searchQuery.toLowerCase().replace(/^@+/, '');
    const cUser = c.username ? normalizeUsername(c.username) : '';
    return (
      c.name.toLowerCase().includes(q) ||
      cUser.includes(q) ||
      (c.bio && c.bio.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary,#18191d)] text-[var(--text-primary,#f8fafc)] select-none overflow-hidden transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--color-accent-from,#ff5757)] to-[var(--color-accent-to,#e63939)] text-white font-bold text-xs shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="p-4 sm:p-6 bg-[var(--bg-surface,#1e2025)] border-b border-[var(--border-color,rgba(255,255,255,0.05))] shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl neu-raised text-[var(--color-accent-primary,#ff4b4b)] flex items-center justify-center font-black shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[var(--text-primary,#f8fafc)]">
                Buku Kontak & Teman
              </h1>
              <p className="text-xs text-[var(--text-secondary,#94a3b8)] font-medium">
                Temukan & tambah teman via <span className="font-bold text-[var(--color-accent-primary,#ff4b4b)]">@username</span> bebas nomor HP
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsScannerModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--color-accent-from,#ff5757)] to-[var(--color-accent-to,#e63939)] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[var(--color-accent-shadow,rgba(255,75,75,0.3))] transition-all cursor-pointer active:scale-95"
              title="Pindai Kode QR Teman"
            >
              <Scan className="w-4 h-4" />
              <span>Pindai QR</span>
            </button>

            <button
              onClick={() => setIsQrModalOpen(true)}
              className="px-3.5 py-2 rounded-xl neu-raised hover:bg-[var(--bg-card,#23262c)] text-[var(--text-primary,#f8fafc)] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="ID & QR Code Saya"
            >
              <QrCode className="w-4 h-4 text-[var(--color-accent-primary,#ff4b4b)]" />
              <span>QR Saya</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl neu-raised hover:bg-[var(--bg-card,#23262c)] text-[var(--text-primary,#f8fafc)] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-[var(--color-accent-primary,#ff4b4b)]" />
              <span>+ Username</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mt-4 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary,#94a3b8)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari teman via @username atau nama..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-inset,#141518)] neu-sunken text-xs sm:text-sm text-[var(--text-primary,#f8fafc)] placeholder:text-[var(--text-secondary,#94a3b8)] outline-none border border-[var(--border-color,rgba(255,255,255,0.06))] focus:border-[var(--color-accent-primary,#ff4b4b)] transition-all"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* User's Own ID Card Banner */}
          <div className="p-4 rounded-3xl neu-flat bg-[var(--bg-surface,#1e2025)] border border-[var(--border-color,rgba(255,255,255,0.06))] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Avatar name={currentUser.name} src={currentUser.avatar} size="md" />
              <div>
                <p className="text-[11px] text-[var(--color-accent-primary,#ff4b4b)] font-bold uppercase tracking-wider">
                  Username Anda untuk dibagikan:
                </p>
                <p className="text-base font-black font-mono text-[var(--text-primary,#f8fafc)]">
                  {currentUser.username || `@${currentUser.name.toLowerCase().replace(/\s+/g, '_')}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl neu-raised hover:bg-[var(--bg-card,#23262c)] text-[var(--text-primary,#f8fafc)] font-bold text-xs flex items-center justify-center gap-1.5 border border-[var(--border-color,rgba(255,255,255,0.06))] transition-all cursor-pointer shadow-sm active:scale-95"
                title="Tampilkan QR Saya"
              >
                <QrCode className="w-3.5 h-3.5 text-[var(--color-accent-primary,#ff4b4b)]" />
                <span>Lihat QR</span>
              </button>
              <button
                onClick={handleCopyMyUsername}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl neu-raised hover:bg-[var(--bg-card,#23262c)] text-[var(--text-primary,#f8fafc)] font-bold text-xs flex items-center justify-center gap-1.5 border border-[var(--border-color,rgba(255,255,255,0.06))] transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Copy className="w-3.5 h-3.5 text-[var(--color-accent-primary,#ff4b4b)]" />
                <span>Salin Username</span>
              </button>
            </div>
          </div>

          {/* Contact List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary,#94a3b8)] px-1">
              <span>Semua Kontak ({filteredContacts.length})</span>
              <span className="text-[10px] text-[var(--color-accent-primary,#ff4b4b)] font-semibold">Terkoneksi Cloud</span>
            </div>

            {filteredContacts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl neu-flat bg-[var(--bg-surface,#1e2025)] border border-[var(--border-color,rgba(255,255,255,0.05))] space-y-3 shadow-sm">
                <div className="w-16 h-16 rounded-full neu-raised text-[var(--color-accent-primary,#ff4b4b)] mx-auto flex items-center justify-center font-bold">
                  <AtSign className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary,#f8fafc)]">
                  {searchQuery ? 'Kontak Tidak Ditemukan' : 'Belum Ada Teman Terdaftar'}
                </h3>
                <p className="text-xs text-[var(--text-secondary,#94a3b8)] max-w-sm mx-auto">
                  {searchQuery
                    ? `Tidak ada teman dengan username "${searchQuery}". Klik tombol Tambah di atas untuk mulai chat!`
                    : 'Ajak teman Anda bergabung dengan membagikan @username Anda, atau tambahkan @username teman di tombol atas!'}
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-accent-from,#ff5757)] to-[var(--color-accent-to,#e63939)] text-white font-bold text-xs shadow-md shadow-[var(--color-accent-shadow,rgba(255,75,75,0.3))] hover:brightness-110 transition-all cursor-pointer active:scale-95"
                >
                  + Tambah @Username Teman
                </button>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3.5 sm:p-4 rounded-2xl neu-flat bg-[var(--bg-card,#23262c)] border border-[var(--border-color,rgba(255,255,255,0.04))] hover:border-[var(--color-accent-primary,#ff4b4b)]/30 transition-all flex items-center justify-between gap-3 shadow-sm hover:shadow-md group"
                >
                  {/* Left: Avatar & Info */}
                  <div
                    onClick={() => handleStartChatWithContact(contact)}
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <Avatar name={contact.name} src={contact.avatar} size="md" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--bg-card,#23262c)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[var(--text-primary,#f8fafc)] truncate flex items-center gap-2">
                        <span>{contact.name}</span>
                        {contact.username && (
                          <span className="text-xs font-mono font-bold text-[var(--color-accent-primary,#ff4b4b)] bg-[var(--bg-surface,#1e2025)] neu-sunken px-2 py-0.5 rounded-md border border-[var(--border-color,rgba(255,255,255,0.05))]">
                            {contact.username}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary,#94a3b8)] truncate mt-0.5">
                        {contact.bio || 'Aktif di NYARIOS'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleVoiceCall(contact)}
                      className="p-2.5 rounded-xl neu-raised hover:text-[var(--color-accent-primary,#ff4b4b)] text-[var(--text-secondary,#94a3b8)] transition-all cursor-pointer active:scale-95"
                      title="Panggilan Suara"
                    >
                      <Phone className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleVideoCall(contact)}
                      className="p-2.5 rounded-xl neu-raised hover:text-[var(--color-accent-primary,#ff4b4b)] text-[var(--text-secondary,#94a3b8)] transition-all cursor-pointer active:scale-95"
                      title="Panggilan Video HD"
                    >
                      <Video className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setViewProfileId(contact.id)}
                      className="px-3.5 py-2 rounded-xl neu-raised text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Profil</span>
                    </button>
                    <button
                      onClick={() => handleStartChatWithContact(contact)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--color-accent-from,#ff5757)] to-[var(--color-accent-to,#e63939)] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[var(--color-accent-shadow,rgba(255,75,75,0.3))] transition-all cursor-pointer active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Kirim Pesan</span>
                    </button>

                    {contact.id.startsWith('contact_') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Hapus kontak "${contact.name}"?`)) {
                            deleteContact(contact.id);
                            showToast(`Kontak "${contact.name}" dihapus`);
                          }
                        }}
                        className="p-2 rounded-xl neu-raised hover:text-rose-500 text-[var(--text-secondary,#94a3b8)] transition-all cursor-pointer active:scale-95 opacity-70 group-hover:opacity-100"
                        title="Hapus dari Kontak"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: TAMBAH KONTAK VIA @USERNAME */}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="w-full max-w-md rounded-3xl neu-flat bg-[var(--bg-surface,#1e2025)] border border-[var(--border-color,rgba(255,255,255,0.1))] p-6 space-y-5 shadow-2xl relative animate-slide-up">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full neu-raised text-[var(--text-secondary,#94a3b8)] hover:text-[var(--text-primary,#f8fafc)]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl neu-raised text-[var(--color-accent-primary,#ff4b4b)] flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary,#f8fafc)]">
                  Tambah Teman via @Username
                </h3>
                <p className="text-xs text-[var(--text-secondary,#94a3b8)]">
                  Cukup ketik username teman untuk langsung terhubung
                </p>
              </div>
            </div>

            <form onSubmit={handleAddNewContact} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary,#94a3b8)]">
                  Username Teman (@)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[var(--color-accent-primary,#ff4b4b)] font-bold text-xs">@</span>
                  <input
                    type="text"
                    required
                    value={newContactUsername.replace(/^@+/, '')}
                    onChange={(e) =>
                      setNewContactUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))
                    }
                    placeholder="contoh_username"
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl neu-sunken bg-[var(--bg-inset,#141518)] text-xs text-[var(--text-primary,#f8fafc)] placeholder:text-[var(--text-secondary,#94a3b8)] outline-none border border-[var(--border-color,rgba(255,255,255,0.06))] focus:border-[var(--color-accent-primary,#ff4b4b)] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary,#94a3b8)]">
                  Nama Tampilan Kontak (Opsional)
                </label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Misal: Acep Yudi"
                  className="w-full px-4 py-2.5 rounded-2xl neu-sunken bg-[var(--bg-inset,#141518)] text-xs text-[var(--text-primary,#f8fafc)] placeholder:text-[var(--text-secondary,#94a3b8)] outline-none border border-[var(--border-color,rgba(255,255,255,0.06))] focus:border-[var(--color-accent-primary,#ff4b4b)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary,#94a3b8)]">
                  Catatan / Status Kontak
                </label>
                <input
                  type="text"
                  value={newContactBio}
                  onChange={(e) => setNewContactBio(e.target.value)}
                  placeholder="Misal: Teman kantor / Teman kuliah"
                  className="w-full px-4 py-2.5 rounded-2xl neu-sunken bg-[var(--bg-inset,#141518)] text-xs text-[var(--text-primary,#f8fafc)] placeholder:text-[var(--text-secondary,#94a3b8)] outline-none border border-[var(--border-color,rgba(255,255,255,0.06))] focus:border-[var(--color-accent-primary,#ff4b4b)]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-accent-from,#ff5757)] to-[var(--color-accent-to,#e63939)] hover:brightness-110 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-accent-shadow,rgba(255,75,75,0.3))] transition-all cursor-pointer mt-2 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Simpan & Buka Obrolan</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: KODE QR SAYA (HD GENERATOR & DOWNLOAD) */}
      {/* ============================================================ */}
      <UserQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onOpenScanner={() => setIsScannerModalOpen(true)}
      />

      {/* ============================================================ */}
      {/* MODAL: PEMINDAI QR KAMERA & GALERI */}
      {/* ============================================================ */}
      <QrScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onOpenMyQr={() => setIsQrModalOpen(true)}
      />
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  User,
  Settings,
  Shield,
  Bell,
  Trash2,
  Check,
  Camera,
  LogOut,
  Palette,
  ChevronRight,
  ArrowLeft,
  QrCode,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { TransparentLogo } from '../brand/TransparentLogo';
import { THEME_PRESETS } from '../../utils/themePresets';
import { UserQrModal } from '../modals/UserQrModal';

export const ProfileSettingsView: React.FC = () => {
  const {
    currentUser,
    updateUserProfile,
    accentTheme,
    setAccentTheme,
    chats,
    messages,
    tasks,
    schedules,
    logout,
  } = useApp();

  const [subView, setSubView] = useState<'main' | 'theme'>('main');
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentThemeObj =
    THEME_PRESETS.find((t) => t.id === accentTheme) || THEME_PRESETS[0];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(name.trim() || 'Saya', bio.trim() || 'Menggunakan NYARIOS', avatar);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setAvatar(res);
      updateUserProfile(name.trim() || 'Saya', bio.trim() || 'Menggunakan NYARIOS', res);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleClearData = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin menghapus semua data percakapan dan pengaturan lokal? Aplikasi akan kembali ke kondisi awal.'
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const totalMessages = Object.values(messages).reduce((acc, list) => acc + list.length, 0);

  // 1. SUBVIEW: TEMA TAMPILAN
  if (subView === 'theme') {
    return (
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary,#18191d)] text-[var(--text-primary,#f8fafc)] p-4 sm:p-6 select-none overflow-y-auto animate-fade-in">
        <div className="max-w-2xl mx-auto w-full space-y-6 pb-24 md:pb-8">
          {/* Header with Back Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSubView('main')}
              className="p-2.5 rounded-2xl neu-raised-circle text-[var(--text-secondary,#94a3b8)] hover:text-[var(--text-primary,#f8fafc)] transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary,#f8fafc)] tracking-tight">
                Tema Tampilan
              </h1>
              <p className="text-xs text-[var(--text-secondary,#94a3b8)]">
                Pilih tema warna latar dan nuansa visual aplikasi ({THEME_PRESETS.length} Pilihan)
              </p>
            </div>
          </div>

          {/* Theme Presets Grid */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface,#1e2025)] neu-raised border border-[var(--border-color,rgba(255,255,255,0.06))] space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {THEME_PRESETS.map((t) => {
                const isSelected = accentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAccentTheme(t.id)}
                    className={`p-3 rounded-2xl text-left border transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'neu-raised border-[var(--color-accent-primary,#ff4b4b)] ring-2 ring-[var(--color-accent-primary,#ff4b4b)]/40 scale-[1.02]'
                        : 'bg-[var(--bg-card,#23262c)] border-[var(--border-color,rgba(255,255,255,0.05))] hover:border-[var(--border-color,rgba(255,255,255,0.2))]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div
                        className="w-8 h-8 rounded-xl shadow-md flex items-center justify-center text-white font-bold transition-transform group-hover:scale-110"
                        style={{ background: t.previewGradient }}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: t.primary }}
                          />
                        )}
                      </div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-[var(--text-secondary,#94a3b8)]">
                        {t.category}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[var(--text-primary,#f8fafc)] truncate">
                      {t.name}
                    </h4>
                    <p className="text-[10px] text-[var(--text-secondary,#94a3b8)] truncate mt-0.5">
                      {t.isLight ? 'Latar Terang' : 'Latar Gelap'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN SETTINGS VIEW
  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary,#18191d)] text-[var(--text-primary,#f8fafc)] p-4 sm:p-6 select-none overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full space-y-5 pb-24 md:pb-8">
        {/* Hidden Avatar Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />

        {/* Top Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl neu-raised-circle text-[var(--color-accent-primary,#ff4b4b)]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary,#f8fafc)] tracking-tight">
              Pengaturan & Profil
            </h1>
            <p className="text-xs text-[var(--text-secondary,#94a3b8)]">
              Kelola profil akun, tema warna, dan preferensi aplikasi
            </p>
          </div>
        </div>

        {/* 1. Profile Section Card */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface,#1e2025)] neu-raised border border-[var(--border-color,rgba(255,255,255,0.06))] space-y-5">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar with Camera Overlay */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar name={name || 'Saya'} src={avatar} size="xl" isOnline={true} />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-6 h-6" />
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-r from-[var(--color-accent-from,#ff5757)] to-[var(--color-accent-to,#e63939)] text-white shadow-lg"
                title="Ubah Foto Profil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0 space-y-1">
              <h2 className="text-lg font-bold text-[var(--text-primary,#f8fafc)] truncate">
                {name || 'Pengguna NYARIOS'}
              </h2>
              <p className="text-xs text-[var(--text-secondary,#94a3b8)] truncate">
                {bio || 'Menggunakan NYARIOS'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {currentUser.username && (
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-[var(--color-accent-glow,rgba(255,75,75,0.15))] text-[var(--color-accent-primary,#ff4b4b)] border border-[var(--color-accent-primary,#ff4b4b)]/30 font-bold">
                    {currentUser.username}
                  </span>
                )}
                {currentUser.phone && (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#18191d] text-slate-400 border border-white/5 font-semibold">
                    {currentUser.phone}
                  </span>
                )}
                {currentUser.email && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#18191d] text-slate-400 border border-white/5">
                    {currentUser.email}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="text-[11px] px-3 py-1 rounded-full neu-raised hover:bg-[var(--bg-card,#23262c)] text-[var(--text-primary,#f8fafc)] font-bold flex items-center gap-1.5 border border-[var(--border-color,rgba(255,255,255,0.06))] transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <QrCode className="w-3.5 h-3.5 text-[var(--color-accent-primary,#ff4b4b)]" />
                  <span>Kode QR Saya</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form Editor */}
          <form onSubmit={handleSaveProfile} className="space-y-3.5 pt-4 border-t border-[var(--border-color,rgba(255,255,255,0.05))]">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary,#94a3b8)] uppercase tracking-wider mb-1.5">
                Nama Tampilan
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full px-4 py-2.5 neu-inset bg-[var(--bg-inset,#141518)] border border-[var(--border-color,rgba(255,255,255,0.06))] rounded-2xl text-xs sm:text-sm text-[var(--text-primary,#f8fafc)] placeholder:text-[var(--text-secondary,#94a3b8)] focus:outline-none focus:border-[var(--color-accent-primary,#ff4b4b)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary,#94a3b8)] uppercase tracking-wider mb-1.5">
                Info Bio / Status
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Status Bio"
                className="w-full px-4 py-2.5 neu-inset bg-[var(--bg-inset,#141518)] border border-[var(--border-color,rgba(255,255,255,0.06))] rounded-2xl text-xs sm:text-sm text-[var(--text-primary,#f8fafc)] placeholder:text-[var(--text-secondary,#94a3b8)] focus:outline-none focus:border-[var(--color-accent-primary,#ff4b4b)]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {savedSuccess ? (
                <span className="text-xs text-[var(--color-accent-primary,#ff4b4b)] font-bold flex items-center gap-1.5 animate-fade-in">
                  <Check className="w-4 h-4" /> Profil Tersimpan!
                </span>
              ) : (
                <span className="text-[11px] text-[var(--text-secondary,#94a3b8)]">
                  Nama ini akan terlihat oleh kontak percakapan Anda
                </span>
              )}
              <Button variant="primary" size="sm" type="submit">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </div>

        {/* 2. Menu Item: Tema Tampilan */}
        <div
          onClick={() => setSubView('theme')}
          className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface,#1e2025)] neu-raised border border-[var(--border-color,rgba(255,255,255,0.06))] flex items-center justify-between cursor-pointer hover:border-[var(--color-accent-primary,#ff4b4b)]/30 transition-all group shadow-sm active:scale-98"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-3 rounded-2xl neu-raised text-[var(--color-accent-primary,#ff4b4b)] group-hover:scale-105 transition-transform">
              <Palette className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--text-primary,#f8fafc)]">
                  Tema Tampilan
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full neu-inset text-[var(--color-accent-primary,#ff4b4b)] font-bold">
                  {currentThemeObj.name}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary,#94a3b8)] truncate mt-0.5">
                Pilih dari {THEME_PRESETS.length} tema warna latar & tampilan aplikasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className="w-5 h-5 rounded-full border border-white/20 shadow-md"
              style={{ backgroundColor: currentThemeObj.primary }}
            />
            <ChevronRight className="w-5 h-5 text-[var(--text-secondary,#94a3b8)] group-hover:text-[var(--text-primary,#f8fafc)] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* 3. Notification & Privacy Preferences */}
        <div className="p-5 rounded-3xl bg-[var(--bg-surface,#1e2025)] neu-raised border border-[var(--border-color,rgba(255,255,255,0.06))] space-y-3">
          <h3 className="text-xs font-bold text-[var(--text-secondary,#94a3b8)] uppercase tracking-wider px-1">
            Preferensi & Privasi
          </h3>

          <div className="divide-y divide-[var(--border-color,rgba(255,255,255,0.05))]">
            {/* Sound Notification Toggle */}
            <div className="flex items-center justify-between py-3 px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl neu-inset text-[var(--color-accent-primary,#ff4b4b)]">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary,#f8fafc)]">Suara Notifikasi</h4>
                  <p className="text-[11px] text-[var(--text-secondary,#94a3b8)]">Putar suara saat pesan terkirim atau diterima</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  soundEnabled ? 'bg-gradient-to-r from-[var(--color-accent-from,#ff5757)] to-[var(--color-accent-to,#e63939)]' : 'bg-[var(--bg-inset,#141518)]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* End-to-End Encryption Info */}
            <div className="flex items-center justify-between py-3 px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl neu-inset text-emerald-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary,#f8fafc)]">Enkripsi Ujung-ke-Ujung</h4>
                  <p className="text-[11px] text-[var(--text-secondary,#94a3b8)]">Pesan dan panggilan Anda dilindungi secara privat</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40">
                Aktif
              </span>
            </div>
          </div>
        </div>

        {/* 4. Storage & Data Statistics */}
        <div className="p-5 rounded-3xl bg-[var(--bg-surface,#1e2025)] neu-raised border border-[var(--border-color,rgba(255,255,255,0.06))] space-y-4">
          <h3 className="text-xs font-bold text-[var(--text-secondary,#94a3b8)] uppercase tracking-wider px-1">
            Penyimpanan & Data
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-2xl neu-inset bg-[var(--bg-inset,#141518)] text-center">
              <span className="text-lg font-black text-[var(--color-accent-primary,#ff4b4b)] block">{chats.length}</span>
              <span className="text-[11px] text-[var(--text-secondary,#94a3b8)]">Percakapan</span>
            </div>
            <div className="p-3.5 rounded-2xl neu-inset bg-[var(--bg-inset,#141518)] text-center">
              <span className="text-lg font-black text-blue-400 block">{totalMessages}</span>
              <span className="text-[11px] text-[var(--text-secondary,#94a3b8)]">Pesan</span>
            </div>
            <div className="p-3.5 rounded-2xl neu-inset bg-[var(--bg-inset,#141518)] text-center">
              <span className="text-lg font-black text-amber-400 block">{tasks.length}</span>
              <span className="text-[11px] text-[var(--text-secondary,#94a3b8)]">Tugas</span>
            </div>
            <div className="p-3.5 rounded-2xl neu-inset bg-[var(--bg-inset,#141518)] text-center">
              <span className="text-lg font-black text-purple-400 block">{schedules.length}</span>
              <span className="text-[11px] text-[var(--text-secondary,#94a3b8)]">Jadwal</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleClearData}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Bersihkan Seluruh Data Lokal (Reset)</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Apakah Anda ingin keluar dari akun NYARIOS?')) {
                  logout();
                }
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl neu-raised text-rose-400 hover:text-white hover:bg-rose-950/40 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/5"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun (Logout)</span>
            </button>
          </div>
        </div>

        {/* 5. Brand & Signature Attribution Footer */}
        <div className="p-6 rounded-3xl bg-[#1e2025] neu-raised border border-white/5 flex flex-col items-center text-center space-y-2">
          <TransparentLogo size="md" />
          <p className="text-xs text-slate-400">
            Aplikasi Komunikasi Modern & Pengorganisasian Percakapan Cerdas
          </p>

          <div className="pt-4 space-y-0.5">
            <span className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold block">
              from
            </span>
            <span className="text-xs sm:text-sm font-black tracking-widest text-white block uppercase">
              ACEP YUDI HERYADI
            </span>
            <span className="text-[11px] text-[#ff6b6b] font-mono font-bold block">
              NYARIOS 2026
            </span>
          </div>
        </div>
      </div>

      <UserQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </div>
  );
};

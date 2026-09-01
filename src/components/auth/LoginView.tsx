import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  X,
  AtSign,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

export const LoginView: React.FC = () => {
  const { loginWithUsername, loginWithGoogle } = useApp();

  // Splash screen before login form
  const [showSplash, setShowSplash] = useState(true);

  // Login Mode Tab: 'username' or 'google'
  const [activeMode, setActiveMode] = useState<'username' | 'google'>('username');

  // Form State
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Google Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleUsername, setGoogleUsername] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [showGooglePassword, setShowGooglePassword] = useState(false);

  // Handle Username + Email Login / Register
  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.replace(/^@+/, '').trim().toLowerCase();

    if (!cleanUser || cleanUser.length < 3) {
      setErrorMessage('Username minimal 3 karakter (contoh: @acepyudi).');
      return;
    }
    if (!/^[a-z0-9_.]+$/.test(cleanUser)) {
      setErrorMessage('Username hanya boleh huruf kecil, angka, titik, atau garis bawah (_).');
      return;
    }
    if (!fullName.trim()) {
      setErrorMessage('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (password && password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    sound.playTap();

    setTimeout(() => {
      setIsSubmitting(false);
      sound.playMessageSent();
      loginWithUsername(cleanUser, fullName.trim(), email.trim(), password);
    }, 400);
  };

  // Handle Google Login Submit
  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = googleEmail.trim();
    const finalName = googleName.trim() || 'Pengguna Google';
    const finalUsername = googleUsername.replace(/^@+/, '').trim().toLowerCase() || finalEmail.split('@')[0];

    if (!finalEmail || !finalEmail.includes('@')) {
      setErrorMessage('Masukkan alamat email Google yang valid.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsGoogleModalOpen(false);
      sound.playMessageSent();
      loginWithGoogle(finalEmail, finalName, '', finalUsername);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-white text-gray-800 px-4 sm:px-6 pt-6 pb-10 select-none overflow-y-auto relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-tr from-emerald-500/15 via-green-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ============================================================ */}
      {/* SPLASH SCREEN — Mangga Ka Lebet */}
      {/* ============================================================ */}
      {showSplash ? (
        <div className="flex flex-col items-center justify-center min-h-screen w-full animate-fade-in space-y-8">
          {/* Logo baru */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 rounded-[40px] blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-[36px] overflow-hidden shadow-2xl border-4 border-gray-100 bg-white">
              <img
                src="/logo-nyarios.jpg"
                alt="NYARIOS Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Teks sambutan */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
              Mangga Ka Lebet
            </h1>
            <p className="text-sm text-gray-500 font-medium">Silakan Masuk</p>
          </div>

          {/* Tombol masuk */}
          <button
            onClick={() => setShowSplash(false)}
            className="mt-4 px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-3 cursor-pointer"
          >
            <span>Ayo Mulai</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Meta credit */}
          <p className="text-[11px] text-gray-400 font-medium">From Acep Yudi Heryadi</p>
        </div>
      ) : (
        <>
          {/* Top Header Status Tag */}
          <div className="w-full max-w-md flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Server Aktif • 2026</span>
            </div>
            <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
              v2.0 PRO
            </span>
          </div>

          {/* Center Main Card */}
          <div className="flex flex-col items-center text-center max-w-md w-full my-auto animate-fade-in relative z-10 space-y-6 pt-4">
            {/* LOGO BARU */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative group cursor-pointer">
                {/* Ambient glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition duration-500 animate-pulse" />
                {/* Logo container */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-emerald-100 shadow-xl group-hover:scale-105 transition-transform bg-white">
                  <img
                    src="/logo-nyarios.jpg"
                    alt="NYARIOS Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 flex items-center justify-center gap-2">
                  <span>NYARIOS</span>
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-wide">
                  Aplikasi Komunikasi Modern Berbasis @Username
                </p>
              </div>

              {/* Micro Trust Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-800 font-medium">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Privasi Aman (@Username)</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-[10px] text-amber-800 font-medium">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Bebas Ribet OTP</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-[10px] text-gray-700 font-medium">
                  <span>🇮🇩 Indonesia</span>
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* LOGIN CONTAINER CARD */}
            {/* ========================================================================= */}
            <div className="w-full bg-white rounded-3xl p-5 sm:p-7 shadow-xl border border-gray-100 space-y-5 text-left">
              {/* Method Switcher Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 border border-gray-200/70">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('username');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeMode === 'username'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <AtSign className="w-3.5 h-3.5" />
                  <span>Akun @Username</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('google');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeMode === 'google'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                  </svg>
                  <span>Akun Google</span>
                </button>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in">
                  <span className="shrink-0 font-bold text-sm">⚠</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ========================================================================= */}
              {/* OPTION 1: USERNAME + EMAIL LOGIN / REGISTER */}
              {/* ========================================================================= */}
              {activeMode === 'username' && (
                <form onSubmit={handleUsernameSubmit} className="space-y-3.5 animate-fade-in">
                  {/* Field: Username Unik */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 flex items-center justify-between">
                      <span>Username Unik Anda</span>
                      <span className="text-[10px] text-emerald-600 font-medium">Contoh: @acepyudi</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-gray-400 font-bold text-xs">@</span>
                      <input
                        type="text"
                        required
                        value={username.replace(/^@+/, '')}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                        placeholder="username_kamu"
                        className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-gray-50 text-xs text-gray-900 placeholder:text-gray-400 outline-none border border-gray-200 focus:border-emerald-500 focus:bg-white transition-all font-mono font-bold shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Field: Nama Lengkap */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700">Nama Tampilan</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Contoh: Acep Yudi Heryadi"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 text-xs text-gray-900 placeholder:text-gray-400 outline-none border border-gray-200 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Field: Email (Opsional) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700">
                      Email <span className="text-[10px] text-gray-400 font-normal">(Opsional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 text-xs text-gray-900 placeholder:text-gray-400 outline-none border border-gray-200 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Field: Kata Sandi */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700">
                      Kata Sandi <span className="text-[10px] text-gray-400 font-normal">(Opsional/Minimal 6 huruf)</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-gray-50 text-xs text-gray-900 placeholder:text-gray-400 outline-none border border-gray-200 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Tombol Masuk */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer mt-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Masuk ke NYARIOS</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ========================================================================= */}
              {/* OPTION 2: GOOGLE SIGN-IN */}
              {/* ========================================================================= */}
              {activeMode === 'google' && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-gray-600 text-center">
                    Masuk cepat dan aman menggunakan akun Google terverifikasi Anda
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsGoogleModalOpen(true)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-50 active:scale-[0.98] text-gray-800 border border-gray-200 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer group"
                  >
                    <svg className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Lanjutkan dengan Google</span>
                  </button>
                </div>
              )}

              {/* Privacy Note Footer */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Privasi data & percakapan terenkripsi End-to-End</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* GOOGLE SIGN-IN MODAL DIALOG */}
          {/* ========================================================================= */}
          {isGoogleModalOpen && (
            <div className="fixed inset-0 z-50 p-4 bg-black/50 backdrop-blur-sm flex items-center justify-center select-none animate-fade-in">
              <div className="w-full max-w-sm rounded-3xl bg-white border border-gray-100 p-6 space-y-4 shadow-2xl relative animate-slide-up">
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-1.5 pt-1">
                  <div className="inline-flex p-2 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Masuk Akun Google</h3>
                  <p className="text-[11px] text-gray-500">Tentukan ID akun Google Anda</p>
                </div>

                <form onSubmit={handleGoogleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700">Email Google</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={googleEmail}
                        onChange={(e) => setGoogleEmail(e.target.value)}
                        placeholder="nama@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 text-xs text-gray-900 placeholder:text-gray-400 outline-none border border-gray-200 focus:border-emerald-500 focus:bg-white shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700">Username (@)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-gray-400 font-bold text-xs">@</span>
                      <input
                        type="text"
                        value={googleUsername.replace(/^@+/, '')}
                        onChange={(e) => setGoogleUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                        placeholder="username_anda"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-gray-50 text-xs text-gray-900 placeholder:text-gray-400 outline-none border border-gray-200 focus:border-emerald-500 focus:bg-white shadow-sm font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700">Nama Tampilan</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={googleName}
                        onChange={(e) => setGoogleName(e.target.value)}
                        placeholder="Acep Yudi"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 text-xs text-gray-900 placeholder:text-gray-400 outline-none border border-gray-200 focus:border-emerald-500 focus:bg-white shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <span>Konfirmasi & Masuk</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Footer meta credit */}
          <p className="text-[11px] text-gray-400 text-center z-10 mt-2">
            From <span className="font-semibold text-gray-600">Acep Yudi Heryadi</span>
          </p>
        </>
      )}
    </div>
  );
};

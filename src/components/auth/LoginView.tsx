import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { TransparentLogo } from '../brand/TransparentLogo';

export const LoginView: React.FC = () => {
  const { loginWithGoogle } = useApp();

  // Google Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenGoogleModal = () => {
    setError('');
    setIsGoogleModalOpen(true);
  };

  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = googleEmail.trim();
    const finalName = googleName.trim() || 'Pengguna Google';
    const finalPass = googlePassword.trim();

    if (!finalEmail || !finalEmail.includes('@')) {
      setError('Silakan masukkan alamat email Google Anda yang valid (contoh: nama@gmail.com).');
      return;
    }

    if (!finalPass || finalPass.length < 6) {
      setError('Silakan masukkan kata sandi akun Google Anda (minimal 6 karakter).');
      return;
    }

    setError('');
    setIsLoading(true);

    // Simulate Google account verification
    setTimeout(() => {
      setIsLoading(false);
      setIsGoogleModalOpen(false);
      loginWithGoogle(finalEmail, finalName, '');
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-[#18191d] text-slate-100 px-6 pt-8 pb-12 sm:pb-16 select-none overflow-y-auto relative">
      {/* Ambient glow background effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ff4b4b]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="w-full max-w-sm flex items-center justify-end z-10">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#ff4b4b] bg-[#ff4b4b]/10 px-3 py-1 rounded-full border border-[#ff4b4b]/20">
          Versi 1.0
        </span>
      </div>

      {/* Center Branding & Google Sign-In Action */}
      <div className="flex flex-col items-center text-center max-w-md w-full my-auto animate-fade-in relative z-10 space-y-6">
        <div className="relative cursor-pointer transition-transform hover:scale-105 duration-300">
          <TransparentLogo size="massive" />
        </div>

        {/* Security & Authentication Card */}
        <div className="w-full max-w-sm bg-[#1e2025] rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/[0.06] space-y-4 neu-flat">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-white">
              Masuk ke NYARIOS
            </h2>
            <p className="text-xs text-slate-400">
              Gunakan Akun Google Anda untuk masuk secara aman dan cepat
            </p>
          </div>

          {/* Official Google Button */}
          <button
            type="button"
            onClick={handleOpenGoogleModal}
            className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-900 font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl transition-all group cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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

          {/* Security details note */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Terenkripsi Ujung-ke-Ujung • Data Akun Aman</span>
          </div>
        </div>

        {/* Security Trust Badges */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#ff4b4b] shrink-0" />
          <span>Privasi Terlindungi • Bebas Spam</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GOOGLE ACCOUNT SIGN-IN MODAL DIALOG */}
      {/* ========================================================================= */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 p-4 bg-black/80 backdrop-blur-md flex items-center justify-center select-none animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#1e2025] neu-raised border border-white/10 p-6 sm:p-7 space-y-5 shadow-2xl relative animate-slide-up">
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Google Header */}
            <div className="text-center space-y-2 pt-1">
              <div className="inline-flex p-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-md">
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
              <h3 className="text-base font-bold text-white">
                Login dengan Google
              </h3>
              <p className="text-xs text-slate-400">
                Masukkan akun Google Anda untuk melanjutkan ke NYARIOS
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 text-rose-300 text-xs font-semibold border border-rose-800 animate-fade-in">
                {error}
              </div>
            )}

            {/* Google Login Form */}
            <form onSubmit={handleGoogleSubmit} className="space-y-3.5">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Email Google</span>
                </label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="nama.anda@gmail.com"
                  className="w-full px-4 py-2.5 neu-inset rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none border border-white/5 focus:border-[#ff4b4b]"
                  autoFocus
                />
              </div>

              {/* Name Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#ff6b6b]" />
                  <span>Nama Lengkap Akun</span>
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Contoh: Acep Yudi Heryadi"
                  className="w-full px-4 py-2.5 neu-inset rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none border border-white/5 focus:border-[#ff4b4b]"
                />
              </div>

              {/* Password Input with Eye Toggle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kata Sandi Akun</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Min. 6 karakter</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={googlePassword}
                    onChange={(e) => setGooglePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 neu-inset rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none border border-white/5 focus:border-[#ff4b4b]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                variant="primary"
                type="submit"
                isLoading={isLoading}
                className="w-full py-3 font-bold text-sm mt-2 flex items-center justify-center gap-2"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Signature Attribution */}
      <footer className="text-center pt-8 pb-4 select-none animate-fade-in space-y-1 relative z-10">
        <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400 font-bold block">
          from
        </span>
        <span className="text-sm sm:text-base font-black tracking-widest text-white block uppercase drop-shadow-md">
          ACEP YUDI HERYADI
        </span>
        <span className="text-xs text-[#ff6b6b] font-mono font-bold block tracking-wider">
          NYARIOS 2026
        </span>
      </footer>
    </div>
  );
};

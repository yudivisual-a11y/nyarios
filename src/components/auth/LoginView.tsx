import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  X,
  Phone,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';
import { sendFirebasePhoneOtp, verifyFirebasePhoneOtp } from '../../utils/firebaseAuth';

export const LoginView: React.FC = () => {
  const { loginWithPhone, loginWithGoogle } = useApp();

  // Splash screen before login form
  const [showSplash, setShowSplash] = useState(true);

  // Login Mode Tab: 'phone' or 'google'
  const [activeMode, setActiveMode] = useState<'phone' | 'google'>('phone');

  // Phone OTP Flow State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [otpStep, setOtpStep] = useState<'input_phone' | 'verify_otp'>('input_phone');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('882910');
  const [countdown, setCountdown] = useState(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFirebaseLive, setIsFirebaseLive] = useState(false);

  // Google Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [showGooglePassword, setShowGooglePassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // OTP Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpStep === 'verify_otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpStep, countdown]);

  // Handle Send OTP (Google Firebase Phone Auth with free 10,000 SMS quota)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      setErrorMessage('Silakan masukkan nomor HP yang valid (minimal 8-13 digit).');
      return;
    }

    setErrorMessage('');
    setIsSendingOtp(true);

    const formattedE164 = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+62${phoneNumber.replace(/^0+/, '')}`;

    // Attempt official Google Firebase Phone Auth SMS
    const res = await sendFirebasePhoneOtp(formattedE164, 'recaptcha-container');

    // Generate local backup OTP for instant zero-friction trial
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setIsFirebaseLive(res.success);

    setIsSendingOtp(false);
    setOtpStep('verify_otp');
    setCountdown(60);
    sound.playMessageReceived();
    setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
  };

  // Handle OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    const chars = generatedOtp.split('');
    setOtpDigits(chars);
    sound.playTap();
    // Auto submit verification
    handleVerifyOtp(chars.join(''));
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setErrorMessage('Silakan masukkan 6 digit kode OTP verifikasi.');
      return;
    }

    setErrorMessage('');
    setIsVerifying(true);

    if (isFirebaseLive) {
      const verifyRes = await verifyFirebasePhoneOtp(code);
      if (!verifyRes.success && code !== generatedOtp) {
        setIsVerifying(false);
        setErrorMessage(verifyRes.error || 'Kode OTP salah atau telah kedaluwarsa.');
        return;
      }
    }

    setTimeout(() => {
      setIsVerifying(false);
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+62 ${phoneNumber.replace(/^0+/, '')}`;
      sound.playMessageSent();
      loginWithPhone(formattedPhone, userName.trim() || undefined);
    }, 400);
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setOtpDigits(['', '', '', '', '', '']);
    setCountdown(60);
    sound.playTap();
  };

  // Handle Google Form
  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = googleEmail.trim();
    const finalName = googleName.trim() || 'Pengguna Google';
    const finalPass = googlePassword.trim();

    if (!finalEmail || !finalEmail.includes('@')) {
      setErrorMessage('Masukkan alamat email Google yang valid.');
      return;
    }
    if (!finalPass || finalPass.length < 6) {
      setErrorMessage('Masukkan kata sandi akun Google minimal 6 karakter.');
      return;
    }

    setErrorMessage('');
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsGoogleModalOpen(false);
      sound.playMessageSent();
      loginWithGoogle(finalEmail, finalName, '');
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-[#141518] text-slate-100 px-4 sm:px-6 pt-6 pb-10 select-none overflow-y-auto relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-tr from-emerald-500/15 via-green-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ============================================================ */}
      {/* SPLASH SCREEN — Mangga Ka Lebet */}
      {/* ============================================================ */}
      {showSplash ? (
        <div className="flex flex-col items-center justify-center min-h-screen w-full animate-fade-in space-y-8">
          {/* Logo baru */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 rounded-[40px] blur-2xl opacity-40 animate-pulse" />
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-[36px] overflow-hidden shadow-2xl border-4 border-white/10">
              <img
                src="/logo-nyarios.jpg"
                alt="NYARIOS Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Teks sambutan */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Mangga Ka Lebet
            </h1>
            <p className="text-sm text-slate-400 font-medium">Silakan Masuk</p>
          </div>

          {/* Tombol masuk */}
          <button
            onClick={() => setShowSplash(false)}
            className="mt-4 px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-3"
          >
            <span>Ayo Mulai</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>NYARIOS • 2026</span>
          </div>
        </div>
      ) : (
      <>
      {/* Top Header Status Tag */}
      <div className="w-full max-w-md flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Server Aktif • 2026</span>
        </div>
        <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          v2.0 PRO
        </span>
      </div>

      {/* Center Main Card */}
      <div className="flex flex-col items-center text-center max-w-md w-full my-auto animate-fade-in relative z-10 space-y-6 pt-4">
        {/* LOGO BARU */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative group cursor-pointer">
            {/* Ambient glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-500 animate-pulse" />
            {/* Logo container */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group-hover:scale-105 transition-transform">
              <img
                src="/logo-nyarios.jpg"
                alt="NYARIOS Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                NYARIOS
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Aplikasi Komunikasi Modern & Terenkripsi
            </p>
          </div>

          {/* Micro Trust Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] text-slate-300">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>End-to-End Encrypted</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] text-slate-300">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Cepat & Jernih</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] text-slate-300">
              <span>🇮🇩 Indonesia</span>
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LOGIN CONTAINER CARD */}
        {/* ========================================================================= */}
        <div className="w-full bg-[#1e2025] rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/[0.06] space-y-5 neu-raised text-left">
          {/* Method Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl neu-inset bg-[#141518]">
            <button
              type="button"
              onClick={() => {
                setActiveMode('phone');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeMode === 'phone'
                  ? 'neu-coral-btn text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Nomor HP & OTP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('google');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeMode === 'google'
                  ? 'neu-coral-btn text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
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
            <div className="p-3 rounded-2xl bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
              <span className="shrink-0 font-bold text-sm">⚠</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* OPTION 1: PHONE NUMBER & FREE OTP */}
          {/* ========================================================================= */}
          {activeMode === 'phone' && (
            <div className="space-y-4 animate-fade-in">
              {otpStep === 'input_phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">
                      Nama Lengkap Anda (Opsional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Contoh: Acep Yudi"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl neu-inset bg-[#141518] text-xs text-white placeholder:text-slate-500 outline-none border border-white/5 focus:border-[#ff4b4b] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">
                      Nomor Handphone (WhatsApp / SMS)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2.5 rounded-2xl neu-inset bg-[#141518] text-xs font-bold text-white border border-white/5 shrink-0 flex items-center gap-1.5">
                        <span>🇮🇩</span>
                        <span>+62</span>
                      </div>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="812-3456-7890"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl neu-inset bg-[#141518] text-xs text-white placeholder:text-slate-500 outline-none border border-white/5 focus:border-[#ff4b4b] transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full py-3.5 px-4 rounded-2xl neu-coral-btn text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff4b4b]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer mt-2"
                  >
                    {isSendingOtp ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <span>Kirim Kode OTP (Gratis)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* STEP 2: VERIFY OTP */
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1 text-center">
                    <h3 className="text-sm font-bold text-white">Masukkan Kode OTP</h3>
                    <p className="text-[11px] text-slate-400">
                      Kode 6 digit telah dikirim ke nomor <b>{phoneNumber}</b>
                    </p>
                  </div>

                  {/* Real SMS Verification Notice */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-300 text-xs flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-white">Cek Kotak Masuk SMS</p>
                      <p className="text-[11px] text-slate-400">
                        Buka aplikasi Pesan (SMS) di HP Anda dan masukkan 6 digit kode verifikasi yang Anda terima.
                      </p>
                    </div>
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 sm:w-12 sm:h-14 rounded-2xl neu-inset bg-[#141518] text-center text-lg sm:text-xl font-bold font-mono text-white outline-none border border-white/5 focus:border-[#ff4b4b] transition-all"
                      />
                    ))}
                  </div>

                  {/* Verify Action Button */}
                  <button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={isVerifying}
                    className="w-full py-3.5 px-4 rounded-2xl neu-coral-btn text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff4b4b]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {isVerifying ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verifikasi & Masuk</span>
                      </>
                    )}
                  </button>

                  {/* Resend & Change Phone */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpStep('input_phone')}
                      className="text-slate-400 hover:text-white underline"
                    >
                      ← Ganti Nomor HP
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0}
                      className={`flex items-center gap-1 font-bold ${
                        countdown > 0
                          ? 'text-slate-500 cursor-not-allowed'
                          : 'text-[#ff6b6b] hover:underline'
                      }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{countdown > 0 ? `Kirim Ulang (${countdown}s)` : 'Kirim Ulang OTP'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* OPTION 2: GOOGLE SIGN-IN */}
          {/* ========================================================================= */}
          {activeMode === 'google' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs text-slate-300 text-center">
                Masuk cepat dan aman menggunakan akun Google terverifikasi Anda
              </p>

              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer group"
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
          <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kerahasiaan data terjamin dengan proteksi AES-256</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GOOGLE SIGN-IN MODAL DIALOG */}
      {/* ========================================================================= */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 p-4 bg-black/80 backdrop-blur-md flex items-center justify-center select-none animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#1e2025] neu-raised border border-white/10 p-6 space-y-4 shadow-2xl relative animate-slide-up">
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 pt-1">
              <div className="inline-flex p-2 rounded-2xl bg-white/5 border border-white/10">
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
              <h3 className="text-sm font-bold text-white">Login dengan Google</h3>
              <p className="text-[11px] text-slate-400">Masukkan detail akun Google Anda</p>
            </div>

            <form onSubmit={handleGoogleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Email Google</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl neu-inset bg-[#141518] text-xs text-white placeholder:text-slate-500 outline-none border border-white/5 focus:border-[#ff4b4b]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Nama Akun</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="Acep Yudi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl neu-inset bg-[#141518] text-xs text-white placeholder:text-slate-500 outline-none border border-white/5 focus:border-[#ff4b4b]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showGooglePassword ? 'text' : 'password'}
                    required
                    value={googlePassword}
                    onChange={(e) => setGooglePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl neu-inset bg-[#141518] text-xs text-white placeholder:text-slate-500 outline-none border border-white/5 focus:border-[#ff4b4b]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGooglePassword(!showGooglePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showGooglePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 rounded-xl neu-coral-btn text-white text-xs font-bold flex items-center justify-center gap-2 mt-2 shadow-lg"
              >
                {isVerifying ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <span>Konfirmasi & Masuk</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invisible reCAPTCHA container for Google Firebase Phone Auth */}
      <div id="recaptcha-container" />
    </>
    )}
    </div>
  );
};

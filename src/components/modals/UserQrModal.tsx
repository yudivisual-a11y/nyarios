import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Download, Share2, Scan, Copy, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { sound } from '../../utils/sound';
import { useHistoryBack } from '../../utils/useHistoryBack';

interface UserQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner?: () => void;
}

export const UserQrModal: React.FC<UserQrModalProps> = ({
  isOpen,
  onClose,
  onOpenScanner,
}) => {
  useHistoryBack(isOpen, onClose, 'user_qr_modal');

  const { currentUser } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const cleanUser = (currentUser.username || `@${currentUser.name.toLowerCase().replace(/\s+/g, '_')}`).replace(/^@+/, '');
  const qrPayload = JSON.stringify({
    app: 'NYARIOS',
    version: '4.0',
    type: 'nyarios_user',
    username: `@${cleanUser}`,
    name: currentUser.name,
    avatar: currentUser.avatar || '',
    bio: currentUser.bio || 'Menggunakan NYARIOS',
    url: `https://nyarios.vercel.app/?user=@${cleanUser}`,
  });

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      qrPayload,
      {
        width: 250,
        margin: 2,
        color: {
          dark: '#18191d',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (err) => {
        if (err) console.error('Error generating QR code', err);
      }
    );
  }, [isOpen, qrPayload]);

  if (!isOpen) return null;

  const handleCopyUsername = () => {
    const text = `@${cleanUser}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      sound.playTap();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    sound.playTap();
    const shareData = {
      title: `Hubungi ${currentUser.name} di NYARIOS`,
      text: `Tambahkan saya di NYARIOS Messenger dengan username @${cleanUser}`,
      url: `https://nyarios.vercel.app/?user=@${cleanUser}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyUsername();
    }
  };

  const handleDownloadQr = () => {
    if (!canvasRef.current) return;
    sound.playMessageSent();
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `QR_NYARIOS_${cleanUser}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl neu-flat bg-[var(--bg-surface,#1e2025)] border border-[var(--border-color,rgba(255,255,255,0.08))] p-6 space-y-5 shadow-2xl relative animate-slide-up text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full neu-raised text-[var(--text-secondary,#94a3b8)] hover:text-[var(--text-primary,#f8fafc)] active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="w-12 h-12 rounded-2xl neu-raised text-[var(--color-accent-primary,#ff4b4b)] mx-auto flex items-center justify-center font-bold mb-2 shadow-sm">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-[var(--text-primary,#f8fafc)] tracking-tight">
            Kode QR Saya
          </h3>
          <p className="text-xs text-[var(--text-secondary,#94a3b8)]">
            Tunjukkan kode QR ini agar teman bisa langsung memindai & menyimpan kontak Anda
          </p>
        </div>

        {/* QR Card Container */}
        <div className="p-4 rounded-3xl bg-white neu-raised shadow-inner max-w-[280px] mx-auto space-y-3">
          {/* User Info inside QR card */}
          <div className="flex items-center gap-2.5 px-1 pt-1 justify-center text-left">
            <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" />
            <div className="min-w-0">
              <h4 className="text-xs font-black text-gray-900 truncate">
                {currentUser.name}
              </h4>
              <p className="text-[10px] font-mono font-bold text-[#ff4b4b] truncate">
                @{cleanUser}
              </p>
            </div>
          </div>

          {/* Canvas QR Code */}
          <div className="flex items-center justify-center p-1 relative">
            <canvas ref={canvasRef} className="rounded-2xl max-w-full h-auto" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-9 h-9 rounded-xl p-1 bg-white shadow-md border border-gray-100 flex items-center justify-center">
                <img
                  src="/logo-nyarios.jpg"
                  alt="Logo"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider pb-1">
            Pindai dengan Kamera NYARIOS
          </p>
        </div>

        {/* Username pill */}
        <div
          onClick={handleCopyUsername}
          className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[var(--bg-inset,#141518)] neu-sunken border border-[var(--border-color,rgba(255,255,255,0.06))] cursor-pointer hover:border-[var(--color-accent-primary,#ff4b4b)] transition-all group"
        >
          <div className="text-left min-w-0">
            <span className="text-[10px] text-[var(--text-secondary,#94a3b8)] font-semibold block">
              Username Anda:
            </span>
            <span className="text-xs font-mono font-black text-[var(--color-accent-primary,#ff4b4b)] truncate block">
              @{cleanUser}
            </span>
          </div>
          <button className="px-2.5 py-1.5 rounded-xl neu-raised text-[var(--text-primary,#f8fafc)] text-xs font-bold flex items-center gap-1">
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[10px]">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px]">Salin</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleDownloadQr}
            className="py-2.5 px-3 rounded-2xl neu-raised hover:bg-[var(--bg-card,#23262c)] text-[var(--text-primary,#f8fafc)] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-[var(--color-accent-primary,#ff4b4b)]" />
            <span>{downloadSuccess ? 'Tersimpan!' : 'Simpan Foto'}</span>
          </button>

          <button
            onClick={handleShare}
            className="py-2.5 px-3 rounded-2xl neu-raised hover:bg-[var(--bg-card,#23262c)] text-[var(--text-primary,#f8fafc)] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4 text-[var(--color-accent-primary,#ff4b4b)]" />
            <span>Bagikan ID</span>
          </button>
        </div>

        {/* Switch to Scanner button */}
        {onOpenScanner && (
          <button
            onClick={() => {
              onClose();
              onOpenScanner();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--color-accent-from,#ff5757)] to-[var(--color-accent-to,#e63939)] hover:brightness-110 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-accent-shadow,rgba(255,75,75,0.3))] cursor-pointer active:scale-95 transition-all"
          >
            <Scan className="w-4 h-4" />
            <span>Buka Pemindai QR Kamera</span>
          </button>
        )}
      </div>
    </div>
  );
};

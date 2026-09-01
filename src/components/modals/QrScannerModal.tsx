import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  X,
  Camera,
  Flashlight,
  FlashlightOff,
  SwitchCamera,
  Image as ImageIcon,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';
import { normalizeUsername } from '../../utils/cloudSync';
import { useHistoryBack } from '../../utils/useHistoryBack';
import confetti from 'canvas-confetti';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMyQr?: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onOpenMyQr,
}) => {
  useHistoryBack(isOpen, onClose, 'qr_scanner_modal');

  const {
    addContact,
    createDirectChatWithUsername,
    setActiveChatId,
    setActiveNavTab,
    chats,
    currentUser,
  } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchAvailable, setIsTorchAvailable] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedResult, setScannedResult] = useState<{
    name: string;
    username: string;
    avatar?: string;
  } | null>(null);

  // Stop current stream
  const stopCameraStream = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsTorchOn(false);
    setIsTorchAvailable(false);
  }, []);

  // Handle scanned user data
  const handleScannedUser = useCallback((userPayload: { username: string; name?: string; avatar?: string; bio?: string }) => {
    if (isProcessing) return;
    setIsProcessing(true);
    sound.playMessageSent();

    if (navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {}
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    const cleanUser = userPayload.username.replace(/^@+/, '').trim().toLowerCase();
    const formattedUsername = `@${cleanUser}`;
    const displayName = userPayload.name?.trim() || cleanUser;

    setScannedResult({
      name: displayName,
      username: formattedUsername,
      avatar: userPayload.avatar,
    });

    // Check if user is self
    const myCleanUser = (currentUser.username || `@${currentUser.name.toLowerCase().replace(/\s+/g, '_')}`).replace(/^@+/, '').toLowerCase();
    if (cleanUser === myCleanUser) {
      setTimeout(() => {
        setIsProcessing(false);
        setScannedResult(null);
        alert('Ini adalah kode QR akun Anda sendiri!');
      }, 500);
      return;
    }

    // Save contact
    addContact({
      id: `contact_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: displayName,
      username: formattedUsername,
      avatar: userPayload.avatar,
      bio: userPayload.bio || 'Ditambahkan via Pindai QR',
      isOnline: true,
    });

    setTimeout(() => {
      // Find or create chat
      const existing = chats.find(
        (c) =>
          c.username && normalizeUsername(c.username) === cleanUser
      );

      if (existing) {
        setActiveChatId(existing.id);
      } else {
        createDirectChatWithUsername(formattedUsername, displayName);
      }

      setActiveNavTab('home');
      stopCameraStream();
      onClose();
    }, 1200);
  }, [
    isProcessing,
    currentUser,
    addContact,
    chats,
    setActiveChatId,
    createDirectChatWithUsername,
    setActiveNavTab,
    stopCameraStream,
    onClose,
  ]);

  // Process raw text string from QR
  const processQrText = useCallback((data: string) => {
    if (!data || isProcessing) return;

    try {
      // 1. Try JSON parse
      if (data.startsWith('{') && data.endsWith('}')) {
        const parsed = JSON.parse(data);
        if (parsed.username) {
          handleScannedUser({
            username: parsed.username,
            name: parsed.name,
            avatar: parsed.avatar,
            bio: parsed.bio,
          });
          return;
        }
      }

      // 2. Try URL parse (?user=@username)
      if (data.includes('?user=')) {
        const url = new URL(data.startsWith('http') ? data : `https://${data}`);
        const userParam = url.searchParams.get('user');
        if (userParam) {
          handleScannedUser({ username: userParam });
          return;
        }
      }

      // 3. Plain username or text
      const match = data.match(/@?([a-zA-Z0-9_.]{3,30})/);
      if (match && match[1]) {
        handleScannedUser({ username: match[1] });
        return;
      }
    } catch (err) {
      console.warn('QR parse notice', err);
    }
  }, [isProcessing, handleScannedUser]);

  // Scan video frame continuously
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          processQrText(code.data);
          return;
        }
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(scanFrame);
  }, [isProcessing, processQrText]);

  // Initialize camera stream
  const startCameraStream = useCallback(async () => {
    stopCameraStream();
    setErrorMessage(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Check flashlight torch availability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack.getCapabilities ? videoTrack.getCapabilities() : {}) as any;
        if (capabilities.torch) {
          setIsTorchAvailable(true);
        }
      }

      // Start scanning loop
      animationFrameIdRef.current = requestAnimationFrame(scanFrame);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Izin kamera ditolak. Silakan berikan izin kamera pada browser Anda.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('Kamera tidak ditemukan pada perangkat ini.');
      } else {
        setErrorMessage('Gagal membuka kamera: ' + (err.message || 'Error tidak diketahui'));
      }
    }
  }, [facingMode, scanFrame, stopCameraStream]);

  // Toggle Torch/Flashlight
  const handleToggleTorch = async () => {
    if (!videoRef.current?.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    if (track) {
      try {
        const nextTorch = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextTorch }],
        });
        setIsTorchOn(nextTorch);
        sound.playTap();
      } catch (err) {
        console.warn('Torch not supported or failed', err);
      }
    }
  };

  // Flip Camera Front/Back
  const handleFlipCamera = () => {
    sound.playTap();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle image upload from file picker / gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            processQrText(code.data);
          } else {
            alert('Tidak ditemukan kode QR yang valid pada foto tersebut. Silakan coba foto yang lebih jelas.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setScannedResult(null);
      startCameraStream();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, startCameraStream, stopCameraStream]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl neu-flat bg-[var(--bg-surface,#1e2025)] border border-[var(--border-color,rgba(255,255,255,0.08))] p-5 space-y-4 shadow-2xl relative animate-slide-up flex flex-col items-center text-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            stopCameraStream();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full neu-raised text-[var(--text-secondary,#94a3b8)] hover:text-[var(--text-primary,#f8fafc)] z-30 active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="space-y-0.5">
          <h3 className="text-base font-black text-[var(--text-primary,#f8fafc)] tracking-tight flex items-center justify-center gap-1.5">
            <Camera className="w-4 h-4 text-[var(--color-accent-primary,#ff4b4b)]" />
            <span>Pindai Kode QR</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary,#94a3b8)]">
            Arahkan kamera ke kode QR teman untuk langsung terhubung
          </p>
        </div>

        {/* Viewfinder Camera Box Container */}
        <div className="relative w-full aspect-square max-w-[280px] rounded-3xl overflow-hidden bg-black neu-sunken border border-white/10 flex items-center justify-center shadow-inner">
          {/* Live Video Stream */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Hidden Canvas for Frame Processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Viewfinder Box Overlay with Corner Brackets */}
          <div className="absolute inset-6 pointer-events-none flex items-center justify-center">
            {/* Viewfinder border */}
            <div className="relative w-full h-full rounded-2xl border-2 border-[var(--color-accent-primary,#ff4b4b)]/60">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[var(--color-accent-primary,#ff4b4b)] rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[var(--color-accent-primary,#ff4b4b)] rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[var(--color-accent-primary,#ff4b4b)] rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[var(--color-accent-primary,#ff4b4b)] rounded-br-lg" />

              {/* Animated Laser Beam */}
              {!scannedResult && !errorMessage && hasPermission && (
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-accent-primary,#ff4b4b)] to-transparent shadow-[0_0_12px_var(--color-accent-primary,#ff4b4b)] animate-pulse top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>

          {/* Success Overlay on Scan Match */}
          {scannedResult && (
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 space-y-2 animate-scale-up text-white">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-sm font-black truncate max-w-[200px]">
                {scannedResult.name}
              </h4>
              <p className="text-xs font-mono font-bold text-emerald-300">
                {scannedResult.username}
              </p>
              <span className="text-[10px] text-emerald-200 animate-pulse pt-1">
                Menghubungkan ke obrolan...
              </span>
            </div>
          )}

          {/* Error / Permission Overlay */}
          {errorMessage && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 space-y-3 text-center">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-xs text-slate-200 leading-relaxed max-w-[220px]">
                {errorMessage}
              </p>
              <button
                onClick={startCameraStream}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--color-accent-from,#ff5757)] to-[var(--color-accent-to,#e63939)] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Torch & Camera Controls on Top of Video */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            {isTorchAvailable ? (
              <button
                onClick={handleToggleTorch}
                className={`p-2 rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer ${
                  isTorchOn ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/50' : 'bg-black/50 text-white'
                }`}
                title="Senter Flash"
              >
                {isTorchOn ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
              </button>
            ) : <div />}

            <button
              onClick={handleFlipCamera}
              className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/70 transition-all cursor-pointer"
              title="Balik Kamera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Options */}
        <div className="w-full space-y-2 pt-1">
          {/* File Picker Scan from Gallery */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 rounded-2xl neu-raised hover:bg-[var(--bg-card,#23262c)] text-[var(--text-primary,#f8fafc)] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <ImageIcon className="w-4 h-4 text-[var(--color-accent-primary,#ff4b4b)]" />
            <span>Pindai dari Galeri Foto</span>
          </button>

          {/* Switch to My QR Code */}
          {onOpenMyQr && (
            <button
              onClick={() => {
                stopCameraStream();
                onClose();
                onOpenMyQr();
              }}
              className="w-full py-2.5 px-4 rounded-2xl neu-raised hover:bg-[var(--bg-card,#23262c)] text-[var(--text-primary,#f8fafc)] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-sm"
            >
              <QrCode className="w-4 h-4 text-[var(--color-accent-primary,#ff4b4b)]" />
              <span>Tampilkan Kode QR Saya</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

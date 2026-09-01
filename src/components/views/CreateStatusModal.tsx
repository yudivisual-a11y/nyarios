import React, { useState, useRef } from 'react';
import {
  Type,
  Image as ImageIcon,
  Video as VideoIcon,
  Palette,
  Send,
  X,
  Camera,
  Upload,
  ArrowLeft,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { compressImageFile } from '../../utils/imageCompressor';
import { useHistoryBack } from '../../utils/useHistoryBack';

interface CreateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const colorThemes = [
  'linear-gradient(135deg, #ff4b4b 0%, #ff8533 100%)', // Coral Sunset
  'linear-gradient(135deg, #00A884 0%, #005c4b 100%)', // Teal Wave
  'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', // Violet Indigo
  'linear-gradient(135deg, #DB2777 0%, #9333EA 100%)', // Pink Purple
  'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)', // Electric Blue
  'linear-gradient(135deg, #2A2D34 0%, #18191D 100%)', // Charcoal Matte
];

export const CreateStatusModal: React.FC<CreateStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  useHistoryBack(isOpen, onClose, 'create_status');

  const { createStatus } = useApp();

  const [mode, setMode] = useState<'text' | 'image' | 'video'>('text');
  const [textContent, setTextContent] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedBg, setSelectedBg] = useState(colorThemes[0]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      // High definition compression (1920px Full HD, 0.92 quality)
      const compressed = await compressImageFile(file, 1920, 1920, 0.92);
      setImagePreview(compressed);
      setIsProcessing(false);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onerror = () => {
      setIsProcessing(false);
    };
    reader.onload = () => {
      const result = reader.result as string;
      setVideoPreview(result);

      // Check duration
      const tempVideo = document.createElement('video');
      tempVideo.src = result;
      tempVideo.onloadedmetadata = () => {
        setVideoDuration(tempVideo.duration);
        setIsProcessing(false);
      };
      tempVideo.onerror = () => {
        setIsProcessing(false);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      if (mode === 'text') {
        if (!textContent.trim()) return;
        createStatus('text', textContent.trim(), undefined, selectedBg);
      } else if (mode === 'image') {
        if (!imagePreview) return;
        createStatus('image', imagePreview, caption.trim());
      } else if (mode === 'video') {
        if (!videoPreview) return;
        createStatus('video', videoPreview, caption.trim());
      }

      setTextContent('');
      setCaption('');
      setImagePreview(null);
      setVideoPreview(null);
      setVideoDuration(null);
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.warn('Submit status error:', err);
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 select-none overflow-y-auto">
      {/* Container - Fullscreen on Mobile & Floating Modal on Desktop */}
      <div className="w-full h-full sm:h-auto sm:max-w-lg bg-[#18191d] sm:rounded-3xl border-0 sm:border border-white/10 shadow-2xl flex flex-col justify-between p-4 sm:p-6 animate-slide-up overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex items-center gap-1.5 p-2 rounded-xl neu-raised-circle text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold sm:hidden">Batal</span>
          </button>

          <div className="text-center">
            <h2 className="text-sm sm:text-base font-bold text-white">
              {isProcessing ? 'Memproses Media...' : 'Bagikan Status Baru'}
            </h2>
            <p className="text-[11px] text-slate-400">
              {isProcessing ? 'Menyiarkan ke teman...' : 'Hilang otomatis setelah 24 jam'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              (mode === 'text' && !textContent.trim()) ||
              (mode === 'image' && !imagePreview) ||
              (mode === 'video' && !videoPreview) ||
              isProcessing
            }
            className="px-4 py-2 rounded-xl neu-coral-btn text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#ff4b4b]/30 disabled:opacity-40"
          >
            <span>{isProcessing ? 'Mengirim...' : 'Kirim'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl neu-inset my-4">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'text'
                ? 'bg-[#ff4b4b] text-white shadow-md shadow-[#ff4b4b]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Teks</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('image')}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'image'
                ? 'bg-[#ff4b4b] text-white shadow-md shadow-[#ff4b4b]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Foto HD</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('video')}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'video'
                ? 'bg-[#ff4b4b] text-white shadow-md shadow-[#ff4b4b]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            <span>Video</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-center my-2 space-y-4">
          {/* 1. TEXT STATUS */}
          {mode === 'text' && (
            <div className="space-y-4 animate-fade-in">
              <div
                className="w-full h-64 sm:h-56 rounded-3xl flex items-center justify-center p-6 text-white text-center font-bold text-lg sm:text-xl shadow-2xl transition-all relative overflow-hidden"
                style={{ background: selectedBg }}
              >
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Ketik cerita atau kabar Anda hari ini..."
                  rows={4}
                  className="w-full bg-transparent text-white placeholder:text-white/70 text-center outline-none resize-none font-bold tracking-wide"
                  autoFocus
                />
              </div>

              {/* Color Presets */}
              <div className="flex items-center justify-center gap-2.5 pt-1">
                <Palette className="w-4 h-4 text-slate-400" />
                {colorThemes.map((bg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedBg(bg)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      selectedBg === bg
                        ? 'scale-125 border-white shadow-lg shadow-black/50'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    style={{ background: bg }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2. PHOTO STATUS (Full HD Crystal Clear) */}
          {mode === 'image' && (
            <div className="space-y-4 animate-fade-in">
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] sm:aspect-video w-full rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
                    <img
                      src={imagePreview}
                      alt="Status Foto"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 text-emerald-400 text-[10px] font-bold backdrop-blur-md flex items-center gap-1 border border-emerald-500/30">
                      <Sparkles className="w-3 h-3" />
                      <span>Full HD Jernih</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 text-white text-xs font-bold backdrop-blur-md hover:bg-black/90 border border-white/10"
                    >
                      Ganti Foto
                    </button>
                  </div>

                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Tambah keterangan foto status..."
                    className="w-full px-4 py-3 neu-inset border border-white/5 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff4b4b]"
                  />
                </div>
              ) : (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="aspect-[4/3] sm:aspect-video w-full rounded-3xl neu-flat border-2 border-dashed border-white/15 flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:border-[#ff4b4b]/60 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl neu-raised text-[#ff4b4b] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Pilih Foto Status HD
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Kualitas Full HD jernih tanpa kompresi buram seperti aplikasi lain
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. VIDEO STATUS (Up to 2 Minutes HD) */}
          {mode === 'video' && (
            <div className="space-y-4 animate-fade-in">
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoChange}
                accept="video/*"
                className="hidden"
              />

              {videoPreview ? (
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] sm:aspect-video w-full rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                    <video
                      src={videoPreview}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 text-rose-400 text-[10px] font-bold backdrop-blur-md flex items-center gap-1 border border-rose-500/30">
                      <Clock className="w-3 h-3" />
                      <span>
                        {videoDuration
                          ? `${Math.round(videoDuration)}s (Maks. 2 Menit)`
                          : 'Durasi Maks. 2 Menit'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 text-white text-xs font-bold backdrop-blur-md hover:bg-black/90 border border-white/10"
                    >
                      Ganti Video
                    </button>
                  </div>

                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Tambah keterangan video status..."
                    className="w-full px-4 py-3 neu-inset border border-white/5 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff4b4b]"
                  />
                </div>
              ) : (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="aspect-[4/3] sm:aspect-video w-full rounded-3xl neu-flat border-2 border-dashed border-white/15 flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:border-[#ff4b4b]/60 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl neu-raised text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <VideoIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Pilih Video Status (Maks. 2 Menit)
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Mendukung video Full HD hingga durasi 2 menit (120 detik) tanpa buram
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-3 border-t border-white/5 text-center flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Kualitas Full HD Jernih • Durasi Video Status Hingga 2 Menit</span>
        </div>
      </div>
    </div>
  );
};

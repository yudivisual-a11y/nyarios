import React, { useState, useRef } from 'react';
import {
  X,
  Video,
  UploadCloud,
  Music,
  Tag,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

interface CreateVideoPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateVideoPostModal: React.FC<CreateVideoPostModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createVideoPost } = useApp();

  const [caption, setCaption] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('nyarios, video, seru');
  const [audioTitle, setAudioTitle] = useState('Original Audio');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setVideoUrl(reader.result as string);
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      alert('Silakan tulis keterangan / caption video.');
      return;
    }

    const finalVideoUrl =
      videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/#/g, ''))
      .filter(Boolean);

    createVideoPost(caption.trim(), finalVideoUrl, tags, audioTitle.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1e2025] neu-raised border border-white/10 overflow-hidden shadow-2xl space-y-4">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Unggah Konten Video
              </h2>
              <p className="text-xs text-slate-400">
                Bagikan momen dan video kreatif Anda ke feed NYARIOS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full neu-raised-circle text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="video/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-4">
          {/* Video Selector / Preview Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full h-44 sm:h-48 rounded-2xl bg-[#18191d] border-2 border-dashed border-white/10 hover:border-[#ff4b4b]/50 overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-colors neu-inset p-3"
          >
            {videoUrl ? (
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400 text-center">
                <div className="p-3 rounded-2xl neu-raised text-rose-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {isUploading ? 'Memproses video...' : 'Ketuk untuk pilih video dari galeri'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Mendukung MP4, MOV, WebM (Vertikal/Horizontal)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Keterangan Video (Caption)
            </label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tulis cerita menarik tentang video ini..."
              className="w-full px-4 py-2.5 neu-inset border border-white/5 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff4b4b] resize-none"
              autoFocus
            />
          </div>

          {/* Audio Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span>Judul Suara / Musik</span>
            </label>
            <input
              type="text"
              value={audioTitle}
              onChange={(e) => setAudioTitle(e.target.value)}
              placeholder="Original Audio / Judul Lagu"
              className="w-full px-4 py-2 neu-inset border border-white/5 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff4b4b]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tagar / Topik (Pisahkan koma)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="nyarios, video, seru"
              className="w-full px-4 py-2 neu-inset border border-white/5 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff4b4b]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-[#ff4b4b] text-white font-bold shadow-lg shadow-blue-600/30"
            >
              Bagikan Video
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

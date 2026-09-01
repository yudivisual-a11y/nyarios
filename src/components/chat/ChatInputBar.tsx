import React, { useState, useRef, useEffect } from 'react';
import {
  Smile,
  Paperclip,
  Camera,
  Mic,
  Send,
  Image as ImageIcon,
  Video,
  FileText,
  HelpCircle,
  BarChart2,
  Calendar,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Message } from '../../types';
import { formatBytes } from '../../utils/formatters';
import { compressImageFile } from '../../utils/imageCompressor';
import { voiceRecorder } from '../../utils/voiceRecorder';

interface ChatInputBarProps {
  replyingTo: Message | null;
  onCancelReply: () => void;
  editingMessage: Message | null;
  onCancelEdit: () => void;
  onOpenQuickAsk: () => void;
  onOpenPollModal: () => void;
  onOpenScheduleModal: () => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  onOpenQuickAsk,
  onOpenPollModal,
  onOpenScheduleModal,
}) => {
  const {
    activeChatId,
    sendMessage,
    editMessage,
  } = useApp();

  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiTray, setShowEmojiTray] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Sync editing text
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  // Voice recording timer
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || !activeChatId) return;

    if (editingMessage) {
      editMessage(activeChatId, editingMessage.id, text.trim());
      onCancelEdit();
    } else {
      sendMessage(activeChatId, text.trim(), 'text', {
        replyTo: replyingTo || undefined,
      });
      if (replyingTo) onCancelReply();
    }

    setText('');
    setShowEmojiTray(false);
    setShowAttachMenu(false);
  };

  const handleStartVoiceRecord = async () => {
    const res = await voiceRecorder.start();
    if (!res.success) {
      alert(res.error || 'Akses mikrofon tidak diizinkan. Silakan beri izin mikrofon pada browser Anda untuk merekam suara.');
      return;
    }
    setIsRecording(true);
  };

  const handleFinishVoiceRecord = async () => {
    if (!isRecording || !activeChatId) return;

    const result = await voiceRecorder.stop();
    setIsRecording(false);

    if (result && result.audioUrl) {
      const durSec = result.durationSeconds || Math.max(1, recordingSeconds);
      const mins = Math.floor(durSec / 60);
      const secs = durSec % 60;
      const formattedDur = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      sendMessage(activeChatId, result.audioUrl, 'voice_note', {
        audioUrl: result.audioUrl,
        audioDuration: formattedDur,
        voiceNoteDuration: durSec,
        replyTo: replyingTo || undefined,
      });

      if (replyingTo) onCancelReply();
    }
  };

  const handleCancelVoiceRecord = () => {
    voiceRecorder.cancel();
    setIsRecording(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatId) return;

    try {
      const compressedDataUrl = await compressImageFile(file);
      sendMessage(activeChatId, compressedDataUrl, 'image', {
        caption: text.trim() || undefined,
        fileName: file.name,
        fileSize: formatBytes(file.size),
        replyTo: replyingTo || undefined,
      });
      setText('');
      if (replyingTo) onCancelReply();
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          sendMessage(activeChatId, reader.result as string, 'image', {
            caption: text.trim() || undefined,
            fileName: file.name,
            fileSize: formatBytes(file.size),
            replyTo: replyingTo || undefined,
          });
          setText('');
          if (replyingTo) onCancelReply();
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatId) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        sendMessage(activeChatId, reader.result as string, 'video', {
          caption: text.trim() || undefined,
          fileName: file.name,
          fileSize: formatBytes(file.size),
          replyTo: replyingTo || undefined,
        });
        setText('');
        if (replyingTo) onCancelReply();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatId) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const dataUrl = reader.result as string;
        sendMessage(activeChatId, dataUrl, 'document', {
          fileName: file.name,
          fileSize: formatBytes(file.size),
          fileUrl: dataUrl,
          caption: text.trim() || undefined,
          replyTo: replyingTo || undefined,
        });
        setText('');
        if (replyingTo) onCancelReply();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const commonEmojis = ['❤️', '👍', '😂', '🔥', '🙏', '🎉', '😊', '😍', '✨', '👏', '🤝', '💯'];

  return (
    <div className="relative px-3 sm:px-5 py-3 border-t border-white/5 bg-[#18191d]">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleVideoUpload}
        accept="video/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <input
        type="file"
        ref={docInputRef}
        onChange={handleDocUpload}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
        className="hidden"
      />

      {/* Reply Banner */}
      {replyingTo && (
        <div className="mb-2 p-2 px-3 rounded-2xl bg-[#202227] border-l-4 border-[#ff4b4b] flex items-center justify-between text-xs animate-slide-up">
          <div className="min-w-0 pr-2">
            <span className="font-bold text-[#ff6b6b] block text-[11px]">
              Membalas {replyingTo.senderName}
            </span>
            <p className="text-slate-300 truncate">{replyingTo.content}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Edit Banner */}
      {editingMessage && (
        <div className="mb-2 p-2 px-3 rounded-2xl bg-[#202227] border-l-4 border-amber-500 flex items-center justify-between text-xs animate-slide-up">
          <div className="min-w-0 pr-2">
            <span className="font-bold text-amber-400 block text-[11px]">
              Mengedit Pesan
            </span>
            <p className="text-slate-300 truncate">{editingMessage.content}</p>
          </div>
          <button
            onClick={() => {
              onCancelEdit();
              setText('');
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Tray */}
      {showEmojiTray && (
        <div className="absolute bottom-16 left-4 z-40 p-2.5 rounded-2xl bg-[#23262c] shadow-2xl border border-white/10 flex flex-wrap gap-2 max-w-xs animate-slide-up neu-flat">
          {commonEmojis.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => {
                setText((prev) => prev + em);
                inputRef.current?.focus();
              }}
              className="text-lg hover:scale-125 transition-transform p-1"
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {/* Attachment Popover Menu */}
      {showAttachMenu && (
        <div className="absolute bottom-16 right-16 z-40 p-2 rounded-3xl bg-[#23262c] shadow-2xl border border-white/10 grid grid-cols-2 gap-1.5 w-72 animate-slide-up neu-flat text-xs">
          {/* Gallery / Image File */}
          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(false);
              imageInputRef.current?.click();
            }}
            className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-[#2c3038] text-slate-200 transition-colors"
          >
            <div className="p-2 rounded-xl neu-raised text-emerald-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="font-bold block">Galeri Foto</span>
              <span className="text-[10px] text-slate-400">Kirim gambar</span>
            </div>
          </button>

          {/* Video File */}
          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(false);
              videoInputRef.current?.click();
            }}
            className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-[#2c3038] text-slate-200 transition-colors"
          >
            <div className="p-2 rounded-xl neu-raised text-rose-400">
              <Video className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="font-bold block">Kirim Video</span>
              <span className="text-[10px] text-slate-400">MP4, MOV, WebM</span>
            </div>
          </button>

          {/* Document File */}
          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(false);
              docInputRef.current?.click();
            }}
            className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-[#2c3038] text-slate-200 transition-colors"
          >
            <div className="p-2 rounded-xl neu-raised text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="font-bold block">Dokumen</span>
              <span className="text-[10px] text-slate-400">PDF, Word, zip</span>
            </div>
          </button>

          {/* Quick Ask */}
          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(false);
              onOpenQuickAsk();
            }}
            className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-[#2c3038] text-slate-200 transition-colors"
          >
            <div className="p-2 rounded-xl neu-raised text-[#ff4b4b]">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="font-bold block">Tanya Grup</span>
              <span className="text-[10px] text-slate-400">Polling 1-klik</span>
            </div>
          </button>

          {/* Full Poll */}
          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(false);
              onOpenPollModal();
            }}
            className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-[#2c3038] text-slate-200 transition-colors"
          >
            <div className="p-2 rounded-xl neu-raised text-purple-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="font-bold block">Polling</span>
              <span className="text-[10px] text-slate-400">Pilihan ganda</span>
            </div>
          </button>

          {/* Agenda Schedule */}
          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(false);
              onOpenScheduleModal();
            }}
            className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-[#2c3038] text-slate-200 transition-colors"
          >
            <div className="p-2 rounded-xl neu-raised text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="font-bold block">Jadwal Agenda</span>
              <span className="text-[10px] text-slate-400">Pengingat pertemuan</span>
            </div>
          </button>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSend} className="flex items-center gap-2.5">
        {/* Recessed / Sunken Input Capsule */}
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 neu-sunken-bar rounded-full border border-white/[0.03] focus-within:border-[#ff4b4b]/30 transition-all">
          {/* Emoji Toggle */}
          <button
            type="button"
            onClick={() => setShowEmojiTray(!showEmojiTray)}
            className="text-[#ff6b6b] hover:text-[#ff4b4b] transition-colors shrink-0"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Voice recording live indicator */}
          {isRecording ? (
            <div className="flex-1 flex items-center gap-2 text-xs font-semibold text-rose-400 animate-fade-in">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              <span className="truncate">Merekam suara ({recordingSeconds}s)...</span>
              <span className="text-[10px] text-slate-400 ml-auto hidden sm:inline">Lepas atau klik untuk selesai</span>
            </div>
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none font-normal"
            />
          )}

          {/* Paperclip attachment icon */}
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="text-[#ff6b6b] hover:text-[#ff4b4b] transition-colors shrink-0"
            title="Lampiran & Fitur Tambahan"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Camera icon directly triggers camera / image upload */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="text-[#ff6b6b] hover:text-[#ff4b4b] transition-colors shrink-0"
            title="Buka Kamera / Foto"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Circular Action Button */}
        {text.trim() ? (
          <button
            type="submit"
            className="w-11 h-11 rounded-full neu-coral-btn flex items-center justify-center text-white shrink-0 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#ff4b4b]/30"
            title="Kirim Pesan"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        ) : isRecording ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCancelVoiceRecord}
              className="p-2 rounded-full neu-raised-circle text-rose-400 hover:text-white"
              title="Batal Rekam"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleFinishVoiceRecord}
              className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg animate-pulse hover:scale-105 transition-transform"
              title="Selesai & Kirim Suara"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartVoiceRecord}
            className="w-11 h-11 rounded-full neu-coral-btn flex items-center justify-center text-white shrink-0 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#ff4b4b]/30"
            title="Tekan untuk Rekam Suara (Mic)"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
};

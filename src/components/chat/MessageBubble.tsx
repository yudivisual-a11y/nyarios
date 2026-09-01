import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  CheckCheck,
  Clock,
  Pin,
  Smile,
  MoreVertical,
  Reply,
  Forward,
  Bookmark,
  CheckSquare,
  Calendar,
  Edit2,
  Trash2,
  Play,
  Pause,
  Download,
  FileText,
  HelpCircle,
  BarChart2,
  Maximize2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Message } from '../../types';
import { Avatar } from '../ui/Avatar';
import { sound } from '../../utils/sound';

interface MessageBubbleProps {
  message: Message;
  isGroup?: boolean;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onConvertToTask: (message: Message) => void;
  onAddToSchedule: (message: Message) => void;
  onEdit: (message: Message) => void;
}

function dataURLtoBlob(dataurl: string): Blob {
  try {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(arr[1] || '');
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch {
    return new Blob([dataurl], { type: 'application/octet-stream' });
  }
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isGroup,
  onReply,
  onForward,
  onConvertToTask,
  onAddToSchedule,
  onEdit,
}) => {
  const {
    activeChatId,
    deleteMessage,
    togglePinMessage,
    addReaction,
    saveMessage,
    voteQuickAsk,
    votePoll,
  } = useApp();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);

  const isOutgoing = message.isOutgoing;
  const isDeleted = message.isDeleted;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Setup real audio player when audioUrl is present
  useEffect(() => {
    const audioSrc = message.audioUrl || (message.content.startsWith('data:audio') ? message.content : null);
    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        setPlaybackSeconds(Math.floor(audio.currentTime));
      };

      audio.onended = () => {
        setIsPlayingAudio(false);
        setPlaybackSeconds(0);
      };

      return () => {
        audio.pause();
        audioRef.current = null;
      };
    }
  }, [message.audioUrl, message.content]);

  const handleAudioToggle = () => {
    const audioSrc = message.audioUrl || (message.content.startsWith('data:audio') ? message.content : null);

    if (audioSrc) {
      if (!audioRef.current) {
        const audio = new Audio(audioSrc);
        audio.ontimeupdate = () => {
          setPlaybackSeconds(Math.floor(audio.currentTime));
        };
        audio.onended = () => {
          setIsPlayingAudio(false);
          setPlaybackSeconds(0);
        };
        audioRef.current = audio;
      }

      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlayingAudio(true);
        }).catch((err) => {
          console.warn('Audio play error:', err);
        });
      }
    } else {
      // Demo visual-only playback when audio URL is missing
      if (isPlayingAudio) {
        setIsPlayingAudio(false);
      } else {
        setIsPlayingAudio(true);
        const totalDuration = message.voiceNoteDuration || 4;
        let count = 0;
        const timer = setInterval(() => {
          count++;
          setPlaybackSeconds(count);
          if (count >= totalDuration) {
            clearInterval(timer);
            setIsPlayingAudio(false);
            setPlaybackSeconds(0);
          }
        }, 1000);
      }
    }
  };

  const handleDownloadMedia = async (src: string, defaultName: string) => {
    try {
      if (!src) return;

      if (src.startsWith('data:')) {
        const blob = dataURLtoBlob(src);

        // Try native Android Web Share API for direct gallery save
        if (typeof navigator !== 'undefined' && navigator.canShare) {
          try {
            const file = new File([blob], defaultName, { type: blob.type });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: defaultName,
              });
              return;
            }
          } catch {}
        }

        // Standard Blob URL download for Android Chrome & mobile web
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = defaultName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } else {
        const link = document.createElement('a');
        link.href = src;
        link.download = defaultName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.warn('Download notice', e);
      try {
        window.open(src, '_blank');
      } catch {}
    }
  };

  const handleDownloadDoc = () => {
    const fileName = message.fileName || 'Dokumen_NYARIOS.pdf';
    const src = message.fileUrl || message.content;
    handleDownloadMedia(src, fileName);
  };

  const reactionList = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  return (
    <div
      className={`group relative flex flex-col my-1 ${
        isOutgoing ? 'items-end' : 'items-start'
      } select-none`}
    >
      {/* Sender name for group chats if incoming */}
      {!isOutgoing && isGroup && message.type !== 'system' && (
        <span className="text-[11px] font-bold text-[#ff6b6b] ml-12 mb-0.5">
          {message.senderName}
        </span>
      )}

      <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]">
        {/* Incoming message Avatar */}
        {!isOutgoing && message.type !== 'system' && (
          <Avatar
            name={message.senderName}
            src={message.senderAvatar}
            size="xs"
            className="mb-1"
          />
        )}

        {/* Bubble Box */}
        <div
          className={`relative px-4 py-2.5 rounded-[18px] transition-all shadow-md ${
            isOutgoing
              ? 'bg-gradient-to-r from-[#ff5757] to-[#e63939] text-white shadow-[#ff4b4b]/20'
              : 'bg-[#22252b] text-slate-100 neu-raised-sm border border-white/[0.04]'
          } ${isDeleted ? 'opacity-60 italic' : ''}`}
        >
          {/* Quoted reply banner */}
          {message.replyTo && (
            <div
              className={`mb-2 px-2.5 py-1.5 rounded-xl text-xs border-l-4 ${
                isOutgoing
                  ? 'bg-black/20 border-white text-white'
                  : 'bg-[#18191d] border-[#ff4b4b] text-slate-300'
              }`}
            >
              <span className="font-bold text-[10px] block opacity-80">
                {message.replyTo.senderName}
              </span>
              <p className="truncate text-xs opacity-90">{message.replyTo.content}</p>
            </div>
          )}

          {/* 1. TEXT MESSAGE */}
          {message.type === 'text' && (
            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* 2. IMAGE MESSAGE */}
          {message.type === 'image' && (
            <div className="space-y-1.5">
              <div className="relative rounded-xl overflow-hidden group/img">
                <img
                  src={message.content}
                  alt="Foto"
                  className="rounded-xl max-h-72 w-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => setIsPhotoLightboxOpen(true)}
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity z-10">
                  <button
                    type="button"
                    title="Simpan / Download Foto"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadMedia(
                        message.content,
                        message.fileName || `Foto_NYARIOS_${Date.now()}.jpg`
                      );
                    }}
                    className="p-2 rounded-full bg-black/75 hover:bg-black/90 text-white backdrop-blur-md transition-transform hover:scale-110 shadow-lg border border-white/20 active:scale-95"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button
                    type="button"
                    title="Perbesar"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPhotoLightboxOpen(true);
                    }}
                    className="p-2 rounded-full bg-black/75 hover:bg-black/90 text-white backdrop-blur-md transition-transform hover:scale-110 shadow-lg border border-white/20 active:scale-95"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {message.caption && message.caption !== message.content && (
                <p className="text-xs sm:text-sm pt-1">{message.caption}</p>
              )}
            </div>
          )}

          {/* 2.5 VIDEO MESSAGE */}
          {message.type === 'video' && (
            <div className="space-y-1.5 min-w-[240px]">
              <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-lg group/vid">
                <video
                  src={message.content}
                  controls
                  playsInline
                  preload="metadata"
                  className="rounded-2xl max-h-72 w-full object-contain"
                />
                <button
                  type="button"
                  title="Simpan / Download Video"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadMedia(
                      message.content,
                      message.fileName || `Video_NYARIOS_${Date.now()}.mp4`
                    );
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/75 hover:bg-black/90 text-white backdrop-blur-md opacity-90 sm:opacity-0 sm:group-hover/vid:opacity-100 transition-all hover:scale-110 shadow-lg border border-white/20 z-10 active:scale-95"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
              {message.caption && message.caption !== message.content && (
                <p className="text-xs sm:text-sm pt-1">{message.caption}</p>
              )}
            </div>
          )}

          {/* 3. VOICE NOTE / AUDIO MESSAGE (ACTIVE SOUNDWAVES & TIMER) */}
          {message.type === 'voice_note' && (
            <div className="flex items-center gap-3 py-1 min-w-[210px]">
              <button
                type="button"
                onClick={handleAudioToggle}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isOutgoing
                    ? 'bg-white text-[#ff4b4b] shadow-md hover:scale-105'
                    : 'bg-[#ff4b4b] text-white shadow-md shadow-[#ff4b4b]/30 hover:scale-105'
                }`}
                title={isPlayingAudio ? 'Jeda' : 'Putar Pesan Suara'}
              >
                {isPlayingAudio ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>

              {/* Sound waves animation */}
              <div className="flex-1 flex items-center gap-1 h-8 px-1">
                {[1, 3, 2, 4, 5, 3, 4, 2, 5, 1, 4, 3, 2].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all ${
                      isPlayingAudio ? `animate-wave-${(i % 5) + 1}` : ''
                    } ${
                      isOutgoing
                        ? isPlayingAudio
                          ? 'bg-white'
                          : 'bg-white/60'
                        : isPlayingAudio
                        ? 'bg-[#ff4b4b]'
                        : 'bg-slate-500'
                    }`}
                    style={{ height: `${h * 4 + 4}px` }}
                  />
                ))}
              </div>

              <span className={`text-[10px] font-mono font-bold ${isOutgoing ? 'text-white/90' : 'text-slate-300'}`}>
                {isPlayingAudio
                  ? `0:0${playbackSeconds}`
                  : message.audioDuration || '0:06'}
              </span>
            </div>
          )}

          {/* 4. DOCUMENT MESSAGE (DOWNLOADABLE) */}
          {message.type === 'document' && (
            <div className="flex items-center gap-3 py-1.5 min-w-[230px]">
              <div className={`p-2.5 rounded-2xl ${isOutgoing ? 'bg-white/20' : 'neu-raised text-[#ff4b4b]'}`}>
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold block truncate">{message.fileName || 'Dokumen.pdf'}</span>
                <span className={`text-[10px] ${isOutgoing ? 'text-white/80' : 'text-slate-400'}`}>
                  {message.fileSize || '1.2 MB'} • Berkas
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadDoc}
                className={`p-2 rounded-xl transition-all ${
                  isOutgoing
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'neu-raised-circle text-slate-300 hover:text-white'
                }`}
                title="Unduh Berkas"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 5. QUICK ASK (TANYA GRUP) */}
          {message.type === 'quick_ask' && message.quickAsk && (
            <div className="space-y-3 min-w-[240px] pt-1">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#ff4b4b]" />
                <span className="text-xs font-bold text-white">Tanya Grup</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold">{message.quickAsk.question}</p>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'can_attend', label: 'Bisa', color: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40' },
                  { key: 'cannot_attend', label: 'Tidak', color: 'bg-rose-600/30 text-rose-300 border-rose-500/40' },
                  { key: 'undecided', label: 'Ragu', color: 'bg-amber-600/30 text-amber-300 border-amber-500/40' },
                ].map((opt) => {
                  const votes = message.quickAsk?.votes[opt.key as keyof typeof message.quickAsk.votes] || [];
                  const isVoted = votes.includes('Saya');
                  return (
                    <button
                      key={opt.key}
                      onClick={() => activeChatId && voteQuickAsk(activeChatId, message.id, opt.key as any)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        isVoted ? 'ring-2 ring-white ' + opt.color : 'bg-[#18191d] border-white/10 text-slate-300 hover:bg-[#25282e]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className="block text-[10px] opacity-75 mt-0.5">{votes.length}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. POLL MESSAGE */}
          {message.type === 'poll' && message.poll && (
            <div className="space-y-2.5 min-w-[240px] pt-1">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#ff4b4b]" />
                <span className="text-xs font-bold text-white">Jajak Pendapat</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold">{message.poll.question}</p>

              <div className="space-y-1.5">
                {message.poll.options.map((opt) => {
                  const totalVotes = message.poll!.options.reduce((acc, o) => acc + o.voterNames.length, 0);
                  const pct = totalVotes > 0 ? Math.round((opt.voterNames.length / totalVotes) * 100) : 0;
                  const isVoted = opt.voterNames.includes('Saya');
                  return (
                    <button
                      key={opt.id}
                      onClick={() => activeChatId && votePoll(activeChatId, message.id, opt.id)}
                      className={`w-full relative overflow-hidden p-2 rounded-xl text-left text-xs border transition-all ${
                        isVoted
                          ? 'border-[#ff4b4b] bg-[#ff4b4b]/20 font-bold'
                          : 'border-white/10 bg-[#18191d] text-slate-300 hover:bg-[#25282e]'
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-[#ff4b4b]/20 rounded-xl"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="relative flex items-center justify-between z-10">
                        <span>{opt.text}</span>
                        <span className="text-[10px] font-mono opacity-80">{pct}% ({opt.voterNames.length})</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. TASK CARD MESSAGE */}
          {message.type === 'task_card' && message.taskData && (
            <div className="space-y-2 min-w-[230px] pt-1">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#ff4b4b]" />
                <span className="text-xs font-bold uppercase tracking-wider">Tugas</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold">{message.taskData.title}</h4>
              <div className={`flex items-center gap-2 text-[10px] ${isOutgoing ? 'text-white/80' : 'text-slate-400'}`}>
                <span>PJ: {message.taskData.assignee}</span>
                <span>•</span>
                <span>Tenggat: {message.taskData.deadline}</span>
              </div>
            </div>
          )}

          {/* 8. SCHEDULE CARD MESSAGE */}
          {message.type === 'schedule_card' && message.scheduleData && (
            <div className="space-y-2 min-w-[230px] pt-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#ff4b4b]" />
                <span className="text-xs font-bold uppercase tracking-wider">Jadwal Agenda</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold">{message.scheduleData.title}</h4>
              <div className={`flex items-center gap-2 text-[10px] ${isOutgoing ? 'text-white/80' : 'text-slate-400'}`}>
                <span>{message.scheduleData.date}</span>
                <span>•</span>
                <span>{message.scheduleData.startTime}</span>
              </div>
            </div>
          )}

          {/* Bubble Footer: Timestamp & status check */}
          <div
            className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
              isOutgoing ? 'text-white/80' : 'text-slate-400'
            }`}
          >
            {message.isEdited && <span className="italic opacity-80">(diedit)</span>}
            {message.isPinned && <Pin className="w-2.5 h-2.5 fill-current" />}
            {message.savedCategory && <Bookmark className="w-2.5 h-2.5 fill-current" />}
            <span>{message.timestamp}</span>

            {isOutgoing && (
              <span>
                {message.status === 'read' ? (
                  <CheckCheck className="w-3 h-3 text-white" />
                ) : message.status === 'delivered' ? (
                  <CheckCheck className="w-3 h-3 text-white/70" />
                ) : (
                  <Check className="w-3 h-3 text-white/70" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Hover Action Popover Trigger */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 pb-1">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="p-1.5 rounded-full neu-raised-circle text-slate-400 hover:text-white"
            title="Tambah Reaksi"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-full neu-raised-circle text-slate-400 hover:text-white"
            title="Opsi Pesan"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reaction Picker Popup */}
      {showReactionPicker && (
        <div
          className={`absolute ${
            isOutgoing ? 'right-0' : 'left-8'
          } -top-8 z-30 flex items-center gap-1 p-1 rounded-full bg-[#23262c] shadow-2xl border border-white/10 animate-fade-in`}
        >
          {reactionList.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                if (activeChatId) addReaction(activeChatId, message.id, emoji);
                setShowReactionPicker(false);
              }}
              className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-sm transition-transform hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Reactions Display */}
      {message.reactions && message.reactions.length > 0 && (
        <div
          className={`flex flex-wrap gap-1 mt-1 ${
            isOutgoing ? 'justify-end mr-1' : 'justify-start ml-12'
          }`}
        >
          {message.reactions.map((r, i) => (
            <button
              key={i}
              onClick={() => activeChatId && addReaction(activeChatId, message.id, r.emoji)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border border-white/10 ${
                r.users.includes('Saya')
                  ? 'bg-[#ff4b4b]/30 text-white border-[#ff4b4b]'
                  : 'bg-[#202227] text-slate-300'
              }`}
            >
              <span>{r.emoji}</span>
              <span>{r.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Photo Modal */}
      {isPhotoLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setIsPhotoLightboxOpen(false)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2.5 z-50">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadMedia(
                  message.content,
                  message.fileName || `Foto_NYARIOS_${Date.now()}.jpg`
                );
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg transition-transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Simpan Foto</span>
            </button>
            <button
              onClick={() => setIsPhotoLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <img
            src={message.content}
            alt="Foto Fullscreen"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Message Context Menu */}
      {showMenu && (
        <div
          className={`absolute ${
            isOutgoing ? 'right-10' : 'left-10'
          } top-6 z-40 w-48 bg-[#23262c] rounded-2xl shadow-2xl border border-white/10 py-1.5 text-xs text-slate-200 animate-fade-in neu-flat`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Direct Download Option for Media */}
          {(message.type === 'image' || message.type === 'video' || message.type === 'document' || message.type === 'voice_note') && (
            <button
              onClick={() => {
                const src = message.fileUrl || message.content;
                let defaultName = message.fileName;
                if (!defaultName) {
                  if (message.type === 'image') defaultName = `Foto_NYARIOS_${Date.now()}.jpg`;
                  else if (message.type === 'video') defaultName = `Video_NYARIOS_${Date.now()}.mp4`;
                  else if (message.type === 'voice_note') defaultName = `Suara_NYARIOS_${Date.now()}.wav`;
                  else defaultName = `Dokumen_NYARIOS_${Date.now()}.pdf`;
                }
                handleDownloadMedia(src, defaultName);
                setShowMenu(false);
              }}
              className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#2c3038] text-emerald-400 font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Simpan ke Perangkat</span>
            </button>
          )}

          <button
            onClick={() => {
              onReply(message);
              setShowMenu(false);
            }}
            className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#2c3038]"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Balas</span>
          </button>
          <button
            onClick={() => {
              onForward(message);
              setShowMenu(false);
            }}
            className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#2c3038]"
          >
            <Forward className="w-3.5 h-3.5" />
            <span>Teruskan</span>
          </button>
          <button
            onClick={() => {
              if (activeChatId) togglePinMessage(activeChatId, message.id);
              setShowMenu(false);
            }}
            className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#2c3038]"
          >
            <Pin className="w-3.5 h-3.5" />
            <span>{message.isPinned ? 'Lepas Sematan' : 'Sematkan'}</span>
          </button>
          <button
            onClick={() => {
              onConvertToTask(message);
              setShowMenu(false);
            }}
            className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#2c3038] text-amber-400 font-bold"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Jadikan Tugas</span>
          </button>
          <button
            onClick={() => {
              if (activeChatId) saveMessage(activeChatId, message.id, 'Penting');
              setShowMenu(false);
            }}
            className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#2c3038]"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Simpan Pesan</span>
          </button>

          {isOutgoing && message.type === 'text' && (
            <button
              onClick={() => {
                onEdit(message);
                setShowMenu(false);
              }}
              className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#2c3038]"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Pesan</span>
            </button>
          )}

          <div className="my-1 border-t border-white/5" />
          <button
            onClick={() => {
              if (activeChatId) deleteMessage(activeChatId, message.id);
              setShowMenu(false);
            }}
            className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-rose-400 hover:bg-rose-950/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Pesan</span>
          </button>
        </div>
      )}
    </div>
  );
};

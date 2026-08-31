import React, { useState, useRef } from 'react';
import {
  Video,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Flame,
  Music,
  Send,
  Sparkles,
  X,
  Bookmark,
  Check,
  Film,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { CreateVideoPostModal } from './CreateVideoPostModal';
import { sound } from '../../utils/sound';

export const VideoLiveView: React.FC = () => {
  const {
    videoPosts,
    likeVideoPost,
    addVideoComment,
    shareVideoToChat,
    chats,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'trending'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCreateVideoOpen, setIsCreateVideoOpen] = useState(false);

  // Active playing video ID & mute states
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [followedCreators, setFollowedCreators] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});

  // Video Share to Chat Modal
  const [sharingPost, setSharingPost] = useState<typeof videoPosts[0] | null>(null);

  // Floating Heart Animation per Post (Double tap)
  const [likeAnimations, setLikeAnimations] = useState<Record<string, boolean>>({});

  const filteredPosts = videoPosts.filter((p) => {
    if (selectedTag && !p.tags.includes(selectedTag)) return false;
    if (activeTab === 'trending') return (p.likes || 0) > 100;
    return true;
  });

  const handleTogglePlay = (postId: string, videoEl: HTMLVideoElement | null) => {
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play();
      setPlayingVideoId(postId);
    } else {
      videoEl.pause();
      setPlayingVideoId(null);
    }
  };

  const handleDoubleTapLike = (postId: string) => {
    likeVideoPost(postId);
    sound.playMessageSent();

    setLikeAnimations((prev) => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      setLikeAnimations((prev) => ({ ...prev, [postId]: false }));
    }, 900);
  };

  const handleLikeVideo = (postId: string) => {
    likeVideoPost(postId);
    sound.playMessageSent();
  };

  const handleToggleFollow = (creatorId: string) => {
    setFollowedCreators((prev) => ({
      ...prev,
      [creatorId]: !prev[creatorId],
    }));
    sound.playTap();
  };

  const handleToggleSave = (postId: string) => {
    setSavedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
    sound.playTap();
  };

  const handleShareToSpecificChat = (chatId: string, chatName: string) => {
    if (!sharingPost) return;
    shareVideoToChat(sharingPost.id, chatId);
    setSharingPost(null);
    setShareToast(`✓ Video berhasil dibagikan ke ${chatName}!`);
    setTimeout(() => setShareToast(null), 2500);
  };

  const handleCopyVideoLink = () => {
    if (!sharingPost) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Tonton video di NYARIOS: "${sharingPost.caption}"`);
    }
    setSharingPost(null);
    setShareToast('✓ Tautan video berhasil disalin!');
    setTimeout(() => setShareToast(null), 2500);
  };

  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;
    addVideoComment(postId, commentInput.trim());
    sound.playMessageSent();
    setCommentInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18191d] select-none overflow-y-auto">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold shadow-2xl animate-slide-up">
          {shareToast}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-xl mx-auto w-full px-4 sm:px-6 pt-6 pb-24 md:pb-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl neu-raised-circle text-[#ff4b4b] shadow-md">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Klip Video</span>
              </h1>
              <p className="text-xs text-slate-400">
                Jelajahi & bagikan video kreatif ke komunitas NYARIOS
              </p>
            </div>
          </div>

          {/* Action Button: Unggah Video */}
          <button
            type="button"
            onClick={() => setIsCreateVideoOpen(true)}
            className="px-4 py-2.5 rounded-2xl neu-coral-btn flex items-center gap-2 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#ff4b4b]/30"
          >
            <Plus className="w-4 h-4 font-bold" />
            <span>Unggah Video</span>
          </button>
        </div>

        {/* Filter Tabs & Tag Bar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl neu-inset bg-[#18191d]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setSelectedTag(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'all' && !selectedTag
                  ? 'neu-coral-btn text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Semua Video ({videoPosts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('trending');
                setSelectedTag(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'trending'
                  ? 'neu-coral-btn text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Populer 🔥</span>
            </button>
          </div>

          {selectedTag && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs animate-fade-in">
              <span>Menampilkan video tagar: <b>#{selectedTag}</b></span>
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="font-bold underline hover:text-white"
              >
                Hapus Filter ✕
              </button>
            </div>
          )}
        </div>

        {/* VIDEO FEEDS SECTION (INSTAGRAM STYLE CARDS) */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="p-8 sm:p-10 rounded-3xl bg-[#1e2025] neu-raised border border-white/5 text-center flex flex-col items-center justify-center space-y-3 shadow-xl">
              <div className="w-16 h-16 rounded-full neu-inset flex items-center justify-center text-rose-500 shadow-inner">
                <Video className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Belum Ada Klip Video</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Jadilah yang pertama mengunggah video kreatif dari galeri HP Anda!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateVideoOpen(true)}
                className="px-5 py-2.5 rounded-2xl neu-coral-btn text-white text-xs font-bold shadow-lg shadow-[#ff4b4b]/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
                <span>Unggah Video Pertama</span>
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isCommentsOpen = openCommentsPostId === post.id;
              const isDoubleTapActive = likeAnimations[post.id];
              const isFollowed = followedCreators[post.creatorId];
              const isSaved = savedPosts[post.id];

              return (
                <div
                  key={post.id}
                  className="rounded-3xl bg-[#1e2025] neu-raised border border-white/5 overflow-hidden shadow-xl"
                >
                  {/* Creator Header */}
                  <div className="p-4 flex items-center justify-between border-b border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="ring-2 ring-[#ff4b4b]/60 rounded-full p-0.5">
                        <Avatar name={post.creatorName} src={post.creatorAvatar} size="sm" isOnline={true} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            {post.creatorName}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {post.creatorHandle}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {post.timestamp}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFollow(post.creatorId)}
                      className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all border ${
                        isFollowed
                          ? 'bg-[#ff4b4b]/20 text-[#ff6b6b] border-[#ff4b4b]/40'
                          : 'neu-raised hover:bg-[#ff4b4b] hover:text-white text-slate-300 border-white/5'
                      }`}
                    >
                      {isFollowed ? 'Mengikuti ✓' : 'Ikuti +'}
                    </button>
                  </div>

                  {/* Video Player Container */}
                  <div
                    className="relative aspect-[4/5] sm:aspect-video w-full bg-black flex items-center justify-center cursor-pointer group"
                    onDoubleClick={() => handleDoubleTapLike(post.id)}
                  >
                    <video
                      id={`video-${post.id}`}
                      src={post.videoUrl}
                      muted={isMuted}
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                      onClick={(e) => handleTogglePlay(post.id, e.currentTarget)}
                    />

                    {/* Double Tap Big Heart Animation */}
                    {isDoubleTapActive && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping duration-700">
                        <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl" />
                      </div>
                    )}

                    {/* Audio Title Tag */}
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-medium">
                      <Music className="w-3 h-3 text-rose-400 animate-spin" />
                      <span className="truncate max-w-[140px]">
                        {post.audioTitle || 'Original Audio'}
                      </span>
                    </div>

                    {/* Sound Mute/Unmute Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80 transition-all"
                      title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-slate-300" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-rose-400" />
                      )}
                    </button>
                  </div>

                  {/* Action Buttons Bar (Instagram Style) */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Like Button */}
                        <button
                          type="button"
                          onClick={() => handleLikeVideo(post.id)}
                          className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                            post.isLiked ? 'text-rose-500 scale-110' : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              post.isLiked ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                          />
                          <span>{post.likes}</span>
                        </button>

                        {/* Comment Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setOpenCommentsPostId(
                              isCommentsOpen ? null : post.id
                            )
                          }
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.commentsCount}</span>
                        </button>

                        {/* Share to Chat Button */}
                        <button
                          type="button"
                          onClick={() => setSharingPost(post)}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                          <span>Bagikan</span>
                        </button>
                      </div>

                      {/* Save / Bookmark Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleSave(post.id)}
                        className={`transition-colors ${
                          isSaved ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                        }`}
                        title={isSaved ? 'Tersimpan' : 'Simpan Video'}
                      >
                        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    {/* Caption & Hashtags */}
                    <div className="space-y-1.5 text-xs">
                      <p className="text-slate-200 leading-relaxed">
                        <span className="font-bold text-white mr-1.5">
                          {post.creatorHandle}
                        </span>
                        {post.caption}
                      </p>

                      {/* Hashtags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {post.tags.map((t, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedTag(t)}
                              className="text-[11px] font-semibold text-[#ff6b6b] hover:underline"
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Comments Drawer */}
                    {isCommentsOpen && (
                      <div className="pt-3 border-t border-white/5 space-y-3 animate-fade-in">
                        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Komentar ({post.commentsList?.length || 0})
                        </h5>

                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                          {post.commentsList && post.commentsList.length > 0 ? (
                            post.commentsList.map((c) => (
                              <div
                                key={c.id}
                                className="flex items-start gap-2.5 p-2 rounded-2xl bg-black/20"
                              >
                                <Avatar name={c.userName} src={c.userAvatar} size="xs" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white">
                                      {c.userName}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                      {c.timestamp}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-300 mt-0.5">
                                    {c.text}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500 italic py-2 text-center">
                              Belum ada komentar. Jadilah yang pertama berkomentar!
                            </p>
                          )}
                        </div>

                        {/* Add Comment Input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Tulis komentar..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            className="flex-1 px-4 py-2 neu-inset rounded-2xl text-xs text-white placeholder:text-slate-500 outline-none border border-white/5 focus:border-[#ff4b4b]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(post.id)}
                            className="p-2 rounded-xl neu-coral-btn text-white"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SHARE VIDEO MODAL */}
      {sharingPost && (
        <div className="fixed inset-0 z-50 p-4 bg-black/80 backdrop-blur-md flex items-center justify-center select-none animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#1e2025] neu-raised border border-white/10 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-bold text-white">Bagikan Video</h4>
              </div>
              <button
                type="button"
                onClick={() => setSharingPost(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400">
                Pilih obrolan kontak atau grup untuk mengirim video ini:
              </p>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {chats.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleShareToSpecificChat(c.id, c.name)}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-[#23262c] hover:bg-[#2c3038] border border-white/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={c.name} src={c.avatar} size="sm" isGroup={c.isGroup} />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-white truncate group-hover:text-[#ff6b6b]">
                          {c.name}
                        </h5>
                        <p className="text-[10px] text-slate-400">
                          {c.isGroup ? 'Grup Komunitas' : 'Kontak Pribadi'}
                        </p>
                      </div>
                    </div>
                    <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#ff4b4b]" />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyVideoLink}
                className="w-full py-2.5 rounded-2xl neu-raised text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2 mt-2 border border-white/5"
              >
                <span>Salin Tautan Video</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE VIDEO MODAL */}
      <CreateVideoPostModal
        isOpen={isCreateVideoOpen}
        onClose={() => setIsCreateVideoOpen(false)}
      />
    </div>
  );
};

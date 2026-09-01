import React, { useState, useEffect } from 'react';
import { PlaySquare, Plus, Search, Heart, MessageCircle, Share2, MoreVertical, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ContentPost } from '../../types';
import { getAllContentPosts, updateContentPost, deleteContentPost } from '../../utils/contentDb';
import { broadcastDeleteContentPost } from '../../utils/cloudSync';
import { UploadVideoModal } from './UploadVideoModal';
import { UserProfileModal } from './UserProfileModal';

export const ContentView: React.FC = () => {
  const { currentUser } = useApp();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'mine' | 'popular' | 'recent'>('all');
  const [activeVideo, setActiveVideo] = useState<ContentPost | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
    const iv = setInterval(loadPosts, 5000);
    return () => clearInterval(iv);
  }, []);

  const loadPosts = async () => {
    const data = await getAllContentPosts();
    // Prepare object URLs for blobs if they exist
    const readyPosts = data.map(p => {
      if (p.videoBlob && (!p.videoUrl || p.videoUrl.startsWith('blob:'))) {
        p.videoUrl = URL.createObjectURL(p.videoBlob as any);
      }
      return p;
    });
    setPosts(readyPosts);
  };

  const handleUploadSuccess = (post: ContentPost) => {
    setPosts([post, ...posts]);
    
  };

  const filteredPosts = posts.filter(p => {
    if (filter === 'mine' && p.userId !== currentUser.id) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.userName.toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => {
    if (filter === 'popular') return b.views - a.views || b.likes.length - a.likes.length;
    return b.rawTimestamp - a.rawTimestamp;
  });

  const handleLike = async (post: ContentPost) => {
    const isLiked = post.likes.includes(currentUser.id);
    const newLikes = isLiked 
      ? post.likes.filter(id => id !== currentUser.id)
      : [...post.likes, currentUser.id];
    
    const updated = { ...post, likes: newLikes };
    setPosts(posts.map(p => p.id === post.id ? updated : p));
    if (activeVideo?.id === post.id) setActiveVideo(updated);
    
    await updateContentPost(post.id, { likes: newLikes });
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Hapus video ini?')) return;
    await deleteContentPost(postId);
    broadcastDeleteContentPost(currentUser, postId);
    setPosts(posts.filter(p => p.id !== postId));
    if (activeVideo?.id === postId) setActiveVideo(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0B141A]">
      {/* Header */}
      <div className="h-16 px-4 md:px-6 bg-white dark:bg-[#111B21] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <PlaySquare className="w-6 h-6 text-emerald-500" />
            KONTEN
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Bagikan video dan momen terbaik Anda</p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Video</span>
          <span className="sm:hidden">Upload</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 flex flex-col sm:flex-row gap-3 items-center bg-white/50 dark:bg-[#0B141A]/50 border-b border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari konten..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-[#202C33] border-none rounded-full text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          {(['all', 'mine', 'popular', 'recent'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter === f ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-[#202C33] dark:text-slate-400'}`}
            >
              {f === 'all' ? 'Semua' : f === 'mine' ? 'Video Saya' : f === 'popular' ? 'Populer' : 'Terbaru'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredPosts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <PlaySquare className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">Belum ada konten</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">Upload video pertama Anda untuk mulai berbagi momen dengan komunitas.</p>
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="bg-emerald-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-emerald-600 transition"
            >
              + Upload Video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPosts.map(post => (
              <div 
                key={post.id} 
                onClick={() => {
                  setActiveVideo(post);
                  if (!post.views) {
                    const newViews = (post.views || 0) + 1;
                    updateContentPost(post.id, { views: newViews });
                    setPosts(posts.map(p => p.id === post.id ? { ...p, views: newViews } : p));
                  }
                }}
                className="group relative aspect-[9/16] bg-black rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition"
              >
                <video 
                  src={post.videoUrl} 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-300"
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <img onClick={(e) => { e.stopPropagation(); setProfileUserId(post.userId); }} src={post.userAvatar || `https://ui-avatars.com/api/?name=${post.userName}&background=10B981&color=fff`} className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition cursor-pointer" />
                    <span className="text-white text-xs font-medium truncate">{post.userName}</span>
                  </div>
                  <p className="text-white font-semibold text-sm line-clamp-2 leading-snug">{post.title}</p>
                  <div className="flex items-center gap-3 mt-2 text-white/80 text-xs font-medium">
                    <span className="flex items-center gap-1"><PlaySquare className="w-3 h-3" /> {post.views || 0}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes.length}</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center">
                    <PlaySquare className="w-6 h-6 text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {profileUserId && <UserProfileModal userId={profileUserId} isOpen={true} onClose={() => setProfileUserId(null)} />}
      <UploadVideoModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={handleUploadSuccess} 
      />

      {/* Video Viewer Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col md:flex-row backdrop-blur-sm">
          <button 
            onClick={() => setActiveVideo(null)}
            className="absolute top-4 left-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex items-center justify-center relative p-4 md:p-8 h-[60vh] md:h-full">
            <video 
              src={activeVideo.videoUrl} 
              controls 
              autoPlay 
              className="w-full h-full object-contain drop-shadow-2xl rounded-lg"
            />
          </div>

          <div className="w-full md:w-96 bg-white dark:bg-[#111B21] flex flex-col h-[40vh] md:h-full overflow-hidden shrink-0 border-l border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={activeVideo.userAvatar || `https://ui-avatars.com/api/?name=${activeVideo.userName}&background=10B981&color=fff`} className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition" onClick={() => { setActiveVideo(null); setProfileUserId(activeVideo.userId); }} />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 cursor-pointer hover:underline" onClick={() => { setActiveVideo(null); setProfileUserId(activeVideo.userId); }}>{activeVideo.userName}</h3>
                  <p className="text-xs text-slate-500">{new Date(activeVideo.rawTimestamp).toLocaleDateString()}</p>
                </div>
              </div>
              {activeVideo.userId === currentUser.id && (
                <button onClick={() => handleDelete(activeVideo.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{activeVideo.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{activeVideo.description}</p>

              <div className="flex items-center justify-around py-4 border-y border-slate-100 dark:border-slate-800/50 mb-6">
                <button onClick={() => handleLike(activeVideo)} className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition">
                  <Heart className={`w-6 h-6 ${activeVideo.likes.includes(currentUser.id) ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                  <span className="text-xs font-medium">{activeVideo.likes.length} Suka</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition">
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-xs font-medium">{activeVideo.comments.length} Komentar</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition">
                  <Share2 className="w-6 h-6" />
                  <span className="text-xs font-medium">Bagikan</span>
                </button>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Komentar</h4>
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">Belum ada komentar.</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2">
                <input type="text" placeholder="Tambahkan komentar..." className="flex-1 bg-slate-100 dark:bg-[#202C33] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white" />
                <button className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium">Kirim</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

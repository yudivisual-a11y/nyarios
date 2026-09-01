import React, { useState, useEffect } from 'react';
import { getFeedPosts } from '../../utils/socialDb';
import { SocialPost, SocialMedia } from '../../types';
import { PostCard } from './PostCard';
import { Search, Heart, Camera, MessageSquare } from 'lucide-react';

export const SocialFeed: React.FC = () => {
  const [posts, setPosts] = useState<{post: SocialPost, media: SocialMedia[]}[]>([]);

  useEffect(() => {
    loadPosts();
    // In production we'd listen to an event bus or use a live query
    const iv = setInterval(loadPosts, 5000);
    return () => clearInterval(iv);
  }, []);

  const loadPosts = async () => {
    const data = await getFeedPosts(50);
    setPosts(data);
  };

  const handleProfileClick = (userId: string) => {
    window.dispatchEvent(new CustomEvent('open-social-profile', { detail: { userId } }));
  };

  const handleCommentClick = (post: SocialPost) => {
    window.dispatchEvent(new CustomEvent('open-social-comments', { detail: { post } }));
  };

  return (
    <div className="flex-1 overflow-y-auto w-full h-full pb-20 md:pb-0 scroll-smooth">
       {/* Mobile Header (Hidden on Desktop, as Desktop has Sidebar) */}
       <div className="md:hidden sticky top-0 z-10 flex items-center justify-between p-4 bg-white/95 dark:bg-[#0B141A]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
          <h1 className="text-xl font-bold font-logo text-emerald-500">NYARIOS</h1>
          <div className="flex items-center gap-4">
             <button className="text-slate-800 dark:text-white"><Heart className="w-6 h-6" /></button>
             <button className="text-slate-800 dark:text-white"><MessageSquare className="w-6 h-6" /></button>
          </div>
       </div>

       {/* Stories Placeholder (Optional, for future) */}
       <div className="flex gap-4 p-4 overflow-x-auto border-b border-slate-200 dark:border-white/10 hide-scrollbar">
          <div className="flex flex-col items-center gap-1 min-w-[72px]">
             <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                <Camera className="w-6 h-6 text-slate-400" />
             </div>
             <span className="text-xs text-slate-500">Cerita Anda</span>
          </div>
       </div>

       {/* Feed */}
       <div className="flex flex-col w-full">
          {posts.map(p => (
            <PostCard 
              key={p.post.id} 
              post={p.post} 
              media={p.media} 
              onProfileClick={handleProfileClick}
              onCommentClick={handleCommentClick}
            />
          ))}
          {posts.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4">
                   <Camera className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum ada konten</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">Mulai ikuti orang-orang atau jadilah yang pertama membagikan konten.</p>
                <button onClick={() => window.dispatchEvent(new CustomEvent('open-social-upload'))} className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition">
                   Mulai Bagikan
                </button>
             </div>
          )}
       </div>
    </div>
  );
};

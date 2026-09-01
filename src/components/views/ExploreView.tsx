import React, { useState, useEffect } from 'react';
import { Search, Image as ImageIcon, Play } from 'lucide-react';
import { getFeedPosts } from '../../utils/socialDb';
import { SocialPost, SocialMedia } from '../../types';

export const ExploreView: React.FC = () => {
  const [posts, setPosts] = useState<{post: SocialPost, media: SocialMedia[]}[]>([]);

  useEffect(() => {
    // In real app, this would be a trending/explore query
    getFeedPosts(30).then(data => setPosts(data));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto w-full h-full bg-white dark:bg-[#0B141A] flex flex-col">
       <div className="p-4 border-b border-slate-200 dark:border-white/10 sticky top-0 bg-white/95 dark:bg-[#0B141A]/95 z-10 backdrop-blur-md">
          <div className="relative w-full max-w-xl mx-auto">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
             </div>
             <input 
                type="text" 
                placeholder="Cari pengguna, konten, atau tag..." 
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 transition"
             />
          </div>
       </div>

       <div className="p-1 md:p-4 grid grid-cols-3 gap-1 md:gap-4 w-full max-w-5xl mx-auto">
          {posts.map(p => {
             const m = p.media[0];
             const url = m && m.blob ? URL.createObjectURL(m.blob as any) : (m?.url || '');
             return (
               <div key={p.post.id} className="relative aspect-square bg-slate-200 dark:bg-slate-800 group cursor-pointer overflow-hidden">
                  {m && m.type === 'video' ? (
                     <>
                       <video src={url} className="w-full h-full object-cover" />
                       <div className="absolute top-2 right-2"><Play className="w-5 h-5 text-white drop-shadow-md" fill="currentColor" /></div>
                     </>
                  ) : (
                     <img src={url} className="w-full h-full object-cover" />
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-sm">
                     <span>{p.post.likesCount} Likes</span>
                     <span>{p.post.commentsCount} Comments</span>
                  </div>
               </div>
             );
          })}
       </div>
    </div>
  );
};

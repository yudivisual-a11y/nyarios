import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SocialPost, SocialMedia } from '../../types';
import { getFeedPosts } from '../../utils/socialDb';
import { PostCard } from '../social/PostCard';
import { Plus, Heart, MessageCircle } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { currentUser, contacts, setActiveNavTab } = useApp();
  const [posts, setPosts] = useState<{post: SocialPost, media: SocialMedia[]}[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    loadPosts();
    const suggested = contacts.filter((u: any) => u.id !== currentUser.id).slice(0, 5);
    setSuggestions(suggested);
  }, []);

  const loadPosts = async () => {
    const data = await getFeedPosts(50);
    setPosts(data);
  };

  const handleProfileClick = (userId: string) => {
    // In a real app, route to /profile/:id
    window.dispatchEvent(new CustomEvent('open-social-profile', { detail: { userId } }));
  };

  const handleCommentClick = (post: SocialPost) => {
    window.dispatchEvent(new CustomEvent('open-social-comments', { detail: { post } }));
  };

  // Dummy stories for UX mockup
  const stories = [
    { id: 'me', name: 'Cerita Anda', avatar: currentUser.avatar, isMe: true },
    ...contacts.slice(0, 8).map(c => ({ id: c.id, name: c.name.split(' ')[0], avatar: c.avatar, isMe: false }))
  ];

  return (
    <div className="flex flex-1 w-full h-full bg-[#F8FAFC] dark:bg-[#0B141A] overflow-hidden">
      {/* Center Feed */}
      <div className="flex-1 max-w-[600px] w-full mx-auto h-full flex flex-col bg-white dark:bg-[#111B21] border-x border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
        
        {/* Mobile Top Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10 sticky top-0 bg-white/95 dark:bg-[#111B21]/95 backdrop-blur-md z-20">
           <h1 className="text-2xl font-bold font-logo text-emerald-500">NYARIOS</h1>
           <div className="flex items-center gap-4">
              <button onClick={() => window.dispatchEvent(new CustomEvent('open-social-upload'))} className="text-slate-800 dark:text-white hover:text-emerald-500 transition">
                 <Plus className="w-6 h-6" />
              </button>
              <button onClick={() => setActiveNavTab('activity')} className="text-slate-800 dark:text-white hover:text-emerald-500 transition">
                 <Heart className="w-6 h-6" />
              </button>
              <button onClick={() => setActiveNavTab('dm')} className="text-slate-800 dark:text-white hover:text-emerald-500 transition relative">
                 <MessageCircle className="w-6 h-6" />
                 <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#111B21]"></span>
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-20 md:pb-0 scroll-smooth">
           {/* Stories Section */}
           <div className="flex gap-4 p-4 overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-white/10">
              {stories.map((s, i) => (
                <div key={s.id + i} className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0 w-[72px]">
                   <div className={`relative p-[3px] rounded-full ${s.isMe ? 'bg-slate-200 dark:bg-slate-700' : 'bg-gradient-to-tr from-emerald-500 to-lime-400'}`}>
                      <img 
                        src={s.avatar || `https://ui-avatars.com/api/?name=${s.name}&background=10B981&color=fff`}
                        className="w-16 h-16 rounded-full border-2 border-white dark:border-[#111B21] object-cover group-hover:scale-95 transition-transform"
                      />
                      {s.isMe && (
                        <div className="absolute bottom-0 right-0 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white dark:border-[#111B21]">
                           <Plus className="w-3.5 h-3.5" />
                        </div>
                      )}
                   </div>
                   <span className="text-xs text-slate-700 dark:text-slate-300 truncate w-full text-center font-medium">
                     {s.isMe ? 'Cerita Anda' : s.name}
                   </span>
                </div>
              ))}
           </div>

           {/* Posts */}
           <div className="flex flex-col">
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
                 <div className="py-20 text-center px-6">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Plus className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Selamat Datang di NYARIOS</h3>
                    <p className="text-slate-500 mb-6">Mulai ikuti orang-orang atau bagikan ceritamu.</p>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Desktop Right Sidebar: Suggestions */}
      <div className="hidden xl:block w-[350px] p-8 shrink-0 overflow-y-auto">
         <div className="flex items-center gap-4 mb-8">
            <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&size=128&background=10B981&color=fff`} className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-800" />
            <div className="flex-1">
               <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name}</h3>
               <p className="text-sm text-slate-500">@{currentUser.name.toLowerCase().replace(/\\s+/g, '')}</p>
            </div>
            <button className="text-sm font-bold text-emerald-500 hover:text-emerald-600 transition">Beralih</button>
         </div>

         <div className="flex items-center justify-between mb-4">
           <h4 className="font-bold text-slate-500 text-sm">Saran Untukmu</h4>
           <button className="text-xs font-bold text-slate-800 dark:text-white hover:opacity-70 transition">Lihat Semua</button>
         </div>

         <div className="space-y-4">
            {suggestions.map(u => (
              <div key={u.id} className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=10B981&color=fff`} className="w-10 h-10 rounded-full" />
                   <div>
                     <h5 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{u.name}</h5>
                     <p className="text-xs text-slate-500">Baru di NYARIOS</p>
                   </div>
                 </div>
                 <button className="text-xs font-bold text-emerald-500 hover:text-emerald-600 transition">Ikuti</button>
              </div>
            ))}
         </div>

         <div className="mt-8 text-xs text-slate-400 leading-relaxed">
            Tentang · Bantuan · Pers dan Media · API · Pekerjaan · Privasi · Ketentuan · Lokasi · Bahasa <br/>
            <br/>
            © 2026 NYARIOS FROM YUDIVISUAL
         </div>
      </div>
    </div>
  );
};

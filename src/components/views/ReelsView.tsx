import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, Music, Film } from 'lucide-react';
import { getFeedPosts } from '../../utils/socialDb';
import { SocialPost, SocialMedia } from '../../types';
import { useApp } from '../../context/AppContext';

export const ReelsView: React.FC = () => {
  const { contacts } = useApp();
  const [reels, setReels] = useState<{post: SocialPost, media: SocialMedia[]}[]>([]);

  useEffect(() => {
    // Only grab posts that have videos
    getFeedPosts(50).then(data => {
      const vids = data.filter(p => p.media.some(m => m.type === 'video'));
      setReels(vids);
    });
  }, []);

  if (reels.length === 0) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-black text-white">
        <Film className="w-16 h-16 text-slate-700 mb-4" />
        <h2 className="text-xl font-bold">Belum ada Reels</h2>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full w-full bg-black overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
      {reels.map((r, i) => (
        <ReelCard key={r.post.id} post={r.post} media={r.media} contacts={contacts} />
      ))}
    </div>
  );
};

const ReelCard: React.FC<{ post: SocialPost, media: SocialMedia[], contacts: any[] }> = ({ post, media, contacts }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const m = media.find(md => md.type === 'video');
  const url = m && m.blob ? URL.createObjectURL(m.blob as any) : (m?.url || '');

  const contact = contacts.find(c => c.id === post.ownerId);
  const name = contact?.name || 'User';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );
    
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full h-full snap-start relative flex justify-center bg-black">
       <div className="relative w-full max-w-[450px] h-full sm:h-[calc(100%-40px)] sm:my-5 sm:rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
          
          <video 
             ref={videoRef}
             src={url} 
             loop 
             playsInline
             onClick={() => {
                if (videoRef.current?.paused) videoRef.current.play();
                else videoRef.current?.pause();
             }}
             className="w-full h-full object-cover"
          />

          {/* Right Actions */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
             <div className="flex flex-col items-center gap-1">
                <button className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition">
                   <Heart className="w-7 h-7" />
                </button>
                <span className="text-white text-xs font-semibold drop-shadow-md">{post.likesCount}</span>
             </div>
             
             <div className="flex flex-col items-center gap-1">
                <button className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition">
                   <MessageCircle className="w-7 h-7" />
                </button>
                <span className="text-white text-xs font-semibold drop-shadow-md">{post.commentsCount}</span>
             </div>
             
             <button className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition">
                <Send className="w-7 h-7" />
             </button>
             
             <button className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition">
                <MoreHorizontal className="w-7 h-7" />
             </button>

             <div className="w-10 h-10 rounded-md border-2 border-white/50 overflow-hidden mt-2 animate-[spin_5s_linear_infinite]">
                <img src={`https://ui-avatars.com/api/?name=${name}&background=10B981&color=fff`} className="w-full h-full object-cover" />
             </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-16 p-4 pt-12 bg-gradient-to-t from-black/80 to-transparent z-10">
             <div className="flex items-center gap-3 mb-2">
                <img src={`https://ui-avatars.com/api/?name=${name}&background=10B981&color=fff`} className="w-9 h-9 rounded-full border border-white/20" />
                <span className="text-white font-bold text-sm drop-shadow-md">{name}</span>
                <button className="px-3 py-1 border border-white/50 rounded-lg text-white text-xs font-bold backdrop-blur-sm ml-2">Ikuti</button>
             </div>
             <p className="text-white text-sm line-clamp-2 drop-shadow-md mb-3">{post.caption}</p>
             <div className="flex items-center gap-2 text-white/90 text-xs bg-black/30 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Music className="w-3.5 h-3.5" />
                <span className="truncate max-w-[150px]">Audio Asli - {name}</span>
             </div>
          </div>

       </div>
    </div>
  );
};

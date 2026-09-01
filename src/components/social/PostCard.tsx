import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { SocialPost, SocialMedia } from '../../types';
import { getPostLikes, toggleLikePost, getPostComments } from '../../utils/socialDb';
import { useApp } from '../../context/AppContext';

interface Props {
  post: SocialPost;
  media: SocialMedia[];
  onProfileClick: (userId: string) => void;
  onCommentClick: (post: SocialPost) => void;
}

export const PostCard: React.FC<Props> = ({ post, media, onProfileClick, onCommentClick }) => {
  const { currentUser, contacts } = useApp();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  // Resolve user info
  let userName = 'User';
  let userAvatar = '';
  if (post.ownerId === currentUser.id) {
    userName = currentUser.name;
    userAvatar = currentUser.avatar || '';
  } else {
    const contact = contacts.find(c => c.id === post.ownerId);
    if (contact) {
      userName = contact.name;
      userAvatar = contact.avatar || '';
    }
  }

  useEffect(() => {
    checkLike();
  }, [post.id]);

  const checkLike = async () => {
    const likes = await getPostLikes(post.id);
    setLikesCount(likes.length);
    setIsLiked(likes.some(l => l.userId === currentUser.id));
  };

  const handleLike = async () => {
    // Optimistic UI
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    await toggleLikePost(post.id, currentUser.id);
    // Real check
    checkLike();
  };

  return (
    <div className="bg-white dark:bg-[#111B21] border-b border-slate-200 dark:border-white/10 pb-4">
       {/* Header */}
       <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onProfileClick(post.ownerId)}>
             <img src={userAvatar || `https://ui-avatars.com/api/?name=${userName}&background=10B981&color=fff`} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800" />
             <span className="font-semibold text-sm text-slate-900 dark:text-white hover:underline">{userName}</span>
          </div>
          <button className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition">
             <MoreHorizontal className="w-5 h-5" />
          </button>
       </div>

       {/* Media */}
       <div className="w-full bg-black aspect-square md:aspect-[4/5] flex items-center justify-center overflow-hidden">
          {media.length > 0 && (
             media[0].type === 'video' ? (
               <video 
                  src={media[0].url || (media[0].blob ? URL.createObjectURL(media[0].blob as any) : '')} 
                  controls 
                  className="w-full h-full object-contain"
               />
             ) : (
               <img 
                  src={media[0].url || (media[0].blob ? URL.createObjectURL(media[0].blob as any) : '')} 
                  className="w-full h-full object-cover"
               />
             )
          )}
          {media.length === 0 && <div className="text-white/50">No media</div>}
       </div>

       {/* Actions */}
       <div className="p-3">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-4">
                <button onClick={handleLike} className={`transition ${isLiked ? 'text-red-500' : 'text-slate-800 dark:text-white hover:text-slate-500'}`}>
                   <Heart className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => onCommentClick(post)} className="text-slate-800 dark:text-white hover:text-slate-500 transition">
                   <MessageCircle className="w-6 h-6" />
                </button>
                <button className="text-slate-800 dark:text-white hover:text-slate-500 transition">
                   <Send className="w-6 h-6" />
                </button>
             </div>
             <button className="text-slate-800 dark:text-white hover:text-slate-500 transition">
                <Bookmark className="w-6 h-6" />
             </button>
          </div>
          
          <div className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
             {likesCount} suka
          </div>
          
          <div className="text-sm text-slate-900 dark:text-white">
             <span className="font-semibold mr-2 cursor-pointer hover:underline" onClick={() => onProfileClick(post.ownerId)}>{userName}</span>
             <span className="opacity-90">{post.caption}</span>
          </div>

          <button onClick={() => onCommentClick(post)} className="text-sm text-slate-500 dark:text-slate-400 mt-1 hover:underline">
             Lihat semua komentar
          </button>
       </div>
    </div>
  );
};

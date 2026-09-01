import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SocialFeed } from '../social/SocialFeed';
import { User } from 'lucide-react';
import { getFollowStats, toggleFollow } from '../../utils/socialDb';
import { broadcastSocialInteraction } from '../../utils/cloudSync';

export const SocialLayout: React.FC = () => {
  const { currentUser, contacts } = useApp();
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const suggested = contacts.filter((u: any) => u.id !== currentUser.id).slice(0, 5);
    setSuggestions(suggested);
  }, [currentUser]);

  const handleFollow = async (userId: string) => {
    const isFollowing = await toggleFollow(currentUser.id, userId);
    broadcastSocialInteraction(isFollowing ? 'FOLLOW' : 'UNFOLLOW', {
      followerId: currentUser.id,
      followingId: userId,
      createdAt: Date.now()
    });
    // Optimistic UI update could be handled here or inside the suggestions component
  };

  return (
    <div className="flex w-full h-full bg-[#F8FAFC] dark:bg-[#0B141A] overflow-hidden">
      {/* Center: Main Feed */}
      <div className="flex-1 max-w-[600px] w-full mx-auto h-full border-r border-slate-200 dark:border-white/10 flex flex-col bg-white dark:bg-[#111B21] shadow-sm overflow-hidden">
         <SocialFeed />
      </div>

      {/* Right: Suggestions (Desktop only) */}
      <div className="hidden lg:block w-[350px] p-6 shrink-0 overflow-y-auto">
         <div className="flex items-center gap-4 mb-8">
            <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&size=128&background=10B981&color=fff`} className="w-14 h-14 rounded-full border-2 border-emerald-500" />
            <div>
               <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name}</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser.username || `@${currentUser.name.toLowerCase().replace(/\\s+/g, '')}`}</p>
            </div>
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
                     <p className="text-xs text-slate-500 dark:text-slate-400">Baru di NYARIOS</p>
                   </div>
                 </div>
                 <button 
                   onClick={() => handleFollow(u.id)}
                   className="text-xs font-bold text-emerald-500 hover:text-emerald-600 transition"
                 >
                   Ikuti
                 </button>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

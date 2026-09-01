import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, UserPlus, AtSign, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SocialNotification } from '../../types';
import { getNotifications, markNotificationsRead } from '../../utils/socialDb';

export const NotificationsView: React.FC = () => {
  const { currentUser, contacts } = useApp();
  const [notifs, setNotifs] = useState<SocialNotification[]>([]);

  useEffect(() => {
    loadNotifs();
  }, []);

  const loadNotifs = async () => {
    const data = await getNotifications(currentUser.id);
    setNotifs(data);
    await markNotificationsRead(currentUser.id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE': return <Heart className="w-5 h-5 text-red-500" fill="currentColor" />;
      case 'COMMENT': return <MessageCircle className="w-5 h-5 text-emerald-500" fill="currentColor" />;
      case 'FOLLOW': return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'MENTION': return <AtSign className="w-5 h-5 text-purple-500" />;
      default: return <Heart className="w-5 h-5 text-slate-500" />;
    }
  };

  const getText = (type: string) => {
    switch (type) {
      case 'LIKE': return 'menyukai konten Anda.';
      case 'COMMENT': return 'mengomentari konten Anda.';
      case 'FOLLOW': return 'mulai mengikuti Anda.';
      case 'MENTION': return 'menyebut Anda dalam sebuah komentar.';
      default: return 'berinteraksi dengan konten Anda.';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto h-full bg-white dark:bg-[#0B141A] border-x border-slate-200 dark:border-white/10">
       <div className="p-4 border-b border-slate-200 dark:border-white/10 sticky top-0 bg-white/95 dark:bg-[#0B141A]/95 z-10 backdrop-blur-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Aktivitas & Notifikasi</h2>
       </div>

       <div className="p-4 space-y-2">
          {notifs.map(n => {
            const contact = contacts.find(c => c.id === n.senderId);
            const name = contact?.name || 'Pengguna';
            const avatar = contact?.avatar || `https://ui-avatars.com/api/?name=${name}&background=10B981&color=fff`;
            
            return (
              <div key={n.id} className={`flex items-center gap-4 p-3 rounded-xl transition ${!n.read ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                 <div className="relative">
                    <img src={avatar} className="w-12 h-12 rounded-full" />
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#0B141A] rounded-full p-0.5 shadow-sm">
                       {getIcon(n.type)}
                    </div>
                 </div>
                 <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-slate-200">
                       <span className="font-bold cursor-pointer hover:underline">{name}</span> {getText(n.type)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                       {new Date(n.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute:'2-digit' })}
                    </p>
                 </div>
                 {n.type === 'FOLLOW' && (
                    <button className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-sm transition">
                       Ikuti Balik
                    </button>
                 )}
              </div>
            );
          })}

          {notifs.length === 0 && (
             <div className="text-center py-20">
                <Heart className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Aktivitas di Konten Anda</h3>
                <p className="text-slate-500 dark:text-slate-400">Saat seseorang menyukai atau mengomentari konten Anda, Anda akan melihatnya di sini.</p>
             </div>
          )}
       </div>
    </div>
  );
};

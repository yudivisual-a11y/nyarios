import fs from 'fs';
let content = fs.readFileSync('src/components/layout/MobileNavigation.tsx', 'utf8');

// I will completely replace the contents of MobileNavigation for the hybrid approach.
const replacement = `
import React, { useMemo } from 'react';
import { Home, Search, PlusSquare, Heart, UserCircle, MessageSquare, BookUser, Users2, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MainNavTab } from '../../types';

export const MobileNavigation: React.FC = () => {
  const { activeNavTab, setActiveNavTab, chats, currentUser } = useApp();

  const isSocialMode = ['konten', 'explore', 'notifications', 'saya'].includes(activeNavTab);

  const totalUnread = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const socialNavItems: { id: MainNavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'konten', label: 'Beranda', icon: <Home className="w-6 h-6" /> },
    { id: 'explore', label: 'Cari', icon: <Search className="w-6 h-6" /> },
    // A special upload button action could be handled here, but we will just map it to 'explore' for now and handle upload inside the views. Actually let's use a dummy id 'upload'
    { id: 'explore', label: 'Upload', icon: <PlusSquare className="w-6 h-6" /> }, 
    { id: 'notifications', label: 'Aktivitas', icon: <Heart className="w-6 h-6" /> },
    { id: 'saya', label: 'Profil', icon: <UserCircle className="w-6 h-6" /> },
  ];

  const commNavItems: { id: MainNavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'pesan', label: 'Pesan', icon: <MessageSquare className="w-5 h-5" />, badge: totalUnread > 0 ? totalUnread : undefined },
    { id: 'kontak', label: 'Kontak', icon: <BookUser className="w-5 h-5" /> },
    { id: 'konten', label: 'Sosial', icon: <Home className="w-5 h-5" /> }, // The bridge to social
    { id: 'komunitas', label: 'Komunitas', icon: <Users2 className="w-5 h-5" /> },
    { id: 'panggilan', label: 'Panggilan', icon: <Phone className="w-5 h-5" /> },
  ];

  const itemsToRender = isSocialMode ? socialNavItems : commNavItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-[#0B141A] border-t border-slate-200 dark:border-white/10 safe-area-bottom">
      <nav className="flex items-center justify-around h-14">
        {itemsToRender.map((item, idx) => {
          const isActive = activeNavTab === item.id && (item.label !== 'Upload'); // Don't highlight upload
          return (
            <button
              key={item.id + idx}
              onClick={() => {
                if (item.label === 'Upload') {
                  // Dispatch a custom event to open upload modal
                  window.dispatchEvent(new CustomEvent('open-social-upload'));
                } else {
                  setActiveNavTab(item.id);
                }
              }}
              className={\`relative flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all \${
                isActive 
                  ? (isSocialMode ? 'text-slate-900 dark:text-white' : 'text-emerald-500')
                  : 'text-slate-400 hover:text-slate-500 dark:hover:text-slate-300'
              }\`}
            >
              <div className={\`\${isActive && isSocialMode ? 'scale-110 transition-transform' : ''}\`}>
                 {item.icon}
              </div>
              {!isSocialMode && <span className="text-[10px] font-medium">{item.label}</span>}

              {item.badge && !isActive && (
                <span className="absolute top-1 right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
`;

fs.writeFileSync('src/components/layout/MobileNavigation.tsx', replacement);

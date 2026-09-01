import React from 'react';
import { Home, Search, Film, MessageCircle, UserCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MainNavTab } from '../../types';

export const MobileNavigation: React.FC = () => {
  const { activeNavTab, setActiveNavTab, chats } = useApp();

  const totalUnread = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const items: { id: MainNavTab; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', icon: <Home className="w-6 h-6" /> },
    { id: 'explore', icon: <Search className="w-6 h-6" /> },
    { id: 'reels', icon: <Film className="w-6 h-6" /> },
    { id: 'dm', icon: <MessageCircle className="w-6 h-6" />, badge: totalUnread > 0 ? totalUnread : undefined },
    { id: 'profile', icon: <UserCircle className="w-6 h-6" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0B141A]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 safe-area-bottom pb-2">
      <nav className="flex items-center justify-around h-12 mt-1">
        {items.map((item) => {
          const isActive = activeNavTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNavTab(item.id)}
              className={`relative flex-1 h-full flex items-center justify-center transition-all duration-200 ${
                isActive ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                 {item.icon}
              </div>

              {item.badge && (
                <span className="absolute top-0 right-1/4 translate-x-2 -translate-y-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
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

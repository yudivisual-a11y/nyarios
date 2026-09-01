import React from 'react';
import { PlaySquare,
  MessageSquare,
  BookUser,
  Camera,
  Users2,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MainNavTab } from '../../types';

export const MobileNavigation: React.FC = () => {
  const { activeNavTab, setActiveNavTab, chats, statuses, currentUser } = useApp();

  const totalUnread = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const otherUnreadStatuses = statuses.filter(
    (s) => s.userId !== currentUser.id && (!s.viewers || !s.viewers.includes(currentUser.name))
  ).length;

  const navItems: { id: MainNavTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      id: 'pesan',
      label: 'Pesan',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: totalUnread > 0 ? totalUnread : undefined,
    },
    {
      id: 'kontak',
      label: 'Kontak',
      icon: <BookUser className="w-5 h-5" />,
    },
        {
      id: 'konten',
      label: 'Konten',
      icon: <PlaySquare className="w-5 h-5" />,
    },
    {
      id: 'status',
      label: 'Status',
      icon: <Camera className="w-5 h-5" />,
      badge: otherUnreadStatuses > 0 ? otherUnreadStatuses : undefined,
    },
    {
      id: 'komunitas',
      label: 'Komunitas',
      icon: <Users2 className="w-5 h-5" />,
    },
    {
      id: 'saya',
      label: 'Pengaturan',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-4 left-3 right-3 z-30 flex justify-center select-none pointer-events-none">
      {/* Floating Dark Neumorphic Dock */}
      <nav className="pointer-events-auto w-full max-w-md px-3 py-2.5 rounded-full bg-[#18191d]/95 backdrop-blur-xl border border-white/5 shadow-2xl flex items-center justify-around neu-flat">
        {navItems.map((item) => {
          const isActive = activeNavTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNavTab(item.id)}
              className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-tr from-[#ff5757] to-[#e63939] text-white shadow-lg shadow-[#ff4b4b]/30 scale-105'
                  : 'neu-raised-circle text-slate-400 hover:text-slate-200'
              }`}
              title={item.label}
            >
              {item.icon}

              {/* Unread Count Badge */}
              {item.badge && !isActive && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-[#ff4b4b] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-[#18191d]">
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

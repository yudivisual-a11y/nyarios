import React from 'react';
import { Home, Search, Film, MessageCircle, Heart, PlusSquare, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MainNavTab } from '../../types';

export const DesktopSidebar: React.FC = () => {
  const { activeNavTab, setActiveNavTab, currentUser, chats } = useApp();

  const totalUnread = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const menuItems = [
    { id: 'home', label: 'Beranda', icon: <Home className="w-6 h-6" /> },
    { id: 'explore', label: 'Jelajahi', icon: <Search className="w-6 h-6" /> },
    { id: 'reels', label: 'Reels', icon: <Film className="w-6 h-6" /> },
    { id: 'dm', label: 'DM', icon: <MessageCircle className="w-6 h-6" />, badge: totalUnread > 0 ? totalUnread : undefined },
    { id: 'activity', label: 'Aktivitas', icon: <Heart className="w-6 h-6" /> },
    { id: 'create', label: 'Buat', icon: <PlusSquare className="w-6 h-6" /> },
  ];

  return (
    <div className="hidden md:flex flex-col w-20 lg:w-[240px] h-full bg-white dark:bg-[#0B141A] border-r border-slate-200 dark:border-white/10 py-6 transition-all duration-300">
      {/* Logo */}
      <div className="px-0 lg:px-6 mb-10 flex items-center justify-center lg:justify-start">
        <h1 className="hidden lg:block text-2xl font-bold font-logo text-emerald-500 tracking-tight">NYARIOS</h1>
        <h1 className="lg:hidden text-2xl font-bold font-logo text-emerald-500">N</h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeNavTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'create') {
                  window.dispatchEvent(new CustomEvent('open-social-upload'));
                } else {
                  setActiveNavTab(item.id as MainNavTab);
                }
              }}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <div className={`flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              <span className={`hidden lg:block font-semibold text-[15px] ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              
              {item.badge && (
                <span className="absolute right-4 lg:static ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-bold text-white shadow-sm">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Profile */}
        <button
          onClick={() => setActiveNavTab('profile')}
          className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group ${
            activeNavTab === 'profile' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'
          }`}
        >
          <img 
            src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=10B981&color=fff`} 
            alt="Profile" 
            className={`w-6 h-6 rounded-full border-2 transition-transform duration-200 ${activeNavTab === 'profile' ? 'border-emerald-500 scale-110' : 'border-transparent group-hover:scale-110'}`} 
          />
          <span className={`hidden lg:block font-semibold text-[15px] text-slate-800 dark:text-slate-200 ${activeNavTab === 'profile' ? 'font-bold text-emerald-500' : ''}`}>
            Profil
          </span>
        </button>
      </nav>

      {/* Footer / Settings */}
      <div className="px-3 mt-auto">
        <button className="w-full flex items-center justify-center lg:justify-start gap-4 px-3 py-3 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
          <Settings className="w-6 h-6 group-hover:rotate-45 transition-transform duration-300" />
          <span className="hidden lg:block font-semibold text-[15px]">Lainnya</span>
        </button>
      </div>
    </div>
  );
};

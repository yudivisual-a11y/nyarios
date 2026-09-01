import {
  MessageSquare,
  Users2,
  CircleDot,
  Phone,
  BookUser,
  Bookmark,
  CheckSquare,
  Calendar,
  FolderOpen,
  Settings,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NyariosLogo } from '../brand/NyariosLogo';
import { Avatar } from '../ui/Avatar';
import { MainNavTab, DesktopSubTab } from '../../types';

export const DesktopSidebar: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    activeDesktopSubTab,
    setActiveDesktopSubTab,
    chats,
    statuses,
    tasks,
    currentUser,
  } = useApp();

  const totalUnread = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const pendingTasks = tasks.filter(t => t.status !== 'done').length;

  const mainNavItems: { id: MainNavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'pesan',
      label: 'Pesan',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: totalUnread,
    },
    {
      id: 'kontak',
      label: 'Kontak',
      icon: <BookUser className="w-5 h-5" />,
    },
    {
      id: 'komunitas',
      label: 'Komunitas',
      icon: <Users2 className="w-5 h-5" />,
    },
    {
      id: 'status',
      label: 'Status',
      icon: <CircleDot className="w-5 h-5" />,
      badge: statuses.length > 0 ? statuses.length : undefined,
    },
    {
      id: 'panggilan',
      label: 'Panggilan',
      icon: <Phone className="w-5 h-5" />,
    },
  ];

  const subNavItems: { id: DesktopSubTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'tersimpan',
      label: 'Tersimpan',
      icon: <Bookmark className="w-4 h-4" />,
    },
    {
      id: 'aktivitas',
      label: 'Aktivitas & Tugas',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: pendingTasks > 0 ? pendingTasks : undefined,
    },
    {
      id: 'jadwal',
      label: 'Jadwal & Agenda',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'file_center',
      label: 'File Center',
      icon: <FolderOpen className="w-4 h-4" />,
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#18191d] border-r border-white/5 shrink-0 select-none h-screen transition-colors">
      {/* Top Header Branding */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <NyariosLogo size="md" withTagline={true} />
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-3 mb-2">
            Menu Utama
          </div>
          <div className="space-y-1.5">
            {mainNavItems.map((item) => {
              const isActive = activeDesktopSubTab === null && activeNavTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveDesktopSubTab(null);
                    setActiveNavTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#ff5757] to-[#e63939] text-white font-bold shadow-lg shadow-[#ff4b4b]/20 scale-[1.02]'
                      : 'neu-raised text-slate-300 hover:text-white hover:bg-[#23262c]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {!!item.badge && item.badge > 0 && (
                    <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-extrabold flex items-center justify-center ${
                      isActive ? 'bg-white text-[#ff4b4b]' : 'bg-[#ff4b4b] text-white'
                    }`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Navigation */}
        <div>
          <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-3 mb-2">
            Organisasi & Pintasan
          </div>
          <div className="space-y-1.5">
            {subNavItems.map((item) => {
              const isActive = activeDesktopSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveDesktopSubTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#ff5757] to-[#e63939] text-white font-bold shadow-md shadow-[#ff4b4b]/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#202227]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {!!item.badge && item.badge > 0 && (
                    <span className="min-w-[18px] h-4 px-1 rounded-full bg-[#ff4b4b] text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Profile */}
      <div className="p-3.5 border-t border-white/5 bg-[#16171a]/60">
        <div
          onClick={() => setActiveDesktopSubTab('pengaturan')}
          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#202227] cursor-pointer transition-colors"
        >
          <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" isOnline={true} />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {currentUser.name}
            </span>
            <span className="text-[10px] font-mono font-bold text-[var(--color-accent-primary,#ff4b4b)] truncate">
              {currentUser.username || `@${currentUser.name.toLowerCase().replace(/\s+/g, '_')}`}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

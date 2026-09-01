import React from 'react';
import { Home, FolderOpen, Plus, Palette, UserCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MainNavTab } from '../../types';

export const MobileNavigation: React.FC = () => {
  const { activeNavTab, setActiveNavTab } = useApp();

  const items = [
    { id: 'home', label: 'Home', icon: <Home className="w-6 h-6" /> },
    { id: 'projects', label: 'Project', icon: <FolderOpen className="w-6 h-6" /> },
    { id: 'action_add', label: 'Buat', icon: <Plus className="w-7 h-7 text-white" />, special: true },
    { id: 'assets', label: 'Assets', icon: <Palette className="w-6 h-6" /> },
    { id: 'profile', label: 'Profil', icon: <UserCircle className="w-6 h-6" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0B141A]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 safe-area-bottom pb-2">
      <nav className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          if (item.special) {
             return (
               <button
                 key={item.id}
                 onClick={() => setActiveNavTab('home')}
                 className="relative flex flex-col items-center justify-center w-14 h-14 -mt-6 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 text-white transition hover:scale-105 active:scale-95"
               >
                  {item.icon}
               </button>
             );
          }

          const isActive = activeNavTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNavTab(item.id as MainNavTab)}
              className={`relative flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${
                isActive ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

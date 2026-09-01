import React from 'react';
import { Home, FolderGit2, FileText, Table, DollarSign, Calendar, Folder, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MainNavTab } from '../../types';

export const DesktopSidebar: React.FC = () => {
  const { activeNavTab, setActiveNavTab, currentUser } = useApp();

  const menuItems = [
    { id: 'home', label: 'Beranda', icon: <Home className="w-5 h-5" /> },
    { id: 'workspace', label: 'Workspace', icon: <FolderGit2 className="w-5 h-5" /> },
    { id: 'docs', label: 'Dokumen', icon: <FileText className="w-5 h-5" /> },
    { id: 'data', label: 'Data', icon: <Table className="w-5 h-5" /> },
    { id: 'finance', label: 'Keuangan', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'schedule', label: 'Jadwal', icon: <Calendar className="w-5 h-5" /> },
    { id: 'files', label: 'File', icon: <Folder className="w-5 h-5" /> },
  ];

  return (
    <div className="hidden md:flex flex-col w-20 lg:w-[260px] h-full bg-[#F8FAFC] dark:bg-[#0B141A] border-r border-slate-200 dark:border-white/10 py-6 transition-all duration-300">
      {/* Logo */}
      <div className="px-0 lg:px-6 mb-10 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold shrink-0">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="hidden lg:block text-2xl font-black text-slate-900 dark:text-white tracking-tight">BERES</h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeNavTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNavTab(item.id as MainNavTab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <div className={`flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              <span className="hidden lg:block text-[15px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Profile */}
      <div className="px-3 mt-6">
        <button
          onClick={() => setActiveNavTab('profile')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
            activeNavTab === 'profile' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <img 
            src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=10B981&color=fff`} 
            alt="Profile" 
            className="w-8 h-8 rounded-full object-cover shrink-0" 
          />
          <div className="hidden lg:flex flex-col items-start overflow-hidden">
             <span className="font-bold text-sm text-slate-900 dark:text-white truncate w-full text-left">{currentUser.name}</span>
             <span className="text-xs text-slate-500 truncate w-full text-left">Free Plan</span>
          </div>
        </button>
      </div>
    </div>
  );
};

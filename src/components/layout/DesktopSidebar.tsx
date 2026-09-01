import React from 'react';
import { Home, FolderOpen, LayoutTemplate, Palette, Settings, Book, MessageSquare, Feather, Paintbrush, BookOpen, PenTool } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MainNavTab } from '../../types';

export const DesktopSidebar: React.FC = () => {
  const { activeNavTab, setActiveNavTab, currentUser } = useApp();

  return (
    <div className="hidden md:flex flex-col w-20 lg:w-[260px] h-full bg-[#F8FAFC] dark:bg-[#0B141A] border-r border-slate-200 dark:border-white/10 py-6 transition-all duration-300">
      {/* Logo */}
      <div className="px-0 lg:px-6 mb-10 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-emerald-500/30">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <div className="hidden lg:flex flex-col">
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">BERES</h1>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Creative Studio</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-8 overflow-y-auto hide-scrollbar">
        
        {/* Main Section */}
        <div>
           <button onClick={() => setActiveNavTab('home')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${activeNavTab === 'home' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-medium'}`}>
              <Home className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block text-[15px]">Beranda</span>
           </button>
        </div>

        {/* Studio Categories */}
        <div className="hidden lg:block">
           <h3 className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Studio</h3>
           <div className="space-y-1">
             {[
               { id: 'studio_book', label: 'Buku', icon: <Book className="w-4 h-4" /> },
               { id: 'studio_story', label: 'Cerita', icon: <Feather className="w-4 h-4" /> },
               { id: 'studio_comic', label: 'Komik', icon: <MessageSquare className="w-4 h-4" /> },
               { id: 'studio_coloring', label: 'Coloring Book', icon: <Paintbrush className="w-4 h-4" /> },
               { id: 'studio_worksheet', label: 'Worksheet', icon: <BookOpen className="w-4 h-4" /> },
               { id: 'studio_illustration', label: 'Ilustrasi', icon: <PenTool className="w-4 h-4" /> },
             ].map(item => (
               <button key={item.id} onClick={() => setActiveNavTab('studio' as any)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white font-medium`}>
                  <div className="text-slate-400 group-hover:text-emerald-500 transition-colors">{item.icon}</div>
                  <span className="text-[14px]">{item.label}</span>
               </button>
             ))}
           </div>
        </div>

        {/* Library Section */}
        <div>
           <h3 className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:block">Library</h3>
           <div className="space-y-1">
             {[
               { id: 'projects', label: 'Project Saya', icon: <FolderOpen className="w-5 h-5" /> },
               { id: 'templates', label: 'Template', icon: <LayoutTemplate className="w-5 h-5" /> },
               { id: 'assets', label: 'Assets', icon: <Palette className="w-5 h-5" /> },
             ].map(item => (
               <button key={item.id} onClick={() => setActiveNavTab(item.id as MainNavTab)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${activeNavTab === item.id ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-medium'}`}>
                  <div className="shrink-0 group-hover:text-emerald-500 transition-colors">{item.icon}</div>
                  <span className="hidden lg:block text-[15px]">{item.label}</span>
               </button>
             ))}
           </div>
        </div>

      </nav>

      {/* Footer / Profile */}
      <div className="px-3 mt-6">
        <button
          onClick={() => setActiveNavTab('profile')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
            activeNavTab === 'profile' ? 'bg-slate-200 dark:bg-white/10' : 'hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=10B981&color=fff`} className="w-8 h-8 rounded-full object-cover shrink-0" />
          <div className="hidden lg:flex flex-col items-start overflow-hidden">
             <span className="font-bold text-sm text-slate-900 dark:text-white truncate w-full text-left">{currentUser.name}</span>
             <span className="text-xs text-slate-500 truncate w-full text-left">Creator Plan</span>
          </div>
        </button>
      </div>
    </div>
  );
};

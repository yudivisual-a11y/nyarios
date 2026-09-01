import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserCircle, Settings, LogOut } from 'lucide-react';

export const BeresProfileView: React.FC = () => {
  const { currentUser, setActiveNavTab } = useApp();

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B141A] p-6 overflow-y-auto">
       <div className="max-w-2xl w-full mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Profil Anda</h1>
          
          <div className="bg-white dark:bg-[#111B21] rounded-2xl p-6 border border-slate-200 dark:border-white/10 flex items-center gap-6 mb-6">
             <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&size=128&background=10B981&color=fff`} className="w-24 h-24 rounded-full border border-slate-200 dark:border-slate-800" />
             <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentUser.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4">{currentUser.bio || 'Pengguna BERES'}</p>
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg transition text-sm flex items-center gap-2">
                   <Settings className="w-4 h-4" /> Edit Profil
                </button>
             </div>
          </div>

          <div className="bg-white dark:bg-[#111B21] rounded-2xl p-2 border border-slate-200 dark:border-white/10">
             <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition rounded-xl text-left text-slate-900 dark:text-white">
                <Settings className="w-5 h-5 text-slate-400" />
                <span className="font-semibold">Pengaturan Aplikasi</span>
             </button>
             <button 
                onClick={() => {
                   if (window.confirm('Keluar dari BERES?')) {
                      localStorage.removeItem('currentUser');
                      window.location.reload();
                   }
                }}
                className="w-full flex items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition rounded-xl text-left text-red-500"
             >
                <LogOut className="w-5 h-5" />
                <span className="font-semibold">Keluar</span>
             </button>
          </div>
       </div>
    </div>
  );
};

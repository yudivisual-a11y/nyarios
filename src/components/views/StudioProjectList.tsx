import React from 'react';
import { useApp } from '../../context/AppContext';
import { Folder, Palette, LayoutTemplate } from 'lucide-react';

export const StudioProjectList: React.FC = () => {
  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#0B141A] p-6 text-center">
       <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
          <Folder className="w-10 h-10 text-emerald-500" />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Daftar Project Kosong</h2>
       <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">Mulai buat karya pertamamu di BERES Creative Studio.</p>
       <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-500/20">
         + Buat Karya
       </button>
    </div>
  );
};

import React from 'react';
import { Calendar } from 'lucide-react';

export const BeresScheduleView: React.FC = () => {
  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#0B141A] p-6 text-center">
       <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
          <Calendar className="w-10 h-10 text-emerald-500" />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Belum ada jadwal.</h2>
       <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">Yuk mulai sesuatu dan biarkan BERES membantu.</p>
       <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-500/20">
         Buat Jadwal Baru
       </button>
    </div>
  );
};

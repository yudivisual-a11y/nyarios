import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Table, DollarSign, Calendar, CheckSquare, Plus, Folder, Search, Filter } from 'lucide-react';

export const BeresWorkspace: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('Semua');

  const filters = ['Semua', 'Dokumen', 'Data', 'Keuangan', 'Jadwal', 'File'];

  // Mock data for UI presentation as per user request (Empty state mostly, or dummy marked as demo)
  const items = [
    { id: 1, name: 'Laporan Pengeluaran Agustus', type: 'Keuangan', date: 'Hari ini', status: 'Selesai', icon: <DollarSign className="w-5 h-5 text-emerald-500" /> },
    { id: 2, name: 'Surat Pengantar RT', type: 'Dokumen', date: 'Kemarin', status: 'Draft', icon: <FileText className="w-5 h-5 text-blue-500" /> },
    { id: 3, name: 'Rekap Absensi', type: 'Data', date: '2 Sep', status: 'Diproses', icon: <Table className="w-5 h-5 text-indigo-500" /> },
  ];

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B141A]">
      {/* Header */}
      <div className="px-6 py-6 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111B21]">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workspace</h1>
        <p className="text-slate-500 mt-1">Tempat semua pekerjaan Anda dibereskan.</p>
        
        {/* Filters */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto hide-scrollbar pb-1">
           {filters.map(f => (
             <button 
               key={f}
               onClick={() => setActiveFilter(f)}
               className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                 activeFilter === f 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
               }`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
           <div className="relative w-full max-w-sm">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="text" placeholder="Cari pekerjaan..." className="w-full bg-white dark:bg-[#111B21] border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition dark:text-white" />
           </div>
           <button className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition">
             <Filter className="w-4 h-4" /> Filter
           </button>
        </div>

        {items.length > 0 ? (
          <div className="bg-white dark:bg-[#111B21] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Pekerjaan</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Jenis</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Terakhir Diedit</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                   {items.map((item, i) => (
                     <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition group cursor-pointer">
                        <td className="py-4 px-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                 {item.icon}
                              </div>
                              <span className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-500 transition">{item.name}</span>
                           </div>
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell text-sm text-slate-500 dark:text-slate-400">{item.type}</td>
                        <td className="py-4 px-6">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              item.status === 'Draft' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                              'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                           }`}>
                             {item.status}
                           </span>
                        </td>
                        <td className="py-4 px-6 hidden sm:table-cell text-sm text-slate-500 dark:text-slate-400">{item.date}</td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
                <Folder className="w-10 h-10 text-emerald-500" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum ada pekerjaan.</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">Yuk mulai sesuatu dan biarkan BERES membantu menyelesaikannya.</p>
             <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-500/20">
               Mulai Sekarang
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

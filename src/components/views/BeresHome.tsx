import React, { useState } from 'react';
import { FileText, Table, Camera, DollarSign, Calendar, CheckSquare, Folder, ArrowRight, Mic, Paperclip } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BeresHome: React.FC = () => {
  const { setActiveNavTab } = useApp();
  const [command, setCommand] = useState('');

  const quickActions = [
    { id: 'docs', label: 'Dokumen', icon: <FileText className="w-5 h-5" />, color: 'bg-blue-500' },
    { id: 'data', label: 'Data', icon: <Table className="w-5 h-5" />, color: 'bg-indigo-500' },
    { id: 'scan', label: 'Scan Foto', icon: <Camera className="w-5 h-5" />, color: 'bg-purple-500' },
    { id: 'finance', label: 'Keuangan', icon: <DollarSign className="w-5 h-5" />, color: 'bg-emerald-500' },
    { id: 'schedule', label: 'Jadwal', icon: <Calendar className="w-5 h-5" />, color: 'bg-orange-500' },
    { id: 'tasks', label: 'Tugas', icon: <CheckSquare className="w-5 h-5" />, color: 'bg-rose-500' },
    { id: 'files', label: 'File', icon: <Folder className="w-5 h-5" />, color: 'bg-amber-500' },
  ];

  const handleCommand = () => {
    if (!command.trim()) return;
    // Super basic routing logic based on keywords
    const lower = command.toLowerCase();
    if (lower.includes('surat') || lower.includes('dokumen')) setActiveNavTab('docs');
    else if (lower.includes('tabel') || lower.includes('data')) setActiveNavTab('data');
    else if (lower.includes('uang') || lower.includes('pengeluaran') || lower.includes('beli')) setActiveNavTab('finance');
    else if (lower.includes('besok') || lower.includes('jadwal') || lower.includes('jam')) setActiveNavTab('schedule');
    else setActiveNavTab('workspace'); // default processing
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-white dark:bg-[#0B141A] overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-full">
        
        <div className="text-center mb-10 w-full animate-fade-in-up">
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
             Mau beresin apa hari ini?
           </h1>
           <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
             Masukkan tugas, data, foto, atau ide. BERES bantu mengubahnya menjadi sesuatu yang siap digunakan.
           </p>
        </div>

        {/* Command Center Input */}
        <div className="w-full max-w-3xl bg-white dark:bg-[#111B21] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/10 overflow-hidden mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
           <textarea 
             value={command}
             onChange={(e) => setCommand(e.target.value)}
             placeholder="Ketik sesuatu yang ingin kamu bereskan..."
             className="w-full bg-transparent border-none p-6 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:ring-0 min-h-[120px]"
           />
           <div className="px-6 py-4 bg-slate-50 dark:bg-[#1A262E] border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <button className="p-2 text-slate-400 hover:text-emerald-500 transition rounded-full hover:bg-white dark:hover:bg-[#0B141A]">
                    <Paperclip className="w-5 h-5" />
                 </button>
                 <button className="p-2 text-slate-400 hover:text-emerald-500 transition rounded-full hover:bg-white dark:hover:bg-[#0B141A]">
                    <Camera className="w-5 h-5" />
                 </button>
                 <button className="p-2 text-slate-400 hover:text-emerald-500 transition rounded-full hover:bg-white dark:hover:bg-[#0B141A]">
                    <Mic className="w-5 h-5" />
                 </button>
              </div>
              <button 
                onClick={handleCommand}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all ${
                  command.trim() ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                }`}
              >
                <span>BERESKAN</span>
                <ArrowRight className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Quick Actions */}
        <div className="w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
           <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
             <span className="text-amber-500">⚡</span> Beres Cepat
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map(action => (
                <button 
                  key={action.id}
                  onClick={() => setActiveNavTab(action.id as any)}
                  className="flex flex-col items-start p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group"
                >
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 ${action.color}`}>
                      {action.icon}
                   </div>
                   <span className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-500 transition">{action.label}</span>
                </button>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

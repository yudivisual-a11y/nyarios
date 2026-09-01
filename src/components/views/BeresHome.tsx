import React, { useState } from 'react';
import { Book, Feather, MessageSquare, Paintbrush, BookOpen, PenTool, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BeresHome: React.FC = () => {
  const { setActiveNavTab } = useApp();
  const [command, setCommand] = useState('');

  const quickActions = [
    { id: 'book', label: 'Buku', icon: <Book className="w-5 h-5" />, color: 'bg-blue-500' },
    { id: 'story', label: 'Cerpen', icon: <Feather className="w-5 h-5" />, color: 'bg-indigo-500' },
    { id: 'comic', label: 'Komik', icon: <MessageSquare className="w-5 h-5" />, color: 'bg-purple-500' },
    { id: 'coloring', label: 'Coloring Book', icon: <Paintbrush className="w-5 h-5" />, color: 'bg-emerald-500' },
    { id: 'worksheet', label: 'Worksheet', icon: <BookOpen className="w-5 h-5" />, color: 'bg-orange-500' },
    { id: 'illustration', label: 'Ilustrasi', icon: <PenTool className="w-5 h-5" />, color: 'bg-rose-500' },
  ];

  const handleCommand = () => {
    if (!command.trim()) return;
    setActiveNavTab('studio' as any); 
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-white dark:bg-[#0B141A] overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-full">
        
        <div className="text-center mb-10 w-full animate-fade-in-up">
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
             Mau bikin apa hari ini?
           </h1>
           <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
             Dari Ide Jadi Karya. BERES adalah Creative Studio untuk membuat karya yang siap dinikmati.
           </p>
        </div>

        {/* Command Center Input */}
        <div className="w-full max-w-3xl bg-white dark:bg-[#111B21] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/10 overflow-hidden mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
           <textarea 
             value={command}
             onChange={(e) => setCommand(e.target.value)}
             placeholder="Ceritakan karya yang ingin kamu buat (Contoh: Buat buku cerita anak 20 halaman tentang kelinci)"
             className="w-full bg-transparent border-none p-6 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:ring-0 min-h-[120px]"
           />
           <div className="px-6 py-4 bg-slate-50 dark:bg-[#1A262E] border-t border-slate-100 dark:border-white/5 flex items-center justify-end">
              <button 
                onClick={handleCommand}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all ${
                  command.trim() ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                }`}
              >
                <span>BUAT KARYA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Quick Actions */}
        <div className="w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
           <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
             Atau mulai dari awal
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.map(action => (
                <button 
                  key={action.id}
                  onClick={() => setActiveNavTab('studio' as any)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group shadow-sm hover:shadow-md"
                >
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${action.color}`}>
                      {action.icon}
                   </div>
                   <span className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-500 transition text-left">{action.label}</span>
                </button>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

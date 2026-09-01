import React, { useState } from 'react';
import { Book, Feather, MessageSquare, Paintbrush, BookOpen, PenTool, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GenerationService } from '../../services/GenerationService';
import { saveProject } from '../../utils/studioDb';
import { StudioProject, StudioPage } from '../../types';

export const BeresHome: React.FC = () => {
  const { setActiveNavTab, setActiveProjectId, setActiveStudioType, currentUser } = useApp();
  const [command, setCommand] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const quickActions = [
    { id: 'book', label: 'Buku', icon: <Book className="w-5 h-5" />, color: 'bg-blue-500' },
    { id: 'story', label: 'Cerpen', icon: <Feather className="w-5 h-5" />, color: 'bg-indigo-500' },
    { id: 'comic', label: 'Komik', icon: <MessageSquare className="w-5 h-5" />, color: 'bg-purple-500' },
    { id: 'coloring', label: 'Coloring Book', icon: <Paintbrush className="w-5 h-5" />, color: 'bg-emerald-500' },
    { id: 'worksheet', label: 'Worksheet', icon: <BookOpen className="w-5 h-5" />, color: 'bg-orange-500' },
    { id: 'illustration', label: 'Ilustrasi', icon: <PenTool className="w-5 h-5" />, color: 'bg-rose-500' },
  ];

  const handleCreateEmpty = (type: string) => { setActiveStudioType(type); setActiveNavTab('wizard'); };

  const handleCommand = async () => {
    if (!command.trim()) return;
    
    setIsGenerating(true);
    setErrorMsg('');
    setProgressText('Menganalisis permintaan...');

    try {
      // 1. Analyze and determine type (naive heuristic for demo, could be better)
      let type = 'book';
      const cmd = command.toLowerCase();
      if (cmd.includes('komik')) type = 'comic';
      else if (cmd.includes('cerpen')) type = 'story';
      else if (cmd.includes('coloring') || cmd.includes('mewarnai')) type = 'coloring';
      
      setProgressText('Menghubungi AI... (Membuat Outline & Halaman)');
      
      const result = await GenerationService.generateProject(command, type);

      setProgressText('Menyimpan ke workspace...');
      
      const projectId = Date.now().toString();
      
      // Save project
      const newProject: StudioProject = {
        id: projectId,
        userId: currentUser.id,
        type: type as any,
        title: result.title || 'Karya Baru',
        description: command,
        status: 'draft',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        settings: {
          outline: result.outline,
          characters: result.characters,
          generatedPages: result.pages
        }
      };
      await saveProject(newProject);

      setActiveProjectId(projectId);
      setActiveNavTab('studio');

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat membuat karya.');
    } finally {
      setIsGenerating(false);
      setProgressText('');
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B141A] overflow-y-auto">
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
        <div className="w-full max-w-3xl bg-white dark:bg-[#111B21] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/10 overflow-hidden mb-12 animate-fade-in-up relative" style={{ animationDelay: '0.1s' }}>
           
           {isGenerating && (
              <div className="absolute inset-0 bg-white/90 dark:bg-[#111B21]/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                 <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                 <span className="font-bold text-slate-900 dark:text-white mb-1">Memproses Karya Anda...</span>
                 <span className="text-sm text-slate-500 dark:text-slate-400">{progressText}</span>
              </div>
           )}

           <textarea 
             value={command}
             onChange={(e) => setCommand(e.target.value)}
             disabled={isGenerating}
             placeholder="Ceritakan karya yang ingin kamu buat (Contoh: Buat buku cerita anak 10 halaman tentang kucing astronot)"
             className="w-full bg-transparent border-none p-6 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:ring-0 min-h-[140px]"
           />

           {errorMsg && (
             <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
               <AlertCircle className="w-4 h-4" /> {errorMsg}
             </div>
           )}

           <div className="px-6 py-4 bg-slate-50 dark:bg-[#1A262E] border-t border-slate-100 dark:border-white/5 flex items-center justify-end">
              <button 
                onClick={handleCommand}
                disabled={isGenerating || !command.trim()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all ${
                  command.trim() && !isGenerating ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
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
             Atau pilih format karya
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.map(action => (
                <button 
                  key={action.id}
                  onClick={() => handleCreateEmpty(action.id)}
                  disabled={isGenerating}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group shadow-sm hover:shadow-md disabled:opacity-50"
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

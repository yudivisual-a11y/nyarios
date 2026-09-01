import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GenerationService } from '../../services/GenerationService';
import { saveProject } from '../../utils/studioDb';
import { StudioProject } from '../../types';
import { ArrowLeft, Sparkles, Book, Loader2, AlertCircle } from 'lucide-react';

export const StudioWizard: React.FC = () => {
  const { setActiveNavTab, setActiveProjectId, activeStudioType, currentUser } = useApp();
  
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('');
  const [target, setTarget] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const typeLabels: Record<string, string> = {
    book: 'Buku',
    story: 'Cerita',
    comic: 'Komik',
    coloring: 'Coloring Book',
    worksheet: 'Worksheet',
    illustration: 'Ilustrasi'
  };

  const currentLabel = typeLabels[activeStudioType] || 'Karya';

  const loadingMessages = [
    'Menganalisis ide...',
    'Menyusun struktur outline...',
    'Membuat profil karakter...',
    'Menulis konten halaman demi halaman...',
    'Merancang visual dan layout...',
    'Hampir selesai...'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setErrorMsg('');
    setLoadingStep(0);

    // Simulate pipeline steps progression
    const interval = setInterval(() => {
      setLoadingStep(prev => prev < loadingMessages.length - 1 ? prev + 1 : prev);
    }, 2000);

    try {
      const fullPrompt = `Buat ${currentLabel} dengan genre ${genre || 'Bebas'} untuk ${target || 'Umum'}. Ide utama: ${prompt}`;
      const result = await GenerationService.generateProject(fullPrompt, activeStudioType);
      
      const projectId = Date.now().toString();
      
      const newProject: StudioProject = {
        id: projectId,
        userId: currentUser.id,
        type: activeStudioType,
        title: result.title || `Project ${currentLabel} Baru`,
        description: prompt,
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
      
      clearInterval(interval);
      setActiveProjectId(projectId);
      setActiveNavTab('studio');
      
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat AI membuat karya.');
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-[#F1F5F9] dark:bg-[#0F172A]">
         <div className="bg-white dark:bg-[#1E293B] p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full text-center border border-slate-200 dark:border-slate-800">
            <div className="relative mb-8">
               <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-10 h-10 text-emerald-500" />
               </div>
               <div className="absolute -bottom-2 -right-2">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
               </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">AI Sedang Bekerja</h2>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-6">
               {loadingMessages[loadingStep]}
            </p>
            
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
               <div 
                 className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                 style={{ width: `\${Math.min(((loadingStep + 1) / loadingMessages.length) * 100, 100)}%` }} 
               />
            </div>
            <p className="text-xs text-slate-400">Mohon tunggu, proses ini mungkin membutuhkan waktu.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-white dark:bg-[#0B141A] overflow-y-auto">
      
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 shrink-0 bg-white dark:bg-[#0B141A] sticky top-0 z-10">
         <button onClick={() => setActiveNavTab('home')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali</span>
         </button>
      </div>

      <div className="max-w-3xl w-full mx-auto px-4 py-12 flex flex-col">
         
         <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <Book className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Buat {currentLabel} dengan AI</h1>
            <p className="text-slate-500 dark:text-slate-400">
               Ceritakan ide Anda, dan biarkan AI BERES menyusun struktur, karakter, dan halaman awalnya.
            </p>
         </div>

         {errorMsg && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
               <div>
                  <p className="font-bold mb-1">Gagal Men-generate Karya</p>
                  <p className="text-sm">{errorMsg}</p>
               </div>
            </div>
         )}

         <div className="bg-slate-50 dark:bg-[#111B21] border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
            
            <div className="space-y-2">
               <label className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Ide Utama / Cerita <span className="text-red-500">*</span>
               </label>
               <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Contoh: Buku cerita tentang petualangan anak bernama Budi di luar angkasa...`}
                  className="w-full bg-white dark:bg-[#0B141A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white min-h-[150px] focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="font-bold text-slate-900 dark:text-white text-sm">Genre (Opsional)</label>
                  <input 
                     type="text" 
                     value={genre}
                     onChange={(e) => setGenre(e.target.value)}
                     placeholder="Contoh: Fantasi, Edukasi, Misteri"
                     className="w-full bg-white dark:bg-[#0B141A] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
               </div>
               <div className="space-y-2">
                  <label className="font-bold text-slate-900 dark:text-white text-sm">Target Pembaca (Opsional)</label>
                  <input 
                     type="text" 
                     value={target}
                     onChange={(e) => setTarget(e.target.value)}
                     placeholder="Contoh: Anak 5-8 tahun, Remaja"
                     className="w-full bg-white dark:bg-[#0B141A] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
               </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
               <button 
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg text-white transition-all ${prompt.trim() ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30' : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed'}`}
               >
                  <Sparkles className="w-6 h-6" />
                  Mulai Generate dengan AI
               </button>
            </div>
         </div>

      </div>
    </div>
  );
};

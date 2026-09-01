import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Save, Download, Plus, Image as ImageIcon, Type, Layout, AlignLeft, Layers, MoreHorizontal, Loader2 } from 'lucide-react';
import { getProjects, saveProject } from '../../utils/studioDb';
import { StudioProject } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const StudioEditor: React.FC = () => {
  const { setActiveNavTab, activeProjectId, currentUser } = useApp();
  const [project, setProject] = useState<StudioProject | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [activePageIdx, setActivePageIdx] = useState(0);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Load project on mount
  useEffect(() => {
    if (activeProjectId) {
      getProjects(currentUser.id).then(all => {
        const proj = all.find(p => p.id === activeProjectId);
        if (proj) {
          setProject(proj);
          if (proj.settings?.generatedPages && proj.settings.generatedPages.length > 0) {
            setPages(proj.settings.generatedPages);
          } else {
            setPages([{ pageNumber: 1, text: 'Mulai menulis di sini...', imagePrompt: '' }]);
          }
        }
      });
    }
  }, [activeProjectId, currentUser.id]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updated = [...pages];
    updated[activePageIdx].text = e.target.value;
    setPages(updated);
  };

  const handleSave = async () => {
    if (!project) return;
    setIsSaving(true);
    const updatedProj = {
      ...project,
      updatedAt: Date.now(),
      settings: {
        ...project.settings,
        generatedPages: pages
      }
    };
    await saveProject(updatedProj);
    setProject(updatedProj);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleExportPDF = async () => {
    if (!canvasRef.current || !project) return;
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const canvasWidth = 210; // A4 width in mm
      const canvasHeight = 297; // A4 height in mm

      // Simple implementation: Just export the currently visible page for demonstration.
      // A full implementation would render each page invisibly and capture it.
      const canvas = await html2canvas(canvasRef.current, ({ scale: 2 } as any));
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvasWidth, canvasHeight);
      pdf.save(`${project.title.replace(/\s+/g, '_')}_Page${pages[activePageIdx].pageNumber}.pdf`);

    } catch (e) {
      console.error(e);
      alert('Gagal export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F1F5F9] dark:bg-[#0F172A]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const currentPage = pages[activePageIdx] || {};

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#F1F5F9] dark:bg-[#0F172A] overflow-hidden">
      
      {/* Top Navbar */}
      <div className="h-14 bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0">
         <div className="flex items-center gap-4">
            <button onClick={() => setActiveNavTab('home')} className="p-2 text-slate-500 hover:text-emerald-500 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <input 
              type="text" 
              value={project.title} 
              onChange={(e) => setProject({...project, title: e.target.value})}
              className="font-bold text-slate-800 dark:text-white bg-transparent border-none focus:ring-0 w-[300px]" 
            />
         </div>
         <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium mr-2">
               {isSaving ? 'Menyimpan...' : '✓ Tersimpan'}
            </span>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700">
               <Save className="w-4 h-4" /> Simpan
            </button>
            <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-sm shadow-emerald-500/20 disabled:opacity-50">
               {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
               <span>Export PDF</span>
            </button>
         </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full flex overflow-hidden">
         
         {/* Left Panel: Pages / Structure */}
         <div className="w-[240px] bg-white dark:bg-[#1E293B] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
               <h3 className="font-bold text-sm text-slate-800 dark:text-white">Halaman</h3>
               <button 
                  onClick={() => {
                     setPages([...pages, { pageNumber: pages.length + 1, text: '', imagePrompt: '' }]);
                     setActivePageIdx(pages.length);
                  }}
                  className="p-1.5 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition"
               >
                  <Plus className="w-4 h-4" />
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
               {pages.map((p, idx) => (
                 <button 
                   key={idx} 
                   onClick={() => setActivePageIdx(idx)}
                   className={`w-full flex items-center justify-between p-2 rounded-lg border-2 transition ${activePageIdx === idx ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                 >
                    <div className="flex items-center gap-3">
                       <span className="font-mono text-xs text-slate-400 w-4">{idx + 1}</span>
                       <div className="w-12 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-sm shrink-0 flex items-center justify-center overflow-hidden p-1 text-[6px] text-left text-slate-300">
                          {project?.type === 'comic' ? (p.panels?.[0]?.dialogue?.substring(0,30) || 'Panel') : p.text?.substring(0, 50)}...
                       </div>
                    </div>
                 </button>
               ))}
            </div>
         </div>

         {/* Center Panel: Canvas */}
         <div className="flex-1 bg-[#F1F5F9] dark:bg-[#0F172A] relative overflow-auto flex flex-col items-center py-10">
            
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1E293B] shadow-lg rounded-xl p-1.5 flex items-center gap-1 border border-slate-200 dark:border-slate-700 z-10">
               {[
                 { id: 'text', icon: <Type className="w-5 h-5" />, title: 'Edit Teks' },
                 { id: 'image', icon: <ImageIcon className="w-5 h-5" />, title: 'Generate Gambar (AI)' },
               ].map(t => (
                 <button 
                   key={t.id}
                   title={t.title}
                   className={`p-2.5 rounded-lg transition text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-emerald-500`}
                 >
                    {t.icon}
                 </button>
               ))}
            </div>

            {/* Canvas Page */}
            <div 
               ref={canvasRef}
               className="w-[600px] h-[848px] bg-white dark:bg-white shadow-2xl rounded-sm border border-slate-200 relative mt-12 shrink-0 p-12 flex flex-col"
            >
               {project.type === 'comic' ? (
                  <div className="w-full flex-1 flex flex-col bg-white">
                     <div className="flex justify-between items-center mb-6 pb-2 border-b-4 border-slate-900">
                        <h1 className="text-2xl font-black text-slate-900 font-anime uppercase tracking-widest">
                          {project.title}
                        </h1>
                     </div>
                     
                     <div className="flex-1 grid grid-cols-2 gap-3 auto-rows-fr">
                        {currentPage.panels?.map((panel: any, idx: number) => {
                           const finalPrompt = `${panel.imagePrompt}, vibrant american comic book graphic novel art style, cel shaded, masterwork`;
                           
                           return (
                           <div key={idx} className={`border-[3px] border-slate-900 bg-slate-100 relative group overflow-hidden flex flex-col min-h-[200px] ${panel.span === 'wide' ? 'col-span-2' : 'col-span-1'}`}>
                              
                              <img 
                                 src={`https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=${panel.span === 'wide' ? 800 : 400}&height=400&nologo=true`} 
                                 alt="Comic panel"
                                 className="absolute inset-0 w-full h-full object-cover"
                                 crossOrigin="anonymous"
                              />
                              
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition z-20">
                                 <button 
                                    title="Regenerate Panel"
                                    onClick={() => {
                                       const newPages = [...pages];
                                       newPages[activePageIdx].panels[idx].imagePrompt = panel.imagePrompt + ' v' + Math.floor(Math.random()*1000);
                                       setPages(newPages);
                                    }}
                                    className="bg-white text-slate-900 p-1.5 rounded-md border-2 border-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)] hover:bg-emerald-400 transition"
                                 >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                 </button>
                              </div>

                              {panel.narration && (
                                 <div className="absolute top-0 left-0 bg-[#fefce8] border-b-[3px] border-r-[3px] border-slate-900 px-3 py-1.5 max-w-[80%] z-10">
                                    <textarea
                                       value={panel.narration}
                                       onChange={(e) => {
                                          const newPages = [...pages];
                                          newPages[activePageIdx].panels[idx].narration = e.target.value;
                                          setPages(newPages);
                                       }}
                                       className="w-full bg-transparent border-none text-slate-900 text-xs font-bold resize-none focus:ring-0 p-0 leading-tight"
                                       style={{ color: '#0f172a', fontFamily: 'Comic Sans MS, cursive' }}
                                    />
                                 </div>
                              )}

                              {panel.dialogue && (
                                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] bg-white border-[3px] border-slate-900 rounded-3xl px-4 py-2 z-10 shadow-[2px_2px_0px_rgba(15,23,42,1)]">
                                    <textarea
                                       value={panel.dialogue}
                                       onChange={(e) => {
                                          const newPages = [...pages];
                                          newPages[activePageIdx].panels[idx].dialogue = e.target.value;
                                          setPages(newPages);
                                       }}
                                       className="w-full bg-transparent border-none text-slate-900 text-sm font-bold resize-none focus:ring-0 p-0 text-center leading-tight min-h-[40px]"
                                       style={{ color: '#0f172a', fontFamily: 'Comic Sans MS, cursive' }}
                                    />
                                    <div className="absolute -bottom-[10px] left-8 w-4 h-5 bg-white border-b-[3px] border-r-[3px] border-slate-900 transform rotate-45"></div>
                                 </div>
                              )}
                              
                           </div>
                        )})}
                     </div>
                  </div>
               ) : (
                  <div className="w-full flex-1 flex flex-col">
                     <h1 className="text-3xl font-black text-center text-slate-900 mb-6 font-serif">
                       {project.title}
                     </h1>
                     
                     {currentPage.imagePrompt ? (
                        <div className="w-full h-64 bg-slate-100 rounded-lg mb-6 overflow-hidden relative group shadow-inner shrink-0">
                           <img 
                              src={`https://image.pollinations.ai/prompt/${encodeURIComponent(currentPage.imagePrompt + ' ' + project.title)}?width=800&height=400&nologo=true`} 
                              alt={currentPage.imagePrompt}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                           />
                        </div>
                     ) : (
                        <div className="w-full h-64 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg mb-6 flex flex-col items-center justify-center shrink-0">
                           <span className="text-sm text-slate-500">Gambar tidak tersedia</span>
                        </div>
                     )}
                     
                     <textarea 
                        value={currentPage.text}
                        onChange={handleTextChange}
                        className="w-full flex-1 bg-transparent border-none text-slate-900 dark:text-slate-900 text-lg leading-relaxed resize-none focus:ring-0 p-0 font-serif"
                        placeholder="Ketik isi cerita di sini..."
                     />
                  </div>
               )}
               <div className="mt-4 text-center font-mono text-xs text-slate-400">
                  - {activePageIdx + 1} -
               </div>
            </div>
         </div>

         {/* Right Panel: Properties */}
         <div className="w-[280px] bg-white dark:bg-[#1E293B] border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
               <h3 className="font-bold text-sm text-slate-800 dark:text-white">Properti Karya</h3>
            </div>
            
            <div className="p-4 space-y-6 overflow-y-auto">
               <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipe Karya</h4>
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm font-medium capitalize border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white">
                     {project.type}
                  </div>
               </div>

               {project.settings?.outline && (
                  <div className="space-y-3">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outline Cerita</h4>
                     <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc pl-4 space-y-1">
                        {project.settings.outline.map((o: string, i: number) => (
                           <li key={i}>{o}</li>
                        ))}
                     </ul>
                  </div>
               )}

               <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Magic Tools</h4>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition shadow-sm">
                     ✨ Rewrite Text
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition shadow-sm">
                     🎨 Generate Image
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

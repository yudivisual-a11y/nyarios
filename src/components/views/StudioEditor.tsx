import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Save, Download, Plus, Image as ImageIcon, Type, Layout, AlignLeft, Layers, MoreHorizontal } from 'lucide-react';

export const StudioEditor: React.FC = () => {
  const { setActiveNavTab } = useApp();
  const [activeTool, setActiveTool] = useState('text');
  
  const pages = [1, 2, 3, 4];
  const [activePage, setActivePage] = useState(1);

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#F1F5F9] dark:bg-[#0F172A] overflow-hidden">
      
      {/* Top Navbar */}
      <div className="h-14 bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0">
         <div className="flex items-center gap-4">
            <button onClick={() => setActiveNavTab('home')} className="p-2 text-slate-500 hover:text-emerald-500 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <input type="text" defaultValue="Project Petualangan Kelinci" className="font-bold text-slate-800 dark:text-white bg-transparent border-none focus:ring-0 w-[300px]" />
         </div>
         <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium mr-2">✓ Tersimpan</span>
            <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700">
               <Save className="w-4 h-4" /> Simpan
            </button>
            <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-sm shadow-emerald-500/20">
               <Download className="w-4 h-4" /> Export
            </button>
         </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full flex overflow-hidden">
         
         {/* Left Panel: Pages / Structure */}
         <div className="w-[240px] bg-white dark:bg-[#1E293B] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
               <h3 className="font-bold text-sm text-slate-800 dark:text-white">Halaman</h3>
               <button className="p-1.5 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition">
                  <Plus className="w-4 h-4" />
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
               {pages.map(p => (
                 <button 
                   key={p} 
                   onClick={() => setActivePage(p)}
                   className={`w-full flex items-center justify-between p-2 rounded-lg border-2 transition ${activePage === p ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                 >
                    <div className="flex items-center gap-3">
                       <span className="font-mono text-xs text-slate-400 w-4">{p}</span>
                       <div className="w-12 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-sm shrink-0"></div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100" />
                 </button>
               ))}
            </div>
         </div>

         {/* Center Panel: Canvas */}
         <div className="flex-1 bg-[#F1F5F9] dark:bg-[#0F172A] relative overflow-auto flex flex-col items-center py-10">
            
            {/* Toolbar Floating */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1E293B] shadow-lg rounded-xl p-1.5 flex items-center gap-1 border border-slate-200 dark:border-slate-700 z-10">
               {[
                 { id: 'text', icon: <Type className="w-5 h-5" />, title: 'Tambah Teks' },
                 { id: 'image', icon: <ImageIcon className="w-5 h-5" />, title: 'Tambah Gambar' },
                 { id: 'layout', icon: <Layout className="w-5 h-5" />, title: 'Layout' },
                 { id: 'layers', icon: <Layers className="w-5 h-5" />, title: 'Layer' },
               ].map(t => (
                 <button 
                   key={t.id}
                   onClick={() => setActiveTool(t.id)}
                   title={t.title}
                   className={`p-2.5 rounded-lg transition ${activeTool === t.id ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                 >
                    {t.icon}
                 </button>
               ))}
            </div>

            {/* Canvas Page */}
            <div className="w-[600px] h-[800px] bg-white dark:bg-[#1E293B] shadow-2xl rounded-sm border border-slate-200 dark:border-slate-800 relative mt-12 shrink-0">
               
               {/* Mock Content on Canvas */}
               <div className="absolute top-12 left-10 right-10">
                  <h1 className="text-4xl font-black text-center text-slate-900 dark:text-white mb-8 cursor-pointer border border-transparent hover:border-emerald-500 rounded px-2 py-1">Kelinci Kecil & Wortel Ajaib</h1>
                  <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8 flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-emerald-500 transition">
                     <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer border border-transparent hover:border-emerald-500 rounded px-2 py-1">
                     Di sebuah desa yang damai, hiduplah seekor kelinci kecil bernama Pip. Pip sangat menyukai wortel. Suatu hari, ia menemukan sebuah wortel bercahaya di ujung ladang...
                  </p>
               </div>
               
               <div className="absolute bottom-6 left-0 right-0 text-center font-mono text-xs text-slate-400">
                  - {activePage} -
               </div>

            </div>
         </div>

         {/* Right Panel: Properties */}
         <div className="w-[280px] bg-white dark:bg-[#1E293B] border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
               <h3 className="font-bold text-sm text-slate-800 dark:text-white">Properti</h3>
            </div>
            
            <div className="p-4 space-y-6 overflow-y-auto">
               
               {/* Typograpy Controls (Mock) */}
               <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teks</h4>
                  <div className="flex flex-col gap-2">
                     <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-800 dark:text-white outline-none">
                        <option>Inter</option>
                        <option>Lora</option>
                        <option>Comic Sans</option>
                     </select>
                     <div className="flex gap-2">
                        <input type="number" defaultValue="18" className="w-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-800 dark:text-white outline-none" />
                        <div className="flex flex-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                           <button className="flex-1 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                              B
                           </button>
                           <button className="flex-1 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 italic">
                              I
                           </button>
                           <button className="flex-1 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 underline">
                              U
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Alignment */}
               <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alignment</h4>
                  <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                     {[1,2,3,4].map(i => (
                        <button key={i} className={`flex-1 p-2 flex items-center justify-center ${i===1 ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'} hover:bg-slate-50 dark:hover:bg-slate-800 border-r border-slate-200 dark:border-slate-700 last:border-0`}>
                           <AlignLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </button>
                     ))}
                  </div>
               </div>

               {/* Position */}
               <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posisi</h4>
                  <div className="grid grid-cols-2 gap-2">
                     <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                        <span className="text-xs text-slate-400">X</span>
                        <input type="number" defaultValue="40" className="w-full bg-transparent border-none p-0 text-sm outline-none text-slate-800 dark:text-white" />
                     </div>
                     <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                        <span className="text-xs text-slate-400">Y</span>
                        <input type="number" defaultValue="640" className="w-full bg-transparent border-none p-0 text-sm outline-none text-slate-800 dark:text-white" />
                     </div>
                  </div>
               </div>

               <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition shadow-sm">
                     ✨ Magic AI Rewrite
                  </button>
               </div>
               
            </div>
         </div>
      </div>
    </div>
  );
};

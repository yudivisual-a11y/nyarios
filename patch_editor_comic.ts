import fs from 'fs';

let content = fs.readFileSync('src/components/views/StudioEditor.tsx', 'utf8');

// The block we want to replace starts with: <h1 className="text-3xl font-black...
// and ends with </textarea> or the page indicator.
// We'll replace the entire inner content of the Canvas Page.

const newCanvasCode = `               {project.type === 'comic' ? (
                  <div className="w-full flex-1 flex flex-col">
                     <h1 className="text-2xl font-black text-center text-slate-900 mb-6 font-anime uppercase tracking-widest border-b-2 border-slate-900 pb-2">
                       {project.title}
                     </h1>
                     <div className="flex-1 grid grid-cols-2 gap-4 auto-rows-fr">
                        {currentPage.panels?.map((panel: any, idx: number) => (
                           <div key={idx} className="border-4 border-slate-900 bg-white relative group overflow-hidden flex flex-col shadow-[4px_4px_0px_rgba(15,23,42,1)]">
                              <div className="flex-1 overflow-hidden relative bg-slate-100">
                                 <img 
                                    src={\`https://image.pollinations.ai/prompt/\${encodeURIComponent((panel.imagePrompt || '') + ' comic book style, highly detailed')}?width=400&height=400&nologo=true\`} 
                                    alt="Comic panel"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    crossOrigin="anonymous"
                                 />
                              </div>
                              <div className="p-3 bg-white border-t-2 border-slate-900 min-h-[60px]">
                                 <textarea
                                    value={panel.dialogue}
                                    onChange={(e) => {
                                       const newPages = [...pages];
                                       newPages[activePageIdx].panels[idx].dialogue = e.target.value;
                                       setPages(newPages);
                                    }}
                                    className="w-full h-full bg-transparent border-none text-slate-900 text-sm font-bold resize-none focus:ring-0 p-0"
                                    style={{ color: '#0f172a', fontFamily: 'Comic Sans MS, cursive' }}
                                 />
                              </div>
                           </div>
                        ))}
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
                              src={\`https://image.pollinations.ai/prompt/\${encodeURIComponent(currentPage.imagePrompt + ' ' + project.title)}?width=800&height=400&nologo=true\`} 
                              alt={currentPage.imagePrompt}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                           />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <span className="text-white text-xs px-4 text-center">{currentPage.imagePrompt}</span>
                           </div>
                        </div>
                     ) : (
                        <div className="w-full h-64 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg mb-6 flex flex-col items-center justify-center shrink-0">
                           <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
                           <span className="text-sm text-slate-500">Gambar tidak tersedia</span>
                        </div>
                     )}
                     
                     <textarea 
                        value={currentPage.text}
                        onChange={handleTextChange}
                        className="w-full flex-1 bg-transparent border-none text-lg leading-relaxed resize-none focus:ring-0 p-0 font-serif"
                        style={{ color: '#0f172a' }}
                        placeholder="Ketik isi cerita di sini..."
                     />
                  </div>
               )}`;

const canvasRegex = /<h1 className="text-3xl font-black text-center text-slate-900 mb-6 font-serif">[\s\S]*?<\/textarea>/;
content = content.replace(canvasRegex, newCanvasCode);

// Also fix the left panel text preview to handle comic panels
content = content.replace(
  /\{p\.text\.substring\(0, 50\)\}\.\.\./g,
  "{project?.type === 'comic' ? (p.panels?.[0]?.dialogue?.substring(0,30) || 'Panel') : p.text?.substring(0, 50)}..."
);

fs.writeFileSync('src/components/views/StudioEditor.tsx', content);

import fs from 'fs';

let content = fs.readFileSync('src/components/views/StudioEditor.tsx', 'utf8');

const canvasStartStr = `<div 
               ref={canvasRef}
               className="w-[600px] h-[848px] bg-white dark:bg-white shadow-2xl rounded-sm border border-slate-200 relative mt-12 shrink-0 p-12 flex flex-col"
            >`;

// Find the position of canvasStartStr
const startIndex = content.indexOf(canvasStartStr);
if (startIndex === -1) {
    console.error("Could not find canvas container!");
    process.exit(1);
}

// Find the end of the canvas div. It ends with:
//                <div className="mt-4 text-center font-mono text-xs text-slate-400">
//                   - {activePageIdx + 1} -
//                </div>
//             </div>
const endStr = `               <div className="mt-4 text-center font-mono text-xs text-slate-400">
                  - {activePageIdx + 1} -
               </div>
            </div>`;
const endIndex = content.indexOf(endStr, startIndex);

if (endIndex === -1) {
    console.error("Could not find end of canvas container!");
    process.exit(1);
}

const before = content.substring(0, startIndex + canvasStartStr.length);
const after = content.substring(endIndex);

const newCanvasContent = `
               {project.type === 'comic' ? (
                  <div className="w-full flex-1 flex flex-col bg-white">
                     <div className="flex justify-between items-center mb-6 pb-2 border-b-4 border-slate-900">
                        <h1 className="text-2xl font-black text-slate-900 font-anime uppercase tracking-widest">
                          {project.title}
                        </h1>
                     </div>
                     
                     <div className="flex-1 grid grid-cols-2 gap-3 auto-rows-fr">
                        {currentPage.panels?.map((panel: any, idx: number) => {
                           const characterContext = project.settings?.characters?.map((c: any) => c.appearance).join(' ') || '';
                           const finalPrompt = \`\${panel.imagePrompt} \${characterContext} comic book style, graphic novel\`;
                           
                           return (
                           <div key={idx} className={\`border-[3px] border-slate-900 bg-slate-100 relative group overflow-hidden flex flex-col min-h-[200px] \${panel.span === 'wide' ? 'col-span-2' : 'col-span-1'}\`}>
                              
                              <img 
                                 src={\`https://image.pollinations.ai/prompt/\${encodeURIComponent(finalPrompt)}?width=\${panel.span === 'wide' ? 800 : 400}&height=400&nologo=true\`} 
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
                              src={\`https://image.pollinations.ai/prompt/\${encodeURIComponent(currentPage.imagePrompt + ' ' + project.title)}?width=800&height=400&nologo=true\`} 
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
`;

fs.writeFileSync('src/components/views/StudioEditor.tsx', before + newCanvasContent + after);
console.log("Successfully patched StudioEditor.tsx");

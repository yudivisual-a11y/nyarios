import fs from 'fs';

let content = fs.readFileSync('src/components/views/StudioEditor.tsx', 'utf8');

const oldComicCanvas = /\{project\.type === 'comic' \? \([\s\S]*?\) : \(\n                  <div className="w-full flex-1 flex flex-col">/;

const newComicCanvas = `{project.type === 'comic' ? (
                  <div className="w-full flex-1 flex flex-col bg-white">
                     <div className="flex justify-between items-center mb-6 pb-2 border-b-4 border-slate-900">
                        <h1 className="text-2xl font-black text-slate-900 font-anime uppercase tracking-widest">
                          {project.title}
                        </h1>
                        <span className="text-sm font-bold text-slate-500">PAGE {activePageIdx + 1}</span>
                     </div>
                     
                     <div className="flex-1 grid grid-cols-2 gap-3 auto-rows-fr">
                        {currentPage.panels?.map((panel: any, idx: number) => {
                           // Build consistent prompt by including character bible
                           const characterContext = project.settings?.characters?.map((c: any) => c.appearance).join(' ') || '';
                           const finalPrompt = \`\${panel.imagePrompt} \${characterContext} comic book style, graphic novel, highly detailed, expressive\`;
                           
                           return (
                           <div key={idx} className={\`border-[3px] border-slate-900 bg-slate-100 relative group overflow-hidden flex flex-col \${panel.span === 'wide' ? 'col-span-2' : 'col-span-1'}\`}>
                              
                              <img 
                                 src={\`https://image.pollinations.ai/prompt/\${encodeURIComponent(finalPrompt)}?width=\${panel.span === 'wide' ? 800 : 400}&height=400&nologo=true\`} 
                                 alt="Comic panel"
                                 className="absolute inset-0 w-full h-full object-cover"
                                 crossOrigin="anonymous"
                              />
                              
                              {/* Overlay UI for regeneration */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition z-20">
                                 <button 
                                    title="Regenerate Panel"
                                    onClick={() => {
                                       // Simple hack to force re-render pollinations image by appending random string
                                       const newPages = [...pages];
                                       newPages[activePageIdx].panels[idx].imagePrompt = panel.imagePrompt + ' v' + Math.floor(Math.random()*1000);
                                       setPages(newPages);
                                    }}
                                    className="bg-white text-slate-900 p-1.5 rounded-md border-2 border-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)] hover:bg-emerald-400 transition"
                                 >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                 </button>
                              </div>

                              {/* Narration Box */}
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

                              {/* Speech Bubble */}
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
                                    {/* Speech Bubble Tail */}
                                    <div className="absolute -bottom-[10px] left-8 w-4 h-5 bg-white border-b-[3px] border-r-[3px] border-slate-900 transform rotate-45"></div>
                                 </div>
                              )}
                              
                           </div>
                        )})}
                     </div>
                  </div>
               ) : (
                  <div className="w-full flex-1 flex flex-col">`;

content = content.replace(oldComicCanvas, newComicCanvas);
fs.writeFileSync('src/components/views/StudioEditor.tsx', content);

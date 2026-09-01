import fs from 'fs';

let content = fs.readFileSync('src/components/views/StudioEditor.tsx', 'utf8');

// 1. Fix Text Color: Make sure textarea text is strictly dark on the white canvas
content = content.replace(
  /className="w-full flex-1 bg-transparent border-none text-slate-800 text-lg/g,
  'className="w-full flex-1 bg-transparent border-none text-slate-900 dark:text-slate-900 text-lg'
);

// 2. Fix Image Display: Use Pollinations.ai to render the actual image instead of just showing the prompt
const oldImagePlaceholder = `<div className="w-full h-64 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg mb-6 flex flex-col items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500 text-center px-4">
                    \\{currentPage.imagePrompt \\? \\\`AI Prompt: \\$\\{currentPage.imagePrompt\\}\\\` : 'Klik untuk generate ilustrasi'\\}
                  </span>
               </div>`;

const newImagePlaceholder = `{currentPage.imagePrompt ? (
                  <div className="w-full h-64 bg-slate-100 rounded-lg mb-6 overflow-hidden relative group shadow-inner">
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
                  <div className="w-full h-64 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg mb-6 flex flex-col items-center justify-center">
                     <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
                     <span className="text-sm text-slate-500">Gambar tidak tersedia</span>
                  </div>
               )}`;

// We need to use string replacement carefully
content = content.replace(
    /<div className="w-full h-64 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg mb-6 flex flex-col items-center justify-center">[\s\S]*?<\/div>/,
    newImagePlaceholder
);

fs.writeFileSync('src/components/views/StudioEditor.tsx', content);

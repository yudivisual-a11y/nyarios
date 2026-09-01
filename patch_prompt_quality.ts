import fs from 'fs';

// 1. Fix API prompt
let apiContent = fs.readFileSync('api/generate.ts', 'utf8');

const oldApiPrompt = `"imagePrompt": "Detailed visual scene. Mention characters by their appearance, not just name."`;
const newApiPrompt = `"imagePrompt": "Highly descriptive visual prompt for AI image generator. IMPORTANT: Instead of just character names, you MUST write their full visual appearance (hair color, clothes, etc.) inside the prompt so the image generator knows how they look."`;

apiContent = apiContent.replace(oldApiPrompt, newApiPrompt);
fs.writeFileSync('api/generate.ts', apiContent);

// 2. Fix StudioEditor image generation logic
let editorContent = fs.readFileSync('src/components/views/StudioEditor.tsx', 'utf8');

// The old string: 
// const characterContext = project.settings?.characters?.map((c: any) => c.appearance).join(' ') || '';
// const finalPrompt = \`\${panel.imagePrompt} \${characterContext} comic book style, graphic novel\`;

const oldEditorLogic = `const characterContext = project.settings?.characters?.map((c: any) => c.appearance).join(' ') || '';
                           const finalPrompt = \\\`\\$\\{panel.imagePrompt\\} \\$\\{characterContext\\} comic book style, graphic novel\\\`;`;

// Notice I have to be careful with backticks and regex. Let's just use string replacement.
const oldEditorLogicExact = `const characterContext = project.settings?.characters?.map((c: any) => c.appearance).join(' ') || '';
                           const finalPrompt = \`\${panel.imagePrompt} \${characterContext} comic book style, graphic novel\`;`;

const newEditorLogicExact = `const finalPrompt = \`\${panel.imagePrompt}, vibrant american comic book graphic novel art style, cel shaded, masterwork\`;`;

editorContent = editorContent.replace(oldEditorLogicExact, newEditorLogicExact);
fs.writeFileSync('src/components/views/StudioEditor.tsx', editorContent);

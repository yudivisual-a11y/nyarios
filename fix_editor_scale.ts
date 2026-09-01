import fs from 'fs';
let content = fs.readFileSync('src/components/views/StudioEditor.tsx', 'utf8');
content = content.replace(/\{ scale: 2 \}/g, "({ scale: 2 } as any)");
fs.writeFileSync('src/components/views/StudioEditor.tsx', content);

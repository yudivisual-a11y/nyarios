import fs from 'fs';
let content = fs.readFileSync('api/generate.ts', 'utf8');
content = content.replace(/gemini-1\.5-flash/g, 'gemini-3.6-flash');
fs.writeFileSync('api/generate.ts', content);

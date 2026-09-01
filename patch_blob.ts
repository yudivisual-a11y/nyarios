import fs from 'fs';
const content = fs.readFileSync('src/types/index.ts', 'utf8');
const updated = content.replace('videoUrl: string;', 'videoUrl: string;\n  videoBlob?: Blob;');
fs.writeFileSync('src/types/index.ts', updated);

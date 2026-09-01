import fs from 'fs';
const content = fs.readFileSync('src/types/index.ts', 'utf8');

// Note: Previously I changed it to "'pesan' | 'kontak' | 'konten' | 'status' | 'komunitas' | 'panggilan' | 'saya'" (wait, what did it say exactly?)
let updated = content.replace(/\| 'status' /g, '');
updated = updated.replace(/'status' \| /g, '');

fs.writeFileSync('src/types/index.ts', updated);

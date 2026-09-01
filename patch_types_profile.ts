import fs from 'fs';
const content = fs.readFileSync('src/types/index.ts', 'utf8');

let updated = content.replace("export type DesktopSubTab = 'tersimpan' | 'aktivitas' | 'jadwal' | 'file_center' | 'pengaturan';", 
"export type DesktopSubTab = 'tersimpan' | 'aktivitas' | 'jadwal' | 'file_center' | 'pengaturan' | 'profil_saya';");

fs.writeFileSync('src/types/index.ts', updated);

import fs from 'fs';
const content = fs.readFileSync('src/components/layout/DesktopSidebar.tsx', 'utf8');

let updated = content.replace("onClick={() => setActiveDesktopSubTab('pengaturan')}", 
"onClick={() => setActiveDesktopSubTab('profil_saya')}");

fs.writeFileSync('src/components/layout/DesktopSidebar.tsx', updated);

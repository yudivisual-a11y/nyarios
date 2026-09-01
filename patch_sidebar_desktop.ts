import fs from 'fs';
let content = fs.readFileSync('src/components/layout/DesktopSidebar.tsx', 'utf8');

// Imports
content = content.replace("PlaySquare,", "PlaySquare,\n  Search,\n  Heart,");

const kontenStr = `{
      id: 'konten',
      label: 'Konten',
      icon: <PlaySquare className="w-5 h-5" />,
    },`;
const newKontenStr = kontenStr + `
    {
      id: 'explore',
      label: 'Explore',
      icon: <Search className="w-5 h-5" />,
    },
    {
      id: 'notifications',
      label: 'Notifikasi',
      icon: <Heart className="w-5 h-5" />,
    },`;
content = content.replace(kontenStr, newKontenStr);

fs.writeFileSync('src/components/layout/DesktopSidebar.tsx', content);

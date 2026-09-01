import fs from 'fs';
const content = fs.readFileSync('src/components/layout/MobileNavigation.tsx', 'utf8');

let updated = content.replace("import {", "import { PlaySquare,");

const newItem = `    {
      id: 'konten',
      label: 'Konten',
      icon: <PlaySquare className="w-5 h-5" />,
    },`;

updated = updated.replace(/\{\s*id:\s*'status',/g, newItem + '\n    {\n      id: \'status\',');
fs.writeFileSync('src/components/layout/MobileNavigation.tsx', updated);

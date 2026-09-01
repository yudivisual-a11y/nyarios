import fs from 'fs';
const content = fs.readFileSync('src/components/layout/MobileNavigation.tsx', 'utf8');

let updated = content.replace(/Camera,\s*/g, 'Phone,\n  UserCircle,');
updated = updated.replace(/const otherUnreadStatuses = statuses\.filter\([\s\S]*?\)\.length;/g, '');

const statusRegex = /\{\s*id:\s*'status',\s*label:\s*'Status',[\s\S]*?\},/g;
updated = updated.replace(statusRegex, '');

// Rename 'saya' label to Profil
updated = updated.replace(/label:\s*'Pengaturan',/g, "label: 'Profil',");
updated = updated.replace(/<Settings/g, "<UserCircle");

// Add 'panggilan'
const panggilanItem = `    {
      id: 'panggilan',
      label: 'Panggilan',
      icon: <Phone className="w-5 h-5" />,
    },`;

updated = updated.replace(/\{\s*id:\s*'saya',/g, panggilanItem + '\n    {\n      id: \'saya\',');

fs.writeFileSync('src/components/layout/MobileNavigation.tsx', updated);

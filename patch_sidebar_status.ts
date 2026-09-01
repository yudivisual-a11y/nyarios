import fs from 'fs';
const content = fs.readFileSync('src/components/layout/DesktopSidebar.tsx', 'utf8');
let updated = content.replace(/CircleDot,\s*/g, '');
updated = updated.replace(/const otherUnreadStatuses = statuses\.filter\([\s\S]*?\)\.length;/g, '');
updated = updated.replace(/\{\s*id:\s*'status',\s*label:\s*'Status',[\s\S]*?\},/g, '');
fs.writeFileSync('src/components/layout/DesktopSidebar.tsx', updated);

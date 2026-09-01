import fs from 'fs';
let content = fs.readFileSync('src/components/views/StudioWizard.tsx', 'utf8');
content = content.replace(/\\`\\\$\\{/g, "`\${");
content = content.replace(/\\`/g, "`");
fs.writeFileSync('src/components/views/StudioWizard.tsx', content);

import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove StatusView import
let updated = content.replace("import { StatusView } from './components/views/StatusView';\n", "");

// Remove Status view route
updated = updated.replace(/\{\/\* STATUS VIEW \*\/\}\s*\{activeNavTab === 'status' && <StatusView \/>\}/g, '');

fs.writeFileSync('src/App.tsx', updated);

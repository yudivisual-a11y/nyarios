import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');

// Import ContentView
let updated = content.replace("import { CommunityView } from './components/views/CommunityView';", 
"import { CommunityView } from './components/views/CommunityView';\nimport { ContentView } from './components/views/ContentView';");

// Add route
const newRoute = `            {/* KONTEN VIEW */}
            {activeNavTab === 'konten' && <ContentView />}`;

updated = updated.replace(/\{\/\* KOMUNITAS VIEW \*\/\}/g, newRoute + '\n\n            {/* KOMUNITAS VIEW */}');
fs.writeFileSync('src/App.tsx', updated);

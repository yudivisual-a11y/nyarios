import fs from 'fs';

// 1. DesktopSidebar
let sidebar = fs.readFileSync('src/components/layout/DesktopSidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  /onClick=\{\(\) => setActiveNavTab\('studio' as any\)\}/g, 
  "onClick={() => { setActiveStudioType(item.id.replace('studio_', '')); setActiveNavTab('wizard'); }}"
);
// Make sure setActiveStudioType is pulled from context in DesktopSidebar
if (!sidebar.includes('setActiveStudioType')) {
  sidebar = sidebar.replace(
    /const \{ activeNavTab, setActiveNavTab, currentUser \} = useApp\(\);/,
    "const { activeNavTab, setActiveNavTab, setActiveStudioType, currentUser } = useApp();"
  );
}
fs.writeFileSync('src/components/layout/DesktopSidebar.tsx', sidebar);

// 2. BeresHome
let home = fs.readFileSync('src/components/views/BeresHome.tsx', 'utf8');
home = home.replace(
  /const handleCreateEmpty = \(type: string\) => \{[\s\S]*?setActiveNavTab\('studio'\);\n    \}\);\n  \};/,
  "const handleCreateEmpty = (type: string) => { setActiveStudioType(type); setActiveNavTab('wizard'); };"
);
if (!home.includes('setActiveStudioType')) {
  home = home.replace(
    /const \{ setActiveNavTab, setActiveProjectId, currentUser \} = useApp\(\);/,
    "const { setActiveNavTab, setActiveProjectId, setActiveStudioType, currentUser } = useApp();"
  );
}
fs.writeFileSync('src/components/views/BeresHome.tsx', home);

// 3. App.tsx (Adding wizard to router)
let app = fs.readFileSync('src/App.tsx', 'utf8');
if (!app.includes('import { StudioWizard }')) {
  app = app.replace(
    /import \{ StudioEditor \} from '\.\/components\/views\/StudioEditor';/,
    "import { StudioWizard } from './components/views/StudioWizard';\nimport { StudioEditor } from './components/views/StudioEditor';"
  );
  app = app.replace(
    /\{activeNavTab === 'studio' && <StudioEditor \/>\}/,
    "{activeNavTab === 'wizard' && <StudioWizard />}\n            {activeNavTab === 'studio' && <StudioEditor />}"
  );
  fs.writeFileSync('src/App.tsx', app);
}


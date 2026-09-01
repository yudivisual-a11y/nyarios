import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace imports
content = content.replace("import { SocialLayout } from './components/views/SocialLayout';",
"import { SocialLayout } from './components/views/SocialLayout';\nimport { ExploreView } from './components/views/ExploreView';\nimport { NotificationsView } from './components/views/NotificationsView';");

// Routes
const routeStr = `{activeNavTab === 'konten' && <SocialLayout />}`;
const newRouteStr = routeStr + `\n            {activeNavTab === 'explore' && <ExploreView />}\n            {activeNavTab === 'notifications' && <NotificationsView />}`;
content = content.replace(routeStr, newRouteStr);

fs.writeFileSync('src/App.tsx', content);

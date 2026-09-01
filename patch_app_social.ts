import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
content = content.replace("import { ContentView } from './components/views/ContentView';",
"import { SocialLayout } from './components/views/SocialLayout';\nimport { UploadPostModal } from './components/social/UploadPostModal';");

// States
const stateStr = `const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);`;
const newStateStr = stateStr + `\n  const [isSocialUploadOpen, setIsSocialUploadOpen] = useState(false);`;
content = content.replace(stateStr, newStateStr);

// Effects
const effectStr = `useEffect(() => {
    if (activeNavTab !== 'pesan' && activeNavTab !== 'komunitas' && activeNavTab !== 'kontak') {`;
const newEffectStr = `useEffect(() => {
    const handleUpload = () => setIsSocialUploadOpen(true);
    window.addEventListener('open-social-upload', handleUpload);
    return () => window.removeEventListener('open-social-upload', handleUpload);
  }, []);

  useEffect(() => {
    if (activeNavTab !== 'pesan' && activeNavTab !== 'komunitas' && activeNavTab !== 'kontak') {`;
content = content.replace(effectStr, newEffectStr);

// Views route
const routeStr = `{activeNavTab === 'konten' && <ContentView />}`;
const newRouteStr = `{activeNavTab === 'konten' && <SocialLayout />}`;
content = content.replace(routeStr, newRouteStr);

// Add upload modal
const modalStr = `{isImageViewerOpen && (`;
const newModalStr = `{isSocialUploadOpen && <UploadPostModal onClose={() => setIsSocialUploadOpen(false)} />}\n\n      {isImageViewerOpen && (`;
content = content.replace(modalStr, newModalStr);

fs.writeFileSync('src/App.tsx', content);

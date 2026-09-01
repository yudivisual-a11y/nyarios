import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');

let updated = content.replace("import { ContentView } from './components/views/ContentView';", 
"import { ContentView } from './components/views/ContentView';\nimport { UserProfileModal } from './components/views/UserProfileModal';");

// For mobile "saya"
const mobileSayaStr = `{activeNavTab === 'saya' && <ProfileSettingsView />}`;
const newMobileSayaStr = `{activeNavTab === 'saya' && <UserProfileModal userId={currentUser.id} isOpen={true} onClose={() => setActiveNavTab('pesan')} />}`;
updated = updated.replace(mobileSayaStr, newMobileSayaStr);

// For desktop footer clicking profile, it currently sets activeDesktopSubTab to 'pengaturan'.
// I will keep 'pengaturan' pointing to ProfileSettingsView, but maybe I should change Desktop Sidebar to have a "Profil" button, or when clicking the footer, it opens UserProfileModal.

fs.writeFileSync('src/App.tsx', updated);

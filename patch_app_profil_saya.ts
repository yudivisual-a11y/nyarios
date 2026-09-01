import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');

const subTabStr = `{activeDesktopSubTab === 'pengaturan' && <ProfileSettingsView />}`;
const newSubTabStr = subTabStr + `\n        {activeDesktopSubTab === 'profil_saya' && <UserProfileModal userId={currentUser.id} isOpen={true} onClose={() => setActiveDesktopSubTab(null)} />}`;

let updated = content.replace(subTabStr, newSubTabStr);
fs.writeFileSync('src/App.tsx', updated);

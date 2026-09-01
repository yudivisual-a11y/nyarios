import fs from 'fs';
const content = fs.readFileSync('src/components/views/ContentView.tsx', 'utf8');

// Imports
let updated = content.replace("import { UploadVideoModal } from './UploadVideoModal';", 
"import { UploadVideoModal } from './UploadVideoModal';\nimport { UserProfileModal } from './UserProfileModal';");

// States
const stateStr = `const [activeVideo, setActiveVideo] = useState<ContentPost | null>(null);`;
const newStateStr = stateStr + `\n  const [profileUserId, setProfileUserId] = useState<string | null>(null);`;
updated = updated.replace(stateStr, newStateStr);

// Avatar click in viewer
const viewerAvatarStr = `<img src={activeVideo.userAvatar || \`https://ui-avatars.com/api/?name=\${activeVideo.userName}&background=10B981&color=fff\`} className="w-10 h-10 rounded-full" />`;
const newViewerAvatarStr = `<img src={activeVideo.userAvatar || \`https://ui-avatars.com/api/?name=\${activeVideo.userName}&background=10B981&color=fff\`} className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition" onClick={() => { setActiveVideo(null); setProfileUserId(activeVideo.userId); }} />`;
updated = updated.replace(viewerAvatarStr, newViewerAvatarStr);

// Username click in viewer
const viewerNameStr = `<h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{activeVideo.userName}</h3>`;
const newViewerNameStr = `<h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 cursor-pointer hover:underline" onClick={() => { setActiveVideo(null); setProfileUserId(activeVideo.userId); }}>{activeVideo.userName}</h3>`;
updated = updated.replace(viewerNameStr, newViewerNameStr);

// Avatar click in grid
const gridAvatarStr = `<img src={post.userAvatar || \`https://ui-avatars.com/api/?name=\${post.userName}&background=10B981&color=fff\`} className="w-6 h-6 rounded-full border border-white/20" />`;
const newGridAvatarStr = `<img onClick={(e) => { e.stopPropagation(); setProfileUserId(post.userId); }} src={post.userAvatar || \`https://ui-avatars.com/api/?name=\${post.userName}&background=10B981&color=fff\`} className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition cursor-pointer" />`;
updated = updated.replace(gridAvatarStr, newGridAvatarStr);

// Add modal at bottom
const modalStr = `<UploadVideoModal`;
const newModalStr = `{profileUserId && <UserProfileModal userId={profileUserId} isOpen={true} onClose={() => setProfileUserId(null)} />}\n      <UploadVideoModal`;
updated = updated.replace(modalStr, newModalStr);

fs.writeFileSync('src/components/views/ContentView.tsx', updated);

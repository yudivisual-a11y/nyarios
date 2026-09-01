import fs from 'fs';

// 1. PostCard.tsx
let pc = fs.readFileSync('src/components/social/PostCard.tsx', 'utf8');
pc = pc.replace("const { currentUser, getCloudDirectoryUsers, contacts } = useApp();", "const { currentUser, contacts } = useApp();");
pc = pc.replace(`    } else {
      const dirU = getCloudDirectoryUsers('').find(u => u.id === post.ownerId);
      if (dirU) {
        userName = dirU.name;
        userAvatar = dirU.avatar || '';
      }
    }`, "");
fs.writeFileSync('src/components/social/PostCard.tsx', pc);

// 2. UploadPostModal.tsx
let upm = fs.readFileSync('src/components/social/UploadPostModal.tsx', 'utf8');
upm = upm.replace("type: f.type.startsWith('video') ? 'video' : 'image' as const", "type: (f.type.startsWith('video') ? 'video' : 'image') as 'video' | 'image'");
fs.writeFileSync('src/components/social/UploadPostModal.tsx', upm);

// 3. SocialLayout.tsx
let sl = fs.readFileSync('src/components/views/SocialLayout.tsx', 'utf8');
sl = sl.replace("const { currentUser, contacts, getCloudDirectoryUsers } = useApp();", "const { currentUser, contacts } = useApp();");
sl = sl.replace(`    // Generate some suggestions from contacts or cloud directory
    const dirUsers = getCloudDirectoryUsers('');
    const suggested = dirUsers.filter(u => u.id !== currentUser.id).slice(0, 5);
    setSuggestions(suggested);`, `    const suggested = contacts.filter((u: any) => u.id !== currentUser.id).slice(0, 5);
    setSuggestions(suggested);`);
fs.writeFileSync('src/components/views/SocialLayout.tsx', sl);

// 4. UserProfileModal.tsx
let upmf = fs.readFileSync('src/components/views/UserProfileModal.tsx', 'utf8');
upmf = upmf.replace("const likedPosts = []; // Implementation for likes requires fetching liked posts", "const likedPosts: {post: import('../../types').SocialPost, media: import('../../types').SocialMedia[]}[] = [];");
upmf = upmf.replace("key={post.id}", "key={post.id}");
fs.writeFileSync('src/components/views/UserProfileModal.tsx', upmf);


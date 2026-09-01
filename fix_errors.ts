import fs from 'fs';

// 1. App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace("const {\n    isLoggedIn,\n    activeNavTab,", "const {\n    isLoggedIn,\n    currentUser,\n    activeNavTab,");
fs.writeFileSync('src/App.tsx', appContent);

// 2. ContactsView.tsx
let contactsContent = fs.readFileSync('src/components/views/ContactsView.tsx', 'utf8');
contactsContent = contactsContent.replace("Search, LogOut", "Search, LogOut, User");
fs.writeFileSync('src/components/views/ContactsView.tsx', contactsContent);

// 3. UserProfileModal.tsx
let userProfContent = fs.readFileSync('src/components/views/UserProfileModal.tsx', 'utf8');
// Replace getCloudDirectoryUsers usage with just checking posts, as we don't have it exported easily
const dirUsersStr = `      const dirUsers = getCloudDirectoryUsers('');
      const dirU = dirUsers.find(u => u.id === userId);
      if (dirU) {
        profile.name = dirU.name;
        profile.username = dirU.username || '';
        profile.avatar = dirU.avatar || '';
        profile.bio = dirU.bio || '';
      } else {
         // Fallback to checking the posts
         const userPost = posts.find(p => p.userId === userId);
         if (userPost) {
           profile.name = userPost.userName;
           profile.username = userPost.userUsername || '';
           profile.avatar = userPost.userAvatar || '';
         }
      }`;
const newDirUsersStr = `      // Fallback to checking the posts
      const userPost = posts.find(p => p.userId === userId);
      if (userPost) {
        profile.name = userPost.userName;
        profile.username = userPost.userUsername || '';
        profile.avatar = userPost.userAvatar || '';
      }`;
userProfContent = userProfContent.replace(dirUsersStr, newDirUsersStr);
userProfContent = userProfContent.replace(", getCloudDirectoryUsers } = useApp()", "} = useApp()");
fs.writeFileSync('src/components/views/UserProfileModal.tsx', userProfContent);


import fs from 'fs';
let f = fs.readFileSync('src/components/views/UserProfileModal.tsx', 'utf8');
f = f.replace("setPosts(posts.filter(p => p.id !== postId));", "setPosts(posts.filter(p => p.post.id !== postId));");
f = f.replace("post.title", "post.caption");
fs.writeFileSync('src/components/views/UserProfileModal.tsx', f);

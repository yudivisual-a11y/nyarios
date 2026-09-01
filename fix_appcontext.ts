import fs from 'fs';

let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Inject imports
const importAdd = `import { saveContentPost, deleteContentPost, getAllContentPosts } from '../utils/contentDb';
import { broadcastContentPost } from '../utils/cloudSync';
`;

content = importAdd + content;

// Fix TS7006 implicit any
content = content.replace("getAllContentPosts().then(posts => {", "getAllContentPosts().then((posts: import('../types').ContentPost[]) => {");
content = content.replace("posts.filter(p => p.userId === currentUser.id", "posts.filter((p: import('../types').ContentPost) => p.userId === currentUser.id");
content = content.replace("=== 'public').forEach(p => {", "=== 'public').forEach((p: import('../types').ContentPost) => {");

fs.writeFileSync('src/context/AppContext.tsx', content);


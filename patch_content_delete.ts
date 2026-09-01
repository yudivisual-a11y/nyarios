import fs from 'fs';
const content = fs.readFileSync('src/components/views/ContentView.tsx', 'utf8');

// Add import
let updated = content.replace("import { getAllContentPosts, updateContentPost, deleteContentPost } from '../../utils/contentDb';",
"import { getAllContentPosts, updateContentPost, deleteContentPost } from '../../utils/contentDb';\nimport { broadcastDeleteContentPost } from '../../utils/cloudSync';");

// Broadcast it
const saveStr = `await deleteContentPost(postId);`;
const newSaveStr = `await deleteContentPost(postId);\n    broadcastDeleteContentPost(currentUser, postId);`;

updated = updated.replace(saveStr, newSaveStr);
fs.writeFileSync('src/components/views/ContentView.tsx', updated);

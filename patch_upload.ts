import fs from 'fs';
const content = fs.readFileSync('src/components/views/UploadVideoModal.tsx', 'utf8');

// Add import
let updated = content.replace("import { saveContentPost } from '../../utils/contentDb';",
"import { saveContentPost } from '../../utils/contentDb';\nimport { broadcastContentPost } from '../../utils/cloudSync';");

// Broadcast it
const saveStr = `await saveContentPost(newPost);`;
const newSaveStr = `await saveContentPost(newPost);\n      if (privacy === 'public' || privacy === 'contacts') {\n        broadcastContentPost(currentUser, newPost);\n      }`;

updated = updated.replace(saveStr, newSaveStr);
fs.writeFileSync('src/components/views/UploadVideoModal.tsx', updated);

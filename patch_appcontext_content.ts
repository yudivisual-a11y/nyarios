import fs from 'fs';
const content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// First, we need an exported state for contents? No, ContentView holds it, or AppContext?
// The prompt implies content is global but we don't necessarily need it in AppContext unless ContentView is mounted.
// BUT we want to receive incoming content updates in the background. If we just write to IndexedDb directly in AppContext, then ContentView can read it! Yes.

// Add imports
let updated = content.replace("import { saveStatusToDb, deleteStatusFromDb, getAllActiveStatusesFromDb } from '../utils/mediaDb';",
"import { saveStatusToDb, deleteStatusFromDb, getAllActiveStatusesFromDb } from '../utils/mediaDb';\nimport { saveContentPost, deleteContentPost, getAllContentPosts } from '../utils/contentDb';\nimport { broadcastContentPost } from '../utils/cloudSync';");

// Inside subscribeToCloudEvents
const callbacksStr = `onStatusQuery: (requesterId) => {
        if (requesterId !== currentUser?.id) {
          // Re-broadcast all our active statuses so late-joining peers receive all stories (1, 2, 3, etc.)
          statusesRef.current
            .filter((s) => s.userId === currentUser.id || s.userName === currentUser.name)
            .forEach((s) => {
              broadcastCloudStatus(currentUser, s);
            });
        }
      },`;
const newCallbacksStr = callbacksStr + `
      onContentPost: (incomingPost) => {
        const fullPost = incomingPost as import('../types').ContentPost;
        saveContentPost(fullPost);
      },
      onDeleteContent: (deletedContentId) => {
        deleteContentPost(deletedContentId);
      },
      onContentQuery: (requesterId) => {
        if (requesterId !== currentUser?.id) {
          // Re-broadcast our public content
          getAllContentPosts().then(posts => {
             posts.filter(p => p.userId === currentUser.id && p.privacy === 'public').forEach(p => {
                 broadcastContentPost(currentUser, p);
             });
          });
        }
      },`;

updated = updated.replace(callbacksStr, newCallbacksStr);

// Also we should broadcastContentQuery after timeout
const timeoutStr = `broadcastStatusQuery(currentUser);
      broadcastUserPresence(currentUser);
      broadcastPresenceQuery(currentUser);`;
const newTimeoutStr = timeoutStr + `\n      import('../utils/cloudSync').then(m => m.broadcastContentQuery(currentUser));`;
updated = updated.replace(timeoutStr, newTimeoutStr);

fs.writeFileSync('src/context/AppContext.tsx', updated);

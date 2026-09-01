import fs from 'fs';
let content = fs.readFileSync('src/utils/cloudSync.ts', 'utf8');

const socialBroadcasts = `
// ==========================================
// SOCIAL SYNC
// ==========================================
const SOCIAL_BROADCAST_TOPIC = \`\${TOPIC_PREFIX}/broadcast/social\`;

export async function broadcastSocialPost(post: import('../types').SocialPost, media: import('../types').SocialMedia[]) {
  // We can't broadcast Blobs. Convert to plain objects and strip blobs.
  const cleanMedia = media.map(m => ({ ...m, blob: undefined }));
  const payload = { post, media: cleanMedia, type: 'SOCIAL_POST_NEW' };
  
  const stringified = JSON.stringify({ type: 'SOCIAL_ACTION', payload });
  const client = getOrCreateMqttClient();
  if (client.connected) client.publish(SOCIAL_BROADCAST_TOPIC, stringified, { qos: 1 });
}

export async function broadcastSocialInteraction(action: 'LIKE' | 'UNLIKE' | 'COMMENT' | 'FOLLOW' | 'UNFOLLOW', data: any) {
  const payload = { action, data, type: 'SOCIAL_INTERACTION' };
  const stringified = JSON.stringify({ type: 'SOCIAL_ACTION', payload });
  const client = getOrCreateMqttClient();
  if (client.connected) client.publish(SOCIAL_BROADCAST_TOPIC, stringified, { qos: 1 });
}
`;

content = content + socialBroadcasts;

// Add subscription
const topicStr = `topicsToSubscribe.push(\`\${LEGACY_TOPIC_PREFIX}/broadcast/content\`);`;
const newTopicStr = topicStr + `\n  topicsToSubscribe.push(\`\${TOPIC_PREFIX}/broadcast/social\`);`;
content = content.replace(topicStr, newTopicStr);

// Add callbacks
content = content.replace("onContentQuery?: (requesterId: string) => void;", 
"onContentQuery?: (requesterId: string) => void;\n  onSocialAction?: (payload: any) => void;");

// Handle message
const msgStr = `} else if (topic.includes('/content')) {`;
const newMsgStr = `} else if (topic.includes('/social')) {
        if (data.type === 'SOCIAL_ACTION') {
          callbacks.onSocialAction?.(data.payload);
        }
      } else if (topic.includes('/content')) {`;
content = content.replace(msgStr, newMsgStr);

fs.writeFileSync('src/utils/cloudSync.ts', content);

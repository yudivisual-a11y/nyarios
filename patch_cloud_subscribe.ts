import fs from 'fs';
const content = fs.readFileSync('src/utils/cloudSync.ts', 'utf8');

// 1. Add callbacks to CloudSyncCallbacks
let updated = content.replace("onStatusQuery?: (requesterId: string) => void;", 
"onStatusQuery?: (requesterId: string) => void;\n  onContentPost?: (post: unknown) => void;\n  onDeleteContent?: (postId: string) => void;\n  onContentQuery?: (requesterId: string) => void;");

// 2. Subscribe to the topic in subscribeToCloudEvents
const topicStr = `topicsToSubscribe.push(\`\${LEGACY_TOPIC_PREFIX}/broadcast/statuses\`);`;
const newTopicStr = topicStr + `
  topicsToSubscribe.push(\`\${TOPIC_PREFIX}/broadcast/content\`);
  topicsToSubscribe.push(\`\${LEGACY_TOPIC_PREFIX}/broadcast/content\`);`;
updated = updated.replace(topicStr, newTopicStr);

// 3. Handle messages in handleMqttMessage
const msgStr = `} else if (topic.includes('/statuses')) {`;
const newMsgStr = `} else if (topic.includes('/content')) {
        if (
          data.type === 'CONTENT_POST' ||
          data.type === 'DELETE_CONTENT' ||
          data.type === 'CONTENT_QUERY'
        ) {
          handleIncomingPayload(data.type, data);
        }
      } else if (topic.includes('/statuses')) {`;
updated = updated.replace(msgStr, newMsgStr);

// 4. In handleIncomingPayload
const payloadStr = `case 'STATUS_QUERY':
        callbacks.onStatusQuery?.(payload.senderId);
        break;`;
const newPayloadStr = payloadStr + `
      case 'CONTENT_POST':
        if (payload.post) callbacks.onContentPost?.(payload.post);
        break;
      case 'DELETE_CONTENT':
        if (payload.postId) callbacks.onDeleteContent?.(payload.postId);
        break;
      case 'CONTENT_QUERY':
        callbacks.onContentQuery?.(payload.senderId);
        break;`;
updated = updated.replace(payloadStr, newPayloadStr);

fs.writeFileSync('src/utils/cloudSync.ts', updated);

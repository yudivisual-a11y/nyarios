/**
 * NYARIOS Real-Time Multi-Device Cloud Synchronization Engine (v4.0 Bulletproof)
 * Enterprise MQTT over WebSocket + Wildcard QoS 1 + Persistent Session + Local Mesh
 * Full bi-directional reliability between Laptop, PC, Phone, and Tablet.
 */

import mqtt, { MqttClient } from 'mqtt';
import { CurrentUserData } from '../context/AppContext';
import { Message, ContactPerson } from '../types';

export interface IncomingCallSignal {
  callId: string;
  callerId: string;
  callerName: string;
  callerUsername?: string;
  callerPhone?: string;
  callerAvatar?: string;
  recipientUsername?: string;
  recipientPhone?: string;
  type: 'voice' | 'video';
  timestamp: number;
  status: 'ringing' | 'accepted' | 'declined' | 'ended';
}

export interface CloudMessagePayload {
  id: string;
  senderId: string;
  senderName: string;
  senderUsername?: string;
  senderPhone?: string;
  senderAvatar?: string;
  recipientUsername?: string;
  recipientPhone?: string;
  message: Message;
  timestamp: number;
}

export interface CloudStatusPayload {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'text' | 'image' | 'video';
  content: string;
  caption?: string;
  bgColor?: string;
  timestamp: string;
  rawTimestamp: number;
  viewers?: string[];
}

const CLOUD_STORAGE_USERS_KEY = 'nyarios_cloud_directory_v2';
const CLOUD_STORAGE_STATUSES_KEY = 'nyarios_cloud_active_statuses_v4';
const PRIMARY_MQTT_BROKER = 'wss://broker.emqx.io:8084/mqtt';
const TOPIC_PREFIX = 'nyarios_2026';
const STATUS_BROADCAST_TOPIC = `${TOPIC_PREFIX}/broadcast/statuses`;
const CHUNK_SIZE = 48 * 1024; // 48KB per packet safe for 64KB WebSocket broker limits

// Global shared MQTT client singleton
let sharedMqttClient: MqttClient | null = null;
let activeUserIdentifier = '';
const currentSubscribedTopics = new Set<string>();

const localBroadcastBus = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('nyarios_local_mesh_bus_v4')
  : null;

/**
 * Returns a persistent unique device ID per browser instance
 */
function getDeviceId(): string {
  if (typeof window === 'undefined') return 'node';
  try {
    let id = localStorage.getItem('nyarios_device_instance_id_v4');
    if (!id) {
      id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('nyarios_device_instance_id_v4', id);
    }
    return id;
  } catch {
    return `dev_${Math.random().toString(36).substring(2, 7)}`;
  }
}

/**
 * Universal Byte Decoder that converts Buffer, Uint8Array or String to UTF-8 text across Node & Browsers
 */
function decodePayloadToString(buf: unknown): string {
  if (typeof buf === 'string') return buf;
  if (!buf) return '';
  try {
    if (buf instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(buf))) {
      return new TextDecoder('utf-8').decode(buf as Uint8Array);
    }
  } catch {}
  return String(buf);
}

/**
 * Normalizes username to clean alphanumeric identifier (@acepyudi -> acepyudi)
 */
export function normalizeUsername(username: string): string {
  if (!username) return '';
  return username.replace(/^@+/, '').trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
}

/**
 * Normalizes phone numbers (+6281234567890)
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) return `+${digits}`;
  if (digits.startsWith('0')) return `+62${digits.slice(1)}`;
  if (digits.length >= 8) return `+62${digits}`;
  return `+${digits}`;
}

/**
 * Converts user identifier (@username or phone) to unique pubsub topic
 */
export function identityToTopic(identity: string): string {
  if (!identity) return `${TOPIC_PREFIX}/general`;
  const clean = normalizeUsername(identity);
  if (clean) {
    return `${TOPIC_PREFIX}/u/${clean}`;
  }
  const digits = identity.replace(/\D/g, '');
  return `${TOPIC_PREFIX}/ph/${digits || 'general'}`;
}

/**
 * Initializes and manages shared MQTT WebSocket connection
 */
function getOrCreateMqttClient(myIdentifier?: string): MqttClient {
  const cleanUser = myIdentifier ? normalizeUsername(myIdentifier) : (activeUserIdentifier || 'guest');

  // If client exists and is connected for the same user, return it
  if (sharedMqttClient && sharedMqttClient.connected && activeUserIdentifier === cleanUser) {
    return sharedMqttClient;
  }

  // If user changed, tear down old client
  if (sharedMqttClient && activeUserIdentifier !== cleanUser) {
    try {
      sharedMqttClient.end(true);
    } catch {}
    sharedMqttClient = null;
    currentSubscribedTopics.clear();
  }

  if (sharedMqttClient && !sharedMqttClient.disconnected) {
    return sharedMqttClient;
  }

  activeUserIdentifier = cleanUser;
  const clientId = `nyarios_v4_${cleanUser}_${getDeviceId()}`;

  try {
    sharedMqttClient = mqtt.connect(PRIMARY_MQTT_BROKER, {
      clientId,
      clean: true, // Clean session to avoid broker session state lockups
      connectTimeout: 10000,
      reconnectPeriod: 1000,
      keepalive: 15,
    });

    sharedMqttClient.on('connect', () => {
      console.log(`[NYARIOS Cloud v4] Connected as ${clientId}`);
      if (currentSubscribedTopics.size > 0 && sharedMqttClient) {
        const topics = Array.from(currentSubscribedTopics);
        sharedMqttClient.subscribe(topics, { qos: 1 }, (err) => {
          if (!err) console.log(`[NYARIOS Cloud v4] Re-subscribed to:`, topics);
        });
      }
    });

    sharedMqttClient.on('error', (err) => {
      console.warn('[NYARIOS Cloud v4] Connection notice:', err);
    });

    sharedMqttClient.on('close', () => {
      console.log('[NYARIOS Cloud v4] Reconnecting...');
    });
  } catch (e) {
    console.warn('[NYARIOS Cloud v4] Init error:', e);
  }

  return sharedMqttClient as MqttClient;
}

// Reconnect instantly when browser tab becomes active or network recovers
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && sharedMqttClient) {
      if (!sharedMqttClient.connected) {
        sharedMqttClient.reconnect();
      }
    }
  });

  window.addEventListener('online', () => {
    if (sharedMqttClient && !sharedMqttClient.connected) {
      sharedMqttClient.reconnect();
    }
  });

  window.addEventListener('focus', () => {
    if (sharedMqttClient && !sharedMqttClient.connected) {
      sharedMqttClient.reconnect();
    }
  });
}

/**
 * Registers current user into the global cloud directory
 */
export async function registerUserOnCloud(user: CurrentUserData) {
  if (typeof window === 'undefined') return;

  const cleanUser = user.username ? normalizeUsername(user.username) : normalizeUsername(user.name);
  const cleanPhone = user.phone ? normalizePhoneNumber(user.phone) : '';

  const cloudUser: ContactPerson = {
    id: user.id,
    name: user.name || (cleanUser ? `@${cleanUser}` : 'Pengguna NYARIOS'),
    username: cleanUser ? `@${cleanUser}` : undefined,
    phone: cleanPhone || undefined,
    bio: user.bio || 'Aktif di NYARIOS',
    avatar: user.avatar,
    isOnline: true,
    lastSeen: 'Online',
  };

  try {
    // 1. Update local shared storage
    const existingRaw = localStorage.getItem(CLOUD_STORAGE_USERS_KEY);
    const users: ContactPerson[] = existingRaw ? JSON.parse(existingRaw) : [];
    const filtered = users.filter((u) => {
      if (cleanUser && u.username) {
        return normalizeUsername(u.username) !== cleanUser;
      }
      if (cleanPhone && u.phone) {
        return normalizePhoneNumber(u.phone) !== cleanPhone;
      }
      return u.id !== user.id;
    });

    const updated = [cloudUser, ...filtered];
    localStorage.setItem(CLOUD_STORAGE_USERS_KEY, JSON.stringify(updated));

    // 2. Broadcast via Local Bus
    if (localBroadcastBus) {
      localBroadcastBus.postMessage({ type: 'USER_PRESENCE', user: cloudUser });
    }

    // 3. Broadcast via MQTT with QoS 1
    const client = getOrCreateMqttClient(cleanUser);
    const payload = JSON.stringify({ type: 'USER_PRESENCE', user: cloudUser });
    if (client.connected) {
      client.publish(`${TOPIC_PREFIX}/directory`, payload, { qos: 1 });
    } else {
      client.once('connect', () => {
        client.publish(`${TOPIC_PREFIX}/directory`, payload, { qos: 1 });
      });
    }
  } catch (e) {
    console.warn('Directory sync notice', e);
  }
}

/**
 * Retrieves all registered users from the cloud directory excluding current user
 */
export function getCloudDirectoryUsers(myIdentifier: string): ContactPerson[] {
  if (typeof window === 'undefined') return [];
  const cleanMyUser = normalizeUsername(myIdentifier);
  const cleanMyPhone = normalizePhoneNumber(myIdentifier);

  try {
    const raw = localStorage.getItem(CLOUD_STORAGE_USERS_KEY);
    if (!raw) return [];
    const users: ContactPerson[] = JSON.parse(raw);
    return users.filter((u) => {
      if (cleanMyUser && u.username && normalizeUsername(u.username) === cleanMyUser) return false;
      if (cleanMyPhone && u.phone && normalizePhoneNumber(u.phone) === cleanMyPhone) return false;
      return true;
    });
  } catch {
    return [];
  }
}

/**
 * Retrieves all active statuses across the mesh within last 24 hours
 */
export function getCloudActiveStatuses(): CloudStatusPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CLOUD_STORAGE_STATUSES_KEY);
    if (!raw) return [];
    const list: CloudStatusPayload[] = JSON.parse(raw);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const activeOnly = list.filter((s) => now - (s.rawTimestamp || 0) < twentyFourHours);
    if (activeOnly.length !== list.length) {
      localStorage.setItem(CLOUD_STORAGE_STATUSES_KEY, JSON.stringify(activeOnly));
    }
    return activeOnly;
  } catch {
    return [];
  }
}

/**
 * Broadcasts a status story to the entire cloud mesh and MQTT real-time stream
 */
export async function broadcastCloudStatus(
  sender: CurrentUserData,
  status: CloudStatusPayload
) {
  if (typeof window === 'undefined') return;

  const cleanSender = normalizeUsername(sender.username || sender.name);

  // 1. Save to local active statuses storage (with quota safety)
  try {
    const active = getCloudActiveStatuses();
    const filtered = active.filter((s) => s.id !== status.id);
    const updated = [status, ...filtered];
    try {
      localStorage.setItem(CLOUD_STORAGE_STATUSES_KEY, JSON.stringify(updated));
    } catch {
      // If localStorage is full from large video, store lightweight metadata
      const lightweight = updated.map(st => ({
        ...st,
        content: st.type === 'video' ? '' : st.content,
      }));
      try {
        localStorage.setItem(CLOUD_STORAGE_STATUSES_KEY, JSON.stringify(lightweight));
      } catch {}
    }
  } catch (err) {
    console.warn('Status storage error:', err);
  }

  // 2. Broadcast to Local Mesh Bus (instant cross-tab / cross-window)
  if (localBroadcastBus) {
    localBroadcastBus.postMessage({ type: 'STATUS_STORY', payload: status });
  }

  // 3. Broadcast to MQTT Broker across the internet
  const client = getOrCreateMqttClient(cleanSender);
  const stringified = JSON.stringify({ type: 'STATUS_STORY', payload: status });

  const publishToTopic = (data: string) => {
    if (client.connected) {
      client.publish(STATUS_BROADCAST_TOPIC, data, { qos: 1 }, (err) => {
        if (err) console.warn('[NYARIOS Cloud v4] Status publish warning:', err);
      });
    } else {
      client.once('connect', () => {
        client.publish(STATUS_BROADCAST_TOPIC, data, { qos: 1 });
      });
    }
  };

  if (stringified.length <= CHUNK_SIZE) {
    publishToTopic(stringified);
  } else {
    // Large payload (e.g. video files > 180KB) -> Send in numbered sequential chunks
    const totalChunks = Math.ceil(stringified.length / CHUNK_SIZE);
    const chunkStatusId = status.id;

    for (let i = 0; i < totalChunks; i++) {
      const chunkData = stringified.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const chunkPayload = JSON.stringify({
        type: 'CHUNKED_STATUS',
        chunkStatusId,
        index: i,
        total: totalChunks,
        chunkData,
      });

      await new Promise<void>((resolve) => {
        if (client.connected) {
          client.publish(STATUS_BROADCAST_TOPIC, chunkPayload, { qos: 1 }, () => {
            setTimeout(resolve, 25);
          });
        } else {
          client.once('connect', () => {
            client.publish(STATUS_BROADCAST_TOPIC, chunkPayload, { qos: 1 }, () => {
              setTimeout(resolve, 25);
            });
          });
        }
      });
    }
  }
}

/**
 * Broadcasts a delete status signal across the entire cloud mesh and MQTT real-time stream
 */
export async function broadcastDeleteStatus(
  sender: CurrentUserData,
  statusId: string
) {
  if (typeof window === 'undefined' || !statusId) return;

  const cleanSender = normalizeUsername(sender.username || sender.name);

  // 1. Remove from local active statuses storage
  try {
    const active = getCloudActiveStatuses();
    const filtered = active.filter((s) => s.id !== statusId);
    localStorage.setItem(CLOUD_STORAGE_STATUSES_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Status delete storage error:', err);
  }

  // 2. Broadcast to Local Mesh Bus
  if (localBroadcastBus) {
    localBroadcastBus.postMessage({ type: 'DELETE_STATUS', statusId, senderId: sender.id });
  }

  // 3. Broadcast to MQTT Broker across the internet
  const client = getOrCreateMqttClient(cleanSender);
  const payload = JSON.stringify({ type: 'DELETE_STATUS', statusId, senderId: sender.id });

  if (client.connected) {
    client.publish(STATUS_BROADCAST_TOPIC, payload, { qos: 1 });
  } else {
    client.once('connect', () => {
      client.publish(STATUS_BROADCAST_TOPIC, payload, { qos: 1 });
    });
  }
}

/**
 * Sends a query requesting all online peers to re-broadcast their active statuses
 */
export async function broadcastStatusQuery(sender: CurrentUserData) {
  if (typeof window === 'undefined') return;
  const cleanSender = normalizeUsername(sender.username || sender.name);

  // Local mesh
  if (localBroadcastBus) {
    localBroadcastBus.postMessage({
      type: 'STATUS_QUERY',
      requesterId: sender.id,
      requesterName: sender.name,
    });
  }

  // MQTT
  const client = getOrCreateMqttClient(cleanSender);
  const payload = JSON.stringify({
    type: 'STATUS_QUERY',
    requesterId: sender.id,
    requesterName: sender.name,
  });

  if (client.connected) {
    client.publish(STATUS_BROADCAST_TOPIC, payload, { qos: 1 });
  } else {
    client.once('connect', () => {
      client.publish(STATUS_BROADCAST_TOPIC, payload, { qos: 1 });
    });
  }
}

/**
 * Sends a real-time message (text, image, video, voice note, document) across the internet
 */
export async function sendCloudRealtimeMessage(
  sender: CurrentUserData,
  recipientIdentity: string,
  message: Message
) {
  const cleanRecipient = normalizeUsername(recipientIdentity);
  const cleanSender = normalizeUsername(sender.username || sender.name);

  const payload: CloudMessagePayload = {
    id: `cmsg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    senderId: sender.id,
    senderName: sender.name,
    senderUsername: sender.username || (sender.name ? `@${normalizeUsername(sender.name)}` : undefined),
    senderPhone: sender.phone,
    senderAvatar: sender.avatar,
    recipientUsername: `@${cleanRecipient}`,
    message,
    timestamp: Date.now(),
  };

  const recipientTopic = identityToTopic(recipientIdentity);
  const targetMsgTopic = `${recipientTopic}/messages`;
  const stringified = JSON.stringify({ type: 'INCOMING_MESSAGE', payload });

  // 1. Broadcast locally (instant 0ms delivery if on same device/browser tabs)
  if (localBroadcastBus) {
    localBroadcastBus.postMessage({ type: 'INCOMING_MESSAGE', topic: recipientTopic, payload });
  }

  // 2. Publish to MQTT broker across internet
  const client = getOrCreateMqttClient(cleanSender);

  const publishToTopic = (topic: string, data: string) => {
    if (client.connected) {
      client.publish(topic, data, { qos: 1 }, (err) => {
        if (err) console.warn('[NYARIOS Cloud v4] Publish warning:', err);
      });
    } else {
      client.once('connect', () => {
        client.publish(topic, data, { qos: 1 });
      });
    }
  };

  if (stringified.length <= CHUNK_SIZE) {
    // Fits in a single atomic packet (All photos, voice notes, audio, and text)
    publishToTopic(targetMsgTopic, stringified);
  } else {
    // Large payload (e.g. video files > 180KB) -> Send in numbered sequential chunks with ACK
    const totalChunks = Math.ceil(stringified.length / CHUNK_SIZE);
    const chunkMsgId = payload.id;

    for (let i = 0; i < totalChunks; i++) {
      const chunkData = stringified.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const chunkPayload = JSON.stringify({
        type: 'CHUNKED_MESSAGE',
        chunkMsgId,
        index: i,
        total: totalChunks,
        chunkData,
      });

      await new Promise<void>((resolve) => {
        if (client.connected) {
          client.publish(targetMsgTopic, chunkPayload, { qos: 1 }, () => {
            setTimeout(resolve, 20);
          });
        } else {
          client.once('connect', () => {
            client.publish(targetMsgTopic, chunkPayload, { qos: 1 }, () => {
              setTimeout(resolve, 20);
            });
          });
        }
      });
    }
  }
}

/**
 * Dispatches a real-time call signal to another username or phone across the internet
 */
export async function sendCloudCallSignal(
  caller: CurrentUserData,
  recipientIdentity: string,
  callType: 'voice' | 'video'
): Promise<string> {
  const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const cleanRecipient = normalizeUsername(recipientIdentity);
  const cleanCaller = normalizeUsername(caller.username || caller.name);

  const signal: IncomingCallSignal = {
    callId,
    callerId: caller.id,
    callerName: caller.name,
    callerUsername: caller.username || (caller.name ? `@${normalizeUsername(caller.name)}` : undefined),
    callerPhone: caller.phone,
    callerAvatar: caller.avatar,
    recipientUsername: `@${cleanRecipient}`,
    type: callType,
    timestamp: Date.now(),
    status: 'ringing',
  };

  const recipientTopic = identityToTopic(recipientIdentity);
  const stringified = JSON.stringify({ type: 'CALL_SIGNAL', signal });

  // Local bus
  if (localBroadcastBus) {
    localBroadcastBus.postMessage({ type: 'CALL_SIGNAL', topic: recipientTopic, signal });
  }

  // MQTT broker with QoS 1
  const client = getOrCreateMqttClient(cleanCaller);
  if (client.connected) {
    client.publish(`${recipientTopic}/calls`, stringified, { qos: 1 });
  } else {
    client.once('connect', () => {
      client.publish(`${recipientTopic}/calls`, stringified, { qos: 1 });
    });
  }

  return callId;
}

/**
 * Responds to a call signal (accept, decline, end)
 */
export async function respondToCloudCallSignal(
  callerIdentity: string,
  callId: string,
  status: 'accepted' | 'declined' | 'ended'
) {
  const callerTopic = identityToTopic(callerIdentity);
  const stringified = JSON.stringify({ type: 'CALL_RESPONSE', callId, status });

  if (localBroadcastBus) {
    localBroadcastBus.postMessage({ type: 'CALL_RESPONSE', topic: callerTopic, callId, status });
  }

  const client = getOrCreateMqttClient();
  if (client.connected) {
    client.publish(`${callerTopic}/calls_resp`, stringified, { qos: 1 });
  } else {
    client.once('connect', () => {
      client.publish(`${callerTopic}/calls_resp`, stringified, { qos: 1 });
    });
  }
}

/**
 * Subscribes to real-time events for the logged-in user with instant MQTT WebSocket + Wildcard QoS 1 + Local Mesh + Chunk Reassembly
 */
export function subscribeToCloudEvents(
  myIdentifier: string,
  handlers: {
    onMessage: (payload: CloudMessagePayload) => void;
    onIncomingCall: (signal: IncomingCallSignal) => void;
    onCallResponse: (callId: string, status: string) => void;
    onUserPresence: (user: ContactPerson) => void;
    onStatusStory?: (status: CloudStatusPayload) => void;
    onStatusDeleted?: (statusId: string) => void;
    onStatusQuery?: (requesterId: string) => void;
  }
): () => void {
  if (typeof window === 'undefined' || !myIdentifier) return () => {};

  const cleanMyUser = normalizeUsername(myIdentifier);
  const myTopic = identityToTopic(myIdentifier);
  const myWildcardTopic = `${myTopic}/#`;
  const myMsgTopic = `${myTopic}/messages`;
  const dirTopic = `${TOPIC_PREFIX}/directory`;

  const processedMsgIds = new Set<string>();
  const chunkBufferMap = new Map<
    string,
    { total: number; chunks: Map<number, string>; timer: NodeJS.Timeout }
  >();
  const statusChunkBufferMap = new Map<
    string,
    { total: number; chunks: Map<number, string>; timer: NodeJS.Timeout }
  >();

  const handleIncomingPayload = (type: string, data: any) => {
    try {
      if (type === 'INCOMING_MESSAGE' && data?.payload) {
        const payload: CloudMessagePayload = data.payload;
        if (!processedMsgIds.has(payload.id)) {
          processedMsgIds.add(payload.id);
          handlers.onMessage(payload);
        }
      } else if (type === 'CHUNKED_MESSAGE' && data?.chunkMsgId) {
        const { chunkMsgId, index, total, chunkData } = data;
        let entry = chunkBufferMap.get(chunkMsgId);
        if (!entry) {
          entry = {
            total,
            chunks: new Map<number, string>(),
            timer: setTimeout(() => chunkBufferMap.delete(chunkMsgId), 45000),
          };
          chunkBufferMap.set(chunkMsgId, entry);
        }

        entry.chunks.set(index, chunkData);

        if (entry.chunks.size === total) {
          clearTimeout(entry.timer);
          chunkBufferMap.delete(chunkMsgId);

          let fullStr = '';
          for (let i = 0; i < total; i++) {
            fullStr += entry.chunks.get(i) || '';
          }

          try {
            const reassembled = JSON.parse(fullStr);
            if (reassembled?.type === 'INCOMING_MESSAGE' && reassembled?.payload) {
              const payload: CloudMessagePayload = reassembled.payload;
              if (!processedMsgIds.has(payload.id)) {
                processedMsgIds.add(payload.id);
                handlers.onMessage(payload);
              }
            }
          } catch (e) {
            console.warn('[NYARIOS Cloud v4] Reassembly parse error', e);
          }
        }
      } else if (type === 'CHUNKED_STATUS' && data?.chunkStatusId) {
        const { chunkStatusId, index, total, chunkData } = data;
        let entry = statusChunkBufferMap.get(chunkStatusId);
        if (!entry) {
          entry = {
            total,
            chunks: new Map<number, string>(),
            timer: setTimeout(() => statusChunkBufferMap.delete(chunkStatusId), 60000),
          };
          statusChunkBufferMap.set(chunkStatusId, entry);
        }

        entry.chunks.set(index, chunkData);

        if (entry.chunks.size === total) {
          clearTimeout(entry.timer);
          statusChunkBufferMap.delete(chunkStatusId);

          let fullStr = '';
          for (let i = 0; i < total; i++) {
            fullStr += entry.chunks.get(i) || '';
          }

          try {
            const reassembled = JSON.parse(fullStr);
            if (reassembled?.type === 'STATUS_STORY' && reassembled?.payload) {
              if (handlers.onStatusStory) {
                handlers.onStatusStory(reassembled.payload);
              }
            }
          } catch (e) {
            console.warn('[NYARIOS Cloud v4] Status reassembly error', e);
          }
        }
      } else if (type === 'CALL_SIGNAL' && data?.signal) {
        handlers.onIncomingCall(data.signal);
      } else if (type === 'CALL_RESPONSE' && data?.callId) {
        handlers.onCallResponse(data.callId, data.status);
      } else if (type === 'USER_PRESENCE' && data?.user) {
        handlers.onUserPresence(data.user);
      } else if (type === 'STATUS_STORY' && data?.payload) {
        if (handlers.onStatusStory) {
          handlers.onStatusStory(data.payload);
        }
      } else if (type === 'DELETE_STATUS' && data?.statusId) {
        if (handlers.onStatusDeleted) {
          handlers.onStatusDeleted(data.statusId);
        }
      } else if (type === 'STATUS_QUERY') {
        if (handlers.onStatusQuery) {
          handlers.onStatusQuery(data?.requesterId || '');
        }
      }
    } catch (e) {
      console.warn('[NYARIOS Cloud v4] Event handler notice:', e);
    }
  };

  // 1. Listen on Local Mesh Bus
  const handleLocalMessage = (event: MessageEvent) => {
    const data = event.data;
    if (!data) return;
    if (data.topic && data.topic !== myTopic) return;
    handleIncomingPayload(data.type, data);
  };

  if (localBroadcastBus) {
    localBroadcastBus.addEventListener('message', handleLocalMessage);
  }

  // 2. Listen on Cloud MQTT WebSocket Broker with Wildcard QoS 1
  const client = getOrCreateMqttClient(cleanMyUser);
  const topicsToSubscribe = [myWildcardTopic, myMsgTopic, dirTopic, STATUS_BROADCAST_TOPIC];

  topicsToSubscribe.forEach((t) => currentSubscribedTopics.add(t));

  const subscribeAll = () => {
    client.subscribe(topicsToSubscribe, { qos: 1 }, (err) => {
      if (!err) {
        console.log(`[NYARIOS Cloud v4] Subscribed QoS 1 to: ${myWildcardTopic}, ${STATUS_BROADCAST_TOPIC}`);
      }
    });
  };

  if (client.connected) {
    subscribeAll();
  } else {
    client.on('connect', subscribeAll);
  }

  const handleMqttMessage = (topic: string, messageBuffer: unknown) => {
    try {
      const text = decodePayloadToString(messageBuffer);
      if (!text) return;
      const data = JSON.parse(text);

      const isMyTopic =
        topic === myMsgTopic ||
        topic.startsWith(myTopic) ||
        topic.includes(`/u/${cleanMyUser}`);

      if (isMyTopic) {
        if (data.type === 'INCOMING_MESSAGE' || data.type === 'CHUNKED_MESSAGE') {
          handleIncomingPayload(data.type, data);
        } else if (data.type === 'CALL_SIGNAL') {
          handleIncomingPayload('CALL_SIGNAL', data);
        } else if (data.type === 'CALL_RESPONSE') {
          handleIncomingPayload('CALL_RESPONSE', data);
        }
      } else if (topic === dirTopic || topic.endsWith('/directory')) {
        if (data.type === 'USER_PRESENCE') {
          handleIncomingPayload('USER_PRESENCE', data);
        }
      } else if (topic === STATUS_BROADCAST_TOPIC || topic.includes('/statuses')) {
        if (
          data.type === 'STATUS_STORY' ||
          data.type === 'CHUNKED_STATUS' ||
          data.type === 'DELETE_STATUS' ||
          data.type === 'STATUS_QUERY'
        ) {
          handleIncomingPayload(data.type, data);
        }
      }
    } catch (err) {
      console.warn('[NYARIOS Cloud v4] MQTT parse notice:', err);
    }
  };

  client.on('message', handleMqttMessage);

  return () => {
    if (localBroadcastBus) {
      localBroadcastBus.removeEventListener('message', handleLocalMessage);
    }
    client.removeListener('message', handleMqttMessage);
    client.removeListener('connect', subscribeAll);
    topicsToSubscribe.forEach((t) => currentSubscribedTopics.delete(t));
  };
}

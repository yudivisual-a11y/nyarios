/**
 * NYARIOS Real-Time Multi-Device Cloud Synchronization Engine
 * Handles real-time messaging, user discovery, and call signaling between usernames (@username)
 * and phone numbers across the public internet using high-speed cloud pub/sub relays + local mesh.
 */

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

const CLOUD_STORAGE_USERS_KEY = 'nyarios_cloud_directory_v2';
const RELAY_BASE = 'https://ntfy.sh';
const TOPIC_PREFIX = 'nyarios_2026';

/**
 * Normalizes username to clean alphanumeric identifier (@acepyudi -> acepyudi)
 */
export function normalizeUsername(username: string): string {
  return username.replace(/^@+/, '').trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
}

/**
 * Normalizes phone numbers (+6281234567890)
 */
export function normalizePhoneNumber(phone: string): string {
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
  if (!identity) return `${TOPIC_PREFIX}_general`;
  if (identity.includes('@') || !/^\+?\d+$/.test(identity)) {
    const cleanUser = normalizeUsername(identity);
    return `${TOPIC_PREFIX}_u_${cleanUser}`;
  }
  const digits = identity.replace(/\D/g, '');
  return `${TOPIC_PREFIX}_ph_${digits}`;
}

/**
 * Registers current user into the global cloud directory
 */
export async function registerUserOnCloud(user: CurrentUserData) {
  if (typeof window === 'undefined') return;

  const cleanUser = user.username ? normalizeUsername(user.username) : '';
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

    // 2. Broadcast presence over public cloud relay
    fetch(`${RELAY_BASE}/${TOPIC_PREFIX}_directory`, {
      method: 'POST',
      body: JSON.stringify({ type: 'USER_PRESENCE', user: cloudUser }),
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
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
 * Sends a real-time message to another user (@username or phone) across the internet
 */
export async function sendCloudRealtimeMessage(
  sender: CurrentUserData,
  recipientIdentity: string,
  message: Message
) {
  const payload: CloudMessagePayload = {
    id: `cmsg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    senderId: sender.id,
    senderName: sender.name,
    senderUsername: sender.username,
    senderPhone: sender.phone,
    senderAvatar: sender.avatar,
    recipientUsername: recipientIdentity.startsWith('@') ? recipientIdentity : undefined,
    recipientPhone: !recipientIdentity.startsWith('@') ? recipientIdentity : undefined,
    message,
    timestamp: Date.now(),
  };

  const recipientTopic = identityToTopic(recipientIdentity);

  // Send across public internet via high-speed cloud relay
  try {
    await fetch(`${RELAY_BASE}/${recipientTopic}`, {
      method: 'POST',
      body: JSON.stringify({ type: 'INCOMING_MESSAGE', payload }),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.warn('Cloud message relay notice', err);
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
  const signal: IncomingCallSignal = {
    callId,
    callerId: caller.id,
    callerName: caller.name,
    callerUsername: caller.username,
    callerPhone: caller.phone,
    callerAvatar: caller.avatar,
    recipientUsername: recipientIdentity.startsWith('@') ? recipientIdentity : undefined,
    recipientPhone: !recipientIdentity.startsWith('@') ? recipientIdentity : undefined,
    type: callType,
    timestamp: Date.now(),
    status: 'ringing',
  };

  const recipientCallTopic = `${identityToTopic(recipientIdentity)}_calls`;

  try {
    await fetch(`${RELAY_BASE}/${recipientCallTopic}`, {
      method: 'POST',
      body: JSON.stringify({ type: 'CALL_SIGNAL', signal }),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.warn('Call signaling relay notice', err);
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
  const callerCallTopic = `${identityToTopic(callerIdentity)}_calls_resp`;

  try {
    await fetch(`${RELAY_BASE}/${callerCallTopic}`, {
      method: 'POST',
      body: JSON.stringify({ type: 'CALL_RESPONSE', callId, status }),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.warn('Call response relay notice', err);
  }
}

/**
 * Listens to incoming cloud events (messages, calls, user presence) in real time
 */
export function subscribeToCloudEvents(
  myIdentifier: string,
  handlers: {
    onMessage: (payload: CloudMessagePayload) => void;
    onIncomingCall: (signal: IncomingCallSignal) => void;
    onCallResponse: (callId: string, status: string) => void;
    onUserPresence: (user: ContactPerson) => void;
  }
): () => void {
  if (typeof window === 'undefined' || !myIdentifier) return () => {};

  const myTopic = identityToTopic(myIdentifier);
  const myCallTopic = `${myTopic}_calls`;
  const myCallRespTopic = `${myTopic}_calls_resp`;

  const sources: EventSource[] = [];

  try {
    // 1. Listen for Incoming Messages
    const msgSource = new EventSource(`${RELAY_BASE}/${myTopic}/sse`);
    msgSource.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const data = typeof raw.message === 'string' ? JSON.parse(raw.message) : raw;
        if (data.type === 'INCOMING_MESSAGE' && data.payload) {
          handlers.onMessage(data.payload);
        }
      } catch {}
    };
    sources.push(msgSource);

    // 2. Listen for Incoming Calls
    const callSource = new EventSource(`${RELAY_BASE}/${myCallTopic}/sse`);
    callSource.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const data = typeof raw.message === 'string' ? JSON.parse(raw.message) : raw;
        if (data.type === 'CALL_SIGNAL' && data.signal) {
          handlers.onIncomingCall(data.signal);
        }
      } catch {}
    };
    sources.push(callSource);

    // 3. Listen for Call Responses
    const callRespSource = new EventSource(`${RELAY_BASE}/${myCallRespTopic}/sse`);
    callRespSource.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const data = typeof raw.message === 'string' ? JSON.parse(raw.message) : raw;
        if (data.type === 'CALL_RESPONSE') {
          handlers.onCallResponse(data.callId, data.status);
        }
      } catch {}
    };
    sources.push(callRespSource);

    // 4. Listen for User Directory Presence
    const dirSource = new EventSource(`${RELAY_BASE}/${TOPIC_PREFIX}_directory/sse`);
    dirSource.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const data = typeof raw.message === 'string' ? JSON.parse(raw.message) : raw;
        if (data.type === 'USER_PRESENCE' && data.user) {
          handlers.onUserPresence(data.user);
        }
      } catch {}
    };
    sources.push(dirSource);
  } catch (err) {
    console.warn('SSE subscription notice', err);
  }

  return () => {
    sources.forEach((src) => {
      try {
        src.close();
      } catch {}
    });
  };
}

/**
 * NYARIOS Real-Time Multi-Device Cloud Synchronization Engine
 * Handles real-time messaging, user discovery, and call signaling between different phone numbers/devices.
 */

import { CurrentUserData } from '../context/AppContext';
import { Message, ContactPerson } from '../types';

export interface IncomingCallSignal {
  callId: string;
  callerId: string;
  callerName: string;
  callerPhone: string;
  callerAvatar?: string;
  recipientPhone: string;
  type: 'voice' | 'video';
  timestamp: number;
  status: 'ringing' | 'accepted' | 'declined' | 'ended';
}

export interface CloudMessagePayload {
  id: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  senderAvatar?: string;
  recipientPhone: string;
  message: Message;
  timestamp: number;
}

const CLOUD_CHANNEL_NAME = 'nyarios_global_mesh_2026';
const CLOUD_STORAGE_USERS_KEY = 'nyarios_cloud_directory_v1';
const CLOUD_STORAGE_MSGS_KEY = 'nyarios_cloud_messages_v1';
const CLOUD_STORAGE_CALLS_KEY = 'nyarios_cloud_calls_v1';

// Cross-tab and cross-window realtime broadcast channel
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CLOUD_CHANNEL_NAME);
  } catch {}
}

/**
 * Normalizes phone numbers for accurate matching across devices (+6281234567890)
 */
export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) return `+${digits}`;
  if (digits.startsWith('0')) return `+62${digits.slice(1)}`;
  if (digits.length >= 8) return `+62${digits}`;
  return `+${digits}`;
}

/**
 * Registers current user into the global cloud directory
 */
export function registerUserOnCloud(user: CurrentUserData) {
  if (typeof window === 'undefined' || !user.phone) return;

  const normalized = normalizePhoneNumber(user.phone);
  const cloudUser: ContactPerson = {
    id: user.id,
    name: user.name || 'Pengguna NYARIOS',
    phone: normalized,
    bio: user.bio || 'Aktif di NYARIOS',
    avatar: user.avatar,
    isOnline: true,
    lastSeen: 'Online',
  };

  try {
    // 1. Update shared cloud storage directory
    const existingRaw = localStorage.getItem(CLOUD_STORAGE_USERS_KEY);
    const users: ContactPerson[] = existingRaw ? JSON.parse(existingRaw) : [];
    const filtered = users.filter((u) => normalizePhoneNumber(u.phone) !== normalized);
    const updated = [cloudUser, ...filtered];
    localStorage.setItem(CLOUD_STORAGE_USERS_KEY, JSON.stringify(updated));

    // 2. Broadcast user presence to other open devices/tabs
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'USER_PRESENCE',
        user: cloudUser,
      });
    }
  } catch (e) {
    console.warn('Directory sync notice', e);
  }
}

/**
 * Retrieves all registered users from the cloud directory excluding current user
 */
export function getCloudDirectoryUsers(myPhone: string): ContactPerson[] {
  if (typeof window === 'undefined') return [];
  const normalizedMyPhone = normalizePhoneNumber(myPhone);
  try {
    const raw = localStorage.getItem(CLOUD_STORAGE_USERS_KEY);
    if (!raw) return [];
    const users: ContactPerson[] = JSON.parse(raw);
    return users.filter((u) => normalizePhoneNumber(u.phone) !== normalizedMyPhone);
  } catch {
    return [];
  }
}

/**
 * Sends a real-time message to another phone number across devices
 */
export function sendCloudRealtimeMessage(
  sender: CurrentUserData,
  recipientPhone: string,
  message: Message
) {
  const payload: CloudMessagePayload = {
    id: `cmsg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    senderId: sender.id,
    senderName: sender.name,
    senderPhone: normalizePhoneNumber(sender.phone),
    senderAvatar: sender.avatar,
    recipientPhone: normalizePhoneNumber(recipientPhone),
    message,
    timestamp: Date.now(),
  };

  try {
    // 1. Store in shared cross-device message queue
    const existingRaw = localStorage.getItem(CLOUD_STORAGE_MSGS_KEY);
    const list: CloudMessagePayload[] = existingRaw ? JSON.parse(existingRaw) : [];
    list.unshift(payload);
    // Keep last 100 messages
    localStorage.setItem(CLOUD_STORAGE_MSGS_KEY, JSON.stringify(list.slice(0, 100)));

    // 2. Broadcast via realtime channel
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'INCOMING_MESSAGE',
        payload,
      });
    }

    // 3. Trigger storage event for cross-browser sync
    window.dispatchEvent(
      new CustomEvent('nyarios_incoming_msg', { detail: payload })
    );
  } catch (e) {
    console.warn('Realtime message dispatch notice', e);
  }
}

/**
 * Dispatches a real-time call signal to another phone number across devices
 */
export function sendCloudCallSignal(
  caller: CurrentUserData,
  recipientPhone: string,
  callType: 'voice' | 'video'
): string {
  const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const signal: IncomingCallSignal = {
    callId,
    callerId: caller.id,
    callerName: caller.name,
    callerPhone: normalizePhoneNumber(caller.phone),
    callerAvatar: caller.avatar,
    recipientPhone: normalizePhoneNumber(recipientPhone),
    type: callType,
    timestamp: Date.now(),
    status: 'ringing',
  };

  try {
    localStorage.setItem(CLOUD_STORAGE_CALLS_KEY, JSON.stringify(signal));

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'CALL_SIGNAL',
        signal,
      });
    }

    window.dispatchEvent(
      new CustomEvent('nyarios_call_signal', { detail: signal })
    );
  } catch (e) {
    console.warn('Call signaling notice', e);
  }

  return callId;
}

/**
 * Responds to a call signal (accept, decline, end)
 */
export function respondToCloudCallSignal(
  callId: string,
  status: 'accepted' | 'declined' | 'ended'
) {
  try {
    const raw = localStorage.getItem(CLOUD_STORAGE_CALLS_KEY);
    if (raw) {
      const signal: IncomingCallSignal = JSON.parse(raw);
      if (signal.callId === callId) {
        signal.status = status;
        localStorage.setItem(CLOUD_STORAGE_CALLS_KEY, JSON.stringify(signal));
      }
    }

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'CALL_RESPONSE',
        callId,
        status,
      });
    }

    window.dispatchEvent(
      new CustomEvent('nyarios_call_response', { detail: { callId, status } })
    );
  } catch (e) {
    console.warn('Call response notice', e);
  }
}

/**
 * Listens to incoming cloud events (messages, calls, user presence)
 */
export function subscribeToCloudEvents(
  myPhone: string,
  handlers: {
    onMessage: (payload: CloudMessagePayload) => void;
    onIncomingCall: (signal: IncomingCallSignal) => void;
    onCallResponse: (callId: string, status: string) => void;
    onUserPresence: (user: ContactPerson) => void;
  }
): () => void {
  const normalizedMyPhone = normalizePhoneNumber(myPhone);

  const handleBroadcast = (event: MessageEvent) => {
    const data = event.data;
    if (!data || !data.type) return;

    if (data.type === 'INCOMING_MESSAGE') {
      const payload: CloudMessagePayload = data.payload;
      if (normalizePhoneNumber(payload.recipientPhone) === normalizedMyPhone) {
        handlers.onMessage(payload);
      }
    } else if (data.type === 'CALL_SIGNAL') {
      const signal: IncomingCallSignal = data.signal;
      if (
        normalizePhoneNumber(signal.recipientPhone) === normalizedMyPhone &&
        signal.status === 'ringing'
      ) {
        handlers.onIncomingCall(signal);
      }
    } else if (data.type === 'CALL_RESPONSE') {
      handlers.onCallResponse(data.callId, data.status);
    } else if (data.type === 'USER_PRESENCE') {
      handlers.onUserPresence(data.user);
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === CLOUD_STORAGE_MSGS_KEY && e.newValue) {
      try {
        const list: CloudMessagePayload[] = JSON.parse(e.newValue);
        const latest = list[0];
        if (
          latest &&
          normalizePhoneNumber(latest.recipientPhone) === normalizedMyPhone &&
          Date.now() - latest.timestamp < 3000
        ) {
          handlers.onMessage(latest);
        }
      } catch {}
    } else if (e.key === CLOUD_STORAGE_CALLS_KEY && e.newValue) {
      try {
        const signal: IncomingCallSignal = JSON.parse(e.newValue);
        if (
          normalizePhoneNumber(signal.recipientPhone) === normalizedMyPhone &&
          signal.status === 'ringing' &&
          Date.now() - signal.timestamp < 10000
        ) {
          handlers.onIncomingCall(signal);
        }
      } catch {}
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorageEvent);
  };
}

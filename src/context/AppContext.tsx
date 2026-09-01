import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import {
  Chat,
  Message,
  MessageType,
  Community,
  StatusStory,
  CallRecord,
  ActiveCallState,
  TaskItem,
  ScheduleEvent,
  ChatFolder,
  MainNavTab,
  DesktopSubTab,
  QuickAskData,
  PollData,
  ContactPerson,
} from '../types';
import { sound } from '../utils/sound';
import { THEME_PRESETS, applyThemeVariables } from '../utils/themePresets';
import {
  normalizePhoneNumber,
  normalizeUsername,
  registerUserOnCloud,
  sendCloudRealtimeMessage,
  sendCloudCallSignal,
  respondToCloudCallSignal,
  subscribeToCloudEvents,
  IncomingCallSignal,
  broadcastCloudStatus,
  broadcastDeleteStatus,
  broadcastStatusQuery,
  broadcastUserPresence,
  broadcastPresenceQuery,
  getCloudDirectoryUsers,
  getCloudActiveStatuses,
} from '../utils/cloudSync';
import {
  saveStatusToDb,
  getAllActiveStatusesFromDb,
  deleteStatusFromDb,
} from '../utils/mediaDb';

export interface CurrentUserData {
  id: string;
  name: string;
  username?: string;
  bio: string;
  avatar?: string;
  phone?: string;
  email?: string;
}

interface AppContextType {
  // Authentication
  isLoggedIn: boolean;
  loginWithUsername: (username: string, name?: string, email?: string, password?: string) => void;
  loginWithPhone: (phone: string, name?: string) => void;
  loginWithGoogle: (email: string, name: string, avatar?: string, username?: string) => void;
  logout: () => void;

  // Current user info
  currentUser: CurrentUserData;
  updateUserProfile: (name: string, bio: string, avatar?: string) => void;

  // Theme & Navigation
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  accentTheme: string;
  setAccentTheme: (themeId: string) => void;
  activeNavTab: MainNavTab;
  setActiveNavTab: (tab: MainNavTab) => void;
  activeDesktopSubTab: DesktopSubTab | null;
  setActiveDesktopSubTab: (subTab: DesktopSubTab | null) => void;
  isGroupDetailOpen: boolean;
  setIsGroupDetailOpen: (open: boolean) => void;

  // Chat & Folder State
  chats: Chat[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  activeChat: Chat | null;
  currentChatMessages: Message[];
  messages: Record<string, Message[]>;
  customFolders: ChatFolder[];
  activeFolderId: string;
  setActiveFolderId: (id: string) => void;

  // Chat Actions
  createDirectChat: (name: string, phone: string, initialMessage?: string) => string;
  createDirectChatWithUsername: (username: string, name?: string, initialMessage?: string) => string;
  createGroupChat: (name: string, members: string[], category?: 'Informasi' | 'Diskusi' | 'Kegiatan' | 'Umum', description?: string) => string;
  togglePinChat: (chatId: string) => void;
  toggleMuteChat: (chatId: string) => void;
  toggleArchiveChat: (chatId: string) => void;
  toggleBlockChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;

  // Message Actions
  sendMessage: (chatId: string, content: string, type?: MessageType, extra?: Partial<Message>) => void;
  editMessage: (chatId: string, messageId: string, newContent: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  togglePinMessage: (chatId: string, messageId: string) => void;
  addReaction: (chatId: string, messageId: string, emoji: string) => void;
  saveMessage: (chatId: string, messageId: string, category: 'Penting' | 'Ide' | 'Jadwal' | 'Dokumen' | 'Tugas') => void;
  unsaveMessage: (chatId: string, messageId: string) => void;
  saveMessageToCategory: (chatId: string, messageId: string, category: 'Penting' | 'Ide' | 'Jadwal' | 'Dokumen' | 'Tugas') => void;
  voteQuickAsk: (chatId: string, messageId: string, choice: 'can_attend' | 'cannot_attend' | 'undecided') => void;
  votePoll: (chatId: string, messageId: string, optionId: string) => void;
  closePoll: (chatId: string, messageId: string) => void;

  // Tasks & Schedules
  tasks: TaskItem[];
  createTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, status: 'todo' | 'in_progress' | 'done') => void;
  deleteTask: (taskId: string) => void;

  schedules: ScheduleEvent[];
  createSchedule: (schedule: Omit<ScheduleEvent, 'id' | 'createdAt'>) => void;
  deleteSchedule: (scheduleId: string) => void;

  // Community State
  communities: Community[];
  createCommunity: (name: string, description: string, subGroups: { name: string; category: 'Informasi' | 'Diskusi' | 'Kegiatan' }[]) => void;

  // Status State
  statuses: StatusStory[];
  createStatus: (type: 'text' | 'image' | 'video', content: string, caption?: string, bgColor?: string) => void;
  deleteStatus: (statusId: string) => void;

  // Calls State
  callRecords: CallRecord[];
  activeCall: ActiveCallState | null;
  incomingCall: IncomingCallSignal | null;
  startCall: (contactName: string, contactAvatar: string | undefined, type: 'voice' | 'video', contactPhone?: string) => void;
  endCall: () => void;
  acceptIncomingCall: () => void;
  declineIncomingCall: () => void;
  toggleCallMute: () => void;
  toggleCallVideo: () => void;
  toggleCallSpeaker: () => void;
  toggleCallScreenShare: () => void;

  // Folders Management
  createCustomFolder: (name: string, chatIds: string[]) => void;
  deleteCustomFolder: (folderId: string) => void;

  // Simulator helper
  simulateContactReply: (chatId: string, replyText: string) => void;

  // Contacts
  contacts: ContactPerson[];
  addContact: (contact: ContactPerson) => void;
  deleteContact: (contactId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'nyarios_chat_state_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state (Dark Mode Default)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const appVersion = localStorage.getItem('nyarios_app_version');
      if (appVersion !== '3.0') {
        localStorage.setItem('nyarios_theme', 'dark');
        localStorage.setItem('nyarios_accent_theme', 'coral_sunset');
        localStorage.setItem('nyarios_app_version', '3.0');
        return 'dark';
      }
      const savedTheme = localStorage.getItem('nyarios_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    }
    return 'dark';
  });

  // Accent Color Theme (Default Sunset Coral / Dark Neumorphic)
  const [accentTheme, setAccentThemeState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nyarios_accent_theme');
      if (saved) return saved;
    }
    return 'coral_sunset';
  });

  const setAccentTheme = (themeId: string) => {
    setAccentThemeState(themeId);
    try {
      localStorage.setItem('nyarios_accent_theme', themeId);
    } catch {}
    const themeObj = THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
    applyThemeVariables(themeObj);
  };

  // Auth state (starts as false if no previous session)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('nyarios_is_logged_in');
      return auth === 'true';
    }
    return false;
  });

  // Current user
  const [currentUser, setCurrentUser] = useState<CurrentUserData>(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('nyarios_is_logged_in') === 'true';
      if (auth) {
        const saved = localStorage.getItem('nyarios_user');
        if (saved) {
          try {
            return JSON.parse(saved) as CurrentUserData;
          } catch {}
        }
      }
    }
    return {
      id: '',
      name: '',
      username: '',
      bio: '',
      avatar: '',
      phone: '',
    };
  });

  // Navigation state
  const [activeNavTab, setActiveNavTab] = useState<MainNavTab>('pesan');
  const [activeDesktopSubTab, setActiveDesktopSubTab] = useState<DesktopSubTab | null>(null);
  const [isGroupDetailOpen, setIsGroupDetailOpen] = useState(false);

  // Chats & Messages state - STRICTLY ISOLATED PER USER
  const [chats, setChats] = useState<Chat[]>(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('nyarios_is_logged_in') === 'true';
      const savedUser = localStorage.getItem('nyarios_user');
      if (auth && savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          if (userObj?.id) {
            const saved = localStorage.getItem(`nyarios_data_${userObj.id}_chats`);
            if (saved) return JSON.parse(saved);
          }
        } catch {}
      }
    }
    return [];
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const activeChatIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
    if (activeChatId) {
      setChats((prev) =>
        prev.map((c) => (c.id === activeChatId && c.unreadCount > 0 ? { ...c, unreadCount: 0 } : c))
      );
    }
  }, [activeChatId]);

  // Contacts state - STRICTLY ISOLATED PER USER
  const [contacts, setContacts] = useState<ContactPerson[]>(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('nyarios_is_logged_in') === 'true';
      const savedUser = localStorage.getItem('nyarios_user');
      if (auth && savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          if (userObj?.id) {
            const saved = localStorage.getItem(`nyarios_data_${userObj.id}_contacts`);
            if (saved) return JSON.parse(saved);
          }
        } catch {}
      }
    }
    return [];
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('nyarios_is_logged_in') === 'true';
      const savedUser = localStorage.getItem('nyarios_user');
      if (auth && savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          if (userObj?.id) {
            const saved = localStorage.getItem(`nyarios_data_${userObj.id}_messages`);
            if (saved) return JSON.parse(saved);
          }
        } catch {}
      }
    }
    return {};
  });

  // Folders state
  const [customFolders, setCustomFolders] = useState<ChatFolder[]>(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('nyarios_is_logged_in') === 'true';
      const savedUser = localStorage.getItem('nyarios_user');
      if (auth && savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          if (userObj?.id) {
            const saved = localStorage.getItem(`nyarios_data_${userObj.id}_folders`);
            if (saved) return JSON.parse(saved);
          }
        } catch {}
      }
    }
    return [
      { id: 'all', name: 'Semua', icon: 'Inbox', chatIds: [] },
      { id: 'unread', name: 'Belum Dibaca', icon: 'Clock', chatIds: [] },
      { id: 'groups', name: 'Grup', icon: 'Users', chatIds: [] },
      { id: 'work', name: 'Pribadi', icon: 'Briefcase', chatIds: [] },
    ];
  });
  const [activeFolderId, setActiveFolderId] = useState<string>('all');

  // Tasks & Schedules
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('nyarios_is_logged_in') === 'true';
      const savedUser = localStorage.getItem('nyarios_user');
      if (auth && savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          if (userObj?.id) {
            const saved = localStorage.getItem(`nyarios_data_${userObj.id}_tasks`);
            if (saved) return JSON.parse(saved);
          }
        } catch {}
      }
    }
    return [];
  });

  const [schedules, setSchedules] = useState<ScheduleEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('nyarios_is_logged_in') === 'true';
      const savedUser = localStorage.getItem('nyarios_user');
      if (auth && savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          if (userObj?.id) {
            const saved = localStorage.getItem(`nyarios_data_${userObj.id}_schedules`);
            if (saved) return JSON.parse(saved);
          }
        } catch {}
      }
    }
    return [];
  });

  // Communities
  const [communities, setCommunities] = useState<Community[]>(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('nyarios_is_logged_in') === 'true';
      const savedUser = localStorage.getItem('nyarios_user');
      if (auth && savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          if (userObj?.id) {
            const saved = localStorage.getItem(`nyarios_data_${userObj.id}_communities`);
            if (saved) return JSON.parse(saved);
          }
        } catch {}
      }
    }
    return [];
  });

  // Status Stories
  const [statuses, setStatuses] = useState<StatusStory[]>(() => {
    let list: StatusStory[] = [];
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('nyarios_is_logged_in') === 'true';
      const savedUser = localStorage.getItem('nyarios_user');
      if (auth && savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          if (userObj?.id) {
            const saved = localStorage.getItem(`nyarios_data_${userObj.id}_statuses`);
            if (saved) list = JSON.parse(saved);
          }
        } catch {}
      }
      try {
        const cloudActive = getCloudActiveStatuses();
        const map = new Map<string, StatusStory>();
        list.forEach((s) => map.set(s.id, s));
        cloudActive.forEach((s) => {
          if (!map.has(s.id)) map.set(s.id, s as StatusStory);
        });
        return Array.from(map.values()).sort(
          (a, b) => (b.rawTimestamp || 0) - (a.rawTimestamp || 0)
        );
      } catch {}
    }
    return list;
  });

  // Calls
  const [callRecords, setCallRecords] = useState<CallRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('nyarios_is_logged_in') === 'true';
      const savedUser = localStorage.getItem('nyarios_user');
      if (auth && savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          if (userObj?.id) {
            const saved = localStorage.getItem(`nyarios_data_${userObj.id}_calls`);
            if (saved) return JSON.parse(saved);
          }
        } catch {}
      }
    }
    return [];
  });

  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nyarios_theme', theme);
  }, [theme]);

  // Sync Accent Theme Variables
  useEffect(() => {
    const themeObj = THEME_PRESETS.find((t) => t.id === accentTheme) || THEME_PRESETS[0];
    applyThemeVariables(themeObj);
  }, [accentTheme]);

  // Persist state changes safely (Strictly isolated per-user ID)
  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) return;
    try {
      localStorage.setItem('nyarios_user', JSON.stringify(currentUser));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [currentUser, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) return;
    try {
      localStorage.setItem(`nyarios_data_${currentUser.id}_chats`, JSON.stringify(chats));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [chats, isLoggedIn, currentUser?.id]);

  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) return;
    try {
      localStorage.setItem(`nyarios_data_${currentUser.id}_messages`, JSON.stringify(messages));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [messages, isLoggedIn, currentUser?.id]);

  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) return;
    try {
      localStorage.setItem(`nyarios_data_${currentUser.id}_folders`, JSON.stringify(customFolders));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [customFolders, isLoggedIn, currentUser?.id]);

  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) return;
    try {
      localStorage.setItem(`nyarios_data_${currentUser.id}_tasks`, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [tasks, isLoggedIn, currentUser?.id]);

  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) return;
    try {
      localStorage.setItem(`nyarios_data_${currentUser.id}_schedules`, JSON.stringify(schedules));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [schedules, isLoggedIn, currentUser?.id]);

  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) return;
    try {
      localStorage.setItem(`nyarios_data_${currentUser.id}_communities`, JSON.stringify(communities));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [communities, isLoggedIn, currentUser?.id]);

  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) return;
    try {
      // Save lightweight metadata to localStorage; full media is safely kept in IndexedDB
      const lightweight = statuses.map((st) => ({
        ...st,
        content: st.type === 'video' && st.content.length > 50000 ? '' : st.content,
      }));
      localStorage.setItem(`nyarios_data_${currentUser.id}_statuses`, JSON.stringify(lightweight));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [statuses, isLoggedIn, currentUser?.id]);

  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) return;
    try {
      localStorage.setItem(`nyarios_data_${currentUser.id}_calls`, JSON.stringify(callRecords));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [callRecords, isLoggedIn, currentUser?.id]);

  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) return;
    try {
      localStorage.setItem(`nyarios_data_${currentUser.id}_contacts`, JSON.stringify(contacts));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [contacts, isLoggedIn, currentUser?.id]);

  const addContact = (contact: ContactPerson) => {
    setContacts((prev) => {
      const cleanUser = contact.username?.replace(/^@+/, '').toLowerCase();
      if (
        prev.some(
          (c) =>
            (cleanUser && c.username?.replace(/^@+/, '').toLowerCase() === cleanUser) ||
            c.id === contact.id
        )
      ) {
        return prev;
      }
      return [contact, ...prev];
    });
  };

  const deleteContact = (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
  };

  const [incomingCall, setIncomingCall] = useState<IncomingCallSignal | null>(null);

  // Helper to format lastMessage preview cleanly like WhatsApp
  const formatLastMessageSnippet = (msg: Message): string => {
    if (msg.caption && msg.caption.trim()) return msg.caption.trim();
    if (msg.type === 'image') return 'Foto';
    if (msg.type === 'video') return 'Video';
    if (msg.type === 'voice_note' || msg.type === 'audio') return 'Pesan suara';
    if (msg.type === 'document') return msg.fileName || 'Dokumen';
    if (msg.type === 'poll') return 'Polling';
    if (msg.type === 'quick_ask') return 'Tanya Cepat';
    if (msg.type === 'task_card') return 'Tugas';
    if (msg.type === 'schedule_card') return 'Jadwal';
    if (msg.content && !msg.content.startsWith('data:')) return msg.content;
    return 'Pesan baru';
  };

  // Real-time Cloud Synchronization Listener
  useEffect(() => {
    const myIdentifier = currentUser?.username || currentUser?.phone || currentUser?.id;
    if (!myIdentifier || !isLoggedIn) return;
    registerUserOnCloud(currentUser);

    const unsubscribe = subscribeToCloudEvents(myIdentifier, {
      onMessage: (payload) => {
        const timeStr = new Date(payload.timestamp).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });

        setChats((prevChats) => {
          const senderUser = payload.senderUsername ? normalizeUsername(payload.senderUsername) : '';
          const senderPhone = payload.senderPhone ? payload.senderPhone.replace(/\D/g, '') : '';
          const defaultChatId = `chat_${payload.senderId || payload.senderName.toLowerCase().replace(/\s+/g, '_')}`;

          const existing = prevChats.find((c) => {
            if (c.username && senderUser) {
              return normalizeUsername(c.username) === senderUser;
            }
            if (senderPhone && c.phone && c.phone.replace(/\D/g, '') === senderPhone) {
              return true;
            }
            if (senderUser && c.name) {
              return normalizeUsername(c.name) === senderUser;
            }
            return c.id === defaultChatId;
          });

          const activeId = existing ? existing.id : defaultChatId;

          const incomingMsg: Message = {
            ...payload.message,
            id: payload.message.id || `msg_cloud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            chatId: activeId,
            senderId: payload.senderId,
            senderName: payload.senderName,
            senderAvatar: payload.senderAvatar,
            isOutgoing: false,
            timestamp: timeStr,
            rawTimestamp: payload.timestamp || Date.now(),
          };

          setMessages((prevMsgs) => {
            const list = prevMsgs[activeId] || [];
            if (list.some(m => m.id === incomingMsg.id || (m.rawTimestamp === incomingMsg.rawTimestamp && m.content === incomingMsg.content))) {
              return prevMsgs;
            }
            return {
              ...prevMsgs,
              [activeId]: [...list, incomingMsg],
            };
          });

          const snippet = formatLastMessageSnippet(payload.message);

          if (existing) {
            return prevChats.map((c) =>
              c.id === existing.id
                ? {
                    ...c,
                    avatar: payload.senderAvatar || c.avatar,
                    name: c.isGroup ? c.name : (payload.senderName || c.name),
                    unreadCount: activeChatIdRef.current === existing.id ? 0 : (c.unreadCount || 0) + 1,
                    lastMessage: {
                      text: snippet,
                      timestamp: timeStr,
                      rawTimestamp: payload.timestamp || Date.now(),
                      senderName: payload.senderName,
                      type: payload.message.type,
                    },
                  }
                : c
            );
          } else {
            const newChat: Chat = {
              id: activeId,
              isGroup: false,
              name: payload.senderName || (senderUser ? `@${senderUser}` : 'Teman Baru'),
              username: payload.senderUsername || (senderUser ? `@${senderUser}` : undefined),
              phone: payload.senderPhone,
              avatar: payload.senderAvatar,
              bio: 'Teman di NYARIOS',
              unreadCount: activeChatIdRef.current === activeId ? 0 : 1,
              isPinned: false,
              isMuted: false,
              isArchived: false,
              folderIds: [],
              lastMessage: {
                text: snippet,
                timestamp: timeStr,
                rawTimestamp: payload.timestamp || Date.now(),
                senderName: payload.senderName,
                type: payload.message.type,
              },
            };
            return [newChat, ...prevChats];
          }
        });

        // Also update contact avatar if sender is in contacts
        if (payload.senderAvatar) {
          const sUser = payload.senderUsername ? normalizeUsername(payload.senderUsername) : '';
          const sPhone = payload.senderPhone ? payload.senderPhone.replace(/\D/g, '') : '';
          setContacts((prev) =>
            prev.map((ct) => {
              const ctUser = ct.username ? normalizeUsername(ct.username) : '';
              const ctPhone = ct.phone ? ct.phone.replace(/\D/g, '') : '';
              if ((sUser && ctUser === sUser) || (sPhone && ctPhone === sPhone) || ct.id === payload.senderId) {
                return { ...ct, avatar: payload.senderAvatar || ct.avatar };
              }
              return ct;
            })
          );
        }

        sound.playMessageReceived();
      },
      onIncomingCall: (signal) => {
        setIncomingCall(signal);
      },
      onCallResponse: (callId, status) => {
        if (status === 'declined' || status === 'ended') {
          setActiveCall(null);
          setIncomingCall(null);
        }
      },
      onUserPresence: (cloudUser) => {
        if (!cloudUser) return;
        const targetUser = cloudUser.username ? normalizeUsername(cloudUser.username) : '';
        const targetPhone = cloudUser.phone ? cloudUser.phone.replace(/\D/g, '') : '';

        // 1. Update matching chat avatars & names
        setChats((prevChats) =>
          prevChats.map((c) => {
            const cUser = c.username ? normalizeUsername(c.username) : '';
            const cPhone = c.phone ? c.phone.replace(/\D/g, '') : '';
            const isMatch =
              (targetUser && cUser === targetUser) ||
              (targetPhone && cPhone === targetPhone) ||
              (targetUser && normalizeUsername(c.name) === targetUser) ||
              c.id === `chat_${cloudUser.id}`;

            if (isMatch) {
              return {
                ...c,
                avatar: cloudUser.avatar || c.avatar,
                name: c.isGroup ? c.name : (cloudUser.name || c.name),
              };
            }
            return c;
          })
        );

        // 2. Update matching contacts
        setContacts((prevContacts) =>
          prevContacts.map((ct) => {
            const ctUser = ct.username ? normalizeUsername(ct.username) : '';
            const ctPhone = ct.phone ? ct.phone.replace(/\D/g, '') : '';
            const isMatch =
              (targetUser && ctUser === targetUser) ||
              (targetPhone && ctPhone === targetPhone) ||
              ct.id === cloudUser.id;

            if (isMatch) {
              return {
                ...ct,
                avatar: cloudUser.avatar || ct.avatar,
                name: cloudUser.name || ct.name,
                bio: cloudUser.bio || ct.bio,
              };
            }
            return ct;
          })
        );

        // 3. Update matching status avatars
        if (cloudUser.avatar) {
          setStatuses((prevStatuses) =>
            prevStatuses.map((st) => {
              if (
                st.userId === cloudUser.id ||
                (targetUser && normalizeUsername(st.userName) === targetUser)
              ) {
                return {
                  ...st,
                  userAvatar: cloudUser.avatar || st.userAvatar,
                };
              }
              return st;
            })
          );
        }
      },
      onPresenceQuery: (requesterId) => {
        if (requesterId !== currentUser?.id) {
          broadcastUserPresence(currentUser);
        }
      },
      onStatusStory: (incomingStatus) => {
        const fullStory = incomingStatus as StatusStory;
        saveStatusToDb(fullStory);
        setStatuses((prev) => {
          const filtered = prev.filter((s) => s.id !== incomingStatus.id);
          return [fullStory, ...filtered];
        });
      },
      onStatusDeleted: (deletedStatusId) => {
        deleteStatusFromDb(deletedStatusId);
        setStatuses((prev) => prev.filter((s) => s.id !== deletedStatusId));
      },
      onStatusQuery: (requesterId) => {
        if (requesterId !== currentUser?.id) {
          // Re-broadcast all our active statuses so late-joining peers receive all stories (1, 2, 3, etc.)
          statuses
            .filter((s) => s.userId === currentUser.id || s.userName === currentUser.name)
            .forEach((s) => {
              broadcastCloudStatus(currentUser, s);
            });
        }
      },
    });

    // Query online peers for all active statuses and presence after connection initializes
    const queryTimer = setTimeout(() => {
      broadcastStatusQuery(currentUser);
      broadcastUserPresence(currentUser);
      broadcastPresenceQuery(currentUser);
    }, 300);

    return () => {
      clearTimeout(queryTimer);
      unsubscribe();
    };
  }, [currentUser?.username, currentUser?.phone, currentUser?.id, currentUser?.avatar, isLoggedIn, statuses]);

  // Restore Active Statuses (including Large Video Stories) from IndexedDB on startup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    getAllActiveStatusesFromDb().then((dbStatuses) => {
      if (dbStatuses && dbStatuses.length > 0) {
        setStatuses((prev) => {
          const map = new Map<string, StatusStory>();
          prev.forEach((s) => map.set(s.id, s));
          dbStatuses.forEach((s) => {
            if (!map.has(s.id)) map.set(s.id, s);
          });
          return Array.from(map.values()).sort(
            (a, b) => (b.rawTimestamp || 0) - (a.rawTimestamp || 0)
          );
        });
      }
    });
  }, [currentUser?.id]);

  // Auto-resolve missing chat avatars from statuses, contacts, or directory
  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) return;

    setChats((prevChats) => {
      let changed = false;
      const updated = prevChats.map((c) => {
        if (c.isGroup || (c.avatar && c.avatar.trim())) return c;

        const cleanCUser = c.username ? normalizeUsername(c.username) : '';
        const cleanCName = c.name ? normalizeUsername(c.name) : '';

        // 1. Check in statuses
        const foundInStatus = statuses.find(
          (s) =>
            s.userAvatar &&
            s.userAvatar.trim() &&
            (s.userId === c.id ||
              (cleanCUser && normalizeUsername(s.userName) === cleanCUser) ||
              (cleanCName && normalizeUsername(s.userName) === cleanCName))
        );
        if (foundInStatus?.userAvatar) {
          changed = true;
          return { ...c, avatar: foundInStatus.userAvatar };
        }

        // 2. Check in contacts
        const foundInContact = contacts.find(
          (ct) =>
            ct.avatar &&
            ct.avatar.trim() &&
            ((cleanCUser && ct.username && normalizeUsername(ct.username) === cleanCUser) ||
              (cleanCName && normalizeUsername(ct.name) === cleanCName))
        );
        if (foundInContact?.avatar) {
          changed = true;
          return { ...c, avatar: foundInContact.avatar };
        }

        // 3. Check in cloud directory
        const dirUsers = getCloudDirectoryUsers(currentUser.username || currentUser.name);
        const foundInDir = dirUsers.find(
          (u) =>
            u.avatar &&
            u.avatar.trim() &&
            ((cleanCUser && u.username && normalizeUsername(u.username) === cleanCUser) ||
              (cleanCName && normalizeUsername(u.name) === cleanCName))
        );
        if (foundInDir?.avatar) {
          changed = true;
          return { ...c, avatar: foundInDir.avatar };
        }

        return c;
      });

      return changed ? updated : prevChats;
    });
  }, [statuses, contacts, isLoggedIn, currentUser?.id]);

  // Active call timer
  useEffect(() => {
    let interval: number;
    if (activeCall && activeCall.isActive) {
      interval = window.setInterval(() => {
        setActiveCall((prev) => prev ? { ...prev, durationSeconds: prev.durationSeconds + 1 } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall?.isActive]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const restoreUserData = (userId: string) => {
    if (typeof window === 'undefined' || !userId) return;
    try {
      // 1. Restore Chats (Strictly per-user)
      const savedChats = localStorage.getItem(`nyarios_data_${userId}_chats`);
      if (savedChats) {
        try {
          const parsed = JSON.parse(savedChats);
          setChats(Array.isArray(parsed) ? parsed : []);
        } catch {
          setChats([]);
        }
      } else {
        setChats([]);
      }

      // 2. Restore Messages (Strictly per-user)
      const savedMsgs = localStorage.getItem(`nyarios_data_${userId}_messages`);
      if (savedMsgs) {
        try {
          const parsed = JSON.parse(savedMsgs);
          setMessages(parsed && typeof parsed === 'object' ? parsed : {});
        } catch {
          setMessages({});
        }
      } else {
        setMessages({});
      }

      // 3. Restore Folders
      const savedFolders = localStorage.getItem(`nyarios_data_${userId}_folders`);
      if (savedFolders) {
        try {
          const parsed = JSON.parse(savedFolders);
          setCustomFolders(Array.isArray(parsed) ? parsed : [
            { id: 'all', name: 'Semua', icon: 'Inbox', chatIds: [] },
            { id: 'unread', name: 'Belum Dibaca', icon: 'Clock', chatIds: [] },
            { id: 'groups', name: 'Grup', icon: 'Users', chatIds: [] },
            { id: 'work', name: 'Pribadi', icon: 'Briefcase', chatIds: [] },
          ]);
        } catch {
          setCustomFolders([
            { id: 'all', name: 'Semua', icon: 'Inbox', chatIds: [] },
            { id: 'unread', name: 'Belum Dibaca', icon: 'Clock', chatIds: [] },
            { id: 'groups', name: 'Grup', icon: 'Users', chatIds: [] },
            { id: 'work', name: 'Pribadi', icon: 'Briefcase', chatIds: [] },
          ]);
        }
      } else {
        setCustomFolders([
          { id: 'all', name: 'Semua', icon: 'Inbox', chatIds: [] },
          { id: 'unread', name: 'Belum Dibaca', icon: 'Clock', chatIds: [] },
          { id: 'groups', name: 'Grup', icon: 'Users', chatIds: [] },
          { id: 'work', name: 'Pribadi', icon: 'Briefcase', chatIds: [] },
        ]);
      }

      // 4. Restore Tasks
      const savedTasks = localStorage.getItem(`nyarios_data_${userId}_tasks`);
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);

      // 5. Restore Schedules
      const savedSchedules = localStorage.getItem(`nyarios_data_${userId}_schedules`);
      setSchedules(savedSchedules ? JSON.parse(savedSchedules) : []);

      // 6. Restore Communities
      const savedComms = localStorage.getItem(`nyarios_data_${userId}_communities`);
      setCommunities(savedComms ? JSON.parse(savedComms) : []);

      // 7. Restore Statuses
      const savedStatuses = localStorage.getItem(`nyarios_data_${userId}_statuses`);
      setStatuses(savedStatuses ? JSON.parse(savedStatuses) : []);

      // 8. Restore Call Records
      const savedCalls = localStorage.getItem(`nyarios_data_${userId}_calls`);
      setCallRecords(savedCalls ? JSON.parse(savedCalls) : []);

      // 9. Restore Contacts (Strictly per-user)
      const savedContacts = localStorage.getItem(`nyarios_data_${userId}_contacts`);
      if (savedContacts) {
        try {
          const parsed = JSON.parse(savedContacts);
          setContacts(Array.isArray(parsed) ? parsed : []);
        } catch {
          setContacts([]);
        }
      } else {
        setContacts([]);
      }

      setActiveChatId(null);
    } catch (err) {
      console.warn('Restore user data notice', err);
    }
  };

  const loginWithUsername = (username: string, name?: string, email?: string, password?: string) => {
    const cleanUser = username.replace(/^@+/, '').trim().toLowerCase();
    const userId = `user_${cleanUser}`;
    const newUser: CurrentUserData = {
      id: userId,
      name: name?.trim() || cleanUser,
      username: `@${cleanUser}`,
      bio: 'Menggunakan NYARIOS',
      avatar: '',
      email: email?.trim() || `${cleanUser}@nyarios.app`,
      phone: '',
    };

    setCurrentUser(newUser);
    restoreUserData(userId);
    registerUserOnCloud(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('nyarios_is_logged_in', 'true');
    localStorage.setItem('nyarios_user', JSON.stringify(newUser));
  };

  const loginWithPhone = (phone: string, name?: string) => {
    const normalized = normalizePhoneNumber(phone);
    const digits = normalized.replace(/\D/g, '');
    const userId = `user_${digits}`;
    const newUser: CurrentUserData = {
      id: userId,
      name: name?.trim() || 'Pengguna NYARIOS',
      username: `@user${digits.slice(-4)}`,
      bio: 'Menggunakan NYARIOS',
      avatar: '',
      phone: normalized,
    };

    setCurrentUser(newUser);
    restoreUserData(userId);
    registerUserOnCloud(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('nyarios_is_logged_in', 'true');
    localStorage.setItem('nyarios_user', JSON.stringify(newUser));
  };

  const loginWithGoogle = (email: string, name: string, avatar?: string, username?: string) => {
    const cleanId = `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const baseUser = username || email.split('@')[0];
    const cleanUser = baseUser.replace(/^@+/, '').toLowerCase();
    const newUser: CurrentUserData = {
      id: cleanId,
      name: name.trim() || 'Pengguna Google',
      username: `@${cleanUser}`,
      bio: email,
      avatar: avatar || '',
      email,
    };
    setCurrentUser(newUser);
    restoreUserData(cleanId);
    registerUserOnCloud(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('nyarios_is_logged_in', 'true');
    localStorage.setItem('nyarios_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('nyarios_is_logged_in', 'false');
    localStorage.removeItem('nyarios_user');

    // Clean up legacy global shared state
    try {
      localStorage.removeItem('nyarios_chat_state_v1_chats');
      localStorage.removeItem('nyarios_chat_state_v1_messages');
      localStorage.removeItem('nyarios_chat_state_v1_folders');
      localStorage.removeItem('nyarios_chat_state_v1_tasks');
      localStorage.removeItem('nyarios_chat_state_v1_schedules');
      localStorage.removeItem('nyarios_chat_state_v1_communities');
      localStorage.removeItem('nyarios_chat_state_v1_statuses');
      localStorage.removeItem('nyarios_chat_state_v1_calls');
      localStorage.removeItem('nyarios_chat_state_v1_contacts');
    } catch {}

    setCurrentUser({
      id: '',
      name: '',
      username: '',
      bio: '',
      avatar: '',
      phone: '',
    });
    setChats([]);
    setMessages({});
    setContacts([]);
    setTasks([]);
    setSchedules([]);
    setCommunities([]);
    setStatuses([]);
    setCallRecords([]);
    setActiveChatId(null);
  };

  const updateUserProfile = (name: string, bio: string, avatar?: string) => {
    const updated = {
      ...currentUser,
      name: name.trim() || currentUser.name || 'Saya',
      bio: bio.trim() || currentUser.bio || 'Menggunakan NYARIOS',
      avatar: avatar ?? currentUser.avatar,
    };
    setCurrentUser(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nyarios_user', JSON.stringify(updated));
      } catch (e) {
        console.warn('Profile save notice', e);
      }
    }
    broadcastUserPresence(updated);
  };

  const activeChat = useMemo(() => {
    return chats.find(c => c.id === activeChatId) || null;
  }, [chats, activeChatId]);

  const currentChatMessages = useMemo(() => {
    if (!activeChatId) return [];
    return messages[activeChatId] || [];
  }, [messages, activeChatId]);

  // Create direct chat via Username (@username)
  const createDirectChatWithUsername = (username: string, name?: string, initialMessage?: string): string => {
    const cleanUser = username.startsWith('@') ? username : `@${username}`;
    const cleanRaw = normalizeUsername(username);
    const existing = chats.find(c => {
      if (c.username && normalizeUsername(c.username) === cleanRaw) return true;
      if (c.name && normalizeUsername(c.name) === cleanRaw) return true;
      return false;
    });

    if (existing) {
      setActiveChatId(existing.id);
      setActiveNavTab('pesan');
      if (initialMessage && initialMessage.trim()) {
        sendMessage(existing.id, initialMessage.trim(), 'text', {}, cleanUser);
      }
      return existing.id;
    }

    // Lookup avatar from contacts or directory
    const matchingContact = contacts.find((ct) => {
      const ctUser = ct.username ? normalizeUsername(ct.username) : '';
      return ctUser === cleanRaw;
    });

    let foundAvatar = matchingContact?.avatar;
    if (!foundAvatar) {
      const dirUsers = getCloudDirectoryUsers(currentUser.username || currentUser.name);
      const foundInDir = dirUsers.find((u) => {
        const uUser = u.username ? normalizeUsername(u.username) : '';
        return uUser === cleanRaw;
      });
      if (foundInDir?.avatar) foundAvatar = foundInDir.avatar;
    }

    const newChatId = `chat_direct_${cleanRaw || Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      isGroup: false,
      name: name || matchingContact?.name || cleanUser,
      username: cleanUser,
      avatar: foundAvatar,
      bio: matchingContact?.bio || 'Teman di NYARIOS',
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      folderIds: [],
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChatId);
    setActiveNavTab('pesan');

    if (initialMessage && initialMessage.trim()) {
      sendMessage(newChatId, initialMessage.trim(), 'text', {}, cleanUser);
    }

    return newChatId;
  };

  // Create direct chat
  const createDirectChat = (name: string, phone: string, initialMessage?: string): string => {
    const newChatId = `chat_${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      isGroup: false,
      name,
      phone,
      bio: 'Kontak Baru',
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      folderIds: [],
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChatId);
    setActiveNavTab('pesan');

    if (initialMessage && initialMessage.trim()) {
      sendMessage(newChatId, initialMessage.trim(), 'text', {}, phone);
    }

    return newChatId;
  };

  // Create group chat
  const createGroupChat = (
    name: string, 
    members: string[], 
    category: 'Informasi' | 'Diskusi' | 'Kegiatan' | 'Umum' = 'Umum', 
    description?: string
  ): string => {
    const newChatId = `group_${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      isGroup: true,
      name,
      members: [currentUser.name, ...members],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      folderIds: [],
      groupCategory: category,
      groupDescription: description || `Grup obrolan: ${name}`,
    };

    // System message
    const sysMsg: Message = {
      id: `msg_sys_${Date.now()}`,
      chatId: newChatId,
      senderId: 'system',
      senderName: 'Sistem',
      isOutgoing: false,
      type: 'system',
      content: `Grup "${name}" berhasil dibuat dengan ${members.length + 1} anggota.`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      rawTimestamp: Date.now(),
      status: 'read',
      reactions: [],
    };

    setChats(prev => [newChat, ...prev]);
    setMessages(prev => ({
      ...prev,
      [newChatId]: [sysMsg],
    }));

    setActiveChatId(newChatId);
    setActiveNavTab('pesan');
    return newChatId;
  };

  const togglePinChat = (chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, isPinned: !c.isPinned } : c));
  };

  const toggleMuteChat = (chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, isMuted: !c.isMuted } : c));
  };

  const toggleArchiveChat = (chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, isArchived: !c.isArchived } : c));
  };

  const toggleBlockChat = (chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, isBlocked: !c.isBlocked } : c));
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    setMessages(prev => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  // Send message
  const sendMessage = (
    chatId: string,
    content: string,
    type: MessageType = 'text',
    extra: Partial<Message> = {},
    overrideRecipient?: string
  ) => {
    const rawNow = Date.now();
    const timeStr = new Date(rawNow).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: `msg_${rawNow}_${Math.random().toString(36).substring(2, 7)}`,
      chatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      isOutgoing: true,
      type,
      content,
      timestamp: timeStr,
      rawTimestamp: rawNow,
      status: 'sent',
      reactions: [],
      ...extra,
    };

    // Update messages
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg],
    }));

    // Update chat last message
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        let snippet = content;
        if (type === 'voice_note') snippet = '🎤 Pesan suara';
        else if (type === 'image') snippet = '📷 Foto';
        else if (type === 'video') snippet = '🎥 Video';
        else if (type === 'document') snippet = '📄 Dokumen';
        else if (type === 'quick_ask') snippet = `❓ ${extra.quickAsk?.question || 'Tanya Grup'}`;
        else if (type === 'poll') snippet = `📊 ${extra.poll?.question || 'Jajak Pendapat'}`;
        else if (type === 'task_card') snippet = `✅ Tugas: ${extra.taskData?.title || ''}`;
        else if (type === 'schedule_card') snippet = `📅 Jadwal: ${extra.scheduleData?.title || ''}`;

        return {
          ...c,
          lastMessage: {
            text: snippet,
            timestamp: timeStr,
            rawTimestamp: rawNow,
            senderName: currentUser.name,
            type,
          },
        };
      }
      return c;
    }));

    // Transmit to recipient device across network in real-time
    const targetChat = chats.find(c => c.id === chatId);
    const recipientTarget = overrideRecipient || targetChat?.username || targetChat?.phone || targetChat?.name;
    if (recipientTarget && (!targetChat || !targetChat.isGroup)) {
      sendCloudRealtimeMessage(currentUser, recipientTarget, newMsg);
    }

    sound.playMessageSent();
  };

  const editMessage = (chatId: string, messageId: string, newContent: string) => {
    setMessages(prev => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map(m => m.id === messageId ? { ...m, content: newContent, isEdited: true } : m),
      };
    });
  };

  const deleteMessage = (chatId: string, messageId: string) => {
    setMessages(prev => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map(m => m.id === messageId ? { ...m, isDeleted: true, content: 'Pesan ini telah dihapus' } : m),
      };
    });
  };

  const togglePinMessage = (chatId: string, messageId: string) => {
    setMessages(prev => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map(m => m.id === messageId ? { ...m, isPinned: !m.isPinned } : m),
      };
    });
  };

  const addReaction = (chatId: string, messageId: string, emoji: string) => {
    setMessages(prev => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map(m => {
          if (m.id !== messageId) return m;
          const reactions = [...m.reactions];
          const existingIdx = reactions.findIndex(r => r.emoji === emoji);
          if (existingIdx >= 0) {
            const hasUser = reactions[existingIdx].users.includes('Saya');
            if (hasUser) {
              // Remove reaction
              const newUsers = reactions[existingIdx].users.filter(u => u !== 'Saya');
              if (newUsers.length === 0) {
                reactions.splice(existingIdx, 1);
              } else {
                reactions[existingIdx] = {
                  ...reactions[existingIdx],
                  count: newUsers.length,
                  users: newUsers,
                };
              }
            } else {
              // Add user to reaction
              reactions[existingIdx] = {
                ...reactions[existingIdx],
                count: reactions[existingIdx].count + 1,
                users: [...reactions[existingIdx].users, 'Saya'],
              };
            }
          } else {
            // New reaction emoji
            reactions.push({
              emoji,
              count: 1,
              users: ['Saya'],
            });
          }
          return { ...m, reactions };
        }),
      };
    });
  };

  const saveMessage = (chatId: string, messageId: string, category: 'Penting' | 'Ide' | 'Jadwal' | 'Dokumen' | 'Tugas') => {
    setMessages(prev => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map(m => m.id === messageId ? { ...m, savedCategory: category } : m),
      };
    });
  };

  const unsaveMessage = (chatId: string, messageId: string) => {
    setMessages(prev => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map(m => m.id === messageId ? { ...m, savedCategory: undefined } : m),
      };
    });
  };

  // Vote Quick Ask
  const voteQuickAsk = (chatId: string, messageId: string, choice: 'can_attend' | 'cannot_attend' | 'undecided') => {
    setMessages(prev => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map(m => {
          if (m.id !== messageId || !m.quickAsk) return m;
          const currentVotes = {
            can_attend: m.quickAsk.votes.can_attend.filter(u => u !== 'Saya'),
            cannot_attend: m.quickAsk.votes.cannot_attend.filter(u => u !== 'Saya'),
            undecided: m.quickAsk.votes.undecided.filter(u => u !== 'Saya'),
          };
          currentVotes[choice].push('Saya');
          return {
            ...m,
            quickAsk: {
              ...m.quickAsk,
              votes: currentVotes,
            },
          };
        }),
      };
    });
    sound.playTap();
  };

  // Vote Poll
  const votePoll = (chatId: string, messageId: string, optionId: string) => {
    setMessages(prev => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map(m => {
          if (m.id !== messageId || !m.poll || m.poll.isClosed) return m;
          const poll = m.poll;
          const options = poll.options.map(opt => {
            const hasVoted = opt.voterNames.includes('Saya');
            if (poll.isMultiChoice) {
              return opt.id === optionId
                ? { ...opt, voterNames: hasVoted ? opt.voterNames.filter(u => u !== 'Saya') : [...opt.voterNames, 'Saya'] }
                : opt;
            } else {
              // Single choice
              if (opt.id === optionId) {
                return { ...opt, voterNames: hasVoted ? [] : ['Saya'] };
              } else {
                return { ...opt, voterNames: opt.voterNames.filter(u => u !== 'Saya') };
              }
            }
          });
          return {
            ...m,
            poll: {
              ...poll,
              options,
            },
          };
        }),
      };
    });
    sound.playTap();
  };

  const closePoll = (chatId: string, messageId: string) => {
    setMessages(prev => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map(m => m.id === messageId && m.poll ? { ...m, poll: { ...m.poll, isClosed: true } } : m),
      };
    });
  };

  // Tasks
  const createTask = (task: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);

    // Send task message card if attached to active chat
    if (task.chatId) {
      sendMessage(task.chatId, `Tugas baru dibuat: ${task.title}`, 'task_card', {
        taskData: newTask,
      });
    }
  };

  const updateTaskStatus = (taskId: string, status: 'todo' | 'in_progress' | 'done') => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Schedules
  const createSchedule = (schedule: Omit<ScheduleEvent, 'id' | 'createdAt'>) => {
    const newEvent: ScheduleEvent = {
      ...schedule,
      id: `event_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSchedules(prev => [newEvent, ...prev]);

    if (schedule.chatId) {
      sendMessage(schedule.chatId, `Jadwal baru ditambahkan: ${schedule.title}`, 'schedule_card', {
        scheduleData: newEvent,
      });
    }
  };

  const deleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
  };

  // Communities
  const createCommunity = (
    name: string,
    description: string,
    subGroups: { name: string; category: 'Informasi' | 'Diskusi' | 'Kegiatan' }[]
  ) => {
    const commId = `comm_${Date.now()}`;
    const subGroupChatIds: string[] = [];

    // Create sub groups as chat entries
    subGroups.forEach((sub, idx) => {
      const subChatId = `group_${Date.now()}_${idx}`;
      const subChat: Chat = {
        id: subChatId,
        isGroup: true,
        name: `${sub.name}`,
        members: [currentUser.name],
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isArchived: false,
        folderIds: [],
        communityId: commId,
        groupCategory: sub.category,
        groupDescription: `Kanal ${sub.category} dari komunitas ${name}`,
      };
      setChats(prev => [subChat, ...prev]);
      subGroupChatIds.push(subChatId);
    });

    const newComm: Community = {
      id: commId,
      name,
      description,
      announcement: `Selamat datang di komunitas ${name}!`,
      subGroupIds: subGroupChatIds,
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };

    setCommunities(prev => [newComm, ...prev]);
    setActiveNavTab('komunitas');
  };

  // Status
  const createStatus = (type: 'text' | 'image' | 'video', content: string, caption?: string, bgColor?: string) => {
    const rawNow = Date.now();
    const newStatus: StatusStory = {
      id: `status_${rawNow}_${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      type,
      content,
      caption,
      bgColor: bgColor || '#ff4b4b',
      timestamp: 'Baru saja',
      rawTimestamp: rawNow,
      viewers: [],
    };
    saveStatusToDb(newStatus);
    setStatuses(prev => [newStatus, ...prev]);
    broadcastCloudStatus(currentUser, newStatus);
  };

  const deleteStatus = (statusId: string) => {
    deleteStatusFromDb(statusId);
    setStatuses(prev => prev.filter(s => s.id !== statusId));
    broadcastDeleteStatus(currentUser, statusId);
  };

  // Calls
  const startCall = (
    contactName: string,
    contactAvatar: string | undefined,
    type: 'voice' | 'video',
    contactPhone?: string
  ) => {
    setActiveCall({
      isActive: true,
      contactName,
      contactAvatar,
      type,
      isMuted: false,
      isVideoOff: false,
      isSpeakerOn: true,
      isScreenSharing: false,
      durationSeconds: 0,
    });

    const identityToCall = contactPhone || activeChat?.username || activeChat?.phone;
    if (identityToCall) {
      sendCloudCallSignal(currentUser, identityToCall, type);
    }
  };

  const acceptIncomingCall = () => {
    if (!incomingCall) return;
    const callerIdentity = incomingCall.callerUsername || incomingCall.callerPhone || incomingCall.callerId;
    respondToCloudCallSignal(callerIdentity, incomingCall.callId, 'accepted');
    setActiveCall({
      isActive: true,
      contactName: incomingCall.callerName,
      contactAvatar: incomingCall.callerAvatar,
      type: incomingCall.type,
      isMuted: false,
      isVideoOff: false,
      isSpeakerOn: true,
      isScreenSharing: false,
      durationSeconds: 0,
    });
    setIncomingCall(null);
  };

  const declineIncomingCall = () => {
    if (!incomingCall) return;
    const callerIdentity = incomingCall.callerUsername || incomingCall.callerPhone || incomingCall.callerId;
    respondToCloudCallSignal(callerIdentity, incomingCall.callId, 'declined');
    setIncomingCall(null);
  };

  const endCall = () => {
    if (activeCall) {
      const mins = Math.floor(activeCall.durationSeconds / 60);
      const secs = activeCall.durationSeconds % 60;
      const durationStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      const newRecord: CallRecord = {
        id: `call_${Date.now()}`,
        contactName: activeCall.contactName,
        contactAvatar: activeCall.contactAvatar,
        type: activeCall.type,
        direction: 'outgoing',
        duration: durationStr,
        timestamp: 'Baru saja',
        rawTimestamp: Date.now(),
      };
      setCallRecords((prev) => [newRecord, ...prev]);

      if (activeChat?.phone) {
        respondToCloudCallSignal(activeChat.phone, `call_${activeChat.phone}`, 'ended');
      }
    }
    setActiveCall(null);
  };

  const toggleCallMute = () => {
    setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
  };

  const toggleCallVideo = () => {
    setActiveCall(prev => prev ? { ...prev, isVideoOff: !prev.isVideoOff } : null);
  };

  const toggleCallSpeaker = () => {
    setActiveCall(prev => prev ? { ...prev, isSpeakerOn: !prev.isSpeakerOn } : null);
  };

  const toggleCallScreenShare = () => {
    setActiveCall(prev => prev ? { ...prev, isScreenSharing: !prev.isScreenSharing } : null);
  };

  // Folders
  const createCustomFolder = (name: string, chatIds: string[]) => {
    const newFolder: ChatFolder = {
      id: `folder_${Date.now()}`,
      name,
      chatIds,
      isCustom: true,
    };
    setCustomFolders(prev => [...prev, newFolder]);
    // update chats folderIds
    setChats(prev => prev.map(c => {
      if (chatIds.includes(c.id)) {
        return {
          ...c,
          folderIds: Array.from(new Set([...c.folderIds, newFolder.id])),
        };
      }
      return c;
    }));
  };

  const deleteCustomFolder = (folderId: string) => {
    setCustomFolders(prev => prev.filter(f => f.id !== folderId));
    setChats(prev => prev.map(c => ({
      ...c,
      folderIds: c.folderIds.filter(fid => fid !== folderId),
    })));
    if (activeFolderId === folderId) {
      setActiveFolderId('all');
    }
  };

  // Simulator helper: lets user test incoming messages from other contacts
  const simulateContactReply = (chatId: string, replyText: string) => {
    const targetChat = chats.find(c => c.id === chatId);
    if (!targetChat) return;

    setTimeout(() => {
      const rawNow = Date.now();
      const timeStr = new Date(rawNow).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      const incomingMsg: Message = {
        id: `msg_inc_${rawNow}`,
        chatId,
        senderId: 'contact_other',
        senderName: targetChat.name,
        senderAvatar: targetChat.avatar,
        isOutgoing: false,
        type: 'text',
        content: replyText,
        timestamp: timeStr,
        rawTimestamp: rawNow,
        status: 'read',
        reactions: [],
      };

      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), incomingMsg],
      }));

      setChats(prev => prev.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            unreadCount: activeChatId === chatId ? 0 : c.unreadCount + 1,
            lastMessage: {
              text: replyText,
              timestamp: timeStr,
              rawTimestamp: rawNow,
              senderName: targetChat.name,
              type: 'text',
            },
          };
        }
        return c;
      }));

      sound.playMessageReceived();
    }, 800);
  };

   // Video Feeds (Instagram Style) Methods



  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        loginWithUsername,
        loginWithPhone,
        loginWithGoogle,
        logout,
        currentUser,
        updateUserProfile,
        theme,
        toggleTheme,
        accentTheme,
        setAccentTheme,
        activeNavTab,
        setActiveNavTab,
        activeDesktopSubTab,
        setActiveDesktopSubTab,
        isGroupDetailOpen,
        setIsGroupDetailOpen,
        chats,
        activeChatId,
        activeChat,
        setActiveChatId,
        messages,
        currentChatMessages,
        customFolders,
        activeFolderId,
        setActiveFolderId,
        createDirectChat,
        createDirectChatWithUsername,
        createGroupChat,
        togglePinChat,
        toggleMuteChat,
        toggleArchiveChat,
        toggleBlockChat,
        deleteChat,
        sendMessage,
        editMessage,
        deleteMessage,
        togglePinMessage,
        addReaction,
        saveMessage,
        unsaveMessage,
        saveMessageToCategory: saveMessage,
        voteQuickAsk,
        votePoll,
        closePoll,
        tasks,
        createTask,
        updateTaskStatus,
        deleteTask,
        schedules,
        createSchedule,
        deleteSchedule,
        communities,
        createCommunity,
        statuses,
        createStatus,
        deleteStatus,
        callRecords,
        activeCall,
        incomingCall,
        startCall,
        endCall,
        acceptIncomingCall,
        declineIncomingCall,
        toggleCallMute,
        toggleCallVideo,
        toggleCallSpeaker,
        toggleCallScreenShare,
        createCustomFolder,
        deleteCustomFolder,
        simulateContactReply,
        contacts,
        addContact,
        deleteContact,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

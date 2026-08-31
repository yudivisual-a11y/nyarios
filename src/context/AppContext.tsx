import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
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
} from '../types';
import { sound } from '../utils/sound';
import { THEME_PRESETS, applyThemeVariables } from '../utils/themePresets';
import {
  normalizePhoneNumber,
  registerUserOnCloud,
  sendCloudRealtimeMessage,
  sendCloudCallSignal,
  respondToCloudCallSignal,
  subscribeToCloudEvents,
  IncomingCallSignal,
} from '../utils/cloudSync';

export interface CurrentUserData {
  id: string;
  name: string;
  bio: string;
  avatar?: string;
  phone: string;
  email?: string;
}

interface AppContextType {
  // Authentication
  isLoggedIn: boolean;
  loginWithPhone: (phone: string, name?: string) => void;
  loginWithGoogle: (email: string, name: string, avatar?: string) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'nyarios_chat_state_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('nyarios_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Accent Color Theme (14 modern color themes)
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
      const saved = localStorage.getItem('nyarios_user');
      if (saved) {
        try {
          return JSON.parse(saved) as CurrentUserData;
        } catch {
          // fallback
        }
      }
    }
    return {
      id: 'user_me',
      name: 'Saya',
      bio: 'Menggunakan NYARIOS',
      avatar: '',
      phone: '+62 812-3456-7890',
    };
  });

  // Navigation state
  const [activeNavTab, setActiveNavTab] = useState<MainNavTab>('pesan');
  const [activeDesktopSubTab, setActiveDesktopSubTab] = useState<DesktopSubTab | null>(null);
  const [isGroupDetailOpen, setIsGroupDetailOpen] = useState(false);

  // Chats & Messages state - PURE ZERO DUMMY DATA (Starts Empty)
  const [chats, setChats] = useState<Chat[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_chats`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [];
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_messages`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return {};
  });

  // Folders state
  const [customFolders, setCustomFolders] = useState<ChatFolder[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_folders`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [];
  });
  const [activeFolderId, setActiveFolderId] = useState<string>('all');

  // Tasks & Schedules
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [];
  });

  const [schedules, setSchedules] = useState<ScheduleEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_schedules`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [];
  });

  // Communities
  const [communities, setCommunities] = useState<Community[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_communities`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [];
  });

  // Status Stories
  const [statuses, setStatuses] = useState<StatusStory[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_statuses`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [];
  });

  // Calls
  const [callRecords, setCallRecords] = useState<CallRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_calls`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
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

  // Persist state changes safely
  useEffect(() => {
    try {
      localStorage.setItem('nyarios_user', JSON.stringify(currentUser));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_chats`, JSON.stringify(chats));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_messages`, JSON.stringify(messages));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_folders`, JSON.stringify(customFolders));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [customFolders]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_schedules`, JSON.stringify(schedules));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [schedules]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_communities`, JSON.stringify(communities));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [communities]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_statuses`, JSON.stringify(statuses));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [statuses]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_calls`, JSON.stringify(callRecords));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [callRecords]);

  const [incomingCall, setIncomingCall] = useState<IncomingCallSignal | null>(null);

  // Real-time Cloud Synchronization Listener
  useEffect(() => {
    if (!currentUser?.phone || !isLoggedIn) return;
    registerUserOnCloud(currentUser);

    const unsubscribe = subscribeToCloudEvents(currentUser.phone, {
      onMessage: (payload) => {
        const timeStr = new Date(payload.timestamp).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });

        setChats((prevChats) => {
          const existing = prevChats.find(
            (c) => normalizePhoneNumber(c.phone || '') === normalizePhoneNumber(payload.senderPhone)
          );
          const chatId = existing ? existing.id : `chat_${Date.now()}`;

          const incomingMsg: Message = {
            ...payload.message,
            id: `msg_cloud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            chatId,
            senderId: payload.senderId,
            senderName: payload.senderName,
            senderAvatar: payload.senderAvatar,
            isOutgoing: false,
            timestamp: timeStr,
            rawTimestamp: payload.timestamp,
          };

          setMessages((prevMsgs) => ({
            ...prevMsgs,
            [chatId]: [...(prevMsgs[chatId] || []), incomingMsg],
          }));

          if (existing) {
            return prevChats.map((c) =>
              c.id === existing.id
                ? {
                    ...c,
                    unreadCount: activeChatId === existing.id ? 0 : c.unreadCount + 1,
                    lastMessage: {
                      text: payload.message.content || 'Pesan baru',
                      timestamp: timeStr,
                      rawTimestamp: payload.timestamp,
                      senderName: payload.senderName,
                      type: payload.message.type,
                    },
                  }
                : c
            );
          } else {
            const newChat: Chat = {
              id: chatId,
              isGroup: false,
              name: payload.senderName,
              phone: payload.senderPhone,
              avatar: payload.senderAvatar,
              bio: 'Kontak NYARIOS Terhubung',
              unreadCount: activeChatId === chatId ? 0 : 1,
              isPinned: false,
              isMuted: false,
              isArchived: false,
              folderIds: [],
              lastMessage: {
                text: payload.message.content || 'Pesan baru',
                timestamp: timeStr,
                rawTimestamp: payload.timestamp,
                senderName: payload.senderName,
                type: payload.message.type,
              },
            };
            return [newChat, ...prevChats];
          }
        });

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
      onUserPresence: () => {
        // Presence updated
      },
    });

    return () => unsubscribe();
  }, [currentUser?.phone, isLoggedIn, activeChatId]);

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

  const loginWithPhone = (phone: string, name?: string) => {
    const normalized = normalizePhoneNumber(phone);
    const digits = normalized.replace(/\D/g, '');
    const newUser: CurrentUserData = {
      id: `user_${digits}`,
      name: name?.trim() || 'Pengguna NYARIOS',
      bio: 'Menggunakan NYARIOS',
      avatar: '',
      phone: normalized,
    };

    setCurrentUser(newUser);
    registerUserOnCloud(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('nyarios_is_logged_in', 'true');
    localStorage.setItem('nyarios_user', JSON.stringify(newUser));
  };

  const loginWithGoogle = (email: string, name: string, avatar?: string) => {
    const cleanId = `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const newUser: CurrentUserData = {
      id: cleanId,
      name: name.trim() || 'Pengguna Google',
      bio: email,
      avatar: avatar || '',
      phone: '+62 812-0000-0000',
      email,
    };
    setCurrentUser(newUser);
    registerUserOnCloud(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('nyarios_is_logged_in', 'true');
    localStorage.setItem('nyarios_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('nyarios_is_logged_in', 'false');
    localStorage.removeItem('nyarios_user');
    setCurrentUser({
      id: '',
      name: '',
      bio: '',
      avatar: '',
      phone: '',
    });
    setChats([]);
    setMessages({});
    setActiveChatId(null);
  };

  const updateUserProfile = (name: string, bio: string, avatar?: string) => {
    setCurrentUser(prev => ({ ...prev, name, bio, avatar: avatar ?? prev.avatar }));
  };

  const activeChat = useMemo(() => {
    return chats.find(c => c.id === activeChatId) || null;
  }, [chats, activeChatId]);

  const currentChatMessages = useMemo(() => {
    if (!activeChatId) return [];
    return messages[activeChatId] || [];
  }, [messages, activeChatId]);

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
      sendMessage(newChatId, initialMessage.trim());
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
      groupDescription: description || `Grup ${name}`,
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
  const sendMessage = (chatId: string, content: string, type: MessageType = 'text', extra: Partial<Message> = {}) => {
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
    if (targetChat && targetChat.phone && !targetChat.isGroup) {
      sendCloudRealtimeMessage(currentUser, targetChat.phone, newMsg);
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
      id: `status_${rawNow}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      type,
      content,
      caption,
      bgColor: bgColor || '#059669',
      timestamp: 'Baru saja',
      rawTimestamp: rawNow,
      viewers: [],
    };
    setStatuses(prev => [newStatus, ...prev]);
  };

  const deleteStatus = (statusId: string) => {
    setStatuses(prev => prev.filter(s => s.id !== statusId));
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

    const phoneToCall = contactPhone || activeChat?.phone;
    if (phoneToCall) {
      sendCloudCallSignal(currentUser, phoneToCall, type);
    }
  };

  const acceptIncomingCall = () => {
    if (!incomingCall) return;
    respondToCloudCallSignal(incomingCall.callerPhone, incomingCall.callId, 'accepted');
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
    respondToCloudCallSignal(incomingCall.callerPhone, incomingCall.callId, 'declined');
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

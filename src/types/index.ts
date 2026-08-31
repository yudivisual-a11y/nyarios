export type MessageType = 
  | 'text' 
  | 'image' 
  | 'video' 
  | 'document' 
  | 'audio' 
  | 'voice_note' 
  | 'quick_ask' 
  | 'poll'
  | 'task_card'
  | 'schedule_card'
  | 'system';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // user names or 'Saya'
}

export interface QuickAskVote {
  userId: string;
  userName: string;
  choice: 'can_attend' | 'cannot_attend' | 'undecided';
}

export interface QuickAskData {
  question: string;
  votes: {
    can_attend: string[]; // user names
    cannot_attend: string[];
    undecided: string[];
  };
}

export interface PollOption {
  id: string;
  text: string;
  voterNames: string[];
}

export interface PollData {
  id: string;
  question: string;
  options: PollOption[];
  isMultiChoice: boolean;
  isAnonymous: boolean;
  deadline?: string;
  isClosed: boolean;
  createdBy: string;
}

export interface TaskItem {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  sourceMessageId?: string;
  chatId?: string;
  chatTitle?: string;
  createdAt: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  reminder: string;
  location?: string;
  notes?: string;
  sourceMessageId?: string;
  chatId?: string;
  chatTitle?: string;
  createdAt: string;
}

export interface AttachmentFile {
  name: string;
  size: number; // in bytes
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  mimeType?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  isOutgoing: boolean;
  type: MessageType;
  content: string;
  timestamp: string; // ISO string or human readable
  rawTimestamp: number;
  status: MessageStatus;
  isPinned?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
    type: MessageType;
  };
  forwardedFrom?: string;
  reactions: Reaction[];
  attachment?: AttachmentFile;
  voiceNoteDuration?: number; // in seconds
  audioDuration?: string;
  audioUrl?: string;
  caption?: string;
  fileName?: string;
  fileSize?: string;
  quickAsk?: QuickAskData;
  poll?: PollData;
  taskData?: TaskItem;
  scheduleData?: ScheduleEvent;
  savedCategory?: 'Penting' | 'Ide' | 'Jadwal' | 'Dokumen' | 'Tugas';
}

export interface Chat {
  id: string;
  isGroup: boolean;
  name: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  members?: string[];
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isBlocked?: boolean;
  folderIds: string[];
  lastMessage?: {
    text: string;
    timestamp: string;
    rawTimestamp: number;
    senderName?: string;
    type: MessageType;
  };
  communityId?: string;
  groupCategory?: 'Informasi' | 'Diskusi' | 'Kegiatan' | 'Umum';
  groupDescription?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  coverColor?: string;
  announcement?: string;
  subGroupIds: string[];
  memberCount: number;
  createdAt: string;
}

export interface StatusStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'text' | 'image' | 'video';
  content: string; // text content, image url, or video url
  caption?: string;
  bgColor?: string;
  timestamp: string;
  rawTimestamp: number;
  viewers: string[];
}

export interface CallRecord {
  id: string;
  contactName: string;
  contactAvatar?: string;
  contactPhone?: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  duration?: string; // e.g. "04:12"
  timestamp: string;
  rawTimestamp: number;
}

export interface ActiveCallState {
  isActive: boolean;
  contactName: string;
  contactAvatar?: string;
  type: 'voice' | 'video';
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
  isScreenSharing: boolean;
  durationSeconds: number;
}

export interface ChatFolder {
  id: string;
  name: string;
  icon?: string;
  chatIds: string[];
  isCustom?: boolean;
}

export interface VideoComment {
  id: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface VideoPost {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorHandle: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl?: string;
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  sharesCount: number;
  timestamp: string;
  tags: string[];
  audioTitle?: string;
  commentsList?: VideoComment[];
}

export type MainNavTab = 'pesan' | 'video' | 'status' | 'komunitas' | 'panggilan' | 'saya';
export type DesktopSubTab = 'tersimpan' | 'aktivitas' | 'jadwal' | 'file_center' | 'pengaturan';

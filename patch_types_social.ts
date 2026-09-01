import fs from 'fs';
let content = fs.readFileSync('src/types/index.ts', 'utf8');

const socialTypes = `
// ==========================================
// SOCIAL CONTENT TYPES
// ==========================================

export type SocialMediaType = 'image' | 'video';

export interface SocialMedia {
  id: string;
  postId: string;
  type: SocialMediaType;
  url: string;
  blob?: Blob;
  thumbnailUrl?: string;
  duration?: number;
  order: number;
}

export interface SocialPost {
  id: string;
  ownerId: string;
  caption: string;
  privacy: 'public' | 'contacts' | 'private';
  createdAt: number;
  updatedAt: number;
  views: number;
  // Denormalized counts for quick rendering
  likesCount: number;
  commentsCount: number;
  media?: SocialMedia[];
}

export interface SocialLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: number;
}

export interface SocialComment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: number;
}

export interface SocialFollow {
  followerId: string;
  followingId: string;
  createdAt: number;
}

export interface SocialSaved {
  userId: string;
  postId: string;
  createdAt: number;
}

export interface SocialNotification {
  id: string;
  recipientId: string;
  senderId: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION';
  postId?: string;
  createdAt: number;
  read: boolean;
}
`;

// Add explore and notifications to MainNavTab
content = content.replace("export type MainNavTab = 'pesan' | 'kontak' | 'konten' | 'komunitas' | 'panggilan' | 'saya';",
"export type MainNavTab = 'pesan' | 'kontak' | 'konten' | 'komunitas' | 'panggilan' | 'saya' | 'explore' | 'notifications';");

fs.writeFileSync('src/types/index.ts', content + socialTypes);

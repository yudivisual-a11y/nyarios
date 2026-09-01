import fs from 'fs';
const content = fs.readFileSync('src/types/index.ts', 'utf8');

// Add ContentPost interface
const contentPostInterface = `
export interface ContentPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userUsername?: string;
  videoUrl: string; // The URL/base64/blob URL
  thumbnailUrl?: string;
  title: string;
  description: string;
  privacy: 'public' | 'contacts' | 'private';
  likes: string[]; // array of userIds
  comments: ContentComment[];
  views: number;
  duration?: string;
  timestamp: string;
  rawTimestamp: number;
}

export interface ContentComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
}
`;

const updatedContent1 = content.replace('export interface CallRecord', contentPostInterface + '\nexport interface CallRecord');

// Update MainNavTab
const updatedContent2 = updatedContent1.replace("'pesan' | 'kontak' | 'status'", "'pesan' | 'kontak' | 'konten' | 'status'");

fs.writeFileSync('src/types/index.ts', updatedContent2);

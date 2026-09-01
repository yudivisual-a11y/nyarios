import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { 
  SocialPost, SocialMedia, SocialLike, SocialComment, 
  SocialFollow, SocialSaved, SocialNotification 
} from '../types';

interface NyariosSocialDB extends DBSchema {
  posts: {
    key: string;
    value: SocialPost;
    indexes: { 'by-owner': string; 'by-created': number };
  };
  media: {
    key: string;
    value: SocialMedia;
    indexes: { 'by-post': string };
  };
  likes: {
    key: string;
    value: SocialLike;
    indexes: { 'by-post': string; 'by-user': string };
  };
  comments: {
    key: string;
    value: SocialComment;
    indexes: { 'by-post': string };
  };
  follows: {
    key: string; // "followerId_followingId"
    value: SocialFollow;
    indexes: { 'by-follower': string; 'by-following': string };
  };
  saved: {
    key: string; // "userId_postId"
    value: SocialSaved;
    indexes: { 'by-user': string };
  };
  notifications: {
    key: string;
    value: SocialNotification;
    indexes: { 'by-recipient': string };
  };
}

let dbPromise: Promise<IDBPDatabase<NyariosSocialDB>>;

export function getSocialDb() {
  if (!dbPromise) {
    dbPromise = openDB<NyariosSocialDB>('nyarios_social_v1', 1, {
      upgrade(db) {
        const postStore = db.createObjectStore('posts', { keyPath: 'id' });
        postStore.createIndex('by-owner', 'ownerId');
        postStore.createIndex('by-created', 'createdAt');

        const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
        mediaStore.createIndex('by-post', 'postId');

        const likeStore = db.createObjectStore('likes', { keyPath: 'id' });
        likeStore.createIndex('by-post', 'postId');
        likeStore.createIndex('by-user', 'userId');

        const commentStore = db.createObjectStore('comments', { keyPath: 'id' });
        commentStore.createIndex('by-post', 'postId');

        const followStore = db.createObjectStore('follows', { keyPath: 'key' });
        followStore.createIndex('by-follower', 'followerId');
        followStore.createIndex('by-following', 'followingId');

        const savedStore = db.createObjectStore('saved', { keyPath: 'key' });
        savedStore.createIndex('by-user', 'userId');

        const notifStore = db.createObjectStore('notifications', { keyPath: 'id' });
        notifStore.createIndex('by-recipient', 'recipientId');
      },
    });
  }
  return dbPromise;
}

// POSTS
export async function saveSocialPost(post: SocialPost, media: SocialMedia[]) {
  const db = await getSocialDb();
  const tx = db.transaction(['posts', 'media'], 'readwrite');
  await tx.objectStore('posts').put(post);
  for (const m of media) {
    await tx.objectStore('media').put(m);
  }
  await tx.done;
}

export async function getSocialPost(id: string): Promise<{ post: SocialPost, media: SocialMedia[] } | null> {
  const db = await getSocialDb();
  const post = await db.get('posts', id);
  if (!post) return null;
  const media = await db.getAllFromIndex('media', 'by-post', id);
  media.sort((a, b) => a.order - b.order);
  return { post, media };
}

export async function getFeedPosts(limit = 20): Promise<{ post: SocialPost, media: SocialMedia[] }[]> {
  const db = await getSocialDb();
  const tx = db.transaction(['posts', 'media'], 'readonly');
  
  // Quick hack for latest first without cursor for now, grabbing all and sorting (in production, use cursor)
  let allPosts = await tx.objectStore('posts').getAll();
  allPosts = allPosts.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  
  const results = [];
  for (const p of allPosts) {
    const media = await tx.objectStore('media').index('by-post').getAll(p.id);
    media.sort((a, b) => a.order - b.order);
    results.push({ post: p, media });
  }
  return results;
}

export async function getUserPosts(userId: string): Promise<{ post: SocialPost, media: SocialMedia[] }[]> {
  const db = await getSocialDb();
  const tx = db.transaction(['posts', 'media'], 'readonly');
  let posts = await tx.objectStore('posts').index('by-owner').getAll(userId);
  posts = posts.sort((a, b) => b.createdAt - a.createdAt);
  
  const results = [];
  for (const p of posts) {
    const media = await tx.objectStore('media').index('by-post').getAll(p.id);
    media.sort((a, b) => a.order - b.order);
    results.push({ post: p, media });
  }
  return results;
}

// LIKES
export async function toggleLikePost(postId: string, userId: string): Promise<boolean> {
  const db = await getSocialDb();
  const id = `${postId}_${userId}`;
  const existing = await db.get('likes', id);
  const tx = db.transaction(['likes', 'posts'], 'readwrite');
  const postStore = tx.objectStore('posts');
  const post = await postStore.get(postId);
  
  let isLiked = false;
  if (existing) {
    await tx.objectStore('likes').delete(id);
    if (post) {
      post.likesCount = Math.max(0, post.likesCount - 1);
      await postStore.put(post);
    }
  } else {
    await tx.objectStore('likes').put({ id, postId, userId, createdAt: Date.now() });
    isLiked = true;
    if (post) {
      post.likesCount += 1;
      await postStore.put(post);
    }
  }
  await tx.done;
  return isLiked;
}

export async function getPostLikes(postId: string) {
  const db = await getSocialDb();
  return db.getAllFromIndex('likes', 'by-post', postId);
}

// COMMENTS
export async function addComment(comment: SocialComment) {
  const db = await getSocialDb();
  const tx = db.transaction(['comments', 'posts'], 'readwrite');
  await tx.objectStore('comments').put(comment);
  const postStore = tx.objectStore('posts');
  const post = await postStore.get(comment.postId);
  if (post) {
    post.commentsCount += 1;
    await postStore.put(post);
  }
  await tx.done;
}

export async function getPostComments(postId: string) {
  const db = await getSocialDb();
  const comments = await db.getAllFromIndex('comments', 'by-post', postId);
  return comments.sort((a, b) => a.createdAt - b.createdAt);
}

// FOLLOWS
export async function toggleFollow(followerId: string, followingId: string): Promise<boolean> {
  const db = await getSocialDb();
  const key = `${followerId}_${followingId}`;
  const existing = await db.get('follows', key as any);
  let isFollowing = false;
  if (existing) {
    await db.delete('follows', key as any);
  } else {
    await db.put('follows', { followerId, followingId, createdAt: Date.now(), key } as any);
    isFollowing = true;
  }
  return isFollowing;
}

export async function getFollowStats(userId: string) {
  const db = await getSocialDb();
  const followers = await db.getAllFromIndex('follows', 'by-following', userId);
  const following = await db.getAllFromIndex('follows', 'by-follower', userId);
  return { followersCount: followers.length, followingCount: following.length, followers, following };
}

// NOTIFICATIONS
export async function addNotification(notif: SocialNotification) {
  const db = await getSocialDb();
  await db.put('notifications', notif);
}

export async function getNotifications(userId: string) {
  const db = await getSocialDb();
  const notifs = await db.getAllFromIndex('notifications', 'by-recipient', userId);
  return notifs.sort((a, b) => b.createdAt - a.createdAt);
}

export async function markNotificationsRead(userId: string) {
  const db = await getSocialDb();
  const tx = db.transaction('notifications', 'readwrite');
  const store = tx.objectStore('notifications');
  const notifs = await store.index('by-recipient').getAll(userId);
  for (const n of notifs) {
    if (!n.read) {
      n.read = true;
      await store.put(n);
    }
  }
  await tx.done;
}


import fs from 'fs';
let content = fs.readFileSync('src/components/views/UserProfileModal.tsx', 'utf8');

// Replace imports
content = content.replace("import { ContentPost } from '../../types';", "import { SocialPost, SocialMedia } from '../../types';");
content = content.replace("import { getAllContentPosts, updateContentPost, deleteContentPost } from '../../utils/contentDb';", 
"import { getUserPosts } from '../../utils/socialDb';");
content = content.replace("import { broadcastDeleteContentPost, broadcastContentPost } from '../../utils/cloudSync';",
"import { broadcastSocialInteraction } from '../../utils/cloudSync';");

// States
content = content.replace("const [posts, setPosts] = useState<ContentPost[]>([]);", 
"const [posts, setPosts] = useState<{post: SocialPost, media: SocialMedia[]}[]>([]);");

// loadPosts
const loadStr = `const loadPosts = async () => {
    const data = await getAllContentPosts();
    setPosts(data);
  };`;
const newLoadStr = `const loadPosts = async () => {
    const data = await getUserPosts(userId);
    setPosts(data);
  };`;
content = content.replace(loadStr, newLoadStr);

// Resolve profile
content = content.replace("const userPost = posts.find(p => p.userId === userId);", "const userPost = posts.find(p => p.post.ownerId === userId);");
content = content.replace("profile.name = userPost.userName;", "profile.name = 'User';");
content = content.replace("profile.username = userPost.userUsername || '';", "profile.username = '';");
content = content.replace("profile.avatar = userPost.userAvatar || '';", "profile.avatar = '';");

// filters
const filterStr = `const userPosts = posts.filter(p => {
    if (p.userId !== userId) return false;
    if (!isMe && p.privacy !== 'public') return false; // Hide non-public from others
    return true;
  });

  const likedPosts = posts.filter(p => p.likes.includes(userId));`;

const newFilterStr = `const userPosts = posts.filter(p => {
    if (p.post.ownerId !== userId) return false;
    if (!isMe && p.post.privacy !== 'public') return false;
    return true;
  });

  const likedPosts = []; // Implementation for likes requires fetching liked posts`;
content = content.replace(filterStr, newFilterStr);

// Render posts
const renderStr = `const pUrl = (post.videoBlob && (!post.videoUrl || post.videoUrl.startsWith('blob:'))) ? URL.createObjectURL(post.videoBlob as any) : post.videoUrl;`;
const newRenderStr = `const pUrl = p.media.length > 0 && p.media[0].blob ? URL.createObjectURL(p.media[0].blob as any) : (p.media[0]?.url || '');\nconst post = p.post;`;
content = content.replace(renderStr, newRenderStr);

content = content.replace(/displayPosts\.map\(post =>/g, "displayPosts.map(p =>");

// Handle delete
content = content.replace("await deleteContentPost(postId);", "// await deleteSocialPost(postId);");
content = content.replace("broadcastDeleteContentPost(currentUser, postId);", "// broadcastDelete");

fs.writeFileSync('src/components/views/UserProfileModal.tsx', content);

import React, { useState, useEffect } from 'react';
import { X, PlaySquare, Settings, Edit3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SocialPost, SocialMedia } from '../../types';
import { getUserPosts } from '../../utils/socialDb';
import { broadcastSocialInteraction } from '../../utils/cloudSync';
import { ProfileSettingsView } from './ProfileSettingsView'; // We can use it as a subview

interface Props {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<Props> = ({ userId, isOpen, onClose }) => {
  const { currentUser, contacts} = useApp();
  const [posts, setPosts] = useState<{post: SocialPost, media: SocialMedia[]}[]>([]);
  const [activeTab, setActiveTab] = useState<'konten' | 'disukai' | 'tersimpan'>('konten');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPosts();
      setIsEditingProfile(false);
      setActiveTab('konten');
    }
  }, [isOpen, userId]);

  const loadPosts = async () => {
    const data = await getUserPosts(userId);
    setPosts(data);
  };

  if (!isOpen) return null;

  const isMe = userId === currentUser.id;

  // Resolve user profile data
  let profile = {
    id: userId,
    name: 'Pengguna NYARIOS',
    username: '',
    avatar: '',
    bio: 'Saya menggunakan NYARIOS',
  };

  if (isMe) {
    profile = {
      id: currentUser.id,
      name: currentUser.name,
      username: currentUser.username || `@${currentUser.name.toLowerCase().replace(/\\s+/g, '_')}`,
      avatar: currentUser.avatar || '',
      bio: currentUser.bio || 'Ada di NYARIOS',
    };
  } else {
    // Try to find in contacts
    const contact = contacts.find(c => c.id === userId);
    if (contact) {
      profile.name = contact.name;
      profile.username = contact.username || '';
      profile.avatar = contact.avatar || '';
      profile.bio = contact.bio || '';
    } else {
      // Try cloud directory
      // Fallback to checking the posts
      const userPost = posts.find(p => p.post.ownerId === userId);
      if (userPost) {
        profile.name = 'User';
        profile.username = '';
        profile.avatar = '';
      }
    }
  }

  const userPosts = posts.filter(p => {
    if (p.post.ownerId !== userId) return false;
    if (!isMe && p.post.privacy !== 'public') return false;
    return true;
  });

  const likedPosts: {post: import('../../types').SocialPost, media: import('../../types').SocialMedia[]}[] = [];
  // In a real app we'd have a saved posts list, but here we mock it or skip it for now.

  const displayPosts = activeTab === 'konten' ? userPosts : (activeTab === 'disukai' ? likedPosts : []);

  if (isEditingProfile) {
    return (
      <div className="fixed inset-0 z-[60] bg-white dark:bg-[#0B141A] flex flex-col">
         <div className="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-800">
           <button onClick={() => setIsEditingProfile(false)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800"><X className="w-5 h-5 text-slate-800 dark:text-slate-100" /></button>
           <h2 className="font-bold text-slate-800 dark:text-slate-100">Edit Profil</h2>
         </div>
         <div className="flex-1 overflow-y-auto">
            <ProfileSettingsView />
         </div>
      </div>
    );
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Hapus video ini?')) return;
    // await deleteSocialPost(postId);
    // broadcastDelete
    setPosts(posts.filter(p => p.post.id !== postId));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#F8FAFC] dark:bg-[#0B141A] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111B21]">
        <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">{isMe ? 'Profil Saya' : 'Profil Pengguna'}</h2>
        <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
          <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-10 max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center md:items-start">
           <div className="w-32 h-32 shrink-0">
             <img src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&size=128&background=10B981&color=fff`} className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white dark:border-slate-800" />
           </div>
           
           <div className="flex-1 text-center md:text-left flex flex-col h-full justify-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{profile.name}</h1>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-3">{profile.username}</p>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto md:mx-0 mb-4">{profile.bio}</p>
              
              <div className="flex items-center gap-6 justify-center md:justify-start mb-6">
                 <div className="text-center">
                   <p className="text-xl font-bold text-slate-900 dark:text-white">{userPosts.length}</p>
                   <p className="text-xs text-slate-500">Konten</p>
                 </div>
                 <div className="text-center">
                   <p className="text-xl font-bold text-slate-900 dark:text-white">124</p>
                   <p className="text-xs text-slate-500">Pengikut</p>
                 </div>
                 <div className="text-center">
                   <p className="text-xl font-bold text-slate-900 dark:text-white">89</p>
                   <p className="text-xs text-slate-500">Mengikuti</p>
                 </div>
              </div>

              {isMe && (
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="px-6 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg font-medium transition self-center md:self-start flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profil
                </button>
              )}
           </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-4">
           <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
              <button 
                onClick={() => setActiveTab('konten')}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition ${activeTab === 'konten' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                KONTEN ({userPosts.length})
              </button>
              {isMe && (
                <>
                  <button 
                    onClick={() => setActiveTab('disukai')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition ${activeTab === 'disukai' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    DISUKAI
                  </button>
                  <button 
                    onClick={() => setActiveTab('tersimpan')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition ${activeTab === 'tersimpan' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    TERSIMPAN
                  </button>
                </>
              )}
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
              {displayPosts.map(p => {
                 const pUrl = p.media.length > 0 && p.media[0].blob ? URL.createObjectURL(p.media[0].blob as any) : (p.media[0]?.url || '');
const post = p.post;
                 return (
                  <div key={p.post.id} className="group relative aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-sm">
                    <video 
                      src={pUrl} 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-300"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 pointer-events-none">
                      <p className="text-white font-semibold text-sm line-clamp-2 leading-snug">{post.caption}</p>
                      <p className="text-white/80 text-xs mt-1">{post.views || 0} views</p>
                    </div>
                    
                    {isMe && (
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                         <button onClick={() => handleDelete(post.id)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                 );
              })}
              {displayPosts.length === 0 && (
                 <div className="col-span-full py-20 text-center">
                    <PlaySquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Belum ada konten di sini.</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

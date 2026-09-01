import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Film, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SocialPost, SocialMedia } from '../../types';
import { saveSocialPost } from '../../utils/socialDb';
import { broadcastSocialPost } from '../../utils/cloudSync';

export const UploadPostModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentUser } = useApp();
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'contacts' | 'private'>('public');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: 'image'|'video' }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(f => ({
        url: URL.createObjectURL(f),
        type: (f.type.startsWith('video') ? 'video' : 'image') as 'video' | 'image'
      }));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleShare = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    try {
      const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      
      const post: SocialPost = {
        id: postId,
        ownerId: currentUser.id,
        caption,
        privacy,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        views: 0,
        likesCount: 0,
        commentsCount: 0
      };

      const media: SocialMedia[] = files.map((f, i) => ({
        id: `media_${postId}_${i}`,
        postId,
        type: f.type.startsWith('video') ? 'video' : 'image',
        url: '', // We rely on blob for now
        blob: f,
        order: i
      }));

      await saveSocialPost(post, media);
      if (privacy === 'public' || privacy === 'contacts') {
        broadcastSocialPost(post, media);
      }

      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4">
       <div className="bg-white dark:bg-[#111B21] rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
             <button onClick={onClose} className="p-2 text-slate-800 dark:text-white"><X className="w-6 h-6" /></button>
             <h2 className="font-bold text-slate-900 dark:text-white">Buat Postingan Baru</h2>
             <button 
               onClick={handleShare}
               disabled={isUploading || files.length === 0}
               className="text-emerald-500 font-bold px-4 hover:text-emerald-600 transition disabled:opacity-50"
             >
               {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Bagikan'}
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-6">
             {/* Left: Media Area */}
             <div className="flex-1 bg-slate-100 dark:bg-black rounded-xl min-h-[300px] flex items-center justify-center relative overflow-hidden">
                {previews.length > 0 ? (
                  <div className="w-full h-full relative group">
                     {/* Just show the first one for simplicity in this mockup, or a grid */}
                     <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1">
                        {previews.map((p, i) => (
                           <div key={i} className="relative aspect-square bg-slate-800 rounded overflow-hidden">
                              {p.type === 'video' ? (
                                <video src={p.url} className="w-full h-full object-cover" />
                              ) : (
                                <img src={p.url} className="w-full h-full object-cover" />
                              )}
                              <button onClick={() => handleRemove(i)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full">
                                 <X className="w-4 h-4" />
                              </button>
                           </div>
                        ))}
                     </div>
                     <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-4 right-4 p-3 bg-white/80 dark:bg-black/80 rounded-full shadow-lg backdrop-blur-sm">
                        <ImageIcon className="w-5 h-5 text-slate-800 dark:text-white" />
                     </button>
                  </div>
                ) : (
                  <div className="text-center p-6">
                     <div className="flex justify-center gap-4 mb-4">
                        <ImageIcon className="w-12 h-12 text-slate-400" />
                        <Film className="w-12 h-12 text-slate-400" />
                     </div>
                     <p className="text-slate-600 dark:text-slate-400 mb-6">Tarik foto dan video ke sini</p>
                     <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600">
                        Pilih dari Komputer
                     </button>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple 
                  accept="image/*,video/*" 
                  className="hidden" 
                />
             </div>

             {/* Right: Caption & Settings */}
             <div className="w-full md:w-80 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                   <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=10B981&color=fff`} className="w-8 h-8 rounded-full" />
                   <span className="font-bold text-slate-900 dark:text-white">{currentUser.name}</span>
                </div>
                <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tulis keterangan..."
                  className="w-full bg-transparent border-none focus:ring-0 resize-none text-slate-800 dark:text-white placeholder:text-slate-400 h-32"
                />
                <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-auto">
                   <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Privasi</p>
                   <select 
                     value={privacy}
                     onChange={(e) => setPrivacy(e.target.value as any)}
                     className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg p-2 border-none focus:ring-2 focus:ring-emerald-500"
                   >
                      <option value="public">Publik (Semua orang)</option>
                      <option value="contacts">Hanya Kontak</option>
                      <option value="private">Hanya Saya</option>
                   </select>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

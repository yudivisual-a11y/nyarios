import React, { useState, useRef } from 'react';
import { X, UploadCloud, Film } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ContentPost } from '../../types';
import { saveContentPost } from '../../utils/contentDb';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (post: ContentPost) => void;
}

export const UploadVideoModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'contacts' | 'private'>('public');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    if (!selected.type.startsWith('video/')) {
      setError('Format tidak didukung. Harap pilih file video (MP4, MOV, WEBM).');
      return;
    }
    
    setFile(selected);
    setError('');
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Pilih video terlebih dahulu.');
      return;
    }
    if (!title.trim()) {
      setError('Judul video harus diisi.');
      return;
    }

    setIsUploading(true);
    
    try {
      const now = Date.now();
      const newPost: ContentPost = {
        id: `content_${now}_${Math.random().toString(36).substring(2, 7)}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        userUsername: currentUser.username,
        videoUrl: previewUrl || '',
        videoBlob: file, // Store the blob for IndexedDB persistence
        title: title.trim(),
        description: description.trim(),
        privacy,
        likes: [],
        comments: [],
        views: 0,
        timestamp: new Date(now).toISOString(),
        rawTimestamp: now,
      };

      await saveContentPost(newPost);
      onSuccess(newPost);
      handleClose();
    } catch (err) {
      setError('Gagal mengupload video. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setPrivacy('public');
    setError('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-[#111B21] w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Upload Video</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
            >
              <UploadCloud className="w-12 h-12 text-emerald-500 mb-3" />
              <p className="text-slate-700 dark:text-slate-300 font-medium">Tarik video ke sini atau klik untuk memilih</p>
              <p className="text-slate-500 text-sm mt-1">MP4, MOV, WEBM didukung</p>
            </div>
          ) : (
            <div className="mb-4 rounded-xl overflow-hidden bg-black relative">
              <video src={previewUrl!} controls className="w-full max-h-48 object-contain" />
              <button 
                onClick={() => {
                  setFile(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="video/mp4,video/quicktime,video/webm" 
            className="hidden" 
          />

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Judul Video</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Masukkan judul..."
                className="w-full px-4 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ceritakan tentang video ini..."
                rows={3}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Privasi</label>
              <select 
                value={privacy}
                onChange={e => setPrivacy(e.target.value as any)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="public">Semua orang</option>
                <option value="contacts">Kontak saya</option>
                <option value="private">Hanya saya</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button 
            onClick={handleClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Batal
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium rounded-lg flex items-center gap-2"
          >
            {isUploading ? 'Memproses...' : 'Publikasikan'}
          </button>
        </div>
      </div>
    </div>
  );
};

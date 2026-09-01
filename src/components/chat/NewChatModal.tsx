import React, { useState } from 'react';
import { User, AtSign, MessageSquare, Send } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const { createDirectChatWithUsername } = useApp();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.replace(/^@+/, '').trim().toLowerCase();
    if (!cleanUser && !name.trim()) {
      setError('Username atau nama kontak wajib diisi.');
      return;
    }

    const finalUser = cleanUser ? `@${cleanUser}` : `@${name.trim().toLowerCase().replace(/\s+/g, '_')}`;
    const displayName = name.trim() || cleanUser;

    createDirectChatWithUsername(finalUser, displayName, initialMessage.trim());
    setUsername('');
    setName('');
    setInitialMessage('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mulai Chat Baru"
      subtitle="Mulai percakapan langsung via @username teman"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Username Teman (@) <span className="text-emerald-600 font-semibold">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">@</span>
            <input
              type="text"
              value={username.replace(/^@+/, '')}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''));
                if (error) setError('');
              }}
              placeholder="username_teman"
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Nama Tampilan (Opsional)
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ahmad Fauzi"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Pesan Pembuka (Opsional)
          </label>
          <div className="relative">
            <MessageSquare className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Halo, salam kenal..."
              rows={2}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" size="sm" onClick={onClose} type="button">
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            leftIcon={<Send className="w-4 h-4" />}
          >
            Mulai Obrolan
          </Button>
        </div>
      </form>
    </Modal>
  );
};

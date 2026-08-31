import React, { useState } from 'react';
import { Users, Tag, AlignLeft, Plus, X, UserCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({ isOpen, onClose }) => {
  const { createGroupChat } = useApp();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Informasi' | 'Diskusi' | 'Kegiatan' | 'Umum'>('Umum');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleAddMember = () => {
    if (memberInput.trim() && !members.includes(memberInput.trim())) {
      setMembers([...members, memberInput.trim()]);
      setMemberInput('');
    }
  };

  const handleRemoveMember = (name: string) => {
    setMembers(members.filter((m) => m !== name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Nama grup wajib diisi.');
      return;
    }

    createGroupChat(groupName.trim(), members, category, description.trim());
    setGroupName('');
    setDescription('');
    setCategory('Umum');
    setMembers([]);
    setMemberInput('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Grup Baru"
      subtitle="Organisasikan diskusi terstruktur bersama tim atau keluarga"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Nama Grup <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Contoh: Panitia Acara Nyarios"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Kategori Grup
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {(['Umum', 'Informasi', 'Diskusi', 'Kegiatan'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  category === cat
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-[#00A884] text-[#00A884] shadow-sm'
                    : 'bg-slate-50 dark:bg-[#202C33] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Deskripsi Singkat (Opsional)
          </label>
          <div className="relative">
            <AlignLeft className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan tujuan grup ini..."
              rows={2}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A884] resize-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Tambah Anggota
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
              placeholder="Ketik nama anggota & tekan enter..."
              className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddMember}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Tambah
            </Button>
          </div>

          {/* Member chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-semibold">
              <UserCheck className="w-3 h-3" /> Saya (Pemilik)
            </span>
            {members.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                <span>{m}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(m)}
                  className="hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" type="submit" leftIcon={<Users className="w-4 h-4" />}>
            Buat Grup
          </Button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { FolderPlus, Trash2, Check, Folder } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';

interface FolderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FolderManagerModal: React.FC<FolderManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { chats, customFolders, createCustomFolder, deleteCustomFolder } = useApp();

  const [newFolderName, setNewFolderName] = useState('');
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const samplePresets = ['Keluarga', 'Teman', 'Sekolah', 'Kerja', 'Organisasi'];

  const toggleSelectChat = (id: string) => {
    if (selectedChatIds.includes(id)) {
      setSelectedChatIds(selectedChatIds.filter((cId) => cId !== id));
    } else {
      setSelectedChatIds([...selectedChatIds, id]);
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      setError('Nama folder wajib diisi.');
      return;
    }

    createCustomFolder(newFolderName.trim(), selectedChatIds);
    setNewFolderName('');
    setSelectedChatIds([]);
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Folder Chat"
      subtitle="Organisasikan daftar chat ke dalam folder pilihan kamu"
    >
      <div className="space-y-4">
        {/* Existing Custom Folders */}
        {customFolders.length > 0 && (
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Folder Kamu
            </span>
            <div className="space-y-1.5">
              {customFolders.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#202C33] border border-slate-200/70 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[#00A884]" />
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {f.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({f.chatIds.length} chat)
                    </span>
                  </div>
                  <button
                    onClick={() => deleteCustomFolder(f.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Folder Form */}
        <form onSubmit={handleCreateFolder} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Buat Folder Baru
          </span>

          {error && (
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 text-xs">{error}</div>
          )}

          <div className="relative">
            <FolderPlus className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => {
                setNewFolderName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Nama folder (misal: Kerja, Keluarga)"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
            />
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5">
            {samplePresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setNewFolderName(preset)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-medium"
              >
                + {preset}
              </button>
            ))}
          </div>

          {/* Chat checklist */}
          {chats.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Pilih Chat untuk dimasukkan ({selectedChatIds.length} dipilih):
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {chats.map((c) => {
                  const isChecked = selectedChatIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => toggleSelectChat(c.id)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#00A884] text-[#00A884] font-semibold'
                          : 'bg-slate-50 dark:bg-[#202C33] border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked ? 'bg-[#00A884] border-[#00A884] text-white' : 'border-slate-400'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Tutup
            </Button>
            <Button variant="primary" type="submit" leftIcon={<FolderPlus className="w-4 h-4" />}>
              Simpan Folder
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

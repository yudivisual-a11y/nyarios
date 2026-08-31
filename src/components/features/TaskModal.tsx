import React, { useState, useEffect } from 'react';
import { CheckSquare, User, Calendar, FileText, Tag } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { Message } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceMessage?: Message | null;
  prefillTitle?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  sourceMessage,
  prefillTitle,
}) => {
  const { createTask, activeChat } = useApp();

  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('Saya');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');

  useEffect(() => {
    if (sourceMessage) {
      setTitle(sourceMessage.content.slice(0, 80));
      setNotes(`Dibuat dari pesan ${sourceMessage.senderName}: "${sourceMessage.content}"`);
      setAssignee(sourceMessage.isOutgoing ? 'Saya' : sourceMessage.senderName);
    } else if (prefillTitle) {
      setTitle(prefillTitle);
    }
  }, [sourceMessage, prefillTitle, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask({
      title: title.trim(),
      assignee: assignee.trim() || 'Saya',
      deadline: deadline || 'Hari ini',
      notes: notes.trim(),
      priority,
      status,
      sourceMessageId: sourceMessage?.id,
      chatId: activeChat?.id,
      chatTitle: activeChat?.name,
    });

    setTitle('');
    setNotes('');
    setDeadline('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Jadikan Tugas"
      subtitle="Ubah informasi pesan menjadi tugas terstruktur untuk Aktivitas"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Judul Tugas <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <CheckSquare className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Siapkan materi presentasi"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
              autoFocus
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Penanggung Jawab (PJ)
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Nama PJ"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Tenggat Waktu (Deadline)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="Contoh: Besok, 17:00"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Prioritas
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
            >
              <option value="low">Rendah</option>
              <option value="medium">Sedang (Normal)</option>
              <option value="high">Tinggi (Penting)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Status Awal
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'todo' | 'in_progress' | 'done')}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
            >
              <option value="todo">Belum Dimulai</option>
              <option value="in_progress">Sedang Dikerjakan</option>
              <option value="done">Selesai</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Catatan Tambahan
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Rincian atau instruksi khusus..."
              rows={2}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00A884] resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" type="submit" leftIcon={<CheckSquare className="w-4 h-4" />}>
            Simpan Tugas
          </Button>
        </div>
      </form>
    </Modal>
  );
};

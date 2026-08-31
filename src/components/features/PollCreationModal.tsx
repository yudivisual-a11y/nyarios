import React, { useState } from 'react';
import { Vote, Plus, X, Calendar, Shield, CheckSquare2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';

interface PollCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PollCreationModal: React.FC<PollCreationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeChatId, sendMessage } = useApp();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [isMultiChoice, setIsMultiChoice] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  const handleAddOption = () => {
    if (options.length < 8) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Pertanyaan polling wajib diisi.');
      return;
    }

    const validOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);
    if (validOptions.length < 2) {
      setError('Minimal sertakan 2 pilihan jawaban.');
      return;
    }

    if (!activeChatId) return;

    sendMessage(activeChatId, `Jajak Pendapat: ${question.trim()}`, 'poll', {
      poll: {
        id: `poll_${Date.now()}`,
        question: question.trim(),
        options: validOptions.map((optText, idx) => ({
          id: `opt_${idx}`,
          text: optText,
          voterNames: [],
        })),
        isMultiChoice,
        isAnonymous,
        deadline: deadline || undefined,
        isClosed: false,
        createdBy: 'Saya',
      },
    });

    setQuestion('');
    setOptions(['', '']);
    setIsMultiChoice(false);
    setIsAnonymous(false);
    setDeadline('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Jajak Pendapat (Polling)"
      subtitle="Kumpulkan suara dan pendapat dari anggota grup secara teratur"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Pertanyaan Polling <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Vote className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
            <textarea
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (error) setError('');
              }}
              placeholder="Contoh: Menu apa yang ingin dipesan untuk makan siang?"
              rows={2}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A884] resize-none"
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Pilihan Jawaban (Min. 2)
          </label>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Pilihan ${idx + 1}`}
                  className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 8 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2 text-xs font-semibold text-[#00A884] dark:text-[#34D399] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pilihan</span>
            </button>
          )}
        </div>

        {/* Toggles */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#202C33] border border-slate-200/70 dark:border-slate-800 space-y-2.5 text-xs">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Izinkan banyak pilihan (Multi-choice)
            </span>
            <input
              type="checkbox"
              checked={isMultiChoice}
              onChange={(e) => setIsMultiChoice(e.target.checked)}
              className="w-4 h-4 text-[#00A884] rounded border-slate-300 focus:ring-[#00A884]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Voting anonim (Sembunyikan nama pemilih)
            </span>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-[#00A884] rounded border-slate-300 focus:ring-[#00A884]"
            />
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Batas Waktu / Deadline (Opsional)
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" type="submit" leftIcon={<Vote className="w-4 h-4" />}>
            Buat Polling
          </Button>
        </div>
      </form>
    </Modal>
  );
};

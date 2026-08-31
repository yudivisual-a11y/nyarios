import React, { useState } from 'react';
import { HelpCircle, Send } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';

interface QuickAskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAskCreationModal: React.FC<QuickAskCreationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeChatId, sendMessage } = useApp();
  const [question, setQuestion] = useState('Siapa yang bisa hadir pada pertemuan besok?');

  const presetQuestions = [
    'Siapa yang bisa hadir pada pertemuan besok?',
    'Siapa yang sudah menyelesaikan tugas bagian 1?',
    'Siapa yang setuju dengan usulan rancangan baru?',
    'Siapa yang ikut rapat offline siang ini?',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !activeChatId) return;

    sendMessage(activeChatId, `Tanya Grup: ${question.trim()}`, 'quick_ask', {
      quickAsk: {
        question: question.trim(),
        votes: {
          can_attend: [],
          cannot_attend: [],
          undecided: [],
        },
      },
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tanya Grup Cepat"
      subtitle="Kirim pertanyaan cepat dengan pilihan otomatis [Bisa / Tidak / Belum Tahu]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Pertanyaan <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <HelpCircle className="w-4 h-4 absolute left-3 top-3 text-purple-500" />
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Contoh: Siapa yang bisa hadir besok?"
              rows={2}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A884] resize-none"
              autoFocus
            />
          </div>
        </div>

        {/* Preset quick templates */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Pertanyaan Cepat:
          </span>
          <div className="space-y-1">
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuestion(q)}
                className="w-full text-left p-2 rounded-xl text-xs bg-slate-50 dark:bg-[#202C33] hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 transition-colors truncate"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 text-xs text-purple-800 dark:text-purple-300">
          <p className="font-semibold mb-1">Format Pilihan Otomatis:</p>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-medium">✓ Saya bisa</span>
            <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 font-medium">✕ Tidak bisa</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">? Belum tahu</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" type="submit" leftIcon={<Send className="w-4 h-4" />}>
            Kirim ke Chat
          </Button>
        </div>
      </form>
    </Modal>
  );
};

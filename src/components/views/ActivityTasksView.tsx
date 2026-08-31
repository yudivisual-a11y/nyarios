import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  ArrowRight,
  Trash2,
  Clock,
  User,
  CheckCircle2,
  Circle,
  PlayCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { TaskModal } from '../features/TaskModal';

export const ActivityTasksView: React.FC = () => {
  const { tasks, updateTaskStatus, deleteTask, setActiveChatId, setActiveDesktopSubTab } = useApp();

  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      return true;
    });
  }, [tasks, filterStatus]);

  const handleJumpToChat = (chatId?: string) => {
    if (!chatId) return;
    setActiveChatId(chatId);
    setActiveDesktopSubTab(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18191d] p-4 sm:p-6 select-none overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl neu-raised-circle text-[#ff4b4b]">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Aktivitas & Tugas
              </h1>
              <p className="text-xs text-slate-400">
                Daftar tindak lanjut dan penugasan yang dibuat langsung dari percakapan
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewTaskModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Buat Tugas
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: `Semua (${tasks.length})` },
            { id: 'todo', label: `Belum Selesai (${tasks.filter((t) => t.status === 'todo').length})` },
            { id: 'in_progress', label: `Sedang Berjalan (${tasks.filter((t) => t.status === 'in_progress').length})` },
            { id: 'done', label: `Selesai (${tasks.filter((t) => t.status === 'done').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                filterStatus === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#111B21] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={<CheckSquare className="w-8 h-8" />}
              title="Belum ada tugas"
              description="Ubah pesan percakapan menjadi tugas terstruktur dengan memilih menu 'Jadikan Tugas' pada pesan."
              actionText="Buat Tugas Baru"
              onAction={() => setIsNewTaskModalOpen(true)}
              actionIcon={<Plus className="w-4 h-4" />}
            />
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-[#00A884] transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Status Toggle Checkbox */}
                  <button
                    onClick={() =>
                      updateTaskStatus(
                        t.id,
                        t.status === 'done' ? 'todo' : 'done'
                      )
                    }
                    className="mt-0.5 text-slate-400 hover:text-[#00A884]"
                  >
                    {t.status === 'done' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                    ) : t.status === 'in_progress' ? (
                      <PlayCircle className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <h4
                      className={`text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 ${
                        t.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {t.title}
                    </h4>

                    {t.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {t.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                        <User className="w-3 h-3 text-slate-400" />
                        PJ: {t.assignee}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Tenggat: {t.deadline}
                      </span>
                      {t.chatTitle && (
                        <>
                          <span>•</span>
                          <span className="text-[#00A884] font-medium truncate">
                            Sumber: {t.chatTitle}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {t.chatId && (
                    <button
                      onClick={() => handleJumpToChat(t.chatId)}
                      className="text-xs text-[#00A884] font-bold flex items-center gap-1 hover:underline"
                    >
                      <span>Lihat Chat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
      />
    </div>
  );
};

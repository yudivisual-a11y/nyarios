import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Bell,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { ScheduleModal } from '../features/ScheduleModal';

export const ScheduleAgendaView: React.FC = () => {
  const { schedules, deleteSchedule, setActiveChatId, setActiveDesktopSubTab } = useApp();

  const [isNewScheduleModalOpen, setIsNewScheduleModalOpen] = useState(false);

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
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Jadwal & Agenda
              </h1>
              <p className="text-xs text-slate-400">
                Agenda kegiatan, pertemuan, dan batas waktu dari percakapan kamu
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewScheduleModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tambah Jadwal
          </Button>
        </div>

        {/* Schedule list */}
        {schedules.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={<Calendar className="w-8 h-8" />}
              title="Belum ada jadwal"
              description="Tambahkan jadwal kegiatan penting langsung dari pesan percakapan untuk tersusun rapi di sini."
              actionText="Tambah Jadwal Baru"
              onAction={() => setIsNewScheduleModalOpen(true)}
              actionIcon={<Plus className="w-4 h-4" />}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#111B21] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#00A884] transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex flex-col items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                    <span className="text-[10px] uppercase font-bold text-blue-500">
                      {new Date(ev.date).toLocaleDateString('id-ID', { month: 'short' })}
                    </span>
                    <span className="text-base font-extrabold -mt-1">
                      {new Date(ev.date).getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                      {ev.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {ev.startTime} {ev.endTime ? `- ${ev.endTime}` : ''}
                      </span>
                      {ev.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {ev.location}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Bell className="w-3.5 h-3.5" />
                        {ev.reminder}
                      </span>
                    </div>

                    {ev.notes && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">
                        {ev.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {ev.chatId && (
                    <button
                      onClick={() => handleJumpToChat(ev.chatId)}
                      className="text-xs text-[#00A884] font-bold flex items-center gap-1 hover:underline"
                    >
                      <span>Lihat Chat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => deleteSchedule(ev.id)}
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

      <ScheduleModal
        isOpen={isNewScheduleModalOpen}
        onClose={() => setIsNewScheduleModalOpen(false)}
      />
    </div>
  );
};

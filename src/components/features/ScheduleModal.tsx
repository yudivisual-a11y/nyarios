import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, MapPin, AlignLeft } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { Message } from '../../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceMessage?: Message | null;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  sourceMessage,
}) => {
  const { createSchedule, activeChat } = useApp();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reminder, setReminder] = useState('15 menit sebelumnya');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (sourceMessage) {
      setTitle(sourceMessage.content.slice(0, 80));
      setNotes(`Ditambahkan dari pesan ${sourceMessage.senderName}: "${sourceMessage.content}"`);
    }
  }, [sourceMessage, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createSchedule({
      title: title.trim(),
      date,
      startTime,
      endTime,
      reminder,
      location: location.trim(),
      notes: notes.trim(),
      sourceMessageId: sourceMessage?.id,
      chatId: activeChat?.id,
      chatTitle: activeChat?.name,
    });

    setTitle('');
    setLocation('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambahkan ke Jadwal"
      subtitle="Atur kegiatan atau pertemuan penting ke dalam agenda"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Nama Kegiatan <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Rapat Koordinasi Tim"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
              autoFocus
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Waktu Mulai
            </label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full pl-8 pr-2 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Waktu Selesai
            </label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full pl-8 pr-2 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Pengingat
            </label>
            <div className="relative">
              <Bell className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
              >
                <option value="Tepat waktu">Tepat waktu</option>
                <option value="15 menit sebelumnya">15 menit sebelumnya</option>
                <option value="30 menit sebelumnya">30 menit sebelumnya</option>
                <option value="1 jam sebelumnya">1 jam sebelumnya</option>
                <option value="1 hari sebelumnya">1 hari sebelumnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Lokasi / Tautan Pertemuan
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Ruang Rapat A / Google Meet"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Catatan Tambahan
          </label>
          <div className="relative">
            <AlignLeft className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agenda rapat atau catatan penting..."
              rows={2}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-[#202C33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00A884] resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" type="submit" leftIcon={<Calendar className="w-4 h-4" />}>
            Simpan ke Jadwal
          </Button>
        </div>
      </form>
    </Modal>
  );
};

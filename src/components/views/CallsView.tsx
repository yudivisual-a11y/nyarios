import React, { useState } from 'react';
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Plus,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Modal } from '../ui/Modal';
import { formatRelativeTime } from '../../utils/formatters';

export const CallsView: React.FC = () => {
  const { callRecords, startCall, chats } = useApp();

  const [isNewCallModalOpen, setIsNewCallModalOpen] = useState(false);
  const [targetContactName, setTargetContactName] = useState('');

  const handleStartDirectCall = (name: string, type: 'voice' | 'video') => {
    if (!name.trim()) return;
    startCall(name.trim(), undefined, type);
    setIsNewCallModalOpen(false);
    setTargetContactName('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18191d] p-4 sm:p-6 select-none overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Header - 1 Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl neu-raised-circle text-[#ff4b4b]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Panggilan
              </h1>
              <p className="text-xs text-slate-400">
                Riwayat panggilan suara dan video berkualitas tinggi
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewCallModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Panggilan Baru
          </Button>
        </div>

        {/* Call Records List or Clean Empty State */}
        {callRecords.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-8 neu-flat rounded-3xl border border-white/5">
            <div className="w-16 h-16 rounded-full neu-raised flex items-center justify-center mb-3 text-[#ff4b4b]">
              <Phone className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Belum ada riwayat panggilan
            </h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Riwayat panggilan masuk, keluar, dan tidak terjawab akan tercatat secara otomatis di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Riwayat Panggilan ({callRecords.length})
            </h3>
            {callRecords.map((record) => {
              const isMissed = record.direction === 'missed';
              return (
                <div
                  key={record.id}
                  className="p-3.5 rounded-2xl bg-[#1e2025] neu-raised border border-white/5 shadow-sm flex items-center justify-between hover:border-[#ff4b4b]/40 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <Avatar name={record.contactName} src={record.contactAvatar} size="md" />
                    <div>
                      <h4 className={`text-xs sm:text-sm font-bold ${
                        isMissed ? 'text-rose-400' : 'text-white'
                      }`}>
                        {record.contactName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        {record.direction === 'incoming' && (
                          <PhoneIncoming className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {record.direction === 'outgoing' && (
                          <PhoneOutgoing className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        {record.direction === 'missed' && (
                          <PhoneMissed className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>{formatRelativeTime(record.rawTimestamp)}</span>
                        {record.duration && (
                          <>
                            <span>•</span>
                            <span>{record.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Redial Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startCall(record.contactName, record.contactAvatar, 'voice')}
                      className="p-2 rounded-xl neu-raised-circle text-slate-400 hover:text-[#ff4b4b]"
                      title="Panggil Suara"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startCall(record.contactName, record.contactAvatar, 'video')}
                      className="p-2 rounded-xl neu-raised-circle text-slate-400 hover:text-[#ff4b4b]"
                      title="Panggil Video"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Call Modal */}
      <Modal
        isOpen={isNewCallModalOpen}
        onClose={() => setIsNewCallModalOpen(false)}
        title="Mulai Panggilan Baru"
        subtitle="Pilih kontak atau ketik nama untuk memulai panggilan"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nama Kontak / Penerima
            </label>
            <input
              type="text"
              value={targetContactName}
              onChange={(e) => setTargetContactName(e.target.value)}
              placeholder="Ketik nama kontak..."
              className="w-full px-3.5 py-2.5 neu-inset border border-white/5 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff4b4b]"
              autoFocus
            />
          </div>

          {/* Existing chats quick list */}
          {chats.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Pilih dari Percakapan:
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {chats.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setTargetContactName(c.name)}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#23262c] hover:bg-[#2c3038] cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar name={c.name} size="xs" />
                      <span className="font-semibold text-slate-200">{c.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Pilih</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => handleStartDirectCall(targetContactName || 'Kontak', 'voice')}
              leftIcon={<Phone className="w-4 h-4 text-[#ff4b4b]" />}
            >
              Panggilan Suara
            </Button>
            <Button
              variant="primary"
              onClick={() => handleStartDirectCall(targetContactName || 'Kontak', 'video')}
              leftIcon={<Video className="w-4 h-4" />}
            >
              Panggilan Video
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

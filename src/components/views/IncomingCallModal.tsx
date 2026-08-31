import React, { useEffect } from 'react';
import { Phone, PhoneOff, Video, ShieldCheck } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { sound } from '../../utils/sound';
import { IncomingCallSignal } from '../../utils/cloudSync';

interface IncomingCallModalProps {
  incomingCall: IncomingCallSignal | null;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  incomingCall,
  onAccept,
  onDecline,
}) => {
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (incomingCall) {
      sound.playVoiceTone(1200);
      interval = setInterval(() => {
        sound.playVoiceTone(1200);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [incomingCall]);

  if (!incomingCall || incomingCall.status !== 'ringing') return null;

  return (
    <div className="fixed inset-0 z-50 p-4 bg-black/90 backdrop-blur-xl flex items-center justify-center select-none animate-fade-in text-white">
      <div className="w-full max-w-sm rounded-3xl bg-[#1e2025] neu-raised border border-white/15 p-6 sm:p-8 space-y-6 text-center shadow-2xl relative overflow-hidden">
        {/* Ambient Pulsing Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {incomingCall.type === 'video' ? '📹 Panggilan Video Masuk' : '📞 Panggilan Suara Masuk'}
          </span>
        </div>

        {/* Caller Avatar & Name */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-emerald-500/30 animate-ping duration-1000" />
            <Avatar name={incomingCall.callerName} src={incomingCall.callerAvatar} size="xl" />
          </div>

          <div className="space-y-0.5">
            <h3 className="text-xl font-black text-white tracking-tight">
              {incomingCall.callerName}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {incomingCall.callerPhone}
            </p>
          </div>
        </div>

        {/* Encryption notice */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Panggilan Terenkripsi End-to-End</span>
        </div>

        {/* Accept & Decline Action Buttons */}
        <div className="flex items-center justify-around gap-4 pt-2">
          {/* Decline Button */}
          <button
            type="button"
            onClick={onDecline}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-110 active:scale-95 transition-all">
              <PhoneOff className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-rose-400">
              Tolak
            </span>
          </button>

          {/* Accept Button */}
          <button
            type="button"
            onClick={onAccept}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 active:scale-95 transition-all animate-bounce">
              {incomingCall.type === 'video' ? (
                <Video className="w-6 h-6" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </div>
            <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              Terima
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

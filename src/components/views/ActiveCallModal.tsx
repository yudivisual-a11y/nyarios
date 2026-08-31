import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  PhoneOff,
  ScreenShare,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { formatDuration } from '../../utils/formatters';

export const ActiveCallModal: React.FC = () => {
  const {
    activeCall,
    endCall,
    toggleCallMute,
    toggleCallVideo,
    toggleCallSpeaker,
    toggleCallScreenShare,
  } = useApp();

  if (!activeCall || !activeCall.isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6 select-none animate-fade-in text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            {activeCall.type === 'video' ? 'Panggilan Video Aktif' : 'Panggilan Suara Aktif'}
          </span>
        </div>

        <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md font-mono text-xs font-bold">
          {formatDuration(activeCall.durationSeconds)}
        </div>
      </div>

      {/* Main Stream Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-4">
        {activeCall.type === 'video' && !activeCall.isVideoOff ? (
          /* Simulated Video View */
          <div className="w-full max-w-xl aspect-video rounded-3xl overflow-hidden bg-slate-800 border border-slate-700 relative shadow-2xl flex items-center justify-center">
            {/* Simulated remote stream */}
            <div className="text-center">
              <Avatar name={activeCall.contactName} size="xl" className="mb-2 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Video {activeCall.contactName}</p>
            </div>

            {/* Self picture-in-picture simulated camera */}
            <div className="absolute bottom-4 right-4 w-32 aspect-video rounded-2xl bg-emerald-950/80 border border-emerald-500/40 p-2 flex items-center justify-center shadow-lg">
              <span className="text-[10px] text-emerald-300 font-bold">Kamera Anda</span>
            </div>
          </div>
        ) : (
          /* Audio Voice Call View */
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping" />
              <Avatar name={activeCall.contactName} size="xl" className="w-24 h-24 text-3xl" />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight">{activeCall.contactName}</h2>
              <p className="text-sm text-slate-400 mt-1">
                {activeCall.isMuted ? 'Mikrofon Anda dimatikan' : 'Terhubung...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-center gap-4 py-4 z-10">
        {/* Mute Toggle */}
        <button
          onClick={toggleCallMute}
          title={activeCall.isMuted ? 'Nyalakan Mikrofon' : 'Matikan Mikrofon'}
          className={`p-4 rounded-2xl transition-all shadow-lg ${
            activeCall.isMuted
              ? 'bg-rose-500 text-white'
              : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
          }`}
        >
          {activeCall.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={toggleCallVideo}
          title={activeCall.isVideoOff ? 'Nyalakan Kamera' : 'Matikan Kamera'}
          className={`p-4 rounded-2xl transition-all shadow-lg ${
            activeCall.isVideoOff
              ? 'bg-rose-500 text-white'
              : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
          }`}
        >
          {activeCall.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        {/* Speaker Toggle */}
        <button
          onClick={toggleCallSpeaker}
          title={activeCall.isSpeakerOn ? 'Matikan Speaker' : 'Nyalakan Speaker'}
          className={`p-4 rounded-2xl transition-all shadow-lg ${
            activeCall.isSpeakerOn
              ? 'bg-[#00A884] text-white'
              : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
          }`}
        >
          {activeCall.isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={toggleCallScreenShare}
          title="Bagi Layar"
          className={`p-4 rounded-2xl transition-all shadow-lg ${
            activeCall.isScreenSharing
              ? 'bg-blue-600 text-white'
              : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
          }`}
        >
          <ScreenShare className="w-6 h-6" />
        </button>

        {/* End Call Button */}
        <button
          onClick={endCall}
          title="Akhiri Panggilan"
          className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/30 transition-all hover:scale-105"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

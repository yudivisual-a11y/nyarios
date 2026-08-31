import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Send, Eye, Sparkles } from 'lucide-react';
import { StatusStory } from '../../types';
import { Avatar } from '../ui/Avatar';
import { formatRelativeTime } from '../../utils/formatters';
import { useHistoryBack } from '../../utils/useHistoryBack';

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  statuses: StatusStory[];
  initialIndex?: number;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  isOpen,
  onClose,
  statuses,
  initialIndex = 0,
}) => {
  useHistoryBack(isOpen, onClose, 'story_viewer');

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentStory = statuses[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
  }, [initialIndex, isOpen]);

  // Handle Pause/Play for Video
  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPaused]);

  // Story progress timer for Text & Image (7 seconds)
  useEffect(() => {
    if (!isOpen || !currentStory || isPaused) return;

    // For videos: handled via onTimeUpdate event on <video>
    if (currentStory.type === 'video') return;

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < statuses.length - 1) {
            setCurrentIndex((c) => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 1.4; // ~7 seconds total
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex, statuses.length, currentStory, onClose, isPaused]);

  if (!isOpen || !currentStory) return null;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  // Video Time Update (Max 2 Minutes / 120 Seconds Support)
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || isPaused) return;
    const current = videoRef.current.currentTime;
    const duration = Math.min(videoRef.current.duration || 120, 120); // Cap at 2 minutes (120s)

    if (duration > 0) {
      const pct = (current / duration) * 100;
      setProgress(pct);

      if (current >= duration || videoRef.current.ended) {
        handleNext();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none animate-fade-in p-0 sm:p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 p-2.5 text-white/90 hover:text-white bg-black/60 rounded-full backdrop-blur-md transition-all hover:scale-105"
        title="Tutup Cerita"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Story Card Container */}
      <div className="relative w-full h-full sm:h-[88vh] sm:max-w-md sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between bg-black">
        {/* Top Progress Bars */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
          {statuses.map((_, idx) => {
            let fillWidth = '0%';
            if (idx < currentIndex) fillWidth = '100%';
            else if (idx === currentIndex) fillWidth = `${progress}%`;

            return (
              <div key={idx} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width: fillWidth }}
                />
              </div>
            );
          })}
        </div>

        {/* User Header */}
        <div className="absolute top-7 left-4 right-4 z-30 flex items-center justify-between text-white drop-shadow-md">
          <div className="flex items-center gap-2.5">
            <Avatar name={currentStory.userName} src={currentStory.userAvatar} size="sm" />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold">{currentStory.userName}</h4>
                {currentStory.type === 'video' && (
                  <span className="px-1.5 py-0.2 rounded bg-rose-600/80 text-[9px] font-extrabold tracking-wider">
                    HD 2M
                  </span>
                )}
              </div>
              <span className="text-[10px] text-white/80 font-mono">
                {formatRelativeTime(currentStory.rawTimestamp)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-white/80 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Eye className="w-3.5 h-3.5" />
            <span className="font-bold">{currentStory.viewers.length || 1}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div
          className="flex-1 flex items-center justify-center p-6 text-center relative overflow-hidden"
          style={{
            background:
              currentStory.type === 'text'
                ? currentStory.bgColor || 'linear-gradient(135deg, #ff4b4b, #ff8533)'
                : '#000',
          }}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* 1. TEXT STORY */}
          {currentStory.type === 'text' && (
            <p className="text-white text-lg sm:text-2xl font-black leading-relaxed max-w-xs break-words drop-shadow-lg px-2">
              {currentStory.content}
            </p>
          )}

          {/* 2. IMAGE STORY (Crystal Clear HD) */}
          {currentStory.type === 'image' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={currentStory.content}
                alt="Story"
                className="max-w-full max-h-full object-contain"
              />
              {currentStory.caption && (
                <div className="absolute bottom-16 left-4 right-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm text-center font-medium border border-white/10">
                  {currentStory.caption}
                </div>
              )}
            </div>
          )}

          {/* 3. VIDEO STORY (Full HD Up to 2 Minutes) */}
          {currentStory.type === 'video' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={currentStory.content}
                autoPlay
                playsInline
                controls={false}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleNext}
                className="max-w-full max-h-full object-contain"
              />
              {currentStory.caption && (
                <div className="absolute bottom-16 left-4 right-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm text-center font-medium border border-white/10">
                  {currentStory.caption}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Touch zones for story navigation */}
        <div
          className="absolute inset-y-16 left-0 w-1/3 z-20 cursor-pointer"
          onClick={handlePrev}
          title="Ketuk untuk cerita sebelumnya"
        />
        <div
          className="absolute inset-y-16 right-0 w-1/3 z-20 cursor-pointer"
          onClick={handleNext}
          title="Ketuk untuk cerita berikutnya"
        />
      </div>
    </div>
  );
};

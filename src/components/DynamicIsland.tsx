'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

export default function DynamicIsland() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const { 
    isIslandVisible, isPlaying, togglePlay, currentTrackTitle, 
    progress, duration, currentTime, seek, nextTrack, prevTrack,
    analyzerData, currentTrackArtwork
  } = useAudio();

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isIslandVisible) return null;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // On mobile: single tap toggles expanded; on desktop: hover
  const handleTap = () => {
    if (isMobile) setIsExpanded(prev => !prev);
  };

  const showExpanded = isMobile ? isExpanded : isExpanded;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
      <motion.div
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
        onTouchStart={handleTap}
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          width: showExpanded 
            ? (isMobile ? 'calc(100vw - 2rem)' : 'min(100%, 900px)')
            : (isMobile ? '200px' : '220px'),
          height: showExpanded ? (isMobile ? 'auto' : '64px') : '64px',
        }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 25,
          width: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
        }}
        className="bg-deepblack/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center relative"
      >
        <AnimatePresence mode="wait">
          {!showExpanded ? (
            /* Compact View */
            <motion.div 
              key="compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-between px-5"
            >
              <div className="flex flex-col min-w-0 mr-3">
                <span className="text-[10px] font-medium text-white truncate uppercase tracking-widest">{currentTrackTitle}</span>
                <span className="text-[8px] text-accent/60 uppercase tracking-[0.2em] font-light">
                  {isMobile ? 'Tap to expand' : 'Playing'}
                </span>
              </div>
              
              <div className="flex items-center gap-[3px] h-4 shrink-0">
                {analyzerData.map((val, i) => (
                  <motion.div 
                    key={i}
                    className="w-[1.5px] bg-accent rounded-full"
                    animate={{ height: isPlaying ? `${Math.max(20, val * 100)}%` : '20%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            /* Expanded View - Mobile-friendly layout */
            <motion.div 
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`w-full flex ${isMobile ? 'flex-col gap-4 p-5' : 'flex-row items-center gap-6 h-full px-6'}`}
            >
              {/* Top row on mobile: artwork + info + controls */}
              <div className={`flex items-center ${isMobile ? 'justify-between w-full' : 'gap-3 shrink-0 max-w-[200px]'}`}>
                {/* Artwork + Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                    {currentTrackArtwork ? (
                      <img src={currentTrackArtwork} alt="Artwork" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent/20 to-transparent" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-medium text-white truncate uppercase tracking-widest max-w-[140px] md:max-w-none">{currentTrackTitle}</span>
                    <span className="text-[8px] text-gray-500 uppercase tracking-widest">DADA.COMPOSER</span>
                  </div>
                </div>

                {/* Controls — always visible on mobile here */}
                {isMobile && (
                  <div className="flex items-center gap-4 shrink-0" onTouchStart={(e) => e.stopPropagation()}>
                    <button onClick={prevTrack} className="text-white/40 active:text-white transition-colors p-2">
                      <SkipBack size={18} fill="currentColor" />
                    </button>
                    <button 
                      onClick={togglePlay}
                      className="w-10 h-10 rounded-full bg-white text-deepblack flex items-center justify-center active:bg-accent active:text-white transition-all shadow-lg"
                    >
                      {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <button onClick={nextTrack} className="text-white/40 active:text-white transition-colors p-2">
                      <SkipForward size={18} fill="currentColor" />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress bar row */}
              <div className={`flex items-center gap-3 ${isMobile ? 'w-full' : 'flex-1'}`} onTouchStart={(e) => e.stopPropagation()}>
                <span className="text-[9px] font-mono text-gray-500 tabular-nums shrink-0">{formatTime(currentTime)}</span>
                <div className="flex-1 h-1 bg-white/10 relative rounded-full">
                  <div 
                    className="absolute top-0 left-0 h-full bg-accent rounded-full pointer-events-none"
                    style={{ width: `${progress}%` }}
                  />
                  <input 
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    step="0.1"
                    onChange={(e) => seek(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    style={{ touchAction: 'none' }}
                  />
                </div>
                <span className="text-[9px] font-mono text-gray-500 tabular-nums shrink-0">{formatTime(duration)}</span>
              </div>

              {/* Desktop controls (right side) */}
              {!isMobile && (
                <div className="flex items-center gap-5 shrink-0">
                  <button onClick={prevTrack} className="text-white/40 hover:text-white transition-colors">
                    <SkipBack size={16} fill="currentColor" />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full bg-white text-deepblack flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-lg"
                  >
                    {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                  </button>
                  <button onClick={nextTrack} className="text-white/40 hover:text-white transition-colors">
                    <SkipForward size={16} fill="currentColor" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
